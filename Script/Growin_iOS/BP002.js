import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP002 - Homepage
//RUN QA : ../../k6 run BP002.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/Growin_iOS/BP002/Manual/Manual_DryRun_0908_1601_BP002_Local.html
//RUN INT: ../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=3h -e NUMSTART=0 --out dashboard=export=../../Report/Growin_iOS/BP002/Manual/Manual_DryRun_2021_2214_BP002_Local.html
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

// API
// /auth/api/v1/login?nocookies=1

// Define custom metrics
const Homepage = {
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_01_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_01_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_01_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_01_User_UserSettings"),
        requestRate: new Counter("rps_001_01_01_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_01_User_UserSettings"),
    },
    Aauth_GetConfig: {
        errorCount: new Counter("error_count_001_01_02_Aauth_GetConfig"),
        errorRate: new Rate("error_rate_001_01_02_Aauth_GetConfig"),
        httpDuration: new Trend("duration_001_01_02_Aauth_GetConfig"),
        httpWaiting: new Trend("waiting_001_01_02_Aauth_GetConfig"),
        requestRate: new Counter("rps_001_01_02_Aauth_GetConfig"),
        http_reqs: new Counter("sample_001_01_02_Aauth_GetConfig"),
    },
    Order_OrderStatusActionMap: {
        errorCount: new Counter("error_count_001_01_03_Order_OrderStatusActionMap"),
        errorRate: new Rate("error_rate_001_01_03_Order_OrderStatusActionMap"),
        httpDuration: new Trend("duration_001_01_03_Order_OrderStatusActionMap"),
        httpWaiting: new Trend("waiting_001_01_03_Order_OrderStatusActionMap"),
        requestRate: new Counter("rps_001_01_03_Order_OrderStatusActionMap"),
        http_reqs: new Counter("sample_001_01_03_Order_OrderStatusActionMap"),
    },
    Auth_AccountCenter_Status: {
        errorCount: new Counter("error_count_001_01_04_Auth_AccountCenter_Status"),
        errorRate: new Rate("error_rate_001_01_04_Auth_AccountCenter_Status"),
        httpDuration: new Trend("duration_001_01_04_Auth_AccountCenter_Status"),
        httpWaiting: new Trend("waiting_001_01_04_Auth_AccountCenter_Status"),
        requestRate: new Counter("rps_001_01_04_Auth_AccountCenter_Status"),
        http_reqs: new Counter("sample_001_01_04_Auth_AccountCenter_Status"),
    },
    User_Watchlistgroup_1: {
        errorCount: new Counter("error_count_001_01_05_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_001_01_05_User_Watchlistgroup"),
        httpDuration: new Trend("duration_001_01_05_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_001_01_05_User_Watchlistgroup"),
        requestRate: new Counter("rps_001_01_05_User_Watchlistgroup"),
        http_reqs: new Counter("sample_001_01_05_User_Watchlistgroup"),
    },
    News_Categories: {
        errorCount: new Counter("error_count_001_01_06_News_Categories"),
        errorRate: new Rate("error_rate_001_01_06_News_Categories"),
        httpDuration: new Trend("duration_001_01_06_News_Categories"),
        httpWaiting: new Trend("waiting_001_01_06_News_Categories"),
        requestRate: new Counter("rps_001_01_06_News_Categories"),
        http_reqs: new Counter("sample_001_01_06_News_Categories"),
    },
    User_Profile_Trading_1: {
        errorCount: new Counter("error_count_001_01_07_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_07_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_07_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_07_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_07_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_07_User_Profile_Trading"),
    },
    User_Profile_Personal: {
        errorCount: new Counter("error_count_001_01_08_User_Profile_Personal"),
        errorRate: new Rate("error_rate_001_01_08_User_Profile_Personal"),
        httpDuration: new Trend("duration_001_01_08_User_Profile_Personal"),
        httpWaiting: new Trend("waiting_001_01_08_User_Profile_Personal"),
        requestRate: new Counter("rps_001_01_08_User_Profile_Personal"),
        http_reqs: new Counter("sample_001_01_08_User_Profile_Personal"),
    },
    Auth_Client_Selected: {
        errorCount: new Counter("error_count_001_01_09_Auth_Client_Selected"),
        errorRate: new Rate("error_rate_001_01_09_Auth_Client_Selected"),
        httpDuration: new Trend("duration_001_01_09_Auth_Client_Selected"),
        httpWaiting: new Trend("waiting_001_01_09_Auth_Client_Selected"),
        requestRate: new Counter("rps_001_01_09_Auth_Client_Selected"),
        http_reqs: new Counter("sample_001_01_09_Auth_Client_Selected"),
    },
    User_Banner_Promo: {
        errorCount: new Counter("error_count_001_01_10_User_Banner_Promo"),
        errorRate: new Rate("error_rate_001_01_10_User_Banner_Promo"),
        httpDuration: new Trend("duration_001_01_10_User_Banner_Promo"),
        httpWaiting: new Trend("waiting_001_01_10_User_Banner_Promo"),
        requestRate: new Counter("rps_001_01_10_User_Banner_Promo"),
        http_reqs: new Counter("sample_001_01_10_User_Banner_Promo"),
    },
    User_Profile_Trading_2: {
        errorCount: new Counter("error_count_001_01_11_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_11_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_11_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_11_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_11_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_11_User_Profile_Trading"),
    },
    Bond_SBN_Master_Product_List: {
        errorCount: new Counter("error_count_001_01_12_Bond_SBN_Master_Product_List"),
        errorRate: new Rate("error_rate_001_01_12_Bond_SBN_Master_Product_List"),
        httpDuration: new Trend("duration_001_01_12_Bond_SBN_Master_Product_List"),
        httpWaiting: new Trend("waiting_001_01_12_Bond_SBN_Master_Product_List"),
        requestRate: new Counter("rps_001_01_12_Bond_SBN_Master_Product_List"),
        http_reqs: new Counter("sample_001_01_12_Bond_SBN_Master_Product_List"),
    },
    Bond_SBN_Client_Check_Status: {
        errorCount: new Counter("error_count_001_01_13_Bond_SBN_Client_Check_Status"),
        errorRate: new Rate("error_rate_001_01_13_Bond_SBN_Client_Check_Status"),
        httpDuration: new Trend("duration_001_01_13_Bond_SBN_Client_Check_Status"),
        httpWaiting: new Trend("waiting_001_01_13_Bond_SBN_Client_Check_Status"),
        requestRate: new Counter("rps_001_01_13_Bond_SBN_Client_Check_Status"),
        http_reqs: new Counter("sample_001_01_13_Bond_SBN_Client_Check_Status"),
    },
    Auth_AccountCenter_Switchables: {
        errorCount: new Counter("error_count_001_01_14_Auth_AccountCenter_Switchables"),
        errorRate: new Rate("error_rate_001_01_14_Auth_AccountCenter_Switchables"),
        httpDuration: new Trend("duration_001_01_14_Auth_AccountCenter_Switchables"),
        httpWaiting: new Trend("waiting_001_01_14_Auth_AccountCenter_Switchables"),
        requestRate: new Counter("rps_001_01_14_Auth_AccountCenter_Switchables"),
        http_reqs: new Counter("sample_001_01_14_Auth_AccountCenter_Switchables"),
    },
    User_Watchlistgroup_2: {
        errorCount: new Counter("error_count_001_01_15_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_001_01_15_User_Watchlistgroup"),
        httpDuration: new Trend("duration_001_01_15_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_001_01_15_User_Watchlistgroup"),
        requestRate: new Counter("rps_001_01_15_User_Watchlistgroup"),
        http_reqs: new Counter("sample_001_01_15_User_Watchlistgroup"),
    },
    Mutualfund_Content_RiskProfile: {
        errorCount: new Counter("error_count_001_01_16_Mutualfund_Content_RiskProfile"),
        errorRate: new Rate("error_rate_001_01_16_Mutualfund_Content_RiskProfile"),
        httpDuration: new Trend("duration_001_01_16_Mutualfund_Content_RiskProfile"),
        httpWaiting: new Trend("waiting_001_01_16_Mutualfund_Content_RiskProfile"),
        requestRate: new Counter("rps_001_01_16_Mutualfund_Content_RiskProfile"),
        http_reqs: new Counter("sample_001_01_16_Mutualfund_Content_RiskProfile"),
    },
    News: {
        errorCount: new Counter("error_count_001_01_17_News"),
        errorRate: new Rate("error_rate_001_01_17_News"),
        httpDuration: new Trend("duration_001_01_17_News"),
        httpWaiting: new Trend("waiting_001_01_17_News"),
        requestRate: new Counter("rps_001_01_17_News"),
        http_reqs: new Counter("sample_001_01_17_News"),
    },
    Mutualfund_User_RiskProfile: {
        errorCount: new Counter("error_count_001_01_18_Mutualfund_User_RiskProfile"),
        errorRate: new Rate("error_rate_001_01_18_Mutualfund_User_RiskProfile"),
        httpDuration: new Trend("duration_001_01_18_Mutualfund_User_RiskProfile"),
        httpWaiting: new Trend("waiting_001_01_18_Mutualfund_User_RiskProfile"),
        requestRate: new Counter("rps_001_01_18_Mutualfund_User_RiskProfile"),
        http_reqs: new Counter("sample_001_01_18_Mutualfund_User_RiskProfile"),
    },
    Bond_SBN_Master_Strapi_Banner: {
        errorCount: new Counter("error_count_001_01_19_Bond_SBN_Master_Strapi_Banner"),
        errorRate: new Rate("error_rate_001_01_19_Bond_SBN_Master_Strapi_Banner"),
        httpDuration: new Trend("duration_001_01_19_Bond_SBN_Master_Strapi_Banner"),
        httpWaiting: new Trend("waiting_001_01_19_Bond_SBN_Master_Strapi_Banner"),
        requestRate: new Counter("rps_001_01_19_Bond_SBN_Master_Strapi_Banner"),
        http_reqs: new Counter("sample_001_01_19_Bond_SBN_Master_Strapi_Banner"),
    },
    User_Watchlist_WatchlistID: {
        errorCount: new Counter("error_count_001_01_20_User_Watchlist_WatchlistID"),
        errorRate: new Rate("error_rate_001_01_20_User_Watchlist_WatchlistID"),
        httpDuration: new Trend("duration_001_01_20_User_Watchlist_WatchlistID"),
        httpWaiting: new Trend("waiting_001_01_20_User_Watchlist_WatchlistID"),
        requestRate: new Counter("rps_001_01_20_User_Watchlist_WatchlistID"),
        http_reqs: new Counter("sample_001_01_20_User_Watchlist_WatchlistID"),
    },
    Mutualfund_User_Filter: {
        errorCount: new Counter("error_count_001_01_21_Mutualfund_User_Filter"),
        errorRate: new Rate("error_rate_001_01_21_Mutualfund_User_Filter"),
        httpDuration: new Trend("duration_001_01_21_Mutualfund_User_Filter"),
        httpWaiting: new Trend("waiting_001_01_21_Mutualfund_User_Filter"),
        requestRate: new Counter("rps_001_01_21_Mutualfund_User_Filter"),
        http_reqs: new Counter("sample_001_01_21_Mutualfund_User_Filter"),
    },
    Mutualfund_MutualFund_List: {
        errorCount: new Counter("error_count_001_01_22_Mutualfund_MutualFund_List"),
        errorRate: new Rate("error_rate_001_01_22_Mutualfund_MutualFund_List"),
        httpDuration: new Trend("duration_001_01_22_Mutualfund_MutualFund_List"),
        httpWaiting: new Trend("waiting_001_01_22_Mutualfund_MutualFund_List"),
        requestRate: new Counter("rps_001_01_22_Mutualfund_MutualFund_List"),
        http_reqs: new Counter("sample_001_01_22_Mutualfund_MutualFund_List"),
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

    // Batch 1: Main homepage requests
    let watchlistID;
    if (token) {
        const urls = [
            base_url + `/user/api/v1/user_settings`,
            base_url + `/auth/api/v1/protected/get-config`,
            base_url + `/order/api/v1/order-status-action-map`,
            base_url + `/auth/api/v1/protected/account-center/status`,
            base_url + `/user/api/v1/watchlistgroup`,
            base_url + `/news/api/v2/categories?is_sharia=0`,
            base_url + `/user/api/v1/profile/trading`,
            base_url + `/user/api/v1/profile/personal`,
            base_url + `/auth/api/v1/protected/client/selected`,
            base_url + `/user/api/v1/banner/promo`,
            base_url + `/user/api/v2/profile/trading`,
            base_url + `/bond/api/v1/sbn/master/product/list?max=4&page=0&search=&status=A`,
            base_url + `/bond/api/v1/sbn/client/check/status`,
            base_url + `/auth/api/v1/protected/account-center/switchables`,
            base_url + `/user/api/v1/watchlistgroup`,
            base_url + `/mutualfund/api/v1/content/risk-profile?size=original`,
            base_url + `/news/api/v2/?category=&is_sharia=0&items=5&page=1&ticker=`,
            base_url + `/mutualfund/api/v1/user/risk-profile`,
            base_url + `/bond/api/v1/sbn/master/strapi/banner`,
            base_url + `/mutualfund/api/v1/user/filter`,
            base_url + `/mutualfund/api/v1/mutual-fund/list?limit=3&product=&subscribable=1`,
        ];

        const batchHeaders = {
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
            ['GET', urls[0], undefined, {headers:batchHeaders}],
            ['GET', urls[1], undefined, {headers:batchHeaders}],
            ['GET', urls[2], undefined, {headers:batchHeaders}],
            ['GET', urls[3], undefined, {headers:batchHeaders}],
            ['GET', urls[4], undefined, {headers:batchHeaders}],
            ['GET', urls[5], undefined, {headers:batchHeaders}],
            ['GET', urls[6], undefined, {headers:batchHeaders}],
            ['GET', urls[7], undefined, {headers:batchHeaders}],
            ['GET', urls[8], undefined, {headers:batchHeaders}],
            ['GET', urls[9], undefined, {headers:batchHeaders}],
            ['GET', urls[10], undefined, {headers:batchHeaders}],
            ['GET', urls[11], undefined, {headers:batchHeaders}],
            ['POST', urls[12], undefined, {headers:batchHeaders}],
            ['GET', urls[13], undefined, {headers:batchHeaders}],
            ['GET', urls[14], undefined, {headers:batchHeaders}],
            ['GET', urls[15], undefined, {headers:batchHeaders}],
            ['GET', urls[16], undefined, {headers:batchHeaders}],
            ['GET', urls[17], undefined, {headers:batchHeaders}],
            ['GET', urls[18], undefined, {headers:batchHeaders}],
            ['GET', urls[19], undefined, {headers:batchHeaders}],
            ['GET', urls[20], undefined, {headers:batchHeaders}],
        ];
        const responses = http.batch(requests);

        // Extract watchlistID from response index 4
        try {
            const watchlistGroupData = JSON.parse(responses[4].body);
            if (watchlistGroupData && watchlistGroupData.data && watchlistGroupData.data[0] && watchlistGroupData.data[0].id) {
                watchlistID = watchlistGroupData.data[0].id;
            }
        } catch (error) {
            console.error(`VU${exec.vu.idInTest} Failed to parse watchlist group:`, error.message);
        }

        responses.forEach((response, index) => {
            const metricArray = [
                Homepage.User_UserSettings,
                Homepage.Aauth_GetConfig,
                Homepage.Order_OrderStatusActionMap,
                Homepage.Auth_AccountCenter_Status,
                Homepage.User_Watchlistgroup_1,
                Homepage.News_Categories,
                Homepage.User_Profile_Trading_1,
                Homepage.User_Profile_Personal,
                Homepage.Auth_Client_Selected,
                Homepage.User_Banner_Promo,
                Homepage.User_Profile_Trading_2,
                Homepage.Bond_SBN_Master_Product_List,
                Homepage.Bond_SBN_Client_Check_Status,
                Homepage.Auth_AccountCenter_Switchables,
                Homepage.User_Watchlistgroup_2,
                Homepage.Mutualfund_Content_RiskProfile,
                Homepage.News,
                Homepage.Mutualfund_User_RiskProfile,
                Homepage.Bond_SBN_Master_Strapi_Banner,
                Homepage.Mutualfund_User_Filter,
                Homepage.Mutualfund_MutualFund_List,
            ];

            const metric = metricArray[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);if (`${__ENV.ENV}`!='INT') {
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

    // Batch 2: Watchlist detail (dependent on watchlistID)
    if (token && watchlistID) {
        const urls = [
            base_url + `/user/api/v2/watchlist/${watchlistID}?limit=200&page=1`,
        ];

        const batchHeaders = {
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
            ['GET', urls[0], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homepage.User_Watchlist_WatchlistID,,
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

    // // Batch 3: Bond portfolio (needs PIN token - optional)
    // if (token) {
    //     const urls = [
    //         base_url + `/bond/api/v1/ipo/bond/transaction/portfolio/list?page=1&max=5&order_by=1`,
    //     ];

    //     const batchHeaders = {
    //         'Cookie': `ACCESS_TOKEN=${token}`,
    //         'Content-Type': 'application/json',
    //     };

    //     const requests = [
    //         ['GET', urls[0], null, { headers: batchHeaders }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metricPortfolio = [
    //             Portfolio.Portfolio_IPO_Bond_Transaction_Portfolio_List,
    //         ];

    //         const metric = metricPortfolio[index];
    //         metric.httpDuration.add(response.timings.duration);
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}`!='INT') {
    //                 console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}`!='INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
    //             }
    //         }
    //     });
    // }
    sleep(0,25);
}

// Generate the test report
export function handleSummary(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ind-EG').replace(/\//g, ''); // Format the date
    const timeStr = now.toLocaleTimeString('ind-EG').replace(/:/g, ''); // Format the time
    if(`${__ENV.RUNBY}`=='Manual'){
        return {
            [`../../Report/Growin_iOS/BP002/Manual/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_iOS/BP002/Regression/${__ENV.RUNBY}_Detail_BP002_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}
