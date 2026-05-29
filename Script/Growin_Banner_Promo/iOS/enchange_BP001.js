// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ============================================================
 *  BP001 — Home Screen Performance Test (Refactored)
 *  Script   : BP001_home_refactored.js
 *  Suite    : Growin by Mandiri — Performance Test
 *  Flow     : Home Screen Initial Load (iOS + Android)
 *  Env      : PT (Performance Test)
 *  Refactor : Maul / QA Mandiri Sekuritas
 * ============================================================
 *
 *  ENDPOINTS COVERED:
 *   01  GET  /user/api/v2/profile/trading
 *   02  GET  /user/api/v1/profile/personal
 *   03  GET  /auth/api/v1/protected/password-reminder
 *   04  POST /auth/api/v1/protected/password-remind-later
 *   05  GET  /user/api/v1/banner/promo
 *   06  GET  /user/api/protected/v1/portfolio/consolidated       [PIN]
 *   07  GET  /user/api/v2/watchlistgroup
 *   08  GET  /user/api/v1/watchlist/{id}                         [dynamic]
 *   09  GET  /news/api/v2/
 *   10  GET  /news/api/v2/categories
 *   11  GET  /news/api/v2/categories                             [2nd call]
 *   12  GET  /oaofinance/api/v1/quota/status/margin
 *   13  GET  /oaofinance/api/v1/user-opening-progress-summary/monitoring/margin
 *   14  GET  /auth/api/v1/protected/account-center/switchables
 *   15  GET  /mutualfund/api/v1/user/risk-profile
 *   16  GET  /auth/api/v1/protected/account-center/status        [iOS]
 *   17  GET  /bond/api/v1/sbn/master/strapi/banner
 *   18  GET  /mutualfund/api/v1/user/risk-profile                [2nd call, iOS]
 *   19  GET  /mutualfund/api/v1/mutual-fund/list?limit=3         [iOS]
 *   20  GET  /news/api/v2/?category=&is_sharia=0&items=5&page=1
 *   21  GET  /auth/api/v1/protected/get-config
 *   22  GET  /auth/api/v1/protected/client/selected
 *   23  POST /bond/api/v1/sbn/client/check/status                [iOS]
 *   24  GET  /mutualfund/api/v1/user/filter                      [iOS]
 *   25  GET  /user/api/v1/user_settings                          [iOS]
 *   26  GET  /order/api/v1/order-status-action-map               [iOS]
 */

import { check, sleep, group } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from "k6/execution";

// ============================================================
//  METRIC FACTORY — generate 6 metrics per endpoint
// ============================================================

/**
 * @param {string} code  — sortable prefix e.g. "001_01_01"
 * @param {string} name  — endpoint label  e.g. "User_Profile_Trading"
 */
function makeMetrics(code, name) {
    return {
        name,
        errorCount:  new Counter(`error_count_${code}_${name}`),
        errorRate:   new Rate(`error_rate_${code}_${name}`),
        httpDuration: new Trend(`duration_${code}_${name}`),
        httpWaiting:  new Trend(`waiting_${code}_${name}`),
        requestCount: new Counter(`rps_${code}_${name}`),    // renamed: rps_ stays, but add(1) always
        http_reqs:   new Counter(`sample_${code}_${name}`),
    };
}

// ============================================================
//  METRIC REGISTRY
// ============================================================

