import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP001 - Homepage
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=98 --out dashboard=export=../../Report/Growin_iOS/BP001/Manual/Manual_DryRun_2021_2211_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=3m -e NUMSTART=1001 --out dashboard=export=../../Report/Growin_iOS/BP001/Manual/Manual_DryRun_2021_1431_BP001_Local.html
//RUN STRESS TEST: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/Growin_iOS/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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

// /auth/api/v1/login
// /user/api/v1/user_settings
// /auth/api/v1/protected/get-config
// /order/api/v1/order-status-action-map
// /auth/api/v1/protected/account-center/status
// /user/api/v2/watchlistgroup
// /news/api/v2/categories?is_sharia=0
// /user/api/v1/profile/trading
// /user/api/v1/profile/personal
// /auth/api/v1/protected/client/selected
// /user/api/v1/banner/promo
// /user/api/v2/profile/trading
// /bond/api/v1/sbn/master/product/list?max={int}&page={int}&search=&status=A
// /bond/api/v1/sbn/client/check/status
// /auth/api/v1/protected/account-center/switchables
// /mutualfund/api/v1/content/risk-profile?size=original
// /order/api/v1/order-status-action-map
// /news/api/v2/?category=&is_sharia={bool}&items={int}&page={int}&ticker=
// /mutualfund/api/v1/user/risk-profile
// /bond/api/v1/sbn/master/strapi/banner
// /user/api/v2/watchlist/{group_id}?limit=200&page={int}
// /inbox/api/v1
// /auth/api/v1/protected/account-center/status
// /mutualfund/api/v1/user/filter
// /mutualfund/api/v1/mutual-fund/list?limit=3&product=&subscribable=1

// Auth_Login
// User_UserSettings
// Auth_Protected_GetConfig
// Order_OrderStatusActionMap
// Auth_Protected_AccountCenter_Status
// User_Watchlistgroup
// News_Categories_Sharia
// User_Profile_Trading
// User_Profile_Personal
// Auth_Protected_Client_Selected
// User_Banner_Promo
// User_Profile_Trading
// Bond_Sbn_Master_Product_List
// Bond_Sbn_Client_Check_Status
// Auth_Protected_AccountCenter_Switchables
// Mutualfund_Content_RiskProfile
// Order_OrderStatusActionMap
// News_V2
// Mutualfund_User_RiskProfile
// Bond_Sbn_Master_Strapi_Banner
// User_Watchlist_WatchlistID
// Inbox_V1
// Auth_Protected_AccountCenter_Status
// Mutualfund_User_Filter
// Mutualfund_MutualFund_List

