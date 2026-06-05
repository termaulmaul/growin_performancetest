import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";

// ##READ ME
//BP009 - Financial Summarizer Backend - News Feature
//RUN QA : ../../k6 run BP009.js -e RUNBY=Manual -e ENV=QA -e USER=100 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP009/Manual/Manual_DryRun_1125_1410_BP009_Local.html
//RUN INT: ../../k6 run BP009.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP009/Manual/Manual_DryRun_1125_1403_BP009_Local.html
//RUN STRESS TEST: ../../k6 run BP009.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP009/Manual/Manual_DryRun_2021_1128_BP009_Local.html
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

// /marketdata/api/v1/marketinfo/profile
// /marketdata/api/v1/key-statistic/eps
// /marketdata/api/v1/key-statistic/dividend
// /marketdata/api/v1/key-statistic/valuation
// /marketdata/api/v1/key-statistic/fundamentals
// /marketdata/api/v1/key-statistic/profitability
// /marketdata/api/v1/key-statistic/earnings
// /marketdata/api/v1/key-statistic/liquidity

// Marketdata_Marketinfo_Profile
// Marketdata_KeyStatistic_Eps
// Marketdata_KeyStatistic_Dividend
// Marketdata_KeyStatistic_Valuation
// Marketdata_KeyStatistic_Fundamentals
// Marketdata_KeyStatistic_Profitability
// Marketdata_KeyStatistic_Earnings
// Marketdata_KeyStatistic_Liquidity

