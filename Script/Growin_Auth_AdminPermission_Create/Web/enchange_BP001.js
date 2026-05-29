// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Auth_AdminPermission_Create/Web/BP001.js
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

// login password
// /auth/api/v2/admin-login

// login pin
// /auth/api/v1/protected/admin-pin-login
 
// refresh token pass
// /auth/api/v1/admin/refresh/pass-token
 
// refresh token pin
// /auth/api/v1/admin/refresh/pin-token
 
// before switch clientid
// /auth/api/v1/protected/validate
// /auth/api/v1/client/validate
// /auth/api/v1/protected/admin-permissions
// /user/api/v1/profile/trading
// /user/api/v1/profile
// /user/api/protected/v2/portfolio-stock/cash
// /user/api/v1/profile/collateral-ratio
// /user/api/protected/v1/portfolio/consolidated
// /marketws/ws-web
 
// switch clientid
// /auth/api/v2/protected/switch-clientid-its
 
// after switch clientid (redirect to portfolio menu)
// /auth/api/v1/protected/validate
// /auth/api/v1/client/validate
// /auth/api/v1/protected/admin-permissions
// /user/api/v1/profile/trading
// /user/api/v1/profile
// /user/api/protected/v2/portfolio-stock/cash
// /user/api/v1/profile/collateral-ratio
// /user/api/protected/v1/portfolio/consolidated
// /user/api/protected/v1/portfolio/forced-sell
// /user/api/protected/v3/portfolio/stock
// /mutualfund/api/v1/user/risk-profile
// /marketws/ws-web
// /order/v2/ws
 
// stocks menu
// /order/api/v1/protected/order-list
// /order/api/v2/protected/order-list
// /order/api/v3/protected/tradelist
// /marketdata/api/v1/orderbook/BMRI
// /marketdata/api/v1/orderbook-simple/all (dihit sehari sekali, di cache di local storage seharian kayak webpro)
// /marketdata/api/v1/price-movement
 
// client profile menu
// /user/api/v1/admin/search-clients
// /user/api/protected/v1/admin/client-profile
  
// client info menu
// /user/api/protected/v2/admin/client-profile

// ===================================================

// Login_Password
// Auth_AdminLogin

// Login_PIN
// Auth_Protected_AdminPinLogin

// Refresh_Token_Pass
// Auth_Admin_Refresh_PassToken

// Refresh_Token_PIN
// Auth_Admin_Refresh_PinToken

// Before_Switch_ClientId
// Auth_Protected_Validate
// Auth_Client_Validate
// Auth_Protected_AdminPermissions
// User_Profile_Trading
// User_Profile
// User_PortfolioStock_Cash
// User_Profile_CollateralRatio
// User_Portfolio_Consolidated
// Marketws_WsWeb

// Switch_ClientId
// Auth_Protected_SwitchClientidIts

// After_Switch_ClientId
// Auth_Protected_Validate
// Auth_Client_Validate
// Auth_Protected_AdminPermissions
// User_Profile_Trading
// User_Profile
// User_PortfolioStock_Cash
// User_Profile_CollateralRatio
// User_Portfolio_Consolidated
// User_Portfolio_ForcedSell
// User_Portfolio_Stock
// Mutualfund_User_RiskProfile
// Marketws_WsWeb
// Order_Ws

// Stocks_Menu
// Order_Protected_OrderList
// Order_Protected_OrderList_V2
// Order_Protected_Tradelist
// Marketdata_Orderbook_BMRI
// Marketdata_OrderbookSimple_All
// Marketdata_PriceMovement

// Client_Profile_Menu
// User_Admin_SearchClients
// User_Admin_ClientProfile

// Client_Info_Menu
// User_Admin_ClientProfil

