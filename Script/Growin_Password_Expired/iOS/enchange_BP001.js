// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Password_Expired/iOS/BP001.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// GET	user/api/v2/profile/trading
// GET	user/api/v1/profile/personal
// GET	/auth/api/v1/protected/password-reminder
// POST	/auth/api/v1/protected/password-remind-later
// GET	user/api/v1/banner/promo
// GET	protected/v1/portfolio/consolidated
// GET	user/api/v1/watchlistgroup
// GET	user/api/v2/watchlist/{watchlistGroupId}
// GET	news/api/v2/
// GET	news/api/v2/categories
// GET	news/api/v2/categories
// GET	oaofinance/api/v1/quota/status/margin
// GET	oaofinance/api/v1/user-opening-progress-summary/monitoring/margin
// GET	auth/api/v1/protected/account-center/switchables
// GET	mutualfund/api/v1/user/risk-profile
// GET (iOS Only)	auth/api/v1/protected/account-center/status
// GET	bond/api/v1/sbn/master/strapi/banner
// GET (iOS Only)	mutualfund/api/v1/user/risk-profile
// GET (iOS Only)	mutualfund/api/v1/mutual-fund/list?limit=3
// GET	news/api/v2/?category=&is_sharia=0&items=5&page=1
// GET	auth/api/v1/protected/get-config
// GET	auth/api/v1/protected/client/selected
// GET (iOS Only)	bond/api/v1/sbn/client/check/status
// GET (iOS Only)	mutualfund/api/v1/user/filter
// GET (iOS Only)	user/api/v1/user_settings
// GET (iOS Only)	order/api/v1/order-status-action-map

// User_Profile_Trading
// User_Profile_Personal
// Auth_Protected_PasswordReminder
// Auth_Protected_PasswordRemindLater
// User_Banner_Promo
// Protected_Portfolio_Consolidated
// User_Watchlistgroup
// User_WatchlistID
// News
// News_Categories
// News_Categories_2
// Oaofinance_Quota_Status_Margin
// Oaofinance_UserOpeningProgressSummary_Monitoring_Margin
// Auth_Protected_AccountCenter_Switchables
// Mutualfund_User_RiskProfile
// Auth_Protected_AccountCenter_Status
// Bond_Sbn_Master_Strapi_Banner
// Mutualfund_User_RiskProfile_2
// Mutualfund_MutualFund_List
// News_Category
// Auth_Protected_GetConfig
// Auth_Protected_Client_Selected
// Bond_Sbn_Client_Check_Status
// Mutualfund_User_Filter
// User_UserSettings
// Order_OrderStatusActionMap

