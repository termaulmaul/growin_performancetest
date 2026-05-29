// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Wabadima/BP001.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from "k6/metrics";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// K6_HTTP_TIMEOUT=600s ../../k6 run BP001.js

// Define options for test execution
// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'constant-vus',
//             vus: `${__ENV.USER}`,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '30s',
//         },
//     },
//     noConnectionReuse: false,
//     setupTimeout: '120m',
//     teardownTimeout: '120m',
//     summaryTimeUnit: '120m',
// };
export const options = {
  scenarios: {
    contacts: {
      executor: 'per-vu-iterations',
      vus: 3,
      iterations: 1,
      maxDuration: '1h',
    },
  },
  noConnectionReuse: false,
  // httpDebug: 'full',
};

// Define custom metrics
const WhatsappIntegration = {
    Webhook: {
        errorCount: new Counter("error_count_001_01_01_Webhook"),
        errorRate: new Rate("error_rate_001_01_01_Webhook"),
        httpDuration: new Trend("duration_001_01_01_Webhook"),
        httpWaiting: new Trend("waiting_001_01_01_Webhook"),
        requestRate: new Counter("rps_001_01_01_Webhook"),
        http_reqs: new Counter("sample_001_01_01_Webhook"),
    },
};

export default function (data) {
    const url = `https://whatsapp-integration-dev.growin.id/webhook`;

    const test = JSON.stringify({
        contacts: [{
            profile: { name: "Izaz Rakha Anggara" },
            wa_id: "6281227170922"
        }],
        messages: [{
            from: "6281227170922",
            id: "HBgNNjI4NTI1NjM4MzQ3OBUCABIYIDA5NzlENjMxNTJEQjg5N0UzMEFGODVCMzA4MzMzMEEwAA==",
            text: { body: "Apa itu Growin?" },
            timestamp: "1763973452",
            type: "text"
        }]
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
        },
        timeout: '3600',
    };

    // Log start time
    const startTime = new Date();
    console.log(`⏰ Request started at: ${startTime.toISOString()}`);

    const response = http.post(url, test, params);

    // Log end time
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`⏰ Request ended at: ${endTime.toISOString()}`);
    console.log(`⏱️ Total duration: ${duration}s`);
    // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`📊 Status: ${response.status} - ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    // console.log(`📝 Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;

    // Check metrics
    const metric = WhatsappIntegration.Webhook;
    metric.httpDuration.add(response.timings.duration);
    metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    
    if (response.status === 200) {
        metric.errorRate.add(false);
        metric.errorCount.add(0);
        metric.requestRate.add(true);
        metric.http_reqs.add(1);
        console.log(`✅ Success: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    } else {
        metric.errorRate.add(true);
        metric.errorCount.add(1);
        metric.requestRate.add(false);
        metric.http_reqs.add(1);
        // console.error(`❌ Error: Status ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    }

    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}

// ✅ OPTIMIZED handleSummary
export function handleSummary(data) {
    try {
        // ✅ Handle missing metrics
        if (!data.metrics.data_received) {
            data.metrics.data_received = { values: { count: 0, rate: 0 } };
        }
        if (!data.metrics.data_sent) {
            data.metrics.data_sent = { values: { count: 0, rate: 0 } };
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        
        console.log(`[${dateStr}_${timeStr}] Starting report generation...`);
        
        
        const htmlPath = `Wabadima_${dateStr}_${timeStr}.html`;
        console.log(`Generating HTML: ${htmlPath}`);
        
        return {
            [htmlPath]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        }
        
    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        
        // ✅ Fallback: text only
        return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}