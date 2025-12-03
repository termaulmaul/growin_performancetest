import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP009 - Upload Signature Bottom Sheet
//RUN QA : ../../k6 run BP009.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=98 --out dashboard=export=../../Report/OMO_Android/BP009/Manual/Manual_DryRun_2023_1717_BP009_Local.html
//RUN INT: ../../k6 run BP009.js -e RUNBY=Manual -e ENV=INT -e USER=70 -e DURATION=15m -e NUMSTART=101 --out dashboard=export=../../Report/OMO_Android/BP009/Manual/Manual_DryRun_1029_2022_BP009_Local.html
//RUN STRESS TEST: ../../k6 run BP009.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP009/Manual/Manual_DryRun_2021_1128_BP009_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// PERBAIKAN: Baca file di global scope (init stage)
const signatureFile = open('./signature.jpeg', 'b');

// Define options for test execution
export const options = {
    scenarios: {
        contacts: {
            executor: 'constant-vus',
            vus: `${__ENV.USER}`,
            duration: `${__ENV.DURATION}`,
            gracefulStop: '30s',
        },
    },
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
};

// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'per-vu-iterations',
//             vus: 1,
//             iterations: 1,
//             maxDuration: '1h',
//         },
//     },
// };

// Define custom metrics
const UploadSignatureBottomSheet = {
    Oaofinance_Margin_Upload_Signature: {
        errorCount: new Counter("error_count_009_01_01_Oaofinance_Margin_Upload_Signature"),
        errorRate: new Rate("error_rate_009_01_01_Oaofinance_Margin_Upload_Signature"),
        httpDuration: new Trend("duration_009_01_01_Oaofinance_Margin_Upload_Signature"),
        httpWaiting: new Trend("waiting_009_01_01_Oaofinance_Margin_Upload_Signature"),
        requestRate: new Counter("rps_009_01_01_Oaofinance_Margin_Upload_Signature"),
        http_reqs: new Counter("sample_009_01_01_Oaofinance_Margin_Upload_Signature"),
    },
};

// ✅ SETUP FUNCTION - Get token AND user_uuid once
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://dev-api.growin.id';
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id';
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id';
    }

    const tokens = {};
    
    console.log(`Starting login and margin draft for ${totalUsers} users...`);
    
    for (let i = 1; i <= totalUsers; i++) {
        let email = '';
        let formattedNum = '';
        
        if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
            formattedNum = String(startNum + i - 1).padStart(3, '0');
            email = 'mostng' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='DRC') {
            formattedNum = String(startNum + i - 1).padStart(0, '0');
            email = 'MOSTNG' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='INT') {
            formattedNum = String(startNum + i - 1).padStart(3, '0');  // Fixed: 2 → 3
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }

        // ✅ Step 1: Login
        const loginPayload = JSON.stringify({
            password: 'M@nsek.123',
            email: email,
            recaptcha: '',
        });

        const headers = {
            'Content-Type': 'application/json',
        };

        let res = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: headers });

        let token = null;
        let user_uuid = null;

        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status} -  Resp Body: ${res.body}`);
            tokens[i] = { email: email, token: null };
        }

        if (res.status === 200) {
            token = res.json().data.token;
            
            // ✅ Step 2: Get user_uuid from margin draft (ONLY ONCE in setup)
            const marginDraftHeaders = {
                // 'Cookie': `ACCESS_TOKEN=${token}`,
                // 'Content-Type': 'application/json',

                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept-Language':'en',
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            };

            const marginPayload = JSON.stringify({
                is_consent_margin: true, 
                is_consent_lpip: true
            });

            res = http.post(base_url + '/oaofinance/api/v1/margin/draft', marginPayload, { headers: marginDraftHeaders });

            if (res.status === 200) {
                user_uuid = res.json().data.id;
                
                // Log setiap 10 user atau user terakhir
                if (i % 10 === 0 || i === totalUsers) {
                    console.log(`User ${i}/${totalUsers} - ${email} Login Success - UUID: ${user_uuid}`);
                }
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} Failed to get UUID - Status: ${res.status}`);
            }
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
        }

        // ✅ Store both token AND user_uuid
        tokens[i] = { 
            email: email, 
            token: token,
            user_uuid: user_uuid  // Store user_uuid
        };
    }
    
    console.log(`Login and margin draft phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

// Main test function
export default function (data) {
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const user_uuid = userToken.user_uuid;
    const base_url = data.base_url;
    
    // Upload signature using multipart/form-data (like curl --form)
    if (token && user_uuid) {
        const url = base_url + `/oaofinance/api/v1/margin/upload/signature`;

        const uploadHeaders = {
            // 'Authorization': `Bearer ${token}`,

            'Authorization': `Bearer ${token}`,
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        // Buat multipart form-data payload
        const formData = {
            file: http.file(signatureFile, 'signature.jpeg', 'image/jpeg'),
            user_uuid: user_uuid
        };

        // Single POST request (tidak menggunakan batch karena hanya 1 request)
        const response = http.post(url, formData, { headers: uploadHeaders });

        // Process metrics
        const metric = UploadSignatureBottomSheet.Oaofinance_Margin_Upload_Signature;
        metric.httpDuration.add(response.timings.duration);
        
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${url} || Status: ${response.status} | Body: ${response.body}`);
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestRate.add(false);
            metric.http_reqs.add(1);
            check(response, {
                [`ERROR ${url} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
            });
            if (`${__ENV.ENV}` != 'INT') {
                // const requestBody = requests[index][2];
                // console.error(`${email} ERROR ${url} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                console.error(`${email} ERROR ${url} || Status: ${response.status} || Response Body: ${response.body}`);
            }
        }
    }
    sleep(0.25);
}

// ✅ OPTIMIZED handleSummary
export function handleSummary(data) {
    try {
        // ✅ Handle missing metrics
        if (!data.metrics.data_received) {
            data.metrics.data_received = { values: { count: 0, rate: 0 } };
        }
        if (!data.metrics.data_sent) {
            data.metrics.data_sent = { values: { count: 0, rate: 0 } };
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        
        console.log(`[${dateStr}_${timeStr}] Starting report generation...`);
        
        if(`${__ENV.RUNBY}`=='Manual'){
            const htmlPath = `../../Report/OMO_Android/BP009/Manual/${__ENV.RUNBY}_Detail_BP009_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../Report/OMO_Android/BP009/Regression/${__ENV.RUNBY}_Detail_BP009_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../Report/OMO_Android/BP009/LoadTest/${__ENV.RUNBY}_Detail_BP009_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        }
        
    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        
        // ✅ Fallback: text only
        return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}