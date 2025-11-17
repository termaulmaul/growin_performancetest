import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP007 - Profile Confirmation Page
//RUN QA : ../../k6 run BP007.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=70 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_2021_1021_BP007_Local.html
//RUN INT: ../../k6 run BP007.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=15m -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_2021_2009_BP007_Local.html
//RUN STRESS TEST: ../../k6 run BP007.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_2021_1128_BP007_Local.html
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

// /oaofinance/api/v1/quota/status/margin
// /oaofinance/api/v1/marginUser/collateral-asset

// Oaofinance_Quota_Status_Margin
// Oaofinance_MarginUser_CollateralAsset

// Define custom metrics
const CollateralSubmitConfirmationPage = {
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_007_01_01_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_007_01_01_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_007_01_01_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_007_01_01_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_007_01_01_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_007_01_01_Oaofinance_Quota_Status_Margin"),
    },
    Oaofinance_MarginUser_CollateralAsset: {
        errorCount: new Counter("error_count_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        errorRate: new Rate("error_rate_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        httpDuration: new Trend("duration_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        httpWaiting: new Trend("waiting_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        requestRate: new Counter("rps_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        http_reqs: new Counter("sample_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
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

    // Hit eligible asset
    let portfolio_id;
    let stock_code;
    let last_price;
    let share;

    if (token) {
        const eligibleAssetHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };
        
        let res = http.get(base_url + '/oaofinance/api/v1/user/eligible-asset', {headers:eligibleAssetHeaders});
        // console.log(res)
        if (res.status === 200) {
            const stocks = res.json().data.stocks;
            
            // Cari stock pertama yang share-nya >= 100
            const selectedStock = stocks.find(stock => stock.share >= 100);
            
            if (selectedStock) {
                portfolio_id = selectedStock.portfolio_id;
                stock_code = selectedStock.stock_code;
                last_price = selectedStock.last_price;
                share = selectedStock.share;
                
                if (`${__ENV.ENV}`!='INT') {
                    console.log('Selected Stock:', JSON.stringify(selectedStock));
                    console.log('portfolio_id:', portfolio_id, '| stock_code:', stock_code, '| last_price:', last_price, '| share:', share);
                }
            } else {
                if (`${__ENV.ENV}`!='INT') {
                    console.error(`${email} No stock found with share >= 100`);
                }
            }
        } else {
            if (`${__ENV.ENV}`!='INT') {
                console.error(`${base_url}/oaofinance/api/v1/user/eligible-asset || ${email} Failed to get eligible asset! || Status: ${res.status} || Body: ${res.body}`);
            }
        }
    }
    sleep(0,25);
    
    // 1 //
    if (token && portfolio_id && stock_code && last_price) {
        const urls = [
            base_url + `/oaofinance/api/v1/quota/status/margin`,
            base_url + `/oaofinance/api/v1/marginUser/collateral-asset`,
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

        const Oaofinance_MarginUser_CollateralAsset_Payload = JSON.stringify({
            margin_limit: 50000000, 
            submitted_cash: 50000000, 
            submitted_stock: [{
                portfolio_id: String(portfolio_id),
                symbol: stock_code, 
                submitted_price: last_price, 
                submitted_unit: 100
            }]
        });

        const requests = [
            ['GET', urls[0], null, {headers:stepOneHeaders}],
            ['POST', urls[1], Oaofinance_MarginUser_CollateralAsset_Payload, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CollateralSubmitConfirmationPage.Oaofinance_Quota_Status_Margin,
                CollateralSubmitConfirmationPage.Oaofinance_MarginUser_CollateralAsset,
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
            [`../../Report/OMO_Android/BP007/Manual/${__ENV.RUNBY}_Detail_BP007_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/OMO_Android/BP007/Regression/${__ENV.RUNBY}_Detail_BP007_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}