import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Home
// /user/api/v2/profile/trading
// /user/api/v1/profile/personal
// /auth/api/v1/protected/password-reminder
// /auth/api/v1/protected/password-remind-later
// /user/api/v1/banner/promo
// /user/protected/v1/portfolio/consolidated
// /user/api/v1/watchlistgroup
// /user/api/v2/watchlist/{watchlistGroupId}
// /news/api/v2/
// /news/api/v2/categories
// /news/api/v2/categories
// /oaofinance/api/v1/quota/status/margin
// /oaofinance/api/v1/user-opening-progress-summary/monitoring/margin
// /auth/api/v1/protected/account-center/switchables
// /mutualfund/api/v1/user/risk-profile
// /bond/api/v1/sbn/master/strapi/banner
// /news/api/v2/?category=&is_sharia=0&items=5&page=1
// /auth/api/v1/protected/get-config
// /auth/api/v1/protected/client/selected

// User_Profile_Trading
// User_Profile_Personal
// Auth_Protected_PasswordReminder
// Auth_Protected_PasswordRemindLater
// User_Banner_Promo
// User_Portfolio_Consolidated
// User_Watchlistgroup
// User_Watchlist_ByWatchlistGroupId
// News
// News_Categories
// News_Categories
// Oaofinance_Quota_Status_Margin
// Oaofinance_UserOpeningProgressSummary_Monitoring_Margin
// Auth_Protected_AccountCenter_Switchables
// Mutualfund_User_RiskProfile
// Bond_Sbn_Master_Strapi_Banner
// News_IsSharia0_Items5_Page1
// Auth_Protected_GetConfig
// Auth_Protected_Client_Selected

