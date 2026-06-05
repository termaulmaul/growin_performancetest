import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from "k6/metrics";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

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
    console.log(`📊 Status: ${response.status} - ${response.body}`);
    // console.log(`📝 Body: ${response.body}`);

    // Check metrics
    const metric = WhatsappIntegration.Webhook;
    metric.httpDuration.add(response.timings.duration);
    
    if (response.status === 200) {
        metric.errorRate.add(false);
        metric.errorCount.add(0);
        metric.requestRate.add(true);
        metric.http_reqs.add(1);
        console.log(`✅ Success: ${response.body}`);
    } else {
        metric.errorRate.add(true);
        metric.errorCount.add(1);
        metric.requestRate.add(false);
        metric.http_reqs.add(1);
        // console.error(`❌ Error: Status ${response.status} || Body: ${response.body}`);
    }

    sleep(0.25);
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