const Home = {
    User_Profile_Trading:                               makeMetrics("001_01_01", "User_Profile_Trading"),
    User_Profile_Personal:                              makeMetrics("001_01_02", "User_Profile_Personal"),
    Auth_Protected_PasswordReminder:                    makeMetrics("001_01_03", "Auth_Protected_PasswordReminder"),
    Auth_Protected_PasswordRemindLater:                 makeMetrics("001_01_04", "Auth_Protected_PasswordRemindLater"),
    User_Banner_Promo:                                  makeMetrics("001_01_05", "User_Banner_Promo"),
    Protected_Portfolio_Consolidated:                   makeMetrics("001_01_06", "Protected_Portfolio_Consolidated"),
    User_Watchlistgroup:                                makeMetrics("001_01_07", "User_Watchlistgroup"),
    User_WatchlistID:                                   makeMetrics("001_01_08", "User_WatchlistID"),
    News:                                               makeMetrics("001_01_09", "News"),
    News_Categories:                                    makeMetrics("001_01_10", "News_Categories"),
    News_Categories_2:                                  makeMetrics("001_01_11", "News_Categories_2"),
    Oaofinance_Quota_Status_Margin:                     makeMetrics("001_01_12", "Oaofinance_Quota_Status_Margin"),
    Oaofinance_UserOpeningProgressSummary_Monitoring:   makeMetrics("001_01_13", "Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
    Auth_Protected_AccountCenter_Switchables:           makeMetrics("001_01_14", "Auth_Protected_AccountCenter_Switchables"),
    Mutualfund_User_RiskProfile:                        makeMetrics("001_01_15", "Mutualfund_User_RiskProfile"),
    Auth_Protected_AccountCenter_Status:                makeMetrics("001_01_16", "Auth_Protected_AccountCenter_Status"),
    Bond_Sbn_Master_Strapi_Banner:                      makeMetrics("001_01_17", "Bond_Sbn_Master_Strapi_Banner"),
    Mutualfund_User_RiskProfile_2:                      makeMetrics("001_01_18", "Mutualfund_User_RiskProfile_2"),
    Mutualfund_MutualFund_List:                         makeMetrics("001_01_19", "Mutualfund_MutualFund_List"),
    News_Category:                                      makeMetrics("001_01_20", "News_Category"),
    Auth_Protected_GetConfig:                           makeMetrics("001_01_21", "Auth_Protected_GetConfig"),
    Auth_Protected_Client_Selected:                     makeMetrics("001_01_22", "Auth_Protected_Client_Selected"),
    Bond_Sbn_Client_Check_Status:                       makeMetrics("001_01_23", "Bond_Sbn_Client_Check_Status"),
    Mutualfund_User_Filter:                             makeMetrics("001_01_24", "Mutualfund_User_Filter"),
    User_UserSettings:                                  makeMetrics("001_01_25", "User_UserSettings"),
    Order_OrderStatusActionMap:                         makeMetrics("001_01_26", "Order_OrderStatusActionMap"),
};

// ============================================================
//  CORE REQUEST HELPER
//  Handles recording, check, and conditional logging in 1 place.
// ============================================================

/**
 * Execute a single HTTP request and record all 6 metrics.
 *
 * @param {object}  metric       — metric group from Home registry
 * @param {string}  method       — "GET" | "POST"
 * @param {string}  url          — full URL
 * @param {string|null} body     — JSON stringified body or null
 * @param {object}  reqHeaders   — full headers object
 * @param {string}  email        — for log context
 * @returns {Response}           — k6 response object (for chaining / data extraction)
 */
function doRequest(metric, method, url, body, reqHeaders, email) {
    const params = {
        headers: reqHeaders,
        tags: { endpoint: metric.name },          // ← enables threshold by endpoint tag
    };

    const res = method === "POST"
        ? http.post(url, body, params)
        : http.get(url, params);

    const ok = res.status === 200;

    // Record all metrics — always
    metric.httpDuration.add(res.timings.duration);
    metric.httpWaiting.add(res.timings.waiting);  // FIXED: was never added in original
    metric.http_reqs.add(1);
    metric.requestCount.add(1);                   // FIXED: always 1, not bool
    metric.errorRate.add(!ok);
    metric.errorCount.add(ok ? 0 : 1);

    // check() always runs — so k6's built-in `checks` metric reflects reality
    check(res, {
        [`${metric.name} -> 200`]: (r) => r.status === 200,
    });

    // Log only on error, regardless of ENV — reduces I/O during load
    // Success body log only in DEBUG mode
    const isDebug = `${__ENV.DEBUG}` === "true";
    const isInt   = `${__ENV.ENV}` === "INT";

    if (!ok && !isInt) {
        console.error(
            `[ERROR] ${email} | ${metric.name} | ${url} | HTTP ${res.status} | body: ${res.body} | req_body: ${body}`
        );
    } else if (ok && isDebug) {
        console.log(
            `[OK] ${email} | ${metric.name} | ${url} | HTTP ${res.status} | ${res.timings.duration.toFixed(0)}ms`
        );
    }

    return res;
}

// ============================================================
//  HEADER BUILDER
// ============================================================

/**
 * Build base headers. Unique device ID per VU prevents anti-bot/cache collision.
 *
 * @param {string} token      — ACCESS_TOKEN cookie value
 * @param {string|null} pin   — PIN_ACCESS_TOKEN (null = omit)
 * @param {number} vuId       — VU ID for device ID uniqueness
 */
function buildHeaders(token, pin, vuId) {
    const cookieParts = [`ACCESS_TOKEN=${token}`];
    if (pin) cookieParts.push(`PIN_ACCESS_TOKEN=${pin}`);

    return {
        "Cookie":           cookieParts.join("; "),
        "Content-Type":     "application/json",
        "Accept":           "*/*",
        "Accept-Language":  "en",
        "Connection":       "keep-alive",
        "Accept-Encoding":  "gzip, deflate, br",
        "User-Agent":       "Growin/1.4.1 (iPhone; iOS 17.5) Alamofire/5.9.1",
        "X-App-Name":       "ios",                        // FIXED: was "web", should match iOS UA
        "X-App-Version":    "1.4.1",
        "X-Device-Info":    "iPhone 11",
        "X-Device-Id":      `PT-VU-${vuId}`,              // FIXED: unique per VU
    };
}

// ============================================================
//  EXPORTED FUNCTION — main test body
// ============================================================

export function BP001(data) {
    const vuId     = exec.vu.idInTest;
    const base_url = data.base_url;

    // --- Guard: VU mapping
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`[SKIP] VU${vuId} — no mapping found`);
        return;
    }

    const { userKey, bp } = mapping;
    const userToken = data.tokens[userKey];

    // --- Guard: token
    if (!userToken?.token) {
        console.error(`[SKIP] VU${vuId} (${userKey}) — no valid token`);
        return;
    }

    const token     = userToken.token;
    const pin_token = userToken.pin_token;   // may be undefined — handled in buildHeaders
    const email     = userToken.email;

    // Pre-build header variants (avoid re-building per batch)
    const hBase = buildHeaders(token, null,      vuId);
    const hPin  = buildHeaders(token, pin_token, vuId);

    // -------------------------------------------------------
    //  GROUP 1 — Profile (parallel batch — 2 requests)
    // -------------------------------------------------------
    group("01_Profile_Initial_Load", () => {
        const batchReqs = [
            ["GET", `${base_url}/user/api/v2/profile/trading`,    null, { headers: hBase, tags: { endpoint: Home.User_Profile_Trading.name  } }],
            ["GET", `${base_url}/user/api/v1/profile/personal`,   null, { headers: hBase, tags: { endpoint: Home.User_Profile_Personal.name } }],
        ];
        const batchRes = http.batch(batchReqs);

        const batchMap = [
            { metric: Home.User_Profile_Trading,  url: batchReqs[0][1] },
            { metric: Home.User_Profile_Personal, url: batchReqs[1][1] },
        ];

        batchMap.forEach(({ metric, url }, i) => {
            const res = batchRes[i];
            const ok  = res.status === 200;

            metric.httpDuration.add(res.timings.duration);
            metric.httpWaiting.add(res.timings.waiting);
            metric.http_reqs.add(1);
            metric.requestCount.add(1);
            metric.errorRate.add(!ok);
            metric.errorCount.add(ok ? 0 : 1);

            check(res, { [`${metric.name} -> 200`]: (r) => r.status === 200 });

            if (!ok && `${__ENV.ENV}` !== "INT") {
                console.error(`[ERROR] ${email} | ${metric.name} | ${url} | HTTP ${res.status}`);
            }
        });
    });

    // -------------------------------------------------------
    //  GROUP 2 — Auth / Password Reminder
    // -------------------------------------------------------
    group("02_Auth_Password", () => {
        doRequest(
            Home.Auth_Protected_PasswordReminder,
            "GET",
            `${base_url}/auth/api/v1/protected/password-reminder`,
            null,
            hBase,
            email
        );

        doRequest(
            Home.Auth_Protected_PasswordRemindLater,
            "POST",
            `${base_url}/auth/api/v1/protected/password-remind-later`,
            JSON.stringify({ current_phase: 1 }),
            hBase,
            email
        );
    });

    // -------------------------------------------------------
    //  GROUP 3 — Banner + Portfolio
    // -------------------------------------------------------
    group("03_Banner_Portfolio", () => {
        doRequest(
            Home.User_Banner_Promo,
            "GET",
            `${base_url}/user/api/v1/banner/promo`,
            null,
            hBase,
            email
        );

        // Portfolio requires PIN token
        doRequest(
            Home.Protected_Portfolio_Consolidated,
            "GET",
            `${base_url}/user/api/protected/v1/portfolio/consolidated`,
            null,
            hPin,    // ← PIN header
            email
        );
    });

    // -------------------------------------------------------
    //  GROUP 4 — Watchlist (dynamic ID extraction)
    // -------------------------------------------------------
    group("04_Watchlist", () => {
        let watchlistGroupID = null;

        const watchlistGroupRes = doRequest(
            Home.User_Watchlistgroup,
            "GET",
            `${base_url}/user/api/v2/watchlistgroup`,
            null,
            hBase,
            email
        );

        // Extract watchlistGroupID safely — guard before Batch 7
        if (watchlistGroupRes.status === 200) {
            try {
                const parsed = JSON.parse(watchlistGroupRes.body);
                watchlistGroupID = parsed?.data?.[0]?.id ? d : null;

                if (!watchlistGroupID && `${__ENV.ENV}` !== "INT") {
                    console.warn(`[WARN] ${email} | User_Watchlistgroup | data empty or missing id`);
                }
            } catch (e) {
                console.error(`[ERROR] ${email} | User_Watchlistgroup | JSON parse failed: ${e.message}`);
            }
        }

        // FIXED: guard — skip if ID not available
        if (watchlistGroupID) {
            doRequest(
                Home.User_WatchlistID,
                "GET",
                `${base_url}/user/api/v1/watchlist/${watchlistGroupID}`,
                null,
                hBase,
                email
            );
        } else {
            console.warn(`[SKIP] ${email} | User_WatchlistID — watchlistGroupID unavailable`);
            // Record skip as error so metric reflects reality
            Home.User_WatchlistID.errorCount.add(1);
            Home.User_WatchlistID.errorRate.add(true);
            Home.User_WatchlistID.http_reqs.add(0);
        }
    });

    // -------------------------------------------------------
    //  GROUP 5 — News
    // -------------------------------------------------------
    group("05_News", () => {
        doRequest(Home.News,             "GET", `${base_url}/news/api/v2/`,           null, hBase, email);
        doRequest(Home.News_Categories,  "GET", `${base_url}/news/api/v2/categories`, null, hBase, email);
        // NOTE: 2nd call intentional — mirrors duplicate iOS client call observed in app
        doRequest(Home.News_Categories_2,"GET", `${base_url}/news/api/v2/categories`, null, hBase, email);
        doRequest(Home.News_Category,    "GET", `${base_url}/news/api/v2/?category=&is_sharia=0&items=5&page=1`, null, hBase, email);
    });

    // -------------------------------------------------------
    //  GROUP 6 — Finance / Margin
    // -------------------------------------------------------
    group("06_OAO_Finance", () => {
        doRequest(Home.Oaofinance_Quota_Status_Margin,                   "GET", `${base_url}/oaofinance/api/v1/quota/status/margin`,                                       null, hBase, email);
        doRequest(Home.Oaofinance_UserOpeningProgressSummary_Monitoring, "GET", `${base_url}/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,           null, hBase, email);
    });

    // -------------------------------------------------------
    //  GROUP 7 — Auth / Account Center + Config
    // -------------------------------------------------------
    group("07_Auth_AccountCenter", () => {
        doRequest(Home.Auth_Protected_AccountCenter_Switchables, "GET", `${base_url}/auth/api/v1/protected/account-center/switchables`, null, hBase, email);
        doRequest(Home.Auth_Protected_AccountCenter_Status,      "GET", `${base_url}/auth/api/v1/protected/account-center/status`,      null, hBase, email);
        doRequest(Home.Auth_Protected_GetConfig,                 "GET", `${base_url}/auth/api/v1/protected/get-config`,                 null, hBase, email);
        doRequest(Home.Auth_Protected_Client_Selected,           "GET", `${base_url}/auth/api/v1/protected/client/selected`,            null, hBase, email);
    });

    // -------------------------------------------------------
    //  GROUP 8 — Mutual Fund
    // -------------------------------------------------------
    group("08_MutualFund", () => {
        doRequest(Home.Mutualfund_User_RiskProfile,   "GET", `${base_url}/mutualfund/api/v1/user/risk-profile`,       null, hBase, email);
        // 2nd call — iOS fires this twice (different screen state)
        doRequest(Home.Mutualfund_User_RiskProfile_2, "GET", `${base_url}/mutualfund/api/v1/user/risk-profile`,       null, hBase, email);
        doRequest(Home.Mutualfund_MutualFund_List,    "GET", `${base_url}/mutualfund/api/v1/mutual-fund/list?limit=3`,null, hBase, email);
        doRequest(Home.Mutualfund_User_Filter,        "GET", `${base_url}/mutualfund/api/v1/user/filter`,             null, hBase, email);
    });

    // -------------------------------------------------------
    //  GROUP 9 — Bond / SBN
    // -------------------------------------------------------
    group("09_Bond_SBN", () => {
        doRequest(Home.Bond_Sbn_Master_Strapi_Banner, "GET",  `${base_url}/bond/api/v1/sbn/master/strapi/banner`, null, hBase, email);
        // POST with null body — confirm API contract; some endpoints accept empty POST
        doRequest(Home.Bond_Sbn_Client_Check_Status,  "POST", `${base_url}/bond/api/v1/sbn/client/check/status`,  null, hBase, email);
    });

    // -------------------------------------------------------
    //  GROUP 10 — iOS-specific: Settings + Order Map
    // -------------------------------------------------------
    group("10_iOS_Specific", () => {
        doRequest(Home.User_UserSettings,        "GET", `${base_url}/user/api/v1/user_settings`,           null, hBase, email);
        doRequest(Home.Order_OrderStatusActionMap,"GET", `${base_url}/order/api/v1/order-status-action-map`,null, hBase, email);
    });

    // -------------------------------------------------------
    //  Think time — randomized for realistic user pacing
    // -------------------------------------------------------
    sleep(0.1 + Math.random() * 0.4);   // 100ms – 500ms  (was fixed 250ms)
}