// Define custom metrics
const FinancialSummarizerBackendNewsFeature = {
    Marketdata_Marketinfo_Profile: {
        errorCount: new Counter("error_count_009_01_01_Marketdata_Marketinfo_Profile"),
        errorRate: new Rate("error_rate_009_01_01_Marketdata_Marketinfo_Profile"),
        httpDuration: new Trend("duration_009_01_01_Marketdata_Marketinfo_Profile"),
        httpWaiting: new Trend("waiting_009_01_01_Marketdata_Marketinfo_Profile"),
        requestRate: new Counter("rps_009_01_01_Marketdata_Marketinfo_Profile"),
        http_reqs: new Counter("sample_009_01_01_Marketdata_Marketinfo_Profile"),
    },
    Marketdata_KeyStatistic_Eps: {
        errorCount: new Counter("error_count_009_01_02_Marketdata_KeyStatistic_Eps"),
        errorRate: new Rate("error_rate_009_01_02_Marketdata_KeyStatistic_Eps"),
        httpDuration: new Trend("duration_009_01_02_Marketdata_KeyStatistic_Eps"),
        httpWaiting: new Trend("waiting_009_01_02_Marketdata_KeyStatistic_Eps"),
        requestRate: new Counter("rps_009_01_02_Marketdata_KeyStatistic_Eps"),
        http_reqs: new Counter("sample_009_01_02_Marketdata_KeyStatistic_Eps"),
    },
    Marketdata_KeyStatistic_Dividend: {
        errorCount: new Counter("error_count_009_01_03_Marketdata_KeyStatistic_Dividend"),
        errorRate: new Rate("error_rate_009_01_03_Marketdata_KeyStatistic_Dividend"),
        httpDuration: new Trend("duration_009_01_03_Marketdata_KeyStatistic_Dividend"),
        httpWaiting: new Trend("waiting_009_01_03_Marketdata_KeyStatistic_Dividend"),
        requestRate: new Counter("rps_009_01_03_Marketdata_KeyStatistic_Dividend"),
        http_reqs: new Counter("sample_009_01_03_Marketdata_KeyStatistic_Dividend"),
    },
    Marketdata_KeyStatistic_Valuation: {
        errorCount: new Counter("error_count_009_01_04_Marketdata_KeyStatistic_Valuation"),
        errorRate: new Rate("error_rate_009_01_04_Marketdata_KeyStatistic_Valuation"),
        httpDuration: new Trend("duration_009_01_04_Marketdata_KeyStatistic_Valuation"),
        httpWaiting: new Trend("waiting_009_01_04_Marketdata_KeyStatistic_Valuation"),
        requestRate: new Counter("rps_009_01_04_Marketdata_KeyStatistic_Valuation"),
        http_reqs: new Counter("sample_009_01_04_Marketdata_KeyStatistic_Valuation"),
    },
    Marketdata_KeyStatistic_Fundamentals: {
        errorCount: new Counter("error_count_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        errorRate: new Rate("error_rate_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        httpDuration: new Trend("duration_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        httpWaiting: new Trend("waiting_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        requestRate: new Counter("rps_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        http_reqs: new Counter("sample_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
    },
    Marketdata_KeyStatistic_Profitability: {
        errorCount: new Counter("error_count_009_01_06_Marketdata_KeyStatistic_Profitability"),
        errorRate: new Rate("error_rate_009_01_06_Marketdata_KeyStatistic_Profitability"),
        httpDuration: new Trend("duration_009_01_06_Marketdata_KeyStatistic_Profitability"),
        httpWaiting: new Trend("waiting_009_01_06_Marketdata_KeyStatistic_Profitability"),
        requestRate: new Counter("rps_009_01_06_Marketdata_KeyStatistic_Profitability"),
        http_reqs: new Counter("sample_009_01_06_Marketdata_KeyStatistic_Profitability"),
    },
    Marketdata_KeyStatistic_Earnings: {
        errorCount: new Counter("error_count_009_01_07_Marketdata_KeyStatistic_Earnings"),
        errorRate: new Rate("error_rate_009_01_07_Marketdata_KeyStatistic_Earnings"),
        httpDuration: new Trend("duration_009_01_07_Marketdata_KeyStatistic_Earnings"),
        httpWaiting: new Trend("waiting_009_01_07_Marketdata_KeyStatistic_Earnings"),
        requestRate: new Counter("rps_009_01_07_Marketdata_KeyStatistic_Earnings"),
        http_reqs: new Counter("sample_009_01_07_Marketdata_KeyStatistic_Earnings"),
    },
    Marketdata_KeyStatistic_Liquidity: {
        errorCount: new Counter("error_count_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        errorRate: new Rate("error_rate_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        httpDuration: new Trend("duration_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        httpWaiting: new Trend("waiting_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        requestRate: new Counter("rps_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        http_reqs: new Counter("sample_009_01_08_Marketdata_KeyStatistic_Liquidity"),
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
            // 'Content-Type': 'application/json',

            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
            'User-Agent':'PostmanRuntime/7.43.0'
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

// MAIN TEST FUNCTION - Runs for each iteration
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

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/marketinfo/profile?seccode=BMRI`,
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
            ['GET', urls[0], null, { headers: stepOneHeaders, timeout: '5m' }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendNewsFeature.Marketdata_Marketinfo_Profile,
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
    // Batch 2
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/key-statistic/eps`,
            base_url + `/marketdata/api/v1/key-statistic/dividend`,
            base_url + `/marketdata/api/v1/key-statistic/valuation`,
            base_url + `/marketdata/api/v1/key-statistic/fundamentals`,
            base_url + `/marketdata/api/v1/key-statistic/profitability`,
            base_url + `/marketdata/api/v1/key-statistic/earnings`,
            base_url + `/marketdata/api/v1/key-statistic/liquidity`,
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
            ['GET', urls[0], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[1], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[2], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[3], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[4], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[5], null, { headers: stepTwoHeaders, timeout: '5m' }],
            ['GET', urls[6], null, { headers: stepTwoHeaders, timeout: '5m' }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Eps,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Dividend,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Valuation,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Fundamentals,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Profitability,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Earnings,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Liquidity,
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
            const htmlPath = `../../../Report/Growin_AI_Summarizer/Web/BP009/Manual/${__ENV.RUNBY}_Detail_BP009_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_AI_Summarizer/Web/BP009/Regression/${__ENV.RUNBY}_Detail_BP009_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_AI_Summarizer/Web/BP009/LoadTest/${__ENV.RUNBY}_Detail_BP009_Web_${dateStr}_${timeStr}.html`;
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