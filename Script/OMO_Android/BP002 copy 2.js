import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP002 - Landing Page
//RUN QA : ../../k6 run BP002.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/OMO_Android/BP002/Manual/Manual_DryRun_2021_2131_BP002_Local.html
//RUN INT: ../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e USER=316 -e DURATION=15m -e NUMSTART=101 --out dashboard=export=../../Report/OMO_Android/BP002/Manual/Manual_DryRun_2030_1316_BP002_Local.html
//RUN STRESS TEST: ../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP002/Manual/Manual_DryRun_2021_1128_BP002_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

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

// oaofinance/api/v1/margin/eligibility
// oaofinance/api/v1/margin/min-total-collateral-assets-value
// oaofinance/api/v1/margin/benefit
// oaofinance/api/v1/margin/leverage-fee
// oaofinance/api/v1/margin/financing-detail?content_type=margin
// user/api/v2/profile/trading
// oaofinance/api/v1/quota/status/margin

// Define custom metrics
const LandingPage = {
    Oaofinance_Margin_Eligibility: {
        errorCount: new Counter("error_count_002_01_01_Oaofinance_Margin_Eligibility"),
        errorRate: new Rate("error_rate_002_01_01_Oaofinance_Margin_Eligibility"),
        httpDuration: new Trend("duration_002_01_01_Oaofinance_Margin_Eligibility"),
        httpWaiting: new Trend("waiting_002_01_01_Oaofinance_Margin_Eligibility"),
        requestRate: new Counter("rps_002_01_01_Oaofinance_Margin_Eligibility"),
        http_reqs: new Counter("sample_002_01_01_Oaofinance_Margin_Eligibility"),
    },
    Oaofinance_Margin_MinTotalCollateralAssetsValue: {
        errorCount: new Counter("error_count_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        errorRate: new Rate("error_rate_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpDuration: new Trend("duration_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpWaiting: new Trend("waiting_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        requestRate: new Counter("rps_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        http_reqs: new Counter("sample_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
    },
    Oaofinance_Margin_Benefit: {
        errorCount: new Counter("error_count_002_01_03_Oaofinance_Margin_Benefit"),
        errorRate: new Rate("error_rate_002_01_03_Oaofinance_Margin_Benefit"),
        httpDuration: new Trend("duration_002_01_03_Oaofinance_Margin_Benefit"),
        httpWaiting: new Trend("waiting_002_01_03_Oaofinance_Margin_Benefit"),
        requestRate: new Counter("rps_002_01_03_Oaofinance_Margin_Benefit"),
        http_reqs: new Counter("sample_002_01_03_Oaofinance_Margin_Benefit"),
    },
    Oaofinance_Margin_LeverageFee: {
        errorCount: new Counter("error_count_002_01_04_Oaofinance_Margin_LeverageFee"),
        errorRate: new Rate("error_rate_002_01_04_Oaofinance_Margin_LeverageFee"),
        httpDuration: new Trend("duration_002_01_04_Oaofinance_Margin_LeverageFee"),
        httpWaiting: new Trend("waiting_002_01_04_Oaofinance_Margin_LeverageFee"),
        requestRate: new Counter("rps_002_01_04_Oaofinance_Margin_LeverageFee"),
        http_reqs: new Counter("sample_002_01_04_Oaofinance_Margin_LeverageFee"),
    },
    Oaofinance_Margin_FinancingDetail: {
        errorCount: new Counter("error_count_002_01_05_Oaofinance_Margin_FinancingDetail"),
        errorRate: new Rate("error_rate_002_01_05_Oaofinance_Margin_FinancingDetail"),
        httpDuration: new Trend("duration_002_01_05_Oaofinance_Margin_FinancingDetail"),
        httpWaiting: new Trend("waiting_002_01_05_Oaofinance_Margin_FinancingDetail"),
        requestRate: new Counter("rps_002_01_05_Oaofinance_Margin_FinancingDetail"),
        http_reqs: new Counter("sample_002_01_05_Oaofinance_Margin_FinancingDetail"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_002_01_06_User_Profile_Trading"),
        errorRate: new Rate("error_rate_002_01_06_User_Profile_Trading"),
        httpDuration: new Trend("duration_002_01_06_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_002_01_06_User_Profile_Trading"),
        requestRate: new Counter("rps_002_01_06_User_Profile_Trading"),
        http_reqs: new Counter("sample_002_01_06_User_Profile_Trading"),
    },
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_002_01_07_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_002_01_07_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_002_01_07_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_002_01_07_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_002_01_07_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_002_01_07_Oaofinance_Quota_Status_Margin"),
    },
};

// SETUP FUNCTION - Runs once before test starts
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    // Determine base_url
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
    
    console.log(`Starting login for ${totalUsers} users...`);
    
    // Login untuk semua user sekaligus di setup phase
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
            formattedNum = String(startNum + i - 1).padStart(2, '0');
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }

        const payload = JSON.stringify({
            password: 'M@nsek.123',
            email: email,
            recaptcha: '',
        });

        const headers = {
            'Content-Type': 'application/json',
        };

        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
            tokens[i] = { email: email, token: null };
        }
    }
    
    console.log(`Login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

// Main test function
export default function (data) {
    // Get token for this VU
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const base_url = data.base_url;
    
    // 1 //
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/eligibility`,
        ];

        const stepOneHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                LandingPage.Oaofinance_Margin_Eligibility,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // 2 //
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,
        ];

        const stepTwoHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                LandingPage.Oaofinance_Margin_MinTotalCollateralAssetsValue,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // 3 //
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/benefit`,
            base_url + `/oaofinance/api/v1/margin/leverage-fee`,
            base_url + `/oaofinance/api/v1/margin/financing-detail?content_type=margin`,
            base_url + `/user/api/v2/profile/trading`,
            base_url + `/oaofinance/api/v1/quota/status/margin`,
        ];

        const stepThreeHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepThreeHeaders }],
            ['GET', urls[1], null, { headers: stepThreeHeaders }],
            ['GET', urls[2], null, { headers: stepThreeHeaders }],
            ['GET', urls[3], null, { headers: stepThreeHeaders }],
            ['GET', urls[4], null, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                LandingPage.Oaofinance_Margin_Benefit,
                LandingPage.Oaofinance_Margin_LeverageFee,
                LandingPage.Oaofinance_Margin_FinancingDetail,
                LandingPage.User_Profile_Trading,
                LandingPage.Oaofinance_Quota_Status_Margin,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0,25);
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
            const htmlPath = `../../Report/OMO_Android/BP002/Manual/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../Report/OMO_Android/BP002/Regression/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../Report/OMO_Android/BP002/LoadTest/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`;
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