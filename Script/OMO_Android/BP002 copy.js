import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP002 - Landing Page
//RUN QA : ../../k6 run BP002.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/OMO_Android/BP002/Manual/Manual_DryRun_2021_1746_BP002_Local.html
//RUN INT: ../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e USER=100 -e DURATION=5m -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP002/Manual/Manual_DryRun_2021_1947_BP002_Local.html
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
        if (`${__ENV.ENV}` != 'INT') {
            console.log(`VU${exec.vu.idInTest} - ${email} Login Success`);
        }
    } else {
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`VU${exec.vu.idInTest} - ${email} Failed to Login || Status: ${res.status} || Status: ${res.body}`);
        }
        return;
    }
    sleep(0,25);
    
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
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
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
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
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
                if (`${__ENV.ENV}` != 'INT') {
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
            [`../../Report/OMO_Android/BP002/Manual/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/OMO_Android/BP002/Regression/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}