import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP003 - Stock - Simple Order
//RUN QA : ../k6 run BP003.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=30 --out dashboard=export=../Report/Growin_iOS/BP003/Manual/Manual_DryRun_1204_1436_BP003_Local.html
// ../../k6 run BP000.js -e RUNBY=Manual -e ENV=DEV -e USER=75 -e DURATION=15m -e NUMSTART=101 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP000/Manual/Manual_DryRun_2023_1016_BP000_Local.html
//RUN DRC: ../k6 run BP003.js -e RUNBY=Manual -e ENV=DRC -e USER=1000 -e DURATION=5m -e NUMSTART=14000 --out dashboard=export=../Report/Growin_iOS/BP003/Manual/Manual_DryRun_1119_1354_BP003_48.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC]

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

// /user/api/protected/v2/portfolio/stock
// /marketdata/api/v1/orderbook/BMRI
// /order/api/v1/fast-order-list/BMRI
// /user/api/protected/v2/portfolio-stock/cash
// /user/api/protected/v1/portfolio/consolidated

// Define custom metrics
const SimpleOrder = {
    SimpleOrder_Portfolio_Stock: {
        errorCount: new Counter("error_count_003_01_01_Portfolio_Stock"),
        errorRate: new Rate("error_rate_003_01_01_Portfolio_Stock"),
        httpDuration: new Trend("duration_003_01_01_Portfolio_Stock"),
        httpWaiting: new Trend("waiting_003_01_01_Portfolio_Stock"),
        requestRate: new Counter("rps_003_01_01_Portfolio_Stock"),
        http_reqs: new Counter("sample_003_01_01_Portfolio_Stock"),
    },
    SimpleOrder_OrderbookStock: {
        errorCount: new Counter("error_count_003_01_02_OrderbookStock"),
        errorRate: new Rate("error_rate_003_01_02_OrderbookStock"),
        httpDuration: new Trend("duration_003_01_02_OrderbookStock"),
        httpWaiting: new Trend("waiting_003_01_02_OrderbookStock"),
        requestRate: new Counter("rps_003_01_02_OrderbookStock"),
        http_reqs: new Counter("sample_003_01_02_OrderbookStock"),
    },
    SimpleOrder_FastOrderList_Stock: {
        errorCount: new Counter("error_count_003_01_03_FastOrderList_Stock"),
        errorRate: new Rate("error_rate_003_01_03_FastOrderList_Stock"),
        httpDuration: new Trend("duration_003_01_03_FastOrderList_Stock"),
        httpWaiting: new Trend("waiting_003_01_03_FastOrderList_Stock"),
        requestRate: new Counter("rps_003_01_03_FastOrderList_Stock"),
        http_reqs: new Counter("sample_003_01_03_FastOrderList_Stock"),
    },
    SimpleOrder_PortfolioStock_Cash: {
        errorCount: new Counter("error_count_003_01_04_PortfolioStock_Cash"),
        errorRate: new Rate("error_rate_003_01_04_PortfolioStock_Cash"),
        httpDuration: new Trend("duration_003_01_04_PortfolioStock_Cash"),
        httpWaiting: new Trend("waiting_003_01_04_PortfolioStock_Cash"),
        requestRate: new Counter("rps_003_01_04_PortfolioStock_Cash"),
        http_reqs: new Counter("sample_003_01_04_PortfolioStock_Cash"),
    },
    SimpleOrder_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_003_01_05_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_003_01_05_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_003_01_05_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_003_01_05_Portfolio_Consolidated"),
        requestRate: new Counter("rps_003_01_05_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_003_01_05_Portfolio_Consolidated"),
    },
};

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
        'Content-Type':'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*',
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
    } else {
        console.error(`${email} Failed to Login || Status: ${res.status} | Body: ${res.body}`);
    }
    sleep(0,25);

    // Perform PIN login request
    let pin_token;
    if (token) {
        const pinPayload = JSON.stringify({ value: "123456" });
        const pinParams = { headers: { 
            cookie: 'ACCESS_TOKEN=' + token,
        'Content-Type':'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*', } };

        res = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, pinParams);

        if (res.status === 200) {
            pin_token = res.json().data.pin_token;
        } else {
            // console.error(`${email} Got Wrong PIN! || Status: ${res.status} || Body: ${res.body}`);
        }
    }
    sleep(0,25);

    // If login and PIN login succeed, perform batch requests
    if (token && pin_token) {
        const urls = [
            base_url + '/user/api/protected/v2/portfolio/stock',
            base_url + '/marketdata/api/v1/orderbook/BMRI',
            base_url + '/order/api/v1/fast-order-list/BMRI',
            base_url + '/user/api/protected/v2/portfolio-stock/cash',
            base_url + '/user/api/protected/v1/portfolio/consolidated',
        ];

        const batchHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*',
        };

        const requests = urls.map((url) => ['GET', url, null, { headers: batchHeaders }]);
        const responses = http.batch(requests);

        // Check and capture metrics for each request
        responses.forEach((response, index) => {
            const metricSimpleOrder = [
                SimpleOrder.SimpleOrder_Portfolio_Stock,
                SimpleOrder.SimpleOrder_OrderbookStock,
                SimpleOrder.SimpleOrder_FastOrderList_Stock,
                SimpleOrder.SimpleOrder_PortfolioStock_Cash,
                SimpleOrder.SimpleOrder_Portfolio_Consolidated,
            ];

            const metric = metricSimpleOrder[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200,
                });
                // console.error(`ERROR ${urls[index]} | Status: ${response.status} | Body: ${response.body}`);
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
            [`../Report/Growin_iOS/BP003/Manual/${__ENV.RUNBY}_Detail_BP003_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../Report/Growin_iOS/BP003/Regression/${__ENV.RUNBY}_Detail_BP003_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}