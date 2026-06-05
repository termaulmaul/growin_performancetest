// ============================================================
// Helper/config.js
// Shared configuration for all k6 performance test scripts
// ============================================================

/**
 * Returns the base URL.
 *
 * Resolution priority:
 *   1. BASE_URL env var (set by pt-menu.sh from configs/pt.env per target)
 *   2. ENV=ONPREM | ONCLOUD | SANDBOX  (target aliases)
 *   3. ENV=DEV | QA | DRC | INT        (legacy environment mapping)
 *   4. Fallback to placeholder
 *
 * Usage: import { getBaseUrl } from '../../Helper/config.js';
 */
export function getBaseUrl() {
    // 1. Highest priority: BASE_URL passed via -e BASE_URL=... (from pt-menu.sh)
    if (__ENV.BASE_URL && __ENV.BASE_URL.length > 0) {
        return __ENV.BASE_URL;
    }

    const env = `${__ENV.ENV}`;
    const urlMap = {
        // Target aliases (pt-menu.sh selection)
        ONPREM:  __ENV.ONPREM_BASE_URL  || 'https://int-api.onprem.growin.com',
        ONCLOUD: __ENV.ONCLOUD_BASE_URL || 'https://int-api-oncloud.growin.com',
        SANDBOX: 'http://localhost:18080',
        // Legacy environment mapping (backward compat)
        DEV:  'https://api-dev.growin.id',
        QA:   'https://api-qa.growin.id',
        DRC:  'https://drc-api.growin.id',
        INT:  'https://internal-api-pt.growin.id',
    };

    if (!urlMap[env]) {
        console.warn(`⚠️  ENV="${env}" not recognized and no BASE_URL provided. Falling back to INT.`);
    }

    return urlMap[env] || urlMap.INT;
}

/**
 * Returns email and password credentials for a given user number.
 * @param {number} userNum     - Local user index (1-based within current BP)
 * @param {number} bpOffset    - Global user offset across BPs
 */
export function getUserCredentials(userNum, bpOffset = 0) {
    const env       = `${__ENV.ENV}`;
    const startNum  = parseInt(`${__ENV.NUMSTART}`) || 0;
    const actualNum = userNum + bpOffset;

    let email = '';

    if (env === 'DEV' || env === 'QA') {
        const formatted = String(startNum + actualNum - 1).padStart(3, '0');
        email = `mostng${formatted}@guysmail.com`;
    } else if (env === 'DRC') {
        const formatted = String(startNum + actualNum - 1); // padStart(0) = no padding
        email = `MOSTNG${formatted}@guysmail.com`;
    } else if (env === 'INT' || env === 'SANDBOX') {
        const formatted = String(startNum + actualNum - 1).padStart(2, '0');
        email = `TESTMON${formatted}@guysmail.com`;
    } else {
        console.error(`❌ getUserCredentials: ENV="${env}" is not handled. Email will be empty.`);
    }

    // Password from env var — never hardcode credentials in source
    const password = __ENV.TEST_PASSWORD || '';
    if (!password) {
        console.error(`❌ getUserCredentials: TEST_PASSWORD env var not set. Pass via -e TEST_PASSWORD=... or set in pt.env`);
    }
    return { email: email, password: password };
}

/**
 * Default HTTP headers used across all test scripts.
 * Pass an optional ACCESS_TOKEN to get headers with Cookie pre-filled.
 * @param {string|null} accessToken
 */
export function getDefaultHeaders(accessToken = null) {
    const headers = {
        'Content-Type':    'application/json',
        'Accept':          '*/*',
        'Accept-Language': 'en',
        'Connection':      'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent':      'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name':      'web',
        'X-App-Version':   '1.4.1',
        'X-Device-Info':   'iPhone 11',
        'X-Device-Id':     'TEST3',
    };

    if (accessToken) {
        headers['Cookie'] = `ACCESS_TOKEN=${accessToken};`;
    }

    return headers;
}

/**
 * Retry and batch config constants.
 * Import these wherever consistent retry behavior is needed.
 */
export const MAX_RETRY_ATTEMPTS = 10;
export const RETRY_DELAY        = 1;   // seconds between retry attempts
export const BATCH_SIZE         = 500; // users per batch in setup()
export const BATCH_DELAY        = 2;   // seconds between batches