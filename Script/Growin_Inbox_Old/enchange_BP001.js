// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Inbox_Old/BP001.js
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
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// ##READ ME
//BP001 - Inbox
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/Growin_Inbox/BP001/Manual/Manual_DryRun_2021_1942_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=15m -e NUMSTART=0 --out dashboard=export=../../Report/Growin_Inbox/BP001/Manual/Manual_DryRun_2021_1943_BP001_Local.html
//RUN STRESS TEST: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/Growin_Inbox/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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

// /inbox/api/v1
// /inbox/api/v1

// Define custom metrics
const Inbox = {
    Inbox_Post: {
        errorCount: new Counter("error_count_001_01_01_Inbox_Post"),
        errorRate: new Rate("error_rate_001_01_01_Inbox_Post"),
        httpDuration: new Trend("duration_001_01_01_Inbox_Post"),
        httpWaiting: new Trend("waiting_001_01_01_Inbox_Post"),
        requestRate: new Counter("rps_001_01_01_Inbox_Post"),
        http_reqs: new Counter("sample_001_01_01_Inbox_Post"),
    },
    Inbox_Get: {
        errorCount: new Counter("error_count_001_01_02_Inbox_Get"),
        errorRate: new Rate("error_rate_001_01_02_Inbox_Get"),
        httpDuration: new Trend("duration_001_01_02_Inbox_Get"),
        httpWaiting: new Trend("waiting_001_01_02_Inbox_Get"),
        requestRate: new Counter("rps_001_01_02_Inbox_Get"),
        http_reqs: new Counter("sample_001_01_02_Inbox_Get"),
    },
};

// Main test function
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
        'Content-Type':'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*',
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
    } else {
        // // ENHANCE: Truncate response body under load before enabling this log in production.
console.error(`${email} Failed to Login || Status: ${res.status} | Body: ${res.body}`);
    }
    sleep(0,25);
    
    // If login and PIN login succeed, perform batch requests
    if (token) {
        const urls = [
            base_url + `/inbox/api/v1`,
            base_url + `/inbox/api/v1`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                'Accept-Language':'en',
                'Host':base_host,
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Content-Type':'application/json',
                'Accept':'*/*',
            }
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
            ['POST', urls[0], Inbox_Post_Payload, batchHeaders],
            ['GET', urls[1], undefined, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Inbox.Inbox_Post,
                Inbox.Inbox_Get,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                // console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200 || r.status === 201
                });
                // console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
            [`../../Report/Growin_Inbox/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_Inbox/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}