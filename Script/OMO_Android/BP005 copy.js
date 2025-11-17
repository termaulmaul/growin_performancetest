import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP005 - Profile Confirmation Page
//RUN QA : ../../k6 run BP005.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=50 --out dashboard=export=../../Report/OMO_Android/BP005/Manual/Manual_DryRun_2021_1142_BP005_Local.html
//RUN INT: ../../k6 run BP005.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=15m -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP005/Manual/Manual_DryRun_2021_0853_BP005_Local.html
//RUN STRESS TEST: ../../k6 run BP005.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP005/Manual/Manual_DryRun_2021_1128_BP005_Local.html
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
    setupTimeout: '120m',
    teardownTimeout: '120m',
    summaryTimeUnit: '120m',
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

// /oaofinance/api/v1/margin/min-total-collateral-assets-value
// /oaofinance/api/v1/user/eligible-asset

// Oaofinance_Margin_MinTotalCollateralAssetsValue
// Oaofinance_User_EligibleAsset

// Define custom metrics
const CollateralSetupPage = {
    Oaofinance_Margin_MinTotalCollateralAssetsValue: {
        errorCount: new Counter("error_count_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        errorRate: new Rate("error_rate_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpDuration: new Trend("duration_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpWaiting: new Trend("waiting_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        requestRate: new Counter("rps_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        http_reqs: new Counter("sample_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
    },
    Oaofinance_User_EligibleAsset: {
        errorCount: new Counter("error_count_005_01_02_Oaofinance_User_EligibleAsset"),
        errorRate: new Rate("error_rate_005_01_02_Oaofinance_User_EligibleAsset"),
        httpDuration: new Trend("duration_005_01_02_Oaofinance_User_EligibleAsset"),
        httpWaiting: new Trend("waiting_005_01_02_Oaofinance_User_EligibleAsset"),
        requestRate: new Counter("rps_005_01_02_Oaofinance_User_EligibleAsset"),
        http_reqs: new Counter("sample_005_01_02_Oaofinance_User_EligibleAsset"),
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
        if (`${__ENV.ENV}`!='INT') {
            console.log(`VU${exec.vu.idInTest} - ${email} Login Success`);
        }
    } else {
        if (`${__ENV.ENV}`!='INT') {
            console.error(`VU${exec.vu.idInTest} - ${email} Failed to Login || Status: ${res.status} || Status: ${res.body}`);
        }
        return;
    }
    sleep(0,25);
    
    // 1 //
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/min-total-collateral-assets-value`,
            base_url + `/oaofinance/api/v1/user/eligible-asset`,
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

        const requests = [
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
            ['GET', urls[1], undefined, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CollateralSetupPage.Oaofinance_Margin_MinTotalCollateralAssetsValue,
                CollateralSetupPage.Oaofinance_User_EligibleAsset,
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
            [`../../Report/OMO_Android/BP005/Manual/${__ENV.RUNBY}_Detail_BP005_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/OMO_Android/BP005/Regression/${__ENV.RUNBY}_Detail_BP005_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}