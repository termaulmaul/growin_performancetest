import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP003 - Collateral Information Bottom Sheet

// Define custom metrics
const CollateralInformationBottomSheet = {
    Oaofinance_Margin_CollateralAssetInformation: {
        errorCount: new Counter("error_count_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
        errorRate: new Rate("error_rate_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
        httpDuration: new Trend("duration_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
        httpWaiting: new Trend("waiting_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
        requestRate: new Counter("rps_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
        http_reqs: new Counter("sample_003_01_01_Oaofinance_Margin_CollateralAssetInformation"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dari setup
export function BP003(data) {
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
    
    if (!userToken || !userToken.token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;

    // Batch 1
    const urls = [
        base_url + `/oaofinance/api/v1/margin/collateral-asset-information`,
    ];

    const stepOneHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const requests = [
        ['GET', urls[0], undefined, {headers:stepOneHeaders}],
    ];
    const responses = http.batch(requests);

    responses.forEach((response, index) => {
        const metric = CollateralInformationBottomSheet.Oaofinance_Margin_CollateralAssetInformation;
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${urls[index]} || Status: ${response.status}`);
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
                console.error(`${email} ERROR ${urls[index]} || Status: ${response.status}`);
            }
        }
    });
    
    sleep(0.25);
}