// Define custom metrics
const Homepage = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_02_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_02_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_02_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_02_User_UserSettings"),
        requestRate: new Counter("rps_001_01_02_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_02_User_UserSettings"),
    },
    Auth_Protected_GetConfig: {
        errorCount: new Counter("error_count_001_01_03_Auth_Protected_GetConfig"),
        errorRate: new Rate("error_rate_001_01_03_Auth_Protected_GetConfig"),
        httpDuration: new Trend("duration_001_01_03_Auth_Protected_GetConfig"),
        httpWaiting: new Trend("waiting_001_01_03_Auth_Protected_GetConfig"),
        requestRate: new Counter("rps_001_01_03_Auth_Protected_GetConfig"),
        http_reqs: new Counter("sample_001_01_03_Auth_Protected_GetConfig"),
    },
    Order_OrderStatusActionMap_1: {
        errorCount: new Counter("error_count_001_01_04_Order_OrderStatusActionMap_1"),
        errorRate: new Rate("error_rate_001_01_04_Order_OrderStatusActionMap_1"),
        httpDuration: new Trend("duration_001_01_04_Order_OrderStatusActionMap_1"),
        httpWaiting: new Trend("waiting_001_01_04_Order_OrderStatusActionMap_1"),
        requestRate: new Counter("rps_001_01_04_Order_OrderStatusActionMap_1"),
        http_reqs: new Counter("sample_001_01_04_Order_OrderStatusActionMap_1"),
    },
    Auth_Protected_AccountCenter_Status_1: {
        errorCount: new Counter("error_count_001_01_05_Auth_Protected_AccountCenter_Status_1"),
        errorRate: new Rate("error_rate_001_01_05_Auth_Protected_AccountCenter_Status_1"),
        httpDuration: new Trend("duration_001_01_05_Auth_Protected_AccountCenter_Status_1"),
        httpWaiting: new Trend("waiting_001_01_05_Auth_Protected_AccountCenter_Status_1"),
        requestRate: new Counter("rps_001_01_05_Auth_Protected_AccountCenter_Status_1"),
        http_reqs: new Counter("sample_001_01_05_Auth_Protected_AccountCenter_Status_1"),
    },
    User_Watchlistgroup: {
        errorCount: new Counter("error_count_001_01_06_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_001_01_06_User_Watchlistgroup"),
        httpDuration: new Trend("duration_001_01_06_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_001_01_06_User_Watchlistgroup"),
        requestRate: new Counter("rps_001_01_06_User_Watchlistgroup"),
        http_reqs: new Counter("sample_001_01_06_User_Watchlistgroup"),
    },
    News_Categories_Sharia: {
        errorCount: new Counter("error_count_001_01_07_News_Categories_Sharia"),
        errorRate: new Rate("error_rate_001_01_07_News_Categories_Sharia"),
        httpDuration: new Trend("duration_001_01_07_News_Categories_Sharia"),
        httpWaiting: new Trend("waiting_001_01_07_News_Categories_Sharia"),
        requestRate: new Counter("rps_001_01_07_News_Categories_Sharia"),
        http_reqs: new Counter("sample_001_01_07_News_Categories_Sharia"),
    },
    User_Profile_Tradin_V1: {
        errorCount: new Counter("error_count_001_01_08_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_08_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_08_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_08_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_08_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_08_User_Profile_Trading"),
    },
    User_Profile_Personal: {
        errorCount: new Counter("error_count_001_01_09_User_Profile_Personal"),
        errorRate: new Rate("error_rate_001_01_09_User_Profile_Personal"),
        httpDuration: new Trend("duration_001_01_09_User_Profile_Personal"),
        httpWaiting: new Trend("waiting_001_01_09_User_Profile_Personal"),
        requestRate: new Counter("rps_001_01_09_User_Profile_Personal"),
        http_reqs: new Counter("sample_001_01_09_User_Profile_Personal"),
    },
    Auth_Protected_Client_Selected: {
        errorCount: new Counter("error_count_001_01_10_Auth_Protected_Client_Selected"),
        errorRate: new Rate("error_rate_001_01_10_Auth_Protected_Client_Selected"),
        httpDuration: new Trend("duration_001_01_10_Auth_Protected_Client_Selected"),
        httpWaiting: new Trend("waiting_001_01_10_Auth_Protected_Client_Selected"),
        requestRate: new Counter("rps_001_01_10_Auth_Protected_Client_Selected"),
        http_reqs: new Counter("sample_001_01_10_Auth_Protected_Client_Selected"),
    },
    User_Banner_Promo: {
        errorCount: new Counter("error_count_001_01_11_User_Banner_Promo"),
        errorRate: new Rate("error_rate_001_01_11_User_Banner_Promo"),
        httpDuration: new Trend("duration_001_01_11_User_Banner_Promo"),
        httpWaiting: new Trend("waiting_001_01_11_User_Banner_Promo"),
        requestRate: new Counter("rps_001_01_11_User_Banner_Promo"),
        http_reqs: new Counter("sample_001_01_11_User_Banner_Promo"),
    },
    User_Profile_Trading_V2: {
        errorCount: new Counter("error_count_001_01_12_User_Profile_Trading_V2"),
        errorRate: new Rate("error_rate_001_01_12_User_Profile_Trading_V2"),
        httpDuration: new Trend("duration_001_01_12_User_Profile_Trading_V2"),
        httpWaiting: new Trend("waiting_001_01_12_User_Profile_Trading_V2"),
        requestRate: new Counter("rps_001_01_12_User_Profile_Trading_V2"),
        http_reqs: new Counter("sample_001_01_12_User_Profile_Trading_V2"),
    },
    Bond_Sbn_Master_Product_List: {
        errorCount: new Counter("error_count_001_01_13_Bond_Sbn_Master_Product_List"),
        errorRate: new Rate("error_rate_001_01_13_Bond_Sbn_Master_Product_List"),
        httpDuration: new Trend("duration_001_01_13_Bond_Sbn_Master_Product_List"),
        httpWaiting: new Trend("waiting_001_01_13_Bond_Sbn_Master_Product_List"),
        requestRate: new Counter("rps_001_01_13_Bond_Sbn_Master_Product_List"),
        http_reqs: new Counter("sample_001_01_13_Bond_Sbn_Master_Product_List"),
    },
    Bond_Sbn_Client_Check_Status: {
        errorCount: new Counter("error_count_001_01_14_Bond_Sbn_Client_Check_Status"),
        errorRate: new Rate("error_rate_001_01_14_Bond_Sbn_Client_Check_Status"),
        httpDuration: new Trend("duration_001_01_14_Bond_Sbn_Client_Check_Status"),
        httpWaiting: new Trend("waiting_001_01_14_Bond_Sbn_Client_Check_Status"),
        requestRate: new Counter("rps_001_01_14_Bond_Sbn_Client_Check_Status"),
        http_reqs: new Counter("sample_001_01_14_Bond_Sbn_Client_Check_Status"),
    },
    Auth_Protected_AccountCenter_Switchables: {
        errorCount: new Counter("error_count_001_01_15_Auth_Protected_AccountCenter_Switchables"),
        errorRate: new Rate("error_rate_001_01_15_Auth_Protected_AccountCenter_Switchables"),
        httpDuration: new Trend("duration_001_01_15_Auth_Protected_AccountCenter_Switchables"),
        httpWaiting: new Trend("waiting_001_01_15_Auth_Protected_AccountCenter_Switchables"),
        requestRate: new Counter("rps_001_01_15_Auth_Protected_AccountCenter_Switchables"),
        http_reqs: new Counter("sample_001_01_15_Auth_Protected_AccountCenter_Switchables"),
    },
    Mutualfund_Content_RiskProfile: {
        errorCount: new Counter("error_count_001_01_16_Mutualfund_Content_RiskProfile"),
        errorRate: new Rate("error_rate_001_01_16_Mutualfund_Content_RiskProfile"),
        httpDuration: new Trend("duration_001_01_16_Mutualfund_Content_RiskProfile"),
        httpWaiting: new Trend("waiting_001_01_16_Mutualfund_Content_RiskProfile"),
        requestRate: new Counter("rps_001_01_16_Mutualfund_Content_RiskProfile"),
        http_reqs: new Counter("sample_001_01_16_Mutualfund_Content_RiskProfile"),
    },
    Order_OrderStatusActionMap_2: {
        errorCount: new Counter("error_count_001_01_17_Order_OrderStatusActionMap_2"),
        errorRate: new Rate("error_rate_001_01_17_Order_OrderStatusActionMap_2"),
        httpDuration: new Trend("duration_001_01_17_Order_OrderStatusActionMap_2"),
        httpWaiting: new Trend("waiting_001_01_17_Order_OrderStatusActionMap_2"),
        requestRate: new Counter("rps_001_01_17_Order_OrderStatusActionMap_2"),
        http_reqs: new Counter("sample_001_01_17_Order_OrderStatusActionMap_2"),
    },
    News_V2: {
        errorCount: new Counter("error_count_001_01_18_News_V2"),
        errorRate: new Rate("error_rate_001_01_18_News_V2"),
        httpDuration: new Trend("duration_001_01_18_News_V2"),
        httpWaiting: new Trend("waiting_001_01_18_News_V2"),
        requestRate: new Counter("rps_001_01_18_News_V2"),
        http_reqs: new Counter("sample_001_01_18_News_V2"),
    },
    Mutualfund_User_RiskProfile: {
        errorCount: new Counter("error_count_001_01_19_Mutualfund_User_RiskProfile"),
        errorRate: new Rate("error_rate_001_01_19_Mutualfund_User_RiskProfile"),
        httpDuration: new Trend("duration_001_01_19_Mutualfund_User_RiskProfile"),
        httpWaiting: new Trend("waiting_001_01_19_Mutualfund_User_RiskProfile"),
        requestRate: new Counter("rps_001_01_19_Mutualfund_User_RiskProfile"),
        http_reqs: new Counter("sample_001_01_19_Mutualfund_User_RiskProfile"),
    },
    Bond_Sbn_Master_Strapi_Banner: {
        errorCount: new Counter("error_count_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
        errorRate: new Rate("error_rate_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
        httpDuration: new Trend("duration_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
        httpWaiting: new Trend("waiting_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
        requestRate: new Counter("rps_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
        http_reqs: new Counter("sample_001_01_20_Bond_Sbn_Master_Strapi_Banner"),
    },
    User_Watchlist_WatchlistID: {
        errorCount: new Counter("error_count_001_01_21_User_Watchlist_WatchlistID"),
        errorRate: new Rate("error_rate_001_01_21_User_Watchlist_WatchlistID"),
        httpDuration: new Trend("duration_001_01_21_User_Watchlist_WatchlistID"),
        httpWaiting: new Trend("waiting_001_01_21_User_Watchlist_WatchlistID"),
        requestRate: new Counter("rps_001_01_21_User_Watchlist_WatchlistID"),
        http_reqs: new Counter("sample_001_01_21_User_Watchlist_WatchlistID"),
    },
    Inbox_V1: {
        errorCount: new Counter("error_count_001_01_22_Inbox_V1"),
        errorRate: new Rate("error_rate_001_01_22_Inbox_V1"),
        httpDuration: new Trend("duration_001_01_22_Inbox_V1"),
        httpWaiting: new Trend("waiting_001_01_22_Inbox_V1"),
        requestRate: new Counter("rps_001_01_22_Inbox_V1"),
        http_reqs: new Counter("sample_001_01_22_Inbox_V1"),
    },
    Auth_Protected_AccountCenter_Status_2: {
        errorCount: new Counter("error_count_001_01_23_Auth_Protected_AccountCenter_Status_2"),
        errorRate: new Rate("error_rate_001_01_23_Auth_Protected_AccountCenter_Status_2"),
        httpDuration: new Trend("duration_001_01_23_Auth_Protected_AccountCenter_Status_2"),
        httpWaiting: new Trend("waiting_001_01_23_Auth_Protected_AccountCenter_Status_2"),
        requestRate: new Counter("rps_001_01_23_Auth_Protected_AccountCenter_Status_2"),
        http_reqs: new Counter("sample_001_01_23_Auth_Protected_AccountCenter_Status_2"),
    },
    Mutualfund_User_Filter: {
        errorCount: new Counter("error_count_001_01_24_Mutualfund_User_Filter"),
        errorRate: new Rate("error_rate_001_01_24_Mutualfund_User_Filter"),
        httpDuration: new Trend("duration_001_01_24_Mutualfund_User_Filter"),
        httpWaiting: new Trend("waiting_001_01_24_Mutualfund_User_Filter"),
        requestRate: new Counter("rps_001_01_24_Mutualfund_User_Filter"),
        http_reqs: new Counter("sample_001_01_24_Mutualfund_User_Filter"),
    },
    Mutualfund_MutualFund_List: {
        errorCount: new Counter("error_count_001_01_25_Mutualfund_MutualFund_List"),
        errorRate: new Rate("error_rate_001_01_25_Mutualfund_MutualFund_List"),
        httpDuration: new Trend("duration_001_01_25_Mutualfund_MutualFund_List"),
        httpWaiting: new Trend("waiting_001_01_25_Mutualfund_MutualFund_List"),
        requestRate: new Counter("rps_001_01_25_Mutualfund_MutualFund_List"),
        http_reqs: new Counter("sample_001_01_25_Mutualfund_MutualFund_List"),
    },
};

// SETUP FUNCTION - Hanya untuk prepare data
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

    // Prepare user emails (tidak login di setup)
    const users = {};
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
            formattedNum = String(startNum + i - 1).padStart(4, '0');
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }
        
        users[i] = { email: email };
    }
    
    console.log(`Prepared ${totalUsers} users for login testing`);
    
    return { base_url: base_url, users: users };
}

// MAIN TEST FUNCTION - Runs for each iteration
export default function (data) {
    const vuId = exec.vu.idInTest;
    const user = data.users[vuId];
    const base_url = data.base_url;
    const email = user.email;

    // Batch 1
    let token;
    const loginUrl = base_url + `/auth/api/v1/login?nocookie=1`;

    const authLoginPayload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    const loginHeaders = {
        // 'Content-Type': 'application/json',

        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    // Perform login request
    const loginResponse = http.post(loginUrl, authLoginPayload, { headers: loginHeaders });

    // Process Login metrics
    const loginMetric = Homepage.Auth_Login;
    loginMetric.httpDuration.add(loginResponse.timings.duration);
    
    if (loginResponse.status === 200) {
        loginMetric.errorRate.add(false);
        loginMetric.errorCount.add(0);
        loginMetric.requestRate.add(true);
        loginMetric.http_reqs.add(1);
        
        // Extract token from response
        try {
            token = loginResponse.json().data.token;
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`VU${vuId} ${email} Login SUCCESS || Status: ${loginResponse.status}`);
            }
        } catch (e) {
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`VU${vuId} ${email} Failed to parse token || Error: ${e.message}`);
            }
        }
    } else {
        loginMetric.errorRate.add(true);
        loginMetric.errorCount.add(1);
        loginMetric.requestRate.add(false);
        loginMetric.http_reqs.add(1);
        
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`VU${vuId} ${email} Login ERROR || Status: ${loginResponse.status} || Response: ${loginResponse.body}`);
        }
    }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/user/api/v1/user_settings`,
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
                Homepage.User_UserSettings
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

    // Batch 3
    let watchlistID;
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/get-config`,
            base_url + `/order/api/v1/order-status-action-map`,
            base_url + `/auth/api/v1/protected/account-center/status`,
            base_url + `/user/api/v2/watchlistgroup`,
            base_url + `/news/api/v2/categories?is_sharia=0`,
            base_url + `/user/api/v1/profile/trading`,
            base_url + `/user/api/v1/profile/personal`,
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
            ['GET', urls[5], null, { headers: stepThreeHeaders }],
            ['GET', urls[6], null, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homepage.Auth_Protected_GetConfig,
                Homepage.Order_OrderStatusActionMap_1,
                Homepage.Auth_Protected_AccountCenter_Status_1,
                Homepage.User_Watchlistgroup,
                Homepage.News_Categories_Sharia,
                Homepage.User_Profile_Tradin_V1,
                Homepage.User_Profile_Personal,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (index === 3) {
                    try {
                        const watchlistData = JSON.parse(response.body);
                        
                        // Asumsi structure: { data: [{ id: "..." }, ...] }
                        if (watchlistData && watchlistData.data && watchlistData.data.length > 0) {
                            watchlistID = watchlistData.data[0].id;
                            
                            if (`${__ENV.ENV}` != 'INT') {
                                console.log(`${email} Got watchlistID: ${watchlistID}`);
                            }
                        } else {
                            if (`${__ENV.ENV}` != 'INT') {
                                console.error(`${email} No watchlist data found in response`);
                            }
                        }
                    } catch (e) {
                        if (`${__ENV.ENV}` != 'INT') {
                            console.error(`${email} Failed to parse watchlistgroup response: ${e.message}`);
                        }
                    }
                }

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

    // Batch 4
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/client/selected`,
        ];

        const stepFourHeaders = {
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
            ['GET', urls[0], null, { headers: stepFourHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homepage.Auth_Protected_Client_Selected
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

    // Batch 5
    if (token) {
        const urls = [
            base_url + `/user/api/v1/banner/promo`,
            base_url + `/user/api/v2/profile/trading`,
            base_url + `/bond/api/v1/sbn/master/product/list?max=10&page=1&search=&status=A`,
            base_url + `/bond/api/v1/sbn/client/check/status`,
            base_url + `/auth/api/v1/protected/account-center/switchables`,
            base_url + `/mutualfund/api/v1/content/risk-profile?size=original`,
            base_url + `/order/api/v1/order-status-action-map`,
            base_url + `/news/api/v2/?category=&is_sharia=false&items=10&page=1&ticker=`,
            base_url + `/mutualfund/api/v1/user/risk-profile`,
            base_url + `/bond/api/v1/sbn/master/strapi/banner`,
            base_url + `/user/api/v2/watchlist/${watchlistID}?limit=200&page=1`,
            base_url + `/inbox/api/v1`,
            base_url + `/auth/api/v1/protected/account-center/status`,
            base_url + `/mutualfund/api/v1/user/filter`,
            base_url + `/mutualfund/api/v1/mutual-fund/list?limit=3&product=&subscribable=1`,
        ];

        const stepFiveHeaders = {
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

        const Inbox_Post_Payload = JSON.stringify([
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            },
            {
                "camp_id": 1,
                "category": "general",
                "deep_links": {
                    "page": "stock_detail 2222",
                    "product_code": "MAPA"
                },
                "message": "[BUY] MAPA TP 950 SL 920 [Disc: On]",
                "title": "Stockpick Alert MAPA",
                "variant_id": 16
            }
        ]);

        const requests = [
            ['GET', urls[0], null, { headers: stepFiveHeaders }],
            ['GET', urls[1], null, { headers: stepFiveHeaders }],
            ['GET', urls[2], null, { headers: stepFiveHeaders }],
            ['POST', urls[3], null, { headers: stepFiveHeaders }],
            ['GET', urls[4], null, { headers: stepFiveHeaders }],
            ['GET', urls[5], null, { headers: stepFiveHeaders }],
            ['GET', urls[6], null, { headers: stepFiveHeaders }],
            ['GET', urls[7], null, { headers: stepFiveHeaders }],
            ['GET', urls[8], null, { headers: stepFiveHeaders }],
            ['GET', urls[9], null, { headers: stepFiveHeaders }],
            ['GET', urls[10], null, { headers: stepFiveHeaders }],
            ['POST', urls[11], Inbox_Post_Payload, { headers: stepFiveHeaders }],
            ['GET', urls[12], null, { headers: stepFiveHeaders }],
            ['GET', urls[13], null, { headers: stepFiveHeaders }],
            ['GET', urls[14], null, { headers: stepFiveHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homepage.User_Banner_Promo,
                Homepage.User_Profile_Trading_V2,
                Homepage.Bond_Sbn_Master_Product_List,
                Homepage.Bond_Sbn_Client_Check_Status,
                Homepage.Auth_Protected_AccountCenter_Switchables,
                Homepage.Mutualfund_Content_RiskProfile,
                Homepage.Order_OrderStatusActionMap_2,
                Homepage.News_V2,
                Homepage.Mutualfund_User_RiskProfile,
                Homepage.Bond_Sbn_Master_Strapi_Banner,
                Homepage.User_Watchlist_WatchlistID,
                Homepage.Inbox_V1,
                Homepage.Auth_Protected_AccountCenter_Status_2,
                Homepage.Mutualfund_User_Filter,
                Homepage.Mutualfund_MutualFund_List,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
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

// Generate the test report
export function handleSummary(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ind-EG').replace(/\//g, '');
    const timeStr = now.toLocaleTimeString('ind-EG').replace(/:/g, '');
    if(`${__ENV.RUNBY}`=='Manual'){
        return {
            [`../../Report/Growin_iOS/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_iOS/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}