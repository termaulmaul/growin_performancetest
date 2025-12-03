import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP007 - Profile Confirmation Page
//RUN QA : ../../k6 run BP007.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=70 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_2021_2141_BP007_Local.html
//RUN INT: ../../k6 run BP007.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=3m -e NUMSTART=101 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_1023_1835_BP007_Local.html
//RUN STRESS TEST: ../../k6 run BP007.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP007/Manual/Manual_DryRun_2021_1128_BP007_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// Define options for test execution
// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'constant-vus',
//             vus: `${__ENV.USER}`,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '0s',
//         },
//     },
//     noConnectionReuse: false,
//     setupTimeout: '15m',
//     teardownTimeout: '15m',
//     summaryTimeUnit: '15m',
// };

export const options = {
    scenarios: {
        contacts: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '1h',
        },
    },
};

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
    
    console.log(`Starting login and PIN login for ${totalUsers} users...`);
    
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
        let pin_token = null;

        if (res.status === 200) {
            token = res.json().data.token;
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);

            const pinPayload = JSON.stringify({ value: "123456" });
            const pinHeaders = { 
                'Content-Type': 'application/json',
                'Cookie': `ACCESS_TOKEN=${token}` 
            };

            res = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

            if (res.status === 200) {
                pin_token = res.json().data.pin_token;
                console.log(`User ${i}/${totalUsers} - ${email} PIN Login Success`);
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} PIN Login Failed - Status: ${res.status}`);
            }
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
        }

        tokens[i] = { 
            email: email, 
            token: token,
            pin_token: pin_token
        };
    }
    
    console.log(`Login and PIN login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

export default function (data) {
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`VU${vuId} - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const base_url = data.base_url;

    let portfolio_id;
    let stock_code;
    let last_price;

    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/draft`,
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

        const OaofinanceMarginPayload = JSON.stringify({
            is_consent_margin: true, 
            is_consent_lpip: true
        });

        const requests = [
            ['POST', urls[0], OaofinanceMarginPayload, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            if (response.status === 200) {
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    if (token) {
        const eligibleAssetHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
        };
        
        let res = http.get(base_url + '/oaofinance/api/v1/user/eligible-asset', { headers: eligibleAssetHeaders });
        
        if (res.status === 200) {
            const stocks = res.json().data.stocks;
            const selectedStock = stocks.find(stock => stock.share >= 100);
            
            if (selectedStock) {
                portfolio_id = selectedStock.portfolio_id;
                stock_code = selectedStock.stock_code;
                last_price = selectedStock.last_price;
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`VU${vuId} Selected Stock - portfolio_id: ${portfolio_id}, stock_code: ${stock_code}`);
                }
            } else {
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`VU${vuId} ${email} No stock found with share >= 100`);
                }
            }
        } else {
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`VU${vuId} ${email} Failed to get eligible asset || Status: ${res.status}`);
            }
        }
    }
    
    if (token && pin_token && portfolio_id && stock_code && last_price) {
        const urls = [
            base_url + `/oaofinance/api/v1/quota/status/margin`,
            base_url + `/oaofinance/api/v1/marginUser/collateral-asset`,
        ];

        const batchHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
        };

        const Oaofinance_MarginUser_CollateralAsset_Payload = JSON.stringify({
            margin_limit: 100000000, 
            submitted_cash: 100000000, 
            submitted_stock: [{
                portfolio_id: String(portfolio_id),
                symbol: stock_code, 
                submitted_price: last_price, 
                submitted_unit: 100
            }]
        });

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
            ['POST', urls[1], Oaofinance_MarginUser_CollateralAsset_Payload, { headers: batchHeaders }],
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
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`VU${vuId} ${email} SUCCESS ${urls[index]}`);
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
                    console.error(`VU${vuId} ${email} ERROR ${urls[index]} || Status: ${response.status}`);
                }
            }
        });
    }
    
    sleep(0.25);
}

// // Generate the test report
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