// Define custom metrics
const Home = {
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_01_01_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_01_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_01_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_01_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_01_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_01_User_Profile_Trading"),
    },
    User_Profile_Personal: {
        errorCount: new Counter("error_count_001_01_02_User_Profile_Personal"),
        errorRate: new Rate("error_rate_001_01_02_User_Profile_Personal"),
        httpDuration: new Trend("duration_001_01_02_User_Profile_Personal"),
        httpWaiting: new Trend("waiting_001_01_02_User_Profile_Personal"),
        requestRate: new Counter("rps_001_01_02_User_Profile_Personal"),
        http_reqs: new Counter("sample_001_01_02_User_Profile_Personal"),
    },
    Auth_Protected_PasswordReminder: {
        errorCount: new Counter("error_count_001_01_03_Auth_Protected_PasswordReminder"),
        errorRate: new Rate("error_rate_001_01_03_Auth_Protected_PasswordReminder"),
        httpDuration: new Trend("duration_001_01_03_Auth_Protected_PasswordReminder"),
        httpWaiting: new Trend("waiting_001_01_03_Auth_Protected_PasswordReminder"),
        requestRate: new Counter("rps_001_01_03_Auth_Protected_PasswordReminder"),
        http_reqs: new Counter("sample_001_01_03_Auth_Protected_PasswordReminder"),
    },
    Auth_Protected_PasswordRemindLater: {
        errorCount: new Counter("error_count_001_01_04_Auth_Protected_PasswordRemindLater"),
        errorRate: new Rate("error_rate_001_01_04_Auth_Protected_PasswordRemindLater"),
        httpDuration: new Trend("duration_001_01_04_Auth_Protected_PasswordRemindLater"),
        httpWaiting: new Trend("waiting_001_01_04_Auth_Protected_PasswordRemindLater"),
        requestRate: new Counter("rps_001_01_04_Auth_Protected_PasswordRemindLater"),
        http_reqs: new Counter("sample_001_01_04_Auth_Protected_PasswordRemindLater"),
    },
    User_Banner_Promo: {
        errorCount: new Counter("error_count_001_01_05_User_Banner_Promo"),
        errorRate: new Rate("error_rate_001_01_05_User_Banner_Promo"),
        httpDuration: new Trend("duration_001_01_05_User_Banner_Promo"),
        httpWaiting: new Trend("waiting_001_01_05_User_Banner_Promo"),
        requestRate: new Counter("rps_001_01_05_User_Banner_Promo"),
        http_reqs: new Counter("sample_001_01_05_User_Banner_Promo"),
    },
    Protected_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_001_01_06_Protected_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_001_01_06_Protected_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_001_01_06_Protected_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_001_01_06_Protected_Portfolio_Consolidated"),
        requestRate: new Counter("rps_001_01_06_Protected_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_001_01_06_Protected_Portfolio_Consolidated"),
    },
    User_Watchlistgroup: {
        errorCount: new Counter("error_count_001_01_07_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_001_01_07_User_Watchlistgroup"),
        httpDuration: new Trend("duration_001_01_07_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_001_01_07_User_Watchlistgroup"),
        requestRate: new Counter("rps_001_01_07_User_Watchlistgroup"),
        http_reqs: new Counter("sample_001_01_07_User_Watchlistgroup"),
    },
    User_WatchlistID: {
        errorCount: new Counter("error_count_001_01_08_User_WatchlistID"),
        errorRate: new Rate("error_rate_001_01_08_User_WatchlistID"),
        httpDuration: new Trend("duration_001_01_08_User_WatchlistID"),
        httpWaiting: new Trend("waiting_001_01_08_User_WatchlistID"),
        requestRate: new Counter("rps_001_01_08_User_WatchlistID"),
        http_reqs: new Counter("sample_001_01_08_User_WatchlistID"),
    },
    News: {
        errorCount: new Counter("error_count_001_01_09_News"),
        errorRate: new Rate("error_rate_001_01_09_News"),
        httpDuration: new Trend("duration_001_01_09_News"),
        httpWaiting: new Trend("waiting_001_01_09_News"),
        requestRate: new Counter("rps_001_01_09_News"),
        http_reqs: new Counter("sample_001_01_09_News"),
    },
    News_Categories: {
        errorCount: new Counter("error_count_001_01_10_News_Categories"),
        errorRate: new Rate("error_rate_001_01_10_News_Categories"),
        httpDuration: new Trend("duration_001_01_10_News_Categories"),
        httpWaiting: new Trend("waiting_001_01_10_News_Categories"),
        requestRate: new Counter("rps_001_01_10_News_Categories"),
        http_reqs: new Counter("sample_001_01_10_News_Categories"),
    },
    News_Categories_2: {
        errorCount: new Counter("error_count_001_01_11_News_Categories_2"),
        errorRate: new Rate("error_rate_001_01_11_News_Categories_2"),
        httpDuration: new Trend("duration_001_01_11_News_Categories_2"),
        httpWaiting: new Trend("waiting_001_01_11_News_Categories_2"),
        requestRate: new Counter("rps_001_01_11_News_Categories_2"),
        http_reqs: new Counter("sample_001_01_11_News_Categories_2"),
    },
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_001_01_12_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_001_01_12_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_001_01_12_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_001_01_12_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_001_01_12_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_001_01_12_Oaofinance_Quota_Status_Margin"),
    },
    Oaofinance_UserOpeningProgressSummary_Monitoring_Margin: {
        errorCount: new Counter("error_count_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        errorRate: new Rate("error_rate_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpDuration: new Trend("duration_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpWaiting: new Trend("waiting_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        requestRate: new Counter("rps_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        http_reqs: new Counter("sample_001_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
    },
    Auth_Protected_AccountCenter_Switchables: {
        errorCount: new Counter("error_count_001_01_14_Auth_Protected_AccountCenter_Switchables"),
        errorRate: new Rate("error_rate_001_01_14_Auth_Protected_AccountCenter_Switchables"),
        httpDuration: new Trend("duration_001_01_14_Auth_Protected_AccountCenter_Switchables"),
        httpWaiting: new Trend("waiting_001_01_14_Auth_Protected_AccountCenter_Switchables"),
        requestRate: new Counter("rps_001_01_14_Auth_Protected_AccountCenter_Switchables"),
        http_reqs: new Counter("sample_001_01_14_Auth_Protected_AccountCenter_Switchables"),
    },
    Mutualfund_User_RiskProfile: {
        errorCount: new Counter("error_count_001_01_15_Mutualfund_User_RiskProfile"),
        errorRate: new Rate("error_rate_001_01_15_Mutualfund_User_RiskProfile"),
        httpDuration: new Trend("duration_001_01_15_Mutualfund_User_RiskProfile"),
        httpWaiting: new Trend("waiting_001_01_15_Mutualfund_User_RiskProfile"),
        requestRate: new Counter("rps_001_01_15_Mutualfund_User_RiskProfile"),
        http_reqs: new Counter("sample_001_01_15_Mutualfund_User_RiskProfile"),
    },
    Auth_Protected_AccountCenter_Status: {
        errorCount: new Counter("error_count_001_01_16_Auth_Protected_AccountCenter_Status"),
        errorRate: new Rate("error_rate_001_01_16_Auth_Protected_AccountCenter_Status"),
        httpDuration: new Trend("duration_001_01_16_Auth_Protected_AccountCenter_Status"),
        httpWaiting: new Trend("waiting_001_01_16_Auth_Protected_AccountCenter_Status"),
        requestRate: new Counter("rps_001_01_16_Auth_Protected_AccountCenter_Status"),
        http_reqs: new Counter("sample_001_01_16_Auth_Protected_AccountCenter_Status"),
    },
    Bond_Sbn_Master_Strapi_Banner: {
        errorCount: new Counter("error_count_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
        errorRate: new Rate("error_rate_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
        httpDuration: new Trend("duration_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
        httpWaiting: new Trend("waiting_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
        requestRate: new Counter("rps_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
        http_reqs: new Counter("sample_001_01_17_Bond_Sbn_Master_Strapi_Banner"),
    },
    Mutualfund_User_RiskProfile_2: {
        errorCount: new Counter("error_count_001_01_18_Mutualfund_User_RiskProfile_2"),
        errorRate: new Rate("error_rate_001_01_18_Mutualfund_User_RiskProfile_2"),
        httpDuration: new Trend("duration_001_01_18_Mutualfund_User_RiskProfile_2"),
        httpWaiting: new Trend("waiting_001_01_18_Mutualfund_User_RiskProfile_2"),
        requestRate: new Counter("rps_001_01_18_Mutualfund_User_RiskProfile_2"),
        http_reqs: new Counter("sample_001_01_18_Mutualfund_User_RiskProfile_2"),
    },
    Mutualfund_MutualFund_List: {
        errorCount: new Counter("error_count_001_01_19_Mutualfund_MutualFund_List"),
        errorRate: new Rate("error_rate_001_01_19_Mutualfund_MutualFund_List"),
        httpDuration: new Trend("duration_001_01_19_Mutualfund_MutualFund_List"),
        httpWaiting: new Trend("waiting_001_01_19_Mutualfund_MutualFund_List"),
        requestRate: new Counter("rps_001_01_19_Mutualfund_MutualFund_List"),
        http_reqs: new Counter("sample_001_01_19_Mutualfund_MutualFund_List"),
    },
    News_Category: {
        errorCount: new Counter("error_count_001_01_20_News_Category"),
        errorRate: new Rate("error_rate_001_01_20_News_Category"),
        httpDuration: new Trend("duration_001_01_20_News_Category"),
        httpWaiting: new Trend("waiting_001_01_20_News_Category"),
        requestRate: new Counter("rps_001_01_20_News_Category"),
        http_reqs: new Counter("sample_001_01_20_News_Category"),
    },
    Auth_Protected_GetConfig: {
        errorCount: new Counter("error_count_001_01_21_Auth_Protected_GetConfig"),
        errorRate: new Rate("error_rate_001_01_21_Auth_Protected_GetConfig"),
        httpDuration: new Trend("duration_001_01_21_Auth_Protected_GetConfig"),
        httpWaiting: new Trend("waiting_001_01_21_Auth_Protected_GetConfig"),
        requestRate: new Counter("rps_001_01_21_Auth_Protected_GetConfig"),
        http_reqs: new Counter("sample_001_01_21_Auth_Protected_GetConfig"),
    },
    Auth_Protected_Client_Selected: {
        errorCount: new Counter("error_count_001_01_22_Auth_Protected_Client_Selected"),
        errorRate: new Rate("error_rate_001_01_22_Auth_Protected_Client_Selected"),
        httpDuration: new Trend("duration_001_01_22_Auth_Protected_Client_Selected"),
        httpWaiting: new Trend("waiting_001_01_22_Auth_Protected_Client_Selected"),
        requestRate: new Counter("rps_001_01_22_Auth_Protected_Client_Selected"),
        http_reqs: new Counter("sample_001_01_22_Auth_Protected_Client_Selected"),
    },
    Bond_Sbn_Client_Check_Status: {
        errorCount: new Counter("error_count_001_01_23_Bond_Sbn_Client_Check_Status"),
        errorRate: new Rate("error_rate_001_01_23_Bond_Sbn_Client_Check_Status"),
        httpDuration: new Trend("duration_001_01_23_Bond_Sbn_Client_Check_Status"),
        httpWaiting: new Trend("waiting_001_01_23_Bond_Sbn_Client_Check_Status"),
        requestRate: new Counter("rps_001_01_23_Bond_Sbn_Client_Check_Status"),
        http_reqs: new Counter("sample_001_01_23_Bond_Sbn_Client_Check_Status"),
    },
    Mutualfund_User_Filter: {
        errorCount: new Counter("error_count_001_01_24_Mutualfund_User_Filter"),
        errorRate: new Rate("error_rate_001_01_24_Mutualfund_User_Filter"),
        httpDuration: new Trend("duration_001_01_24_Mutualfund_User_Filter"),
        httpWaiting: new Trend("waiting_001_01_24_Mutualfund_User_Filter"),
        requestRate: new Counter("rps_001_01_24_Mutualfund_User_Filter"),
        http_reqs: new Counter("sample_001_01_24_Mutualfund_User_Filter"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_25_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_25_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_25_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_25_User_UserSettings"),
        requestRate: new Counter("rps_001_01_25_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_25_User_UserSettings"),
    },
    Order_OrderStatusActionMap: {
        errorCount: new Counter("error_count_001_01_26_Order_OrderStatusActionMap"),
        errorRate: new Rate("error_rate_001_01_26_Order_OrderStatusActionMap"),
        httpDuration: new Trend("duration_001_01_26_Order_OrderStatusActionMap"),
        httpWaiting: new Trend("waiting_001_01_26_Order_OrderStatusActionMap"),
        requestRate: new Counter("rps_001_01_26_Order_OrderStatusActionMap"),
        http_reqs: new Counter("sample_001_01_26_Order_OrderStatusActionMap"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        //  || !userToken.pin_token
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;

    const headers = {
        'Cookie': `ACCESS_TOKEN=${token};`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3'
    };

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/user/api/v2/profile/trading`,
            base_url + `/user/api/v1/profile/personal`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_Profile_Trading,
                Home.User_Profile_Personal,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/password-reminder`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_PasswordReminder,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 3
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/password-remind-later`,
        ];

        const Auth_Protected_PasswordRemindLater_Payload = JSON.stringify({ 
            current_phase: 1 
        });

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
            ['POST', urls[0], Auth_Protected_PasswordRemindLater_Payload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_PasswordRemindLater,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 4
    if (token) {
        const urls = [
            base_url + `/user/api/v1/banner/promo`,
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
                Home.User_Banner_Promo,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 5
    if (token) {
        const urls = [
            base_url + `/user/api/protected/v1/portfolio/consolidated`,
        ];

        const stepFiveHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepFiveHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Protected_Portfolio_Consolidated,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true)
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 6
    let watchlistGroupID;
    if (token) {
        const urls = [
            base_url + `/user/api/v1/watchlistgroup`,
        ];

        const stepSixHeaders = {
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
            ['GET', urls[0], null, { headers: stepSixHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_Watchlistgroup,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {

                try {
                    const watchlistData = JSON.parse(response.body);
                    
                    // Asumsi structure: { data: [{ id: "..." }, ...] }
                    if (watchlistData && watchlistData.data && watchlistData.data.length > 0) {
                        watchlistGroupID = watchlistData.data[0].id;
                        
                        if (`${__ENV.ENV}` != 'INT') {
                            console.log(`${email} Got watchlistID: ${watchlistGroupID}`);
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

                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 7
    if (token) {
        const urls = [
            base_url + `/user/api/v2/watchlist/${watchlistGroupID}`,
        ];

        const stepSevenHeaders = {
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
            ['GET', urls[0], null, { headers: stepSevenHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_WatchlistID,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 8
    if (token) {
        const urls = [
            base_url + `/news/api/v2/`,
        ];

        const stepEightHeaders = {
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
            ['GET', urls[0], null, { headers: stepEightHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.News,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 9
    if (token) {
        const urls = [
            base_url + `/news/api/v2/categories`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.News_Categories,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 10
    if (token) {
        const urls = [
            base_url + `/news/api/v2/categories`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.News_Categories_2,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 11
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/quota/status/margin`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Oaofinance_Quota_Status_Margin,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 12
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Oaofinance_UserOpeningProgressSummary_Monitoring_Margin,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 13
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/account-center/switchables`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_AccountCenter_Switchables,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 14
    if (token) {
        const urls = [
            base_url + `/mutualfund/api/v1/user/risk-profile`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Mutualfund_User_RiskProfile,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 15
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/account-center/status`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_AccountCenter_Status,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 16
    // if (token) {
    //     const urls = [
    //         base_url + `/bond/api/v1/sbn/master/strapi/banner`,
    //     ];

    //     const requests = [
    //         ['GET', urls[0], null, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             Home.Bond_Sbn_Master_Strapi_Banner,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // Batch 17
    if (token) {
        const urls = [
            base_url + `/mutualfund/api/v1/user/risk-profile`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Mutualfund_User_RiskProfile_2,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 18
    if (token) {
        const urls = [
            base_url + `/mutualfund/api/v1/mutual-fund/list?limit=3`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Mutualfund_MutualFund_List,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 19
    if (token) {
        const urls = [
            base_url + `/news/api/v2/?category=&is_sharia=0&items=5&page=1`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.News_Category,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 20
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/get-config`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_GetConfig,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 21
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/client/selected`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_Client_Selected,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // // Batch 22
    // if (token) {
    //     const urls = [
    //         base_url + `/bond/api/v1/sbn/client/check/status`,
    //     ];

    //     const requests = [
    //         ['GET', urls[0], null, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             Home.Bond_Sbn_Client_Check_Status,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // Batch 23
    if (token) {
        const urls = [
            base_url + `/mutualfund/api/v1/user/filter`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Mutualfund_User_Filter,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 24
    if (token) {
        const urls = [
            base_url + `/user/api/v1/user_settings`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_UserSettings,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 25
    if (token) {
        const urls = [
            base_url + `/order/api/v1/order-status-action-map`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Order_OrderStatusActionMap,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}