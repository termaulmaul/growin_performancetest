import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/channel/get-list
// /socialinvesting/api/v1/channel/get-profile?channel_id={channel_id}
// /socialinvesting/api/v1/community-profile/get-profile
// /socialinvesting/api/v1/channel/joined-by-user
// /socialinvesting/api/v1/social/switch

// Socialinvesting_Channel_GetList
// Socialinvesting_Channel_GetProfile
// Socialinvesting_CommunityProfile_GetProfile
// Socialinvesting_Channel_JoinedByUser
// Socialinvesting_Social_Switch

// Define custom metrics
const CommunityDetailUserTrialSwitch = {
    Socialinvesting_Channel_GetList: {
        errorCount: new Counter("error_count_005_01_01_Socialinvesting_Channel_GetList"),
        errorRate: new Rate("error_rate_005_01_01_Socialinvesting_Channel_GetList"),
        httpDuration: new Trend("duration_005_01_01_Socialinvesting_Channel_GetList"),
        httpWaiting: new Trend("waiting_005_01_01_Socialinvesting_Channel_GetList"),
        requestRate: new Counter("rps_005_01_01_Socialinvesting_Channel_GetList"),
        http_reqs: new Counter("sample_005_01_01_Socialinvesting_Channel_GetList"),
    },
    Socialinvesting_Channel_GetProfile: {
        errorCount: new Counter("error_count_005_01_02_Socialinvesting_Channel_GetProfile"),
        errorRate: new Rate("error_rate_005_01_02_Socialinvesting_Channel_GetProfile"),
        httpDuration: new Trend("duration_005_01_02_Socialinvesting_Channel_GetProfile"),
        httpWaiting: new Trend("waiting_005_01_02_Socialinvesting_Channel_GetProfile"),
        requestRate: new Counter("rps_005_01_02_Socialinvesting_Channel_GetProfile"),
        http_reqs: new Counter("sample_005_01_02_Socialinvesting_Channel_GetProfile"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_005_01_03_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_005_01_04_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_005_01_04_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_005_01_04_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_005_01_04_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_005_01_04_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_005_01_04_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_Social_Switch: {
        errorCount: new Counter("error_count_005_01_05_Socialinvesting_Social_Switch"),
        errorRate: new Rate("error_rate_005_01_05_Socialinvesting_Social_Switch"),
        httpDuration: new Trend("duration_005_01_05_Socialinvesting_Social_Switch"),
        httpWaiting: new Trend("waiting_005_01_05_Socialinvesting_Social_Switch"),
        requestRate: new Counter("rps_005_01_05_Socialinvesting_Social_Switch"),
        http_reqs: new Counter("sample_005_01_05_Socialinvesting_Social_Switch"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP005(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;
    const isIntEnv = `${__ENV.ENV}` === 'INT';

    const channel_id = getChannelId(base_url, token, bp, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    let switchChannelIDGetList;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-list`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_GetList,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                // Parse response dan ambil channel_id yang berbeda
                try {
                    const responseData = JSON.parse(response.body);
                    
                    if (responseData.data && Array.isArray(responseData.data)) {
                        // Filter channel yang channel_id-nya TIDAK sama dengan channel_id yang sudah dimiliki
                        const differentChannels = responseData.data.filter(
                            channel => channel.channel_id !== channel_id // channel_id adalah variable yang lu punya sebelumnya
                        );
                        
                        // Ambil channel_id yang pertama dari hasil filter
                        if (differentChannels.length > 0) {
                            switchChannelIDGetList = differentChannels[0].channel_id;
                            // console.log(`[BATCH 1] switchChannelID SET TO: ${switchChannelID}`);
                            // console.log(`[BATCH 1] Type: ${typeof switchChannelID}`);
                        } 
                        // else {
                        //     console.error(`${email} Tidak ada channel lain selain ${channel_id}`);
                        //     switchChannelID = null;
                        //     // console.log(`[BATCH 1] switchChannelID SET TO NULL`);
                        // }
                    }
                } catch (parseError) {
                    console.error(`${email} Error parsing response: ${parseError}`);
                    switchChannelID = null;
                }

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
    // console.log(`switchChannelIDGetList : ${switchChannelIDGetList}`)

    // Batch 2
    let switchChannelID;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
        ];

        const stepTwoHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepTwoHeaders }],
            ['GET', urls[1], null, { headers: stepTwoHeaders }],
            ['GET', urls[2], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_GetProfile,
                CommunityDetailUserTrialSwitch.Socialinvesting_CommunityProfile_GetProfile,
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_JoinedByUser,
            ];

            if (index === 2) { // index 2 = joined-by-user endpoint
                try {
                    const joinedChannels = response.json();
                    if (joinedChannels && joinedChannels.data && joinedChannels.data.length > 0) {
                        // Cari channel pertama dengan join_status === "LEFT"
                        const leftChannel = joinedChannels.data.find(ch => ch.join_status === "LEFT");

                        if (leftChannel) {
                            switchChannelID = leftChannel.channel_id;
                            if (`${__ENV.ENV}` != 'INT') {
                                console.log(`Got LEFT Channel ID: ${switchChannelID}`);
                            }
                        } else {
                            if (`${__ENV.ENV}` != 'INT') {
                                console.log(`No channel with LEFT status found`);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to parse LEFT Channel ID: ${e.message}`);
                }
            }

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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

    // Batch 3
    // console.log(`[BEFORE CHANGE BATCH 3] switchChannelID: ${switchChannelID}`);
    if (switchChannelID == null) {
        switchChannelID = switchChannelIDGetList
    }
    // console.log(`[AFTER CHANGE BATCH 3] switchChannelID: ${switchChannelID}`);

    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/switch`,
        ];

        // console.log(`[BATCH 3 START] switchChannelID: ${switchChannelID}`);
        const Socialinvesting_Social_Switch_Payload = JSON.stringify({
            new_channel_id: switchChannelID,
            // new_channel_id: leftChannel,
        });
        
        // console.log(`[BATCH 3] Payload: ${Socialinvesting_Social_Switch_Payload}`);

        const stepThreeHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], Socialinvesting_Social_Switch_Payload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialSwitch.Socialinvesting_Social_Switch,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body} || UUID : ${switchChannelID}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // console.log(`${email} to Channel ID : ${switchChannelID}`)
                check(response, {
                    [`${email} ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || UUID : ${switchChannelID}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody} || UUID : ${switchChannelID}`);
                }
            }
        });
    }
    sleep(0.25);
}