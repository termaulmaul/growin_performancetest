import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP001 - Homescreen
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/OMO_Android/BP001/Manual/Manual_DryRun_1006_2200_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=1000 -e DURATION=5m -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
//RUN STRESS TEST: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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

// /auth/api/v1/login
// /auth/api/v1/protected/validate
// /user/api/v1/portfolio/consolidated
// /user/api/v1/profile/trading
// /user/api/v1/profile/personal
// /user/api/v1/portfolio-stock/cash
// /marketdata/api/v1/stock-rank-explore (top gainer)
// /marketdata/api/v1/stock-rank-explore (top volume)

// Define custom metrics
const Homescreen = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    Auth_Pprotected_Validate: {
        errorCount: new Counter("error_count_001_02_02_Auth_Pprotected_Validate"),
        errorRate: new Rate("error_rate_001_02_02_Auth_Pprotected_Validate"),
        httpDuration: new Trend("duration_001_02_02_Auth_Pprotected_Validate"),
        httpWaiting: new Trend("waiting_001_02_02_Auth_Pprotected_Validate"),
        requestRate: new Counter("rps_001_02_02_Auth_Pprotected_Validate"),
        http_reqs: new Counter("sample_001_02_02_Auth_Pprotected_Validate"),
    },
    User_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_001_03_03_User_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_001_03_03_User_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_001_03_03_User_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_001_03_03_User_Portfolio_Consolidated"),
        requestRate: new Counter("rps_001_03_03_User_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_001_03_03_User_Portfolio_Consolidated"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_03_04_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_03_04_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_03_04_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_03_04_User_Profile_Trading"),
        requestRate: new Counter("rps_001_03_04_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_03_04_User_Profile_Trading"),
    },
    User_Profile_Personal: {
        errorCount: new Counter("error_count_001_03_05_User_Profile_Personal"),
        errorRate: new Rate("error_rate_001_03_05_User_Profile_Personal"),
        httpDuration: new Trend("duration_001_03_05_User_Profile_Personal"),
        httpWaiting: new Trend("waiting_001_03_05_User_Profile_Personal"),
        requestRate: new Counter("rps_001_03_05_User_Profile_Personal"),
        http_reqs: new Counter("sample_001_03_05_User_Profile_Personal"),
    },
    User_PortfolioStock_Cash: {
        errorCount: new Counter("error_count_001_03_06_User_PortfolioStock_Cash"),
        errorRate: new Rate("error_rate_001_03_06_User_PortfolioStock_Cash"),
        httpDuration: new Trend("duration_001_03_06_User_PortfolioStock_Cash"),
        httpWaiting: new Trend("waiting_001_03_06_User_PortfolioStock_Cash"),
        requestRate: new Counter("rps_001_03_06_User_PortfolioStock_Cash"),
        http_reqs: new Counter("sample_001_03_06_User_PortfolioStock_Cash"),
    },
    Marketdata_StockRankExplore_TopGainer: {
        errorCount: new Counter("error_count_001_03_07_Marketdata_StockRankExplore_TopGainer"),
        errorRate: new Rate("error_rate_001_03_07_Marketdata_StockRankExplore_TopGainer"),
        httpDuration: new Trend("duration_001_03_07_Marketdata_StockRankExplore_TopGainer"),
        httpWaiting: new Trend("waiting_001_03_07_Marketdata_StockRankExplore_TopGainer"),
        requestRate: new Counter("rps_001_03_07_Marketdata_StockRankExplore_TopGainer"),
        http_reqs: new Counter("sample_001_03_07_Marketdata_StockRankExplore_TopGainer"),
    },
    Marketdata_StockRankExplore_TopVolume: {
        errorCount: new Counter("error_count_001_03_08_Marketdata_StockRankExplore_TopVolume"),
        errorRate: new Rate("error_rate_001_03_08_Marketdata_StockRankExplore_TopVolume"),
        httpDuration: new Trend("duration_001_03_08_Marketdata_StockRankExplore_TopVolume"),
        httpWaiting: new Trend("waiting_001_03_08_Marketdata_StockRankExplore_TopVolume"),
        requestRate: new Counter("rps_001_03_08_Marketdata_StockRankExplore_TopVolume"),
        http_reqs: new Counter("sample_001_03_08_Marketdata_StockRankExplore_TopVolume"),
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
        email = 'TESTMON' + formattedRandomNumber + '@guysmail.com'
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
    Homescreen.Auth_Login.httpDuration.add(res.timings.duration);
    if (res.status === 200) {
        token = res.json().data.token;
        Homescreen.Auth_Login.errorRate.add(false);
        Homescreen.Auth_Login.errorCount.add(0);
        Homescreen.Auth_Login.requestRate.add(true);
        Homescreen.Auth_Login.http_reqs.add(1);
    } else {
        Homescreen.Auth_Login.errorRate.add(true);
        Homescreen.Auth_Login.errorCount.add(1);
        Homescreen.Auth_Login.requestRate.add(false);
        Homescreen.Auth_Login.http_reqs.add(1);
        check(res, {
        [`FAILED Login || Status: ${res.status} || Body: ${res.body}`]: (r) => r.status === 200,
        });
        // console.error(`${email} Failed to Login || Status: ${res.status} | Body: ${res.body}`);
    }

    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/validate`,
        ];

        const batchHeaders = {
            headers:{
                'Content-Type':'application/json',
                'Accept-Language':'en',
                'Host':base_host,
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Content-Type':'application/json',
                'Accept':'*/*',
            }
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homescreen.Auth_Pprotected_Validate,
            ];

            const metric = metrics[index];
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
    
    // If login and PIN login succeed, perform batch requests
    if (token) {
        const urls = [
            base_url + `/user/api/v1/portfolio/consolidated`,
            base_url + `/user/api/v1/profile/trading`,
            base_url + `/user/api/v1/profile/personal`,
            base_url + `/user/api/v1/portfolio-stock/cash`,
            base_url + `/marketdata/api/v1/stock-rank-explore?limit=5&rank_by=top_gainer&page=1`,
            base_url + `/marketdata/api/v1/stock-rank-explore?limit=5&rank_by=top_volume&page=1`,
        ];

        const batchHeaders = {
            headers:{
                'Content-Type':'application/json',
                'Accept-Language':'en',
                'Host':base_host,
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Content-Type':'application/json',
                'Accept':'*/*',
            }
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
            ['GET', urls[1], null, { headers: batchHeaders }],
            ['GET', urls[2], null, { headers: batchHeaders }],
            ['GET', urls[3], null, { headers: batchHeaders }],
            ['GET', urls[4], null, { headers: batchHeaders }],
            ['GET', urls[5], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homescreen.User_Portfolio_Consolidated,
                Homescreen.User_Profile_Trading,
                Homescreen.User_Profile_Personal,
                Homescreen.User_PortfolioStock_Cash,
                Homescreen.Marketdata_StockRankExplore_TopGainer,
                Homescreen.Marketdata_StockRankExplore_TopVolume,
            ];

            const metric = metrics[index];
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
            [`../../Report/OMO_Android/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/OMO_Android/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}