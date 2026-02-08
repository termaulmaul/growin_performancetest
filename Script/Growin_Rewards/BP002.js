import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics
const Homescreen = {
    Gamification_Tier: {
        errorCount: new Counter("error_count_002_01_01_Gamification_Tier"),
        errorRate: new Rate("error_rate_002_01_01_Gamification_Tier"),
        httpDuration: new Trend("duration_002_01_01_Gamification_Tier"),
        httpWaiting: new Trend("waiting_002_01_01_Gamification_Tier"),
        requestRate: new Counter("rps_002_01_01_Gamification_Tier"),
        http_reqs: new Counter("sample_002_01_01_Gamification_Tier"),
    },
    Gamification_Reward_User_TierID: {
        errorCount: new Counter("error_count_002_01_02_Gamification_Reward_User_TierID"),
        errorRate: new Rate("error_rate_002_01_02_Gamification_Reward_User_TierID"),
        httpDuration: new Trend("duration_002_01_02_Gamification_Reward_User_TierID"),
        httpWaiting: new Trend("waiting_002_01_02_Gamification_Reward_User_TierID"),
        requestRate: new Counter("rps_002_01_02_Gamification_Reward_User_TierID"),
        http_reqs: new Counter("sample_002_01_02_Gamification_Reward_User_TierID"),
    },
    Gamification_Reward_Redeemed_TierID: {
        errorCount: new Counter("error_count_002_01_03_Gamification_Reward_Redeemed_TierID"),
        errorRate: new Rate("error_rate_002_01_03_Gamification_Reward_Redeemed_TierID"),
        httpDuration: new Trend("duration_002_01_03_Gamification_Reward_Redeemed_TierID"),
        httpWaiting: new Trend("waiting_002_01_03_Gamification_Reward_Redeemed_TierID"),
        requestRate: new Counter("rps_002_01_03_Gamification_Reward_Redeemed_TierID"),
        http_reqs: new Counter("sample_002_01_03_Gamification_Reward_Redeemed_TierID"),
    },
    Gamification_Reward_Redeem: {
        errorCount: new Counter("error_count_002_01_04_Gamification_Reward_Redeem"),
        errorRate: new Rate("error_rate_002_01_04_Gamification_Reward_Redeem"),
        httpDuration: new Trend("duration_002_01_04_Gamification_Reward_Redeem"),
        httpWaiting: new Trend("waiting_002_01_04_Gamification_Reward_Redeem"),
        requestRate: new Counter("rps_002_01_04_Gamification_Reward_Redeem"),
        http_reqs: new Counter("sample_002_01_04_Gamification_Reward_Redeem"),
    },
};

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
export function BP002(data) {
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
    let tierID;
    if (token) {
        const urls = [
            base_url + `/gamification/api/tier/`,
        ];

        const stepOneHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homescreen.Gamification_Tier,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                tierID = response.json().data[0].id
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Request Body: ${requestBody}`);
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // Batch 2
    let rewardID;
    // console.log(`tierID: ${tierID}`)
    if (token) {
        const urls = [
            base_url + `/gamification/api/v2/reward/user?tier_id=${tierID}`,
            // base_url + `/gamification/api/v2/reward/user?tier_id=44`,
            base_url + `/gamification/api/v2/reward/redeemed?tier_id=${tierID}`,
        ];

        const stepTwoHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepTwoHeaders }],
            ['GET', urls[1], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homescreen.Gamification_Reward_User_TierID,
                Homescreen.Gamification_Reward_Redeemed_TierID,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (index === 0) {
                    try {
                        const rewardData = response.json();
                        if (rewardData && rewardData.data && rewardData.data.length > 0) {
                            // ✅ CORRECTED: id is a string, not an array
                            // rewardID = rewardData.data[0].id;
                            const iteration = exec.scenario.iterationInInstance;
                            const index = iteration % rewardData.data.length;
                            rewardID = rewardData.data[index].id;
                            
                            if (`${__ENV.ENV}` != 'INT') {
                                console.log(`Got reward ID: ${id}`);
                            }
                        } else {
                            console.error(`No reward data available`);
                        }
                    } catch (e) {
                        console.error(`Failed to parse reward data: ${e.message}`);
                    }
                }
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Request Body: ${requestBody}`);
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // console.log(`rewardID: ${rewardID}`)
    // Batch 3
    if (token) {
        const urls = [
            base_url + `/gamification/api/v2/reward/redeem`,
        ];

        const stepThreeHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const rewardRedeemPayload = JSON.stringify({
            rewardid: `${rewardID}`,
            // rewardid: `105`,
        });

        const requests = [
            ['POST', urls[0], rewardRedeemPayload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Homescreen.Gamification_Reward_Redeem,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Request Body: ${requestBody}`);
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.25);
}