import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

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
        check(response, {
            [`ERROR ${url} || Status: ${response.status}`]: (r) => r.status === 200
        });
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`${email} ERROR ${url} || Status: ${response.status}`);
        }
    }
    
    sleep(0.25);
}