// Define custom metrics (unchanged)
const Home = {
    User_Profile_Trading: {
        errorCount: new Counter("error_count_003_01_01_User_Profile_Trading"),
        errorRate: new Rate("error_rate_003_01_01_User_Profile_Trading"),
        httpDuration: new Trend("duration_003_01_01_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_003_01_01_User_Profile_Trading"),
        requestRate: new Counter("rps_003_01_01_User_Profile_Trading"),
        http_reqs: new Counter("sample_003_01_01_User_Profile_Trading"),
    },
    User_Profile_Personal: {
        errorCount: new Counter("error_count_003_01_02_User_Profile_Personal"),
        errorRate: new Rate("error_rate_003_01_02_User_Profile_Personal"),
        httpDuration: new Trend("duration_003_01_02_User_Profile_Personal"),
        httpWaiting: new Trend("waiting_003_01_02_User_Profile_Personal"),
        requestRate: new Counter("rps_003_01_02_User_Profile_Personal"),
        http_reqs: new Counter("sample_003_01_02_User_Profile_Personal"),
    },
    Auth_Protected_PasswordReminder: {
        errorCount: new Counter("error_count_003_01_03_Auth_Protected_PasswordReminder"),
        errorRate: new Rate("error_rate_003_01_03_Auth_Protected_PasswordReminder"),
        httpDuration: new Trend("duration_003_01_03_Auth_Protected_PasswordReminder"),
        httpWaiting: new Trend("waiting_003_01_03_Auth_Protected_PasswordReminder"),
        requestRate: new Counter("rps_003_01_03_Auth_Protected_PasswordReminder"),
        http_reqs: new Counter("sample_003_01_03_Auth_Protected_PasswordReminder"),
    },
    Auth_Protected_PasswordRemindLater: {
        errorCount: new Counter("error_count_003_01_04_Auth_Protected_PasswordRemindLater"),
        errorRate: new Rate("error_rate_003_01_04_Auth_Protected_PasswordRemindLater"),
        httpDuration: new Trend("duration_003_01_04_Auth_Protected_PasswordRemindLater"),
        httpWaiting: new Trend("waiting_003_01_04_Auth_Protected_PasswordRemindLater"),
        requestRate: new Counter("rps_003_01_04_Auth_Protected_PasswordRemindLater"),
        http_reqs: new Counter("sample_003_01_04_Auth_Protected_PasswordRemindLater"),
    },
    User_Banner_Promo: {
        errorCount: new Counter("error_count_003_01_05_User_Banner_Promo"),
        errorRate: new Rate("error_rate_003_01_05_User_Banner_Promo"),
        httpDuration: new Trend("duration_003_01_05_User_Banner_Promo"),
        httpWaiting: new Trend("waiting_003_01_05_User_Banner_Promo"),
        requestRate: new Counter("rps_003_01_05_User_Banner_Promo"),
        http_reqs: new Counter("sample_003_01_05_User_Banner_Promo"),
    },
    User_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_003_01_06_User_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_003_01_06_User_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_003_01_06_User_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_003_01_06_User_Portfolio_Consolidated"),
        requestRate: new Counter("rps_003_01_06_User_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_003_01_06_User_Portfolio_Consolidated"),
    },
    User_Watchlistgroup: {
        errorCount: new Counter("error_count_003_01_07_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_003_01_07_User_Watchlistgroup"),
        httpDuration: new Trend("duration_003_01_07_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_003_01_07_User_Watchlistgroup"),
        requestRate: new Counter("rps_003_01_07_User_Watchlistgroup"),
        http_reqs: new Counter("sample_003_01_07_User_Watchlistgroup"),
    },
    User_Watchlist_ByWatchlistGroupId: {
        errorCount: new Counter("error_count_003_01_08_User_Watchlist_ByWatchlistGroupId"),
        errorRate: new Rate("error_rate_003_01_08_User_Watchlist_ByWatchlistGroupId"),
        httpDuration: new Trend("duration_003_01_08_User_Watchlist_ByWatchlistGroupId"),
        httpWaiting: new Trend("waiting_003_01_08_User_Watchlist_ByWatchlistGroupId"),
        requestRate: new Counter("rps_003_01_08_User_Watchlist_ByWatchlistGroupId"),
        http_reqs: new Counter("sample_003_01_08_User_Watchlist_ByWatchlistGroupId"),
    },
    News: {
        errorCount: new Counter("error_count_003_01_09_News"),
        errorRate: new Rate("error_rate_003_01_09_News"),
        httpDuration: new Trend("duration_003_01_09_News"),
        httpWaiting: new Trend("waiting_003_01_09_News"),
        requestRate: new Counter("rps_003_01_09_News"),
        http_reqs: new Counter("sample_003_01_09_News"),
    },
    News_Categories: {
        errorCount: new Counter("error_count_003_01_10_News_Categories"),
        errorRate: new Rate("error_rate_003_01_10_News_Categories"),
        httpDuration: new Trend("duration_003_01_10_News_Categories"),
        httpWaiting: new Trend("waiting_003_01_10_News_Categories"),
        requestRate: new Counter("rps_003_01_10_News_Categories"),
        http_reqs: new Counter("sample_003_01_10_News_Categories"),
    },
    News_Categories_2: {
        errorCount: new Counter("error_count_003_01_11_News_Categories_2"),
        errorRate: new Rate("error_rate_003_01_11_News_Categories_2"),
        httpDuration: new Trend("duration_003_01_11_News_Categories_2"),
        httpWaiting: new Trend("waiting_003_01_11_News_Categories_2"),
        requestRate: new Counter("rps_003_01_11_News_Categories_2"),
        http_reqs: new Counter("sample_003_01_11_News_Categories_2"),
    },
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_003_01_12_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_003_01_12_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_003_01_12_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_003_01_12_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_003_01_12_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_003_01_12_Oaofinance_Quota_Status_Margin"),
    },
    Oaofinance_UserOpeningProgressSummary_Monitoring_Margin: {
        errorCount: new Counter("error_count_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        errorRate: new Rate("error_rate_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpDuration: new Trend("duration_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpWaiting: new Trend("waiting_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        requestRate: new Counter("rps_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        http_reqs: new Counter("sample_003_01_13_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
    },
    Auth_Protected_AccountCenter_Switchables: {
        errorCount: new Counter("error_count_003_01_14_Auth_Protected_AccountCenter_Switchables"),
        errorRate: new Rate("error_rate_003_01_14_Auth_Protected_AccountCenter_Switchables"),
        httpDuration: new Trend("duration_003_01_14_Auth_Protected_AccountCenter_Switchables"),
        httpWaiting: new Trend("waiting_003_01_14_Auth_Protected_AccountCenter_Switchables"),
        requestRate: new Counter("rps_003_01_14_Auth_Protected_AccountCenter_Switchables"),
        http_reqs: new Counter("sample_003_01_14_Auth_Protected_AccountCenter_Switchables"),
    },
    Mutualfund_User_RiskProfile: {
        errorCount: new Counter("error_count_003_01_15_Mutualfund_User_RiskProfile"),
        errorRate: new Rate("error_rate_003_01_15_Mutualfund_User_RiskProfile"),
        httpDuration: new Trend("duration_003_01_15_Mutualfund_User_RiskProfile"),
        httpWaiting: new Trend("waiting_003_01_15_Mutualfund_User_RiskProfile"),
        requestRate: new Counter("rps_003_01_15_Mutualfund_User_RiskProfile"),
        http_reqs: new Counter("sample_003_01_15_Mutualfund_User_RiskProfile"),
    },
    Bond_Sbn_Master_Strapi_Banner: {
        errorCount: new Counter("error_count_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
        errorRate: new Rate("error_rate_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
        httpDuration: new Trend("duration_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
        httpWaiting: new Trend("waiting_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
        requestRate: new Counter("rps_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
        http_reqs: new Counter("sample_003_01_16_Bond_Sbn_Master_Strapi_Banner"),
    },
    News_IsSharia0_Items5_Page1: {
        errorCount: new Counter("error_count_003_01_17_News_IsSharia0_Items5_Page1"),
        errorRate: new Rate("error_rate_003_01_17_News_IsSharia0_Items5_Page1"),
        httpDuration: new Trend("duration_003_01_17_News_IsSharia0_Items5_Page1"),
        httpWaiting: new Trend("waiting_003_01_17_News_IsSharia0_Items5_Page1"),
        requestRate: new Counter("rps_003_01_17_News_IsSharia0_Items5_Page1"),
        http_reqs: new Counter("sample_003_01_17_News_IsSharia0_Items5_Page1"),
    },
    Auth_Protected_GetConfig: {
        errorCount: new Counter("error_count_003_01_18_Auth_Protected_GetConfig"),
        errorRate: new Rate("error_rate_003_01_18_Auth_Protected_GetConfig"),
        httpDuration: new Trend("duration_003_01_18_Auth_Protected_GetConfig"),
        httpWaiting: new Trend("waiting_003_01_18_Auth_Protected_GetConfig"),
        requestRate: new Counter("rps_003_01_18_Auth_Protected_GetConfig"),
        http_reqs: new Counter("sample_003_01_18_Auth_Protected_GetConfig"),
    },
    Auth_Protected_Client_Selected: {
        errorCount: new Counter("error_count_003_01_19_Auth_Protected_Client_Selected"),
        errorRate: new Rate("error_rate_003_01_19_Auth_Protected_Client_Selected"),
        httpDuration: new Trend("duration_003_01_19_Auth_Protected_Client_Selected"),
        httpWaiting: new Trend("waiting_003_01_19_Auth_Protected_Client_Selected"),
        requestRate: new Counter("rps_003_01_19_Auth_Protected_Client_Selected"),
        http_reqs: new Counter("sample_003_01_19_Auth_Protected_Client_Selected"),
    },
};

export function BP003(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    // ✅ Get mapping from setup
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        // console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
        return;
    }
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;
    
    let watchlistGroupID = null;

    const headersAfterLogin = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };

    // Batch 1 - Home
    {
        const urls = [
            base_url + `/user/api/v2/profile/trading`,
            base_url + `/user/api/v1/profile/personal`,
            base_url + `/auth/api/v1/protected/password-reminder`,
            base_url + `/auth/api/v1/protected/password-remind-later`,
            base_url + `/user/api/v1/banner/promo`,
            // base_url + `/user/protected/v1/portfolio/consolidated`,
            base_url + `/user/api/v1/watchlistgroup`,
        ];
        const Auth_Protected_PasswordRemindLater_Payload = JSON.stringify({
            current_phase: 3,
        });

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterLogin }],
            ['GET', urls[1], null, { headers: headersAfterLogin }],
            ['GET', urls[2], null, { headers: headersAfterLogin }],
            ['POST', urls[3], Auth_Protected_PasswordRemindLater_Payload, { headers: headersAfterLogin }],
            ['GET', urls[4], null, { headers: headersAfterLogin }],
            ['GET', urls[5], null, { headers: headersAfterLogin }],
            // ['GET', urls[6], null, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_Profile_Trading,
                Home.User_Profile_Personal,
                Home.Auth_Protected_PasswordReminder,
                Home.Auth_Protected_PasswordRemindLater,
                Home.User_Banner_Promo,
                // Home.User_Portfolio_Consolidated,
                Home.User_Watchlistgroup,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                try {
                    const watchlistData = JSON.parse(response.body);
                    
                    if (watchlistData && watchlistData.data && watchlistData.data.length > 0) {
                        watchlistGroupID = watchlistData.data[5].id;
                        
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
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`]: (r) => r.status === 200
                });
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }

    // Batch 2 - Home
    {
        const urls = [
            base_url + `/user/api/v2/watchlist/${watchlistGroupID}`,
            base_url + `/news/api/v2/`,
            base_url + `/news/api/v2/categories`,
            base_url + `/news/api/v2/categories`,
            base_url + `/oaofinance/api/v1/quota/status/margin`,
            base_url + `/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,
            base_url + `/auth/api/v1/protected/account-center/switchables`,
            base_url + `/mutualfund/api/v1/user/risk-profile`,
            base_url + `/bond/api/v1/sbn/master/strapi/banner`,
            base_url + `/news/api/v2/?category=&is_sharia=0&items=5&page=1`,
            base_url + `/auth/api/v1/protected/get-config`,
            base_url + `/auth/api/v1/protected/client/selected`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterLogin }],
            ['GET', urls[1], null, { headers: headersAfterLogin }],
            ['GET', urls[2], null, { headers: headersAfterLogin }],
            ['GET', urls[3], null, { headers: headersAfterLogin }],
            ['GET', urls[4], null, { headers: headersAfterLogin }],
            ['GET', urls[5], null, { headers: headersAfterLogin }],
            ['GET', urls[6], null, { headers: headersAfterLogin }],
            ['GET', urls[7], null, { headers: headersAfterLogin }],
            ['GET', urls[8], null, { headers: headersAfterLogin }],
            ['GET', urls[9], null, { headers: headersAfterLogin }],
            ['GET', urls[10], null, { headers: headersAfterLogin }],
            ['GET', urls[11], null, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_Watchlist_ByWatchlistGroupId,
                Home.News,
                Home.News_Categories,
                Home.News_Categories_2,
                Home.Oaofinance_Quota_Status_Margin,
                Home.Oaofinance_UserOpeningProgressSummary_Monitoring_Margin,
                Home.Auth_Protected_AccountCenter_Switchables,
                Home.Mutualfund_User_RiskProfile,
                Home.Bond_Sbn_Master_Strapi_Banner,
                Home.News_IsSharia0_Items5_Page1,
                Home.Auth_Protected_GetConfig,
                Home.Auth_Protected_Client_Selected,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`]: (r) => r.status === 200
                });
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }

    sleep(0.25);
}