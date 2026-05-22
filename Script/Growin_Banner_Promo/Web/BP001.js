import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// 1
//   curl 'https://api-qa.growin.id/user/api/v1/profile/status' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   2
//   curl 'https://api-qa.growin.id/auth/api/v1/protected/account-center/status' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   3
//   curl 'https://api-qa.growin.id/auth/api/v1/client/validate' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   4
//   curl 'https://api-qa.growin.id/user/api/v1/profile/trading' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   5
//   curl 'https://api-qa.growin.id/auth/api/v1/protected/validate' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'x-device-id: nhC5UK2WVHZw2G0m' \
//   -H 'Accept-Language: en' \
//   -H 'x-app-name: web' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'x-app-version: v1.0.0' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'Accept: application/json, text/plain, */*'

//   6
//   curl 'https://api-qa.growin.id/socialinvesting/api/v2/community-profile/login' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'Content-Type: application/json' \
//   --data-raw '{}'

//   7
//   curl 'https://api-qa.growin.id/auth/api/v1/protected/get-config' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   8
//   curl 'https://api-qa.growin.id/user/api/v1/profile/trading' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   9
//   curl 'https://api-qa.growin.id/user/api/v1/profile/personal' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   10
//   curl 'https://api-qa.growin.id/user/api/v1/user_settings' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   11
//   curl 'https://api-qa.growin.id/inbox/api/v1/read-count' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//     11
//   curl 'https://api-qa.growin.id/marketdata/api/v1/stock-rank-explore?limit=5&rank_by=top_volume&page=1' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   12
//   curl 'https://api-qa.growin.id/user/api/v2/watchlistgroup' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   13
//   curl 'https://api-qa.growin.id/bond/api/v1/sbn/master/strapi/banner' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   14
//   curl 'https://api-qa.growin.id/bond/api/v1/sbn/client/check/status' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'Content-Type: application/json' \
//   --data-raw '{}'

//   15
//   curl 'https://api-qa.growin.id/bond/api/v1/sbn/master/product/list?page=0&max=100&status=A' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   16
//   curl 'https://api-qa.growin.id/user/api/v1/banner/promo' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   17
//   curl 'https://api-qa.growin.id/news/api/v2/categories?is_sharia=0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   18
//   curl 'https://api-qa.growin.id/news/api/v2/?items=6&page=1&category=0&is_sharia=0&is_shortsell=0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   19
//   curl 'https://api-qa.growin.id/socialinvesting/api/v1/channel/joined-by-user' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'accept: application/json' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0'

//   20
//   curl 'https://api-qa.growin.id/socialinvesting/api/v1/community-profile/get-profile' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'accept: application/json' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0'

//   21
//   curl 'https://api-qa.growin.id/mutualfund/api/v1/mutual-fund/list?subscribable=true&limit=5&sort=1&order=DESC&mi=&page=1' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'x-device-id: nhC5UK2WVHZw2G0m' \
//   -H 'Accept-Language: en' \
//   -H 'x-app-name: web' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'x-app-version: v1.0.0' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'Accept: application/json, text/plain, */*'

//   22
//   curl 'https://api-qa.growin.id/user/api/v1/watchlist/8746ec27-f702-42b6-8e9a-2a352596cf55' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

//   23
//   curl 'https://api-qa.growin.id/auth/api/v1/client/validate' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Referer: https://invest-qa.growin.id/' \
//   -H 'Accept-Language: en' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'sec-ch-ua: "Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36' \
//   -H 'sec-ch-ua-mobile: ?0'

// /user/api/v1/profile/status
// /auth/api/v1/protected/account-center/status
// /auth/api/v1/client/validate
// /user/api/v1/profile/trading
// /auth/api/v1/protected/validate
// /socialinvesting/api/v2/community-profile/login
// /auth/api/v1/protected/get-config
// /user/api/v1/profile/trading
// /auth/api/v1/protected/validate
// /user/api/v1/user_settings
// /marketdata/api/v1/stock-rank-explore?limit=5&rank_by=top_volume&page=1
// /user/api/v2/watchlistgroup
// /bond/api/v1/sbn/master/strapi/banner
// /bond/api/v1/sbn/client/check/status
// /bond/api/v1/sbn/master/product/list?page=0&max=100&status=A
// /user/api/v1/banner/promo
// /news/api/v2/categories?is_sharia=0
// /news/api/v2/?items=6&page=1&category=0&is_sharia=0&is_shortsell=0
// /socialinvesting/api/v1/channel/joined-by-user
// /socialinvesting/api/v1/community-profile/get-profile
// /mutualfund/api/v1/mutual-fund/list?subscribable=true&limit=5&sort=1&order=DESC&mi=&page=1
// /user/api/v1/watchlist/8746ec27-f702-42b6-8e9a-2a352596cf55
// /auth/api/v1/client/validate

