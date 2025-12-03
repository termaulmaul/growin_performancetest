import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP009 - Upload Signature Bottom Sheet
//RUN QA : ../../k6 run BP009.js -e RUNBY=Manual -e ENV=DEV -e USER=10 -e DURATION=1m -e NUMSTART=75 --out dashboard=export=../../Report/OMO_Android/BP009/Manual/Manual_DryRun_2021_1347_BP009_Local.html
//RUN INT: ../../k6 run BP009.js -e RUNBY=Manual -e ENV=INT -e USER=1000 -e DURATION=5m -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP009/Manual/Manual_DryRun_2021_1347_BP009_Local.html
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

// /oaofinance/api/v1/margin/upload/signature

// Oaofinance_Margin_Upload_Signature

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

// Main test function
export default function () {
    // Determine the environment and user email based on ENV
    let base_url = '';
    let base_wss = '';
    let email = '';
    let base_host = '';

    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://api-dev.growin.id';
        base_wss = 'wss://api-dev.growin.id';
        base_host = 'api-dev.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
        base_wss = 'wss://api-qa.growin.id';
        base_host = 'api-qa.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id'
        base_wss = 'wss://drc-api.growin.id'
        base_host = 'drc-api.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(0, '0');
        email = 'MOSTNG' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id'
        base_wss = 'wss://internal-api-pt.growin.id'
        base_host = 'internal-api-pt.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(2, '0');
        email = 'TESTMON' + formattedRandomNumber + '@guysmail.com'
    }

    // Define request headers
    const headers = {
        'Content-Type': 'application/json',
        // 'Content-Type':'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*',
        'User-Agent':'PostmanRuntime/7.43.0'
    };

    // Login payload
    const payload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    // Perform login request
    let res = http.post(base_url + '/auth/api/v1/login', payload, {headers:headers});

    let token;
    if (res.status === 200) {
        token = res.json().data.token;
        if (`${__ENV.ENV}`!='INT') {
            console.log(`VU${exec.vu.idInTest} - ${email} Login Success`);
        }
    } else {
        if (`${__ENV.ENV}`!='INT') {
            console.error(`VU${exec.vu.idInTest} - ${email} Failed to Login || Status: ${res.status} || Status: ${res.body}`);
        }
        return;
    }

    // /oaofinance/api/v1/margin/draft
    let user_uuid;
    if (token) {
        const marginDraftHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const OaofinanceMarginPayload = JSON.stringify({
            is_consent_margin: true, 
            is_consent_lpip: true
        });

        // Perform login request
        let res = http.post(base_url + '/oaofinance/api/v1/margin/draft', OaofinanceMarginPayload, {headers:marginDraftHeaders});

        if (res.status === 200) {
            user_uuid = res.json().data.id;
            if (`${__ENV.ENV}`!='INT') {
                console.log(`${email} Got user_uuid: ${user_uuid}`);
            }
        } else {
            if (`${__ENV.ENV}`!='INT') {
                console.error(`${email} Failed to get User UUID || Status: ${res.status} | Body: ${res.body}`);
            }
            return;
        }
    }
    
    // 1 //
    if (token && user_uuid) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/upload/signature`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const Oaofinance_Margin_Upload_Signature_Payload = {
            file: http.file(signatureFile, 'signature.jpeg', 'image/jpeg'),
            user_uuid: user_uuid,
        };

        const requests = [
            ['POST', urls[0], Oaofinance_Margin_Upload_Signature_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                UploadSignatureBottomSheet.Oaofinance_Margin_Upload_Signature,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0,25);
}

// Generate the test report
export function handleSummary(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ind-EG').replace(/\//g, ''); // Format the date
    const timeStr = now.toLocaleTimeString('ind-EG').replace(/:/g, ''); // Format the time
    if(`${__ENV.RUNBY}`=='Manual'){
        return {
            [`../../Report/OMO_Android/BP009/Manual/${__ENV.RUNBY}_Detail_BP009_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/OMO_Android/BP009/Regression/${__ENV.RUNBY}_Detail_BP009_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}


