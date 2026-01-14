import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics (unchanged)
const DeviceManagement = {
    Auth_Protected_VerifiedDevice_List: {
        errorCount: new Counter("error_count_003_01_01_Auth_Protected_VerifiedDevice_List"),
        errorRate: new Rate("error_rate_003_01_01_Auth_Protected_VerifiedDevice_List"),
        httpDuration: new Trend("duration_003_01_01_Auth_Protected_VerifiedDevice_List"),
        httpWaiting: new Trend("waiting_003_01_01_Auth_Protected_VerifiedDevice_List"),
        requestRate: new Counter("rps_003_01_01_Auth_Protected_VerifiedDevice_List"),
        http_reqs: new Counter("sample_003_01_01_Auth_Protected_VerifiedDevice_List"),
    },
    Auth_Protected_VerifiedDevice: {
        errorCount: new Counter("error_count_003_01_02_Auth_Protected_VerifiedDevice"),
        errorRate: new Rate("error_rate_003_01_02_Auth_Protected_VerifiedDevice"),
        httpDuration: new Trend("duration_003_01_02_Auth_Protected_VerifiedDevice"),
        httpWaiting: new Trend("waiting_003_01_02_Auth_Protected_VerifiedDevice"),
        requestRate: new Counter("rps_003_01_02_Auth_Protected_VerifiedDevice"),
        http_reqs: new Counter("sample_003_01_02_Auth_Protected_VerifiedDevice"),
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
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
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
    
    let deviceIdToDelete = null;

    // Batch 1 - Get device list
    const urls = [
        base_url + `/auth/api/v1/protected/verified-device/list`,
    ];

    const stepOneHeaders = {
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
        // 'X-Device-Id': 'TEST3',
        'X-Device-Id': deviceId,
    };

    const requests = [
        ['GET', urls[0], null, { headers: stepOneHeaders }],
    ];
    const responses = http.batch(requests);

    responses.forEach((response, index) => {
        const metrics = [
            DeviceManagement.Auth_Protected_VerifiedDevice_List,
        ];

        const metric = metrics[index];
        metric.httpDuration.add(response.timings.duration);
        
        if (response.status === 200) {
            try {
                const responseData = response.json();
                
                if (responseData?.data?.data && Array.isArray(responseData.data.data) && responseData.data.data.length > 0) {
                    const allDevices = responseData.data.data;
                    const allIds = allDevices.map(item => item.id);
                    
                    // deviceIdToDelete = allIds[1] || allIds[0]; // Fallback to first if only one device
                    deviceIdToDelete = allIds[1]; // Fallback to first if only one device
                }
            } catch (e) {
                console.error(`${email} ❌ Failed to parse device list: ${e.message}`);
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
                [`ERROR ${urls[index]} || Status: ${response.status}`]: (r) => r.status === 200
            });
            
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
            }
        }
    });
    sleep(0.25);

    // Batch 2 - Delete device (only if we have a device ID)
    if (deviceIdToDelete) {
        const deleteUrls = [
            base_url + `/auth/api/v1/protected/verified-device/${deviceIdToDelete}`,
        ];

        const stepTwoHeaders = {
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
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
        };

        const deleteRequests = [
            ['DELETE', deleteUrls[0], null, { headers: stepTwoHeaders }],
        ];
        const deleteResponses = http.batch(deleteRequests);

        deleteResponses.forEach((response, index) => {
            const metrics = [
                DeviceManagement.Auth_Protected_VerifiedDevice,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${deleteUrls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    [`ERROR ${deleteUrls[index]} || Status: ${response.status}`]: (r) => r.status === 200
                });
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${deleteUrls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }
    sleep(0.25);
}