// Define custom metrics
const Login_Password = {
    Auth_AdminLogin: {
        errorCount: new Counter("error_count_001_01_01_Auth_AdminLogin"),
        errorRate: new Rate("error_rate_001_01_01_Auth_AdminLogin"),
        httpDuration: new Trend("duration_001_01_01_Auth_AdminLogin"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_AdminLogin"),
        requestRate: new Counter("rps_001_01_01_Auth_AdminLogin"),
        http_reqs: new Counter("sample_001_01_01_Auth_AdminLogin"),
    },
};
const Login_PIN = {
    Auth_Protected_AdminPinLogin: {
        errorCount: new Counter("error_count_001_02_01_Auth_Protected_AdminPinLogin"),
        errorRate: new Rate("error_rate_001_02_01_Auth_Protected_AdminPinLogin"),
        httpDuration: new Trend("duration_001_02_01_Auth_Protected_AdminPinLogin"),
        httpWaiting: new Trend("waiting_001_02_01_Auth_Protected_AdminPinLogin"),
        requestRate: new Counter("rps_001_02_01_Auth_Protected_AdminPinLogin"),
        http_reqs: new Counter("sample_001_02_01_Auth_Protected_AdminPinLogin"),
    },
};
const Refresh_Token_Pass = {
    Auth_Admin_Refresh_PassToken: {
        errorCount: new Counter("error_count_001_03_01_Auth_Admin_Refresh_PassToken"),
        errorRate: new Rate("error_rate_001_03_01_Auth_Admin_Refresh_PassToken"),
        httpDuration: new Trend("duration_001_03_01_Auth_Admin_Refresh_PassToken"),
        httpWaiting: new Trend("waiting_001_03_01_Auth_Admin_Refresh_PassToken"),
        requestRate: new Counter("rps_001_03_01_Auth_Admin_Refresh_PassToken"),
        http_reqs: new Counter("sample_001_03_01_Auth_Admin_Refresh_PassToken"),
    },
};
const Refresh_Token_PIN = {
    Auth_Admin_Refresh_PinToken: {
        errorCount: new Counter("error_count_001_04_01_Auth_Admin_Refresh_PinToken"),
        errorRate: new Rate("error_rate_001_04_01_Auth_Admin_Refresh_PinToken"),
        httpDuration: new Trend("duration_001_04_01_Auth_Admin_Refresh_PinToken"),
        httpWaiting: new Trend("waiting_001_04_01_Auth_Admin_Refresh_PinToken"),
        requestRate: new Counter("rps_001_04_01_Auth_Admin_Refresh_PinToken"),
        http_reqs: new Counter("sample_001_04_01_Auth_Admin_Refresh_PinToken"),
    },
};
const Before_Switch_ClientId = {
    Auth_Protected_Validate: {
        errorCount: new Counter("error_count_001_05_01_Auth_Protected_Validate"),
        errorRate: new Rate("error_rate_001_05_01_Auth_Protected_Validate"),
        httpDuration: new Trend("duration_001_05_01_Auth_Protected_Validate"),
        httpWaiting: new Trend("waiting_001_05_01_Auth_Protected_Validate"),
        requestRate: new Counter("rps_001_05_01_Auth_Protected_Validate"),
        http_reqs: new Counter("sample_001_05_01_Auth_Protected_Validate"),
    },
    Auth_Client_Validate: {
        errorCount: new Counter("error_count_001_05_02_Auth_Client_Validate"),
        errorRate: new Rate("error_rate_001_05_02_Auth_Client_Validate"),
        httpDuration: new Trend("duration_001_05_02_Auth_Client_Validate"),
        httpWaiting: new Trend("waiting_001_05_02_Auth_Client_Validate"),
        requestRate: new Counter("rps_001_05_02_Auth_Client_Validate"),
        http_reqs: new Counter("sample_001_05_02_Auth_Client_Validate"),
    },
    Auth_Protected_AdminPermissions: {
        errorCount: new Counter("error_count_001_05_03_Auth_Protected_AdminPermissions"),
        errorRate: new Rate("error_rate_001_05_03_Auth_Protected_AdminPermissions"),
        httpDuration: new Trend("duration_001_05_03_Auth_Protected_AdminPermissions"),
        httpWaiting: new Trend("waiting_001_05_03_Auth_Protected_AdminPermissions"),
        requestRate: new Counter("rps_001_05_03_Auth_Protected_AdminPermissions"),
        http_reqs: new Counter("sample_001_05_03_Auth_Protected_AdminPermissions"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_05_04_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_05_04_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_05_04_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_05_04_User_Profile_Trading"),
        requestRate: new Counter("rps_001_05_04_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_05_04_User_Profile_Trading"),
    },
    User_Profile: {
        errorCount: new Counter("error_count_001_05_05_User_Profile"),
        errorRate: new Rate("error_rate_001_05_05_User_Profile"),
        httpDuration: new Trend("duration_001_05_05_User_Profile"),
        httpWaiting: new Trend("waiting_001_05_05_User_Profile"),
        requestRate: new Counter("rps_001_05_05_User_Profile"),
        http_reqs: new Counter("sample_001_05_05_User_Profile"),
    },
    User_PortfolioStock_Cash: {
        errorCount: new Counter("error_count_001_05_06_User_PortfolioStock_Cash"),
        errorRate: new Rate("error_rate_001_05_06_User_PortfolioStock_Cash"),
        httpDuration: new Trend("duration_001_05_06_User_PortfolioStock_Cash"),
        httpWaiting: new Trend("waiting_001_05_06_User_PortfolioStock_Cash"),
        requestRate: new Counter("rps_001_05_06_User_PortfolioStock_Cash"),
        http_reqs: new Counter("sample_001_05_06_User_PortfolioStock_Cash"),
    },
    User_Profile_CollateralRatio: {
        errorCount: new Counter("error_count_001_05_07_User_Profile_CollateralRatio"),
        errorRate: new Rate("error_rate_001_05_07_User_Profile_CollateralRatio"),
        httpDuration: new Trend("duration_001_05_07_User_Profile_CollateralRatio"),
        httpWaiting: new Trend("waiting_001_05_07_User_Profile_CollateralRatio"),
        requestRate: new Counter("rps_001_05_07_User_Profile_CollateralRatio"),
        http_reqs: new Counter("sample_001_05_07_User_Profile_CollateralRatio"),
    },
    User_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_001_05_08_User_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_001_05_08_User_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_001_05_08_User_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_001_05_08_User_Portfolio_Consolidated"),
        requestRate: new Counter("rps_001_05_08_User_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_001_05_08_User_Portfolio_Consolidated"),
    },
};
const Switch_ClientId = {
    Auth_Protected_VerifiedDevice_List: {
        errorCount: new Counter("error_count_001_06_01_Auth_Protected_SwitchClientidIts"),
        errorRate: new Rate("error_rate_001_06_01_Auth_Protected_SwitchClientidIts"),
        httpDuration: new Trend("duration_001_06_01_Auth_Protected_SwitchClientidIts"),
        httpWaiting: new Trend("waiting_001_06_01_Auth_Protected_SwitchClientidIts"),
        requestRate: new Counter("rps_001_06_01_Auth_Protected_SwitchClientidIts"),
        http_reqs: new Counter("sample_001_06_01_Auth_Protected_SwitchClientidIts"),
    },
};
const After_Switch_ClientId = {
    Auth_Protected_Validate: {
        errorCount: new Counter("error_count_001_07_01_Auth_Protected_Validate"),
        errorRate: new Rate("error_rate_001_07_01_Auth_Protected_Validate"),
        httpDuration: new Trend("duration_001_07_01_Auth_Protected_Validate"),
        httpWaiting: new Trend("waiting_001_07_01_Auth_Protected_Validate"),
        requestRate: new Counter("rps_001_07_01_Auth_Protected_Validate"),
        http_reqs: new Counter("sample_001_07_01_Auth_Protected_Validate"),
    },
    Auth_Client_Validate: {
        errorCount: new Counter("error_count_001_07_02_Auth_Client_Validate"),
        errorRate: new Rate("error_rate_001_07_02_Auth_Client_Validate"),
        httpDuration: new Trend("duration_001_07_02_Auth_Client_Validate"),
        httpWaiting: new Trend("waiting_001_07_02_Auth_Client_Validate"),
        requestRate: new Counter("rps_001_07_02_Auth_Client_Validate"),
        http_reqs: new Counter("sample_001_07_02_Auth_Client_Validate"),
    },
    Auth_Protected_AdminPermissions: {
        errorCount: new Counter("error_count_001_07_03_Auth_Protected_AdminPermissions"),
        errorRate: new Rate("error_rate_001_07_03_Auth_Protected_AdminPermissions"),
        httpDuration: new Trend("duration_001_07_03_Auth_Protected_AdminPermissions"),
        httpWaiting: new Trend("waiting_001_07_03_Auth_Protected_AdminPermissions"),
        requestRate: new Counter("rps_001_07_03_Auth_Protected_AdminPermissions"),
        http_reqs: new Counter("sample_001_07_03_Auth_Protected_AdminPermissions"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_07_04_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_07_04_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_07_04_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_07_04_User_Profile_Trading"),
        requestRate: new Counter("rps_001_07_04_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_07_04_User_Profile_Trading"),
    },
    User_Profile: {
        errorCount: new Counter("error_count_001_07_05_User_Profile"),
        errorRate: new Rate("error_rate_001_07_05_User_Profile"),
        httpDuration: new Trend("duration_001_07_05_User_Profile"),
        httpWaiting: new Trend("waiting_001_07_05_User_Profile"),
        requestRate: new Counter("rps_001_07_05_User_Profile"),
        http_reqs: new Counter("sample_001_07_05_User_Profile"),
    },
    User_PortfolioStock_Cash: {
        errorCount: new Counter("error_count_001_07_06_User_PortfolioStock_Cash"),
        errorRate: new Rate("error_rate_001_07_06_User_PortfolioStock_Cash"),
        httpDuration: new Trend("duration_001_07_06_User_PortfolioStock_Cash"),
        httpWaiting: new Trend("waiting_001_07_06_User_PortfolioStock_Cash"),
        requestRate: new Counter("rps_001_07_06_User_PortfolioStock_Cash"),
        http_reqs: new Counter("sample_001_07_06_User_PortfolioStock_Cash"),
    },
    User_Profile_CollateralRatio: {
        errorCount: new Counter("error_count_001_07_07_User_Profile_CollateralRatio"),
        errorRate: new Rate("error_rate_001_07_07_User_Profile_CollateralRatio"),
        httpDuration: new Trend("duration_001_07_07_User_Profile_CollateralRatio"),
        httpWaiting: new Trend("waiting_001_07_07_User_Profile_CollateralRatio"),
        requestRate: new Counter("rps_001_07_07_User_Profile_CollateralRatio"),
        http_reqs: new Counter("sample_001_07_07_User_Profile_CollateralRatio"),
    },
    User_Portfolio_Consolidated: {
        errorCount: new Counter("error_count_001_07_08_User_Portfolio_Consolidated"),
        errorRate: new Rate("error_rate_001_07_08_User_Portfolio_Consolidated"),
        httpDuration: new Trend("duration_001_07_08_User_Portfolio_Consolidated"),
        httpWaiting: new Trend("waiting_001_07_08_User_Portfolio_Consolidated"),
        requestRate: new Counter("rps_001_07_08_User_Portfolio_Consolidated"),
        http_reqs: new Counter("sample_001_07_08_User_Portfolio_Consolidated"),
    },
    User_Portfolio_ForcedSell: {
        errorCount: new Counter("error_count_001_07_09_User_Portfolio_ForcedSell"),
        errorRate: new Rate("error_rate_001_07_09_User_Portfolio_ForcedSell"),
        httpDuration: new Trend("duration_001_07_09_User_Portfolio_ForcedSell"),
        httpWaiting: new Trend("waiting_001_07_09_User_Portfolio_ForcedSell"),
        requestRate: new Counter("rps_001_07_09_User_Portfolio_ForcedSell"),
        http_reqs: new Counter("sample_001_07_09_User_Portfolio_ForcedSell"),
    },
    User_Portfolio_Stock: {
        errorCount: new Counter("error_count_001_07_10_User_Portfolio_Stock"),
        errorRate: new Rate("error_rate_001_07_10_User_Portfolio_Stock"),
        httpDuration: new Trend("duration_001_07_10_User_Portfolio_Stock"),
        httpWaiting: new Trend("waiting_001_07_10_User_Portfolio_Stock"),
        requestRate: new Counter("rps_001_07_10_User_Portfolio_Stock"),
        http_reqs: new Counter("sample_001_07_10_User_Portfolio_Stock"),
    },
    Mutualfund_User_RiskProfile: {
        errorCount: new Counter("error_count_001_07_11_Mutualfund_User_RiskProfile"),
        errorRate: new Rate("error_rate_001_07_11_Mutualfund_User_RiskProfile"),
        httpDuration: new Trend("duration_001_07_11_Mutualfund_User_RiskProfile"),
        httpWaiting: new Trend("waiting_001_07_11_Mutualfund_User_RiskProfile"),
        requestRate: new Counter("rps_001_07_11_Mutualfund_User_RiskProfile"),
        http_reqs: new Counter("sample_001_07_11_Mutualfund_User_RiskProfile"),
    },
};
const Stocks_Menu = {
    Order_Protected_OrderList: {
        errorCount: new Counter("error_count_001_08_01_Order_Protected_OrderList"),
        errorRate: new Rate("error_rate_001_08_01_Order_Protected_OrderList"),
        httpDuration: new Trend("duration_001_08_01_Order_Protected_OrderList"),
        httpWaiting: new Trend("waiting_001_08_01_Order_Protected_OrderList"),
        requestRate: new Counter("rps_001_08_01_Order_Protected_OrderList"),
        http_reqs: new Counter("sample_001_08_01_Order_Protected_OrderList"),
    },
    Order_Protected_OrderList_V2: {
        errorCount: new Counter("error_count_001_08_02_Order_Protected_OrderList_V2"),
        errorRate: new Rate("error_rate_001_08_02_Order_Protected_OrderList_V2"),
        httpDuration: new Trend("duration_001_08_02_Order_Protected_OrderList_V2"),
        httpWaiting: new Trend("waiting_001_08_02_Order_Protected_OrderList_V2"),
        requestRate: new Counter("rps_001_08_02_Order_Protected_OrderList_V2"),
        http_reqs: new Counter("sample_001_08_02_Order_Protected_OrderList_V2"),
    },
    Order_Protected_Tradelist: {
        errorCount: new Counter("error_count_001_08_03_Order_Protected_Tradelist"),
        errorRate: new Rate("error_rate_001_08_03_Order_Protected_Tradelist"),
        httpDuration: new Trend("duration_001_08_03_Order_Protected_Tradelist"),
        httpWaiting: new Trend("waiting_001_08_03_Order_Protected_Tradelist"),
        requestRate: new Counter("rps_001_08_03_Order_Protected_Tradelist"),
        http_reqs: new Counter("sample_001_08_03_Order_Protected_Tradelist"),
    },
    Marketdata_Orderbook_BMRI: {
        errorCount: new Counter("error_count_001_08_04_Marketdata_Orderbook_BMRI"),
        errorRate: new Rate("error_rate_001_08_04_Marketdata_Orderbook_BMRI"),
        httpDuration: new Trend("duration_001_08_04_Marketdata_Orderbook_BMRI"),
        httpWaiting: new Trend("waiting_001_08_04_Marketdata_Orderbook_BMRI"),
        requestRate: new Counter("rps_001_08_04_Marketdata_Orderbook_BMRI"),
        http_reqs: new Counter("sample_001_08_04_Marketdata_Orderbook_BMRI"),
    },
    Marketdata_OrderbookSimple_All: {
        errorCount: new Counter("error_count_001_08_05_Marketdata_OrderbookSimple_All"),
        errorRate: new Rate("error_rate_001_08_05_Marketdata_OrderbookSimple_All"),
        httpDuration: new Trend("duration_001_08_05_Marketdata_OrderbookSimple_All"),
        httpWaiting: new Trend("waiting_001_08_05_Marketdata_OrderbookSimple_All"),
        requestRate: new Counter("rps_001_08_05_Marketdata_OrderbookSimple_All"),
        http_reqs: new Counter("sample_001_08_05_Marketdata_OrderbookSimple_All"),
    },
    Marketdata_PriceMovement: {
        errorCount: new Counter("error_count_001_08_06_Marketdata_PriceMovement"),
        errorRate: new Rate("error_rate_001_08_06_Marketdata_PriceMovement"),
        httpDuration: new Trend("duration_001_08_06_Marketdata_PriceMovement"),
        httpWaiting: new Trend("waiting_001_08_06_Marketdata_PriceMovement"),
        requestRate: new Counter("rps_001_08_06_Marketdata_PriceMovement"),
        http_reqs: new Counter("sample_001_08_06_Marketdata_PriceMovement"),
    },
};
const Client_Profile_Menu = {
    User_Admin_SearchClients: {
        errorCount: new Counter("error_count_001_09_01_User_Admin_SearchClients"),
        errorRate: new Rate("error_rate_001_09_01_User_Admin_SearchClients"),
        httpDuration: new Trend("duration_001_09_01_User_Admin_SearchClients"),
        httpWaiting: new Trend("waiting_001_09_01_User_Admin_SearchClients"),
        requestRate: new Counter("rps_001_09_01_User_Admin_SearchClients"),
        http_reqs: new Counter("sample_001_09_01_User_Admin_SearchClients"),
    },
    User_Admin_ClientProfile: {
        errorCount: new Counter("error_count_001_09_02_User_Admin_ClientProfile"),
        errorRate: new Rate("error_rate_001_09_02_User_Admin_ClientProfile"),
        httpDuration: new Trend("duration_001_09_02_User_Admin_ClientProfile"),
        httpWaiting: new Trend("waiting_001_09_02_User_Admin_ClientProfile"),
        requestRate: new Counter("rps_001_09_02_User_Admin_ClientProfile"),
        http_reqs: new Counter("sample_001_09_02_User_Admin_ClientProfile"),
    },
};
const Client_Info_Menu = {
    Auth_Protected_VerifiedDevice_List: {
        errorCount: new Counter("error_count_001_10_01_User_Admin_ClientProfil"),
        errorRate: new Rate("error_rate_001_10_01_User_Admin_ClientProfil"),
        httpDuration: new Trend("duration_001_10_01_User_Admin_ClientProfil"),
        httpWaiting: new Trend("waiting_001_10_01_User_Admin_ClientProfil"),
        requestRate: new Counter("rps_001_10_01_User_Admin_ClientProfil"),
        http_reqs: new Counter("sample_001_10_01_User_Admin_ClientProfil"),
    },
};

export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    // ✅ Get mapping from setup
    // const mapping = data.vuMapping[vuId];
    // if (!mapping) {
    //     console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
    //     return;
    // }
    
    const userKey = mapping.userKey;
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    // if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
    //     console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
    //     return;
    // }
    
    // const token = userTokenData.token;
    // const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3',
    };

    // Deklarasi token dan pinToken di luar block agar bisa diakses lintas batch
    let token = null;
    let pinToken = null;

    // ─── Batch 1 - Login_Password ──────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v2/admin-login`,
        ];

        const Auth_AdminLogin_Payload = JSON.stringify({
            identity: its_user,
            password: "M@nsek.123",
        });

        const requests = [
            ['POST', urls[0], Auth_AdminLogin_Payload, { headers: headersBeforeLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login_Password.Auth_AdminLogin
            ]

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time

            if (response.status === 200) {
                try {
                    const body = JSON.parse(response.body);
                    token = body?.data?.token ?? null; // assign ke outer variable
                } catch (e) {
                    console.error(`❌ VU${vuId} - Gagal parse login response: ${e}`);
                }
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.

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

    // ─── Batch 2 - Login_PIN ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/protected/admin-pin-login`,
        ];

        const Auth_Protected_AdminPinLogin_Payload = JSON.stringify({
            value: "123456"
        });

        const requests = [
            ['POST', urls[0], Auth_Protected_AdminPinLogin_Payload, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login_PIN.Auth_Protected_AdminPinLogin
            ]
            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time

            if (response.status === 200) {
                try {
                    const body = JSON.parse(response.body);
                    pinToken = body?.data?.pin_token ?? null; // assign ke outer variable
                } catch (e) {
                    console.error(`❌ VU${vuId} - Gagal parse pin login response: ${e}`);
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    const headersAfterPin = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
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

    // ─── Batch 3 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/admin/refresh/pass-token`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterPin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Refresh_Token_Pass.Auth_Admin_Refresh_PassToken
            ]

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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}