// User_Profile_Status
// Auth_Protected_AccountCenter_Status
// Auth_Client_Validate
// User_Profile_Trading
// Auth_Protected_Validate
// Socialinvesting_CommunityProfile_Login
// Auth_Protected_GetConfig
// User_Profile_Trading
// Auth_Protected_Validate
// User_UserSettings
// Marketdata_StockRankExplore
// User_Watchlistgroup
// Bond_Sbn_Master_Strapi_Banner
// Bond_Sbn_Client_Check_Status
// Bond_Sbn_Master_Product_List
// User_Banner_Promo
// News_Categories
// News
// Socialinvesting_Channel_JoinedByUser
// Socialinvesting_CommunityProfile_GetProfile
// Mutualfund_MutualFund_List
// User_Watchlist_ID
// Auth_Client_Validate

// Define custom metrics
const Home = {
    User_Profile_Status: {
        errorCount: new Counter("error_count_001_01_01_User_Profile_Status"),
        errorRate: new Rate("error_rate_001_01_01_User_Profile_Status"),
        httpDuration: new Trend("duration_001_01_01_User_Profile_Status"),
        httpWaiting: new Trend("waiting_001_01_01_User_Profile_Status"),
        requestRate: new Counter("rps_001_01_01_User_Profile_Status"),
        http_reqs: new Counter("sample_001_01_01_User_Profile_Status"),
    },
    Auth_Protected_AccountCenter_Status: {
        errorCount: new Counter("error_count_001_01_02_Auth_Protected_AccountCenter_Status"),
        errorRate: new Rate("error_rate_001_01_02_Auth_Protected_AccountCenter_Status"),
        httpDuration: new Trend("duration_001_01_02_Auth_Protected_AccountCenter_Status"),
        httpWaiting: new Trend("waiting_001_01_02_Auth_Protected_AccountCenter_Status"),
        requestRate: new Counter("rps_001_01_02_Auth_Protected_AccountCenter_Status"),
        http_reqs: new Counter("sample_001_01_02_Auth_Protected_AccountCenter_Status"),
    },
    Auth_Client_Validate: {
        errorCount: new Counter("error_count_001_01_03_Auth_Client_Validate"),
        errorRate: new Rate("error_rate_001_01_03_Auth_Client_Validate"),
        httpDuration: new Trend("duration_001_01_03_Auth_Client_Validate"),
        httpWaiting: new Trend("waiting_001_01_03_Auth_Client_Validate"),
        requestRate: new Counter("rps_001_01_03_Auth_Client_Validate"),
        http_reqs: new Counter("sample_001_01_03_Auth_Client_Validate"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_01_04_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_04_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_04_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_04_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_04_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_04_User_Profile_Trading"),
    },
    Auth_Protected_Validate: {
        errorCount: new Counter("error_count_001_01_05_Auth_Protected_Validate"),
        errorRate: new Rate("error_rate_001_01_05_Auth_Protected_Validate"),
        httpDuration: new Trend("duration_001_01_05_Auth_Protected_Validate"),
        httpWaiting: new Trend("waiting_001_01_05_Auth_Protected_Validate"),
        requestRate: new Counter("rps_001_01_05_Auth_Protected_Validate"),
        http_reqs: new Counter("sample_001_01_05_Auth_Protected_Validate"),
    },
    Socialinvesting_CommunityProfile_Login: {
        errorCount: new Counter("error_count_001_01_06_Socialinvesting_CommunityProfile_Login"),
        errorRate: new Rate("error_rate_001_01_06_Socialinvesting_CommunityProfile_Login"),
        httpDuration: new Trend("duration_001_01_06_Socialinvesting_CommunityProfile_Login"),
        httpWaiting: new Trend("waiting_001_01_06_Socialinvesting_CommunityProfile_Login"),
        requestRate: new Counter("rps_001_01_06_Socialinvesting_CommunityProfile_Login"),
        http_reqs: new Counter("sample_001_01_06_Socialinvesting_CommunityProfile_Login"),
    },
    Auth_Protected_GetConfig: {
        errorCount: new Counter("error_count_001_01_07_Auth_Protected_GetConfig"),
        errorRate: new Rate("error_rate_001_01_07_Auth_Protected_GetConfig"),
        httpDuration: new Trend("duration_001_01_07_Auth_Protected_GetConfig"),
        httpWaiting: new Trend("waiting_001_01_07_Auth_Protected_GetConfig"),
        requestRate: new Counter("rps_001_01_07_Auth_Protected_GetConfig"),
        http_reqs: new Counter("sample_001_01_07_Auth_Protected_GetConfig"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_01_08_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_08_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_08_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_08_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_08_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_08_User_Profile_Trading"),
    },
    Auth_Protected_Validate: {
        errorCount: new Counter("error_count_001_01_09_Auth_Protected_Validate"),
        errorRate: new Rate("error_rate_001_01_09_Auth_Protected_Validate"),
        httpDuration: new Trend("duration_001_01_09_Auth_Protected_Validate"),
        httpWaiting: new Trend("waiting_001_01_09_Auth_Protected_Validate"),
        requestRate: new Counter("rps_001_01_09_Auth_Protected_Validate"),
        http_reqs: new Counter("sample_001_01_09_Auth_Protected_Validate"),
    },
    User_UserSettings: {
        errorCount: new Counter("error_count_001_01_10_User_UserSettings"),
        errorRate: new Rate("error_rate_001_01_10_User_UserSettings"),
        httpDuration: new Trend("duration_001_01_10_User_UserSettings"),
        httpWaiting: new Trend("waiting_001_01_10_User_UserSettings"),
        requestRate: new Counter("rps_001_01_10_User_UserSettings"),
        http_reqs: new Counter("sample_001_01_10_User_UserSettings"),
    },
    Marketdata_StockRankExplore: {
        errorCount: new Counter("error_count_001_01_11_Marketdata_StockRankExplore"),
        errorRate: new Rate("error_rate_001_01_11_Marketdata_StockRankExplore"),
        httpDuration: new Trend("duration_001_01_11_Marketdata_StockRankExplore"),
        httpWaiting: new Trend("waiting_001_01_11_Marketdata_StockRankExplore"),
        requestRate: new Counter("rps_001_01_11_Marketdata_StockRankExplore"),
        http_reqs: new Counter("sample_001_01_11_Marketdata_StockRankExplore"),
    },
    User_Watchlistgroup: {
        errorCount: new Counter("error_count_001_01_12_User_Watchlistgroup"),
        errorRate: new Rate("error_rate_001_01_12_User_Watchlistgroup"),
        httpDuration: new Trend("duration_001_01_12_User_Watchlistgroup"),
        httpWaiting: new Trend("waiting_001_01_12_User_Watchlistgroup"),
        requestRate: new Counter("rps_001_01_12_User_Watchlistgroup"),
        http_reqs: new Counter("sample_001_01_12_User_Watchlistgroup"),
    },
    Bond_Sbn_Master_Strapi_Banner: {
        errorCount: new Counter("error_count_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
        errorRate: new Rate("error_rate_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
        httpDuration: new Trend("duration_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
        httpWaiting: new Trend("waiting_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
        requestRate: new Counter("rps_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
        http_reqs: new Counter("sample_001_01_13_Bond_Sbn_Master_Strapi_Banner"),
    },
    Bond_Sbn_Client_Check_Status: {
        errorCount: new Counter("error_count_001_01_14_Bond_Sbn_Client_Check_Status"),
        errorRate: new Rate("error_rate_001_01_14_Bond_Sbn_Client_Check_Status"),
        httpDuration: new Trend("duration_001_01_14_Bond_Sbn_Client_Check_Status"),
        httpWaiting: new Trend("waiting_001_01_14_Bond_Sbn_Client_Check_Status"),
        requestRate: new Counter("rps_001_01_14_Bond_Sbn_Client_Check_Status"),
        http_reqs: new Counter("sample_001_01_14_Bond_Sbn_Client_Check_Status"),
    },
    Bond_Sbn_Master_Product_List: {
        errorCount: new Counter("error_count_001_01_15_Bond_Sbn_Master_Product_List"),
        errorRate: new Rate("error_rate_001_01_15_Bond_Sbn_Master_Product_List"),
        httpDuration: new Trend("duration_001_01_15_Bond_Sbn_Master_Product_List"),
        httpWaiting: new Trend("waiting_001_01_15_Bond_Sbn_Master_Product_List"),
        requestRate: new Counter("rps_001_01_15_Bond_Sbn_Master_Product_List"),
        http_reqs: new Counter("sample_001_01_15_Bond_Sbn_Master_Product_List"),
    },
    User_Banner_Promo: {
        errorCount: new Counter("error_count_001_01_16_User_Banner_Promo"),
        errorRate: new Rate("error_rate_001_01_16_User_Banner_Promo"),
        httpDuration: new Trend("duration_001_01_16_User_Banner_Promo"),
        httpWaiting: new Trend("waiting_001_01_16_User_Banner_Promo"),
        requestRate: new Counter("rps_001_01_16_User_Banner_Promo"),
        http_reqs: new Counter("sample_001_01_16_User_Banner_Promo"),
    },
    News_Categories: {
        errorCount: new Counter("error_count_001_01_17_News_Categories"),
        errorRate: new Rate("error_rate_001_01_17_News_Categories"),
        httpDuration: new Trend("duration_001_01_17_News_Categories"),
        httpWaiting: new Trend("waiting_001_01_17_News_Categories"),
        requestRate: new Counter("rps_001_01_17_News_Categories"),
        http_reqs: new Counter("sample_001_01_17_News_Categories"),
    },
    News: {
        errorCount: new Counter("error_count_001_01_18_News"),
        errorRate: new Rate("error_rate_001_01_18_News"),
        httpDuration: new Trend("duration_001_01_18_News"),
        httpWaiting: new Trend("waiting_001_01_18_News"),
        requestRate: new Counter("rps_001_01_18_News"),
        http_reqs: new Counter("sample_001_01_18_News"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_001_01_19_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_001_01_19_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_001_01_19_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_001_01_19_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_001_01_19_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_001_01_19_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_001_01_20_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Mutualfund_MutualFund_List: {
        errorCount: new Counter("error_count_001_01_21_Mutualfund_MutualFund_List"),
        errorRate: new Rate("error_rate_001_01_21_Mutualfund_MutualFund_List"),
        httpDuration: new Trend("duration_001_01_21_Mutualfund_MutualFund_List"),
        httpWaiting: new Trend("waiting_001_01_21_Mutualfund_MutualFund_List"),
        requestRate: new Counter("rps_001_01_21_Mutualfund_MutualFund_List"),
        http_reqs: new Counter("sample_001_01_21_Mutualfund_MutualFund_List"),
    },
    User_Watchlist_ID: {
        errorCount: new Counter("error_count_001_01_22_User_Watchlist_ID"),
        errorRate: new Rate("error_rate_001_01_22_User_Watchlist_ID"),
        httpDuration: new Trend("duration_001_01_22_User_Watchlist_ID"),
        httpWaiting: new Trend("waiting_001_01_22_User_Watchlist_ID"),
        requestRate: new Counter("rps_001_01_22_User_Watchlist_ID"),
        http_reqs: new Counter("sample_001_01_22_User_Watchlist_ID"),
    },
    Auth_Client_Validate: {
        errorCount: new Counter("error_count_001_01_23_Auth_Client_Validate"),
        errorRate: new Rate("error_rate_001_01_23_Auth_Client_Validate"),
        httpDuration: new Trend("duration_001_01_23_Auth_Client_Validate"),
        httpWaiting: new Trend("waiting_001_01_23_Auth_Client_Validate"),
        requestRate: new Counter("rps_001_01_23_Auth_Client_Validate"),
        http_reqs: new Counter("sample_001_01_23_Auth_Client_Validate"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
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
    const user_id = userToken.user_id;
    const client_id = userToken.client_id;
    const SID = userToken.SID;
    const ksei_acc_no = userToken.ksei_acc_no;
    const account_name = userToken.account_name;
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
        'X-Device-Id': 'TEST3',

        // "origin": (referer or "https://invest-dev.growin.id").rstrip("/"),
        // "referer": referer or "https://invest-dev.growin.id/",
        "priority": "u=1, i",
        "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        // "Authorization": "Bearer rw^~q0k/7szEfGroWiN9MostNG",
    };

    // Batch 1
    if (token) {
        const urls = [
            // base_url + `/marketdata/api/v1/gpt/financial_summarizer`,
            
            base_url + `/user/api/v1/profile/status`,
            base_url + `/auth/api/v1/protected/account-center/status`,
            base_url + `/auth/api/v1/client/validate`,
            base_url + `/user/api/v1/profile/trading`,
            base_url + `/auth/api/v1/protected/validate`,
            base_url + `/socialinvesting/api/v2/community-profile/login`,
            base_url + `/auth/api/v1/protected/get-config`,
            base_url + `/user/api/v1/profile/trading`,
            base_url + `/auth/api/v1/protected/validate`,
            base_url + `/user/api/v1/user_settings`,
            base_url + `/marketdata/api/v1/stock-rank-explore?limit=5&rank_by=top_volume&page=1`,
            base_url + `/user/api/v2/watchlistgroup`,
            base_url + `/bond/api/v1/sbn/master/strapi/banner`,
            base_url + `/bond/api/v1/sbn/client/check/status`,
            base_url + `/bond/api/v1/sbn/master/product/list?page=0&max=100&status=A`,
            base_url + `/user/api/v1/banner/promo`,
            base_url + `/news/api/v2/categories?is_sharia=0`,
            base_url + `/news/api/v2/?items=6&page=1&category=0&is_sharia=0&is_shortsell=0`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/mutualfund/api/v1/mutual-fund/list?subscribable=true&limit=5&sort=1&order=DESC&mi=&page=1`,
            base_url + `/user/api/v1/watchlist/8746ec27-f702-42b6-8e9a-2a352596cf55`,
            base_url + `/auth/api/v1/client/validate`,
        ];

        const requests = [
            // ['GET', urls[0], null, { headers: headers, timeout: '300s' }],
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
            ['GET', urls[2], null, { headers: headers }],
            ['GET', urls[3], null, { headers: headers }],
            ['GET', urls[4], null, { headers: headers }],
            ['POST', urls[5], null, { headers: headers }],
            ['GET', urls[6], null, { headers: headers }],
            ['GET', urls[7], null, { headers: headers }],
            ['GET', urls[8], null, { headers: headers }],
            ['GET', urls[9], null, { headers: headers }],
            ['GET', urls[10], null, { headers: headers }],
            ['GET', urls[11], null, { headers: headers }],
            ['GET', urls[12], null, { headers: headers }],
            ['POST', urls[13], null, { headers: headers }],
            ['GET', urls[14], null, { headers: headers }],
            ['GET', urls[15], null, { headers: headers }],
            ['GET', urls[16], null, { headers: headers }],
            ['GET', urls[17], null, { headers: headers }],
            ['GET', urls[18], null, { headers: headers }],
            ['GET', urls[19], null, { headers: headers }],
            ['GET', urls[20], null, { headers: headers }],
            ['GET', urls[21], null, { headers: headers }],
            ['GET', urls[22], null, { headers: headers }],
            // ['GET', urls[23], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.User_Profile_Status,
                Home.Auth_Protected_AccountCenter_Status,
                Home.Auth_Client_Validate,
                Home.User_Profile_Trading,
                Home.Auth_Protected_Validate,
                Home.Socialinvesting_CommunityProfile_Login,
                Home.Auth_Protected_GetConfig,
                Home.User_Profile_Trading,
                Home.Auth_Protected_Validate,
                Home.User_UserSettings,
                Home.Marketdata_StockRankExplore,
                Home.User_Watchlistgroup,
                Home.Bond_Sbn_Master_Strapi_Banner,
                Home.Bond_Sbn_Client_Check_Status,
                Home.Bond_Sbn_Master_Product_List,
                Home.User_Banner_Promo,
                Home.News_Categories,
                Home.News,
                Home.Socialinvesting_Channel_JoinedByUser,
                Home.Socialinvesting_CommunityProfile_GetProfile,
                Home.Mutualfund_MutualFund_List,
                Home.User_Watchlist_ID,
                Home.Auth_Client_Validate,
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.25);
}