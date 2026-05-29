// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/OMO_Android/BP009.js
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

// ##READ ME
//BP009 - Upload Signature Bottom Sheet

// ✅ PERBAIKAN: Baca file di global scope (init stage)
const signatureFile = open('./signature.jpeg', 'b');

// Define custom metrics
const UploadSignatureBottomSheet = {
    Oaofinance_Margin_Upload_Signature: {
        errorCount: new Counter("error_count_009_01_01_Oaofinance_Margin_Upload_Signature"),
        errorRate: new Rate("error_rate_009_01_01_Oaofinance_Margin_Upload_Signature"),
        httpDuration: new Trend("duration_009_01_01_Oaofinance_Margin_Upload_Signature"),
        httpWaiting: new Trend("waiting_009_01_01_Oaofinance_Margin_Upload_Signature"),
        requestRate: new Counter("rps_009_01_01_Oaofinance_Margin_Upload_Signature"),
        http_reqs: new Counter("sample_009_01_01_Oaofinance_Margin_Upload_Signature"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dan user_uuid dari setup
export function BP009(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    // ✅ Get userKey dari VU mapping
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token || !userToken.user_uuid) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or user_uuid available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const user_uuid = userToken.user_uuid;

    // Upload signature using multipart/form-data
    const url = base_url + `/oaofinance/api/v1/margin/upload/signature`;

    const uploadHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    // Buat multipart form-data payload
    const formData = {
        file: http.file(signatureFile, 'signature.jpeg', 'image/jpeg'),
        user_uuid: user_uuid
    };

    // Single POST request
    const response = http.post(url, formData, { headers: uploadHeaders });

    // Process metrics
    const metric = UploadSignatureBottomSheet.Oaofinance_Margin_Upload_Signature;
    metric.httpDuration.add(response.timings.duration);
    metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    
    if (response.status === 200) {
        metric.errorRate.add(false);
        metric.errorCount.add(0);
        metric.requestRate.add(true);
        metric.http_reqs.add(1);
        if (`${__ENV.ENV}` != 'INT') {
            console.log(`${email} ${url} || Status: ${response.status}`);
        }
    } else {
        metric.errorRate.add(true);
        metric.errorCount.add(1);
        metric.requestRate.add(false);
        metric.http_reqs.add(1);
        // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
            [`ERROR ${url} || Status: ${response.status}`]: (r) => r.status === 200
        });
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`${email} ERROR ${url} || Status: ${response.status}`);
        }
    }
    
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}