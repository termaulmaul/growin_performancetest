import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP001 - Homepage
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/Growin_Invest/BP001/Manual/Manual_DryRun_0908_1601_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=1000 -e DURATION=5m -e NUMSTART=0 --out dashboard=export=../../Report/Growin_Invest/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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
            gracefulStop: '30s',  // Beri waktu graceful shutdown
        },
    },
    noConnectionReuse: false,  // Enable keep-alive
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

// PIN
// /auth/api/v1/protected/pin-login - POST
// /auth/api/v1/protected/account-center/switchables
// /user/api/v1/watchlistgroup
// /user/api/protected/v2/portfolio/stock
// /user/api/protected/v1/portfolio/consolidated
// /user/api/protected/v2/portfolio-stock/cash
// /user/api/protected/v1/profile/collateral-ratio
// /user/api/v2/watchlist/c81e7cfa-406c-4fd1-97db-520c0ac4cad1?limit=200&page=1
// /mutualfund/api/v1/content/risk-profile?size=original
// /user/api/protected/v2/portfolio/stock
// /user/api/protected/v1/portfolio/consolidated
// /user/api/protected/v2/portfolio-stock/cash
// /user/api/protected/v1/profile/collateral-ratio
// /mutualfund/api/v1/user/risk-profile

// /auth/pin-login - POST

// /auth/account-center/switchables
// /user/watchlistgroup
// /user/portfolio/stock
// /user/portfolio/consolidated
// /user/portfolio-stock/cash
// /user/profile/collateral-ratio
// /user/watchlist/WatchlistID
// /mutualfund/content/risk-profile?size=original
// /user/portfolio/stock
// /user/portfolio/consolidated
// /user/portfolio-stock/cash
// /user/profile/collateral-ratio
// /mutualfund/user/risk-profile

// Define custom metrics
const Homepage_PIN = {
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
};

// Main test function
export default function () {
    // Determine the environment and user email based on ENV
    let base_url = '';
    let base_wss = '';
    let email = '';

    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://dev-api.growin.id';
        base_wss = 'wss://dev-api.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id'
        base_wss = 'wss://api-qa.growin.id'

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id'
        base_wss = 'wss://drc-api.growin.id'

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(0, '0');
        email = 'MOSTNG' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id'
        base_wss = 'wss://internal-api-pt.growin.id'

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(2, '0');
        email = 'MOSTNG' + formattedRandomNumber + '@guysmail.com'
    }

    // Define request headers
    const headers = {
        'Content-Type': 'application/json',
    };

    const params = {
        timeout: '60s',
    };

    // Login payload
    const payload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    // Perform login request
    let res = http.post(base_url + '/auth/api/v1/login', payload, params);

    let token;
    if (res.status === 200) {
        token = res.json().data.token;
    } else {
        // console.error(`${email} Failed to Login || Status: ${res.status} | Body: ${res.body}`);
    }
    sleep(0,25);

    // Perform PIN login request
    let pin_token;
    if (token) {
        const pinPayload = JSON.stringify({ value: "123456" });
        const pinParams = { headers: { cookie: 'ACCESS_TOKEN=' + token } };

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
            base_url + `/bond/api/v1/sbn/transaction/portfolio/list`,
            base_url + `/bond/api/v1/sbn/master/strapi/banner`,
            base_url + `/bond/api/v1/sbn/client/check/status`,
            base_url + `/bond/api/v1/sbn/master/product/list?page=0&max=100&status=A`,
            base_url + `/user/api/protected/v1/portfolio/consolidated`,
            base_url + `/user/api/protected/v2/portfolio-stock/cash`,
        ];

        const batchHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
            ['GET', urls[1], null, { headers: batchHeaders }],
            ['POST', urls[2], null, { headers: batchHeaders }],
            ['GET', urls[3], null, { headers: batchHeaders }],
            ['GET', urls[4], null, { headers: batchHeaders }],
            ['GET', urls[5], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metricPortfolio = [
                Portfolio.Portfolio_SBN_Transaction_Portfolio_List,
                Portfolio.Portfolio_SBN_Master_Strapi_Banner,
                Portfolio.Portfolio_SBN_Client_Check_Status,
                Portfolio.Portfolio_SBN_Master_Product_List,
                Portfolio.Portfolio_Portfolio_Consolidated,
                Portfolio.Portfolio_PortfolioStock_Cash_V2,
            ];

            const metric = metricPortfolio[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                // console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                // console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    sleep(0,25);

    if (token && pin_token) {
        const urls = [
            base_url + `/bond/api/v1/ipo/bond/transaction/portfolio/list?page=1&max=5&order_by=1`,
        ];

        const batchHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metricPortfolio = [
                Portfolio.Portfolio_IPO_Bond_Transaction_Portfolio_List,
            ];

            const metric = metricPortfolio[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                // console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                // console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
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
            [`../../Report/Growin_Invest/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_Invest/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}
