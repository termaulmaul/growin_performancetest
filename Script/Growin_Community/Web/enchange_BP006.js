// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Community/Web/BP006.js
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
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// /socialinvesting/api/v1/channel/get-list
// /socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}
// /socialinvesting/api/v1/community-profile/get-profile
// /socialinvesting/api/v1/channel/joined-by-user
// /socialinvesting/api/v1/social/join
// /socialinvesting/api/v1/social/leave

// Socialinvesting_Channel_GetList
// Socialinvesting_Channel_GetProfile
// Socialinvesting_CommunityProfile_GetProfile
// Socialinvesting_Channel_JoinedByUser
// Socialinvesting_Social_Join
// Socialinvesting_Social_Leave

// Define custom metrics
const CommunityDetailUserTrialJoinLeave = {
    Socialinvesting_Channel_GetList: {
        errorCount: new Counter("error_count_006_01_01_Socialinvesting_Channel_GetList"),
        errorRate: new Rate("error_rate_006_01_01_Socialinvesting_Channel_GetList"),
        httpDuration: new Trend("duration_006_01_01_Socialinvesting_Channel_GetList"),
        httpWaiting: new Trend("waiting_006_01_01_Socialinvesting_Channel_GetList"),
        requestRate: new Counter("rps_006_01_01_Socialinvesting_Channel_GetList"),
        http_reqs: new Counter("sample_006_01_01_Socialinvesting_Channel_GetList"),
    },
    Socialinvesting_Channel_GetProfile: {
        errorCount: new Counter("error_count_006_01_02_Socialinvesting_Channel_GetProfile"),
        errorRate: new Rate("error_rate_006_01_02_Socialinvesting_Channel_GetProfile"),
        httpDuration: new Trend("duration_006_01_02_Socialinvesting_Channel_GetProfile"),
        httpWaiting: new Trend("waiting_006_01_02_Socialinvesting_Channel_GetProfile"),
        requestRate: new Counter("rps_006_01_02_Socialinvesting_Channel_GetProfile"),
        http_reqs: new Counter("sample_006_01_02_Socialinvesting_Channel_GetProfile"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_006_01_03_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_006_01_04_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_006_01_04_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_006_01_04_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_006_01_04_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_006_01_04_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_006_01_04_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_Social_Leave: {
        errorCount: new Counter("error_count_006_01_05_Socialinvesting_Social_Leave"),
        errorRate: new Rate("error_rate_006_01_05_Socialinvesting_Social_Leave"),
        httpDuration: new Trend("duration_006_01_05_Socialinvesting_Social_Leave"),
        httpWaiting: new Trend("waiting_006_01_05_Socialinvesting_Social_Leave"),
        requestRate: new Counter("rps_006_01_05_Socialinvesting_Social_Leave"),
        http_reqs: new Counter("sample_006_01_05_Socialinvesting_Social_Leave"),
    },
    Socialinvesting_Channel_GetList_2: {
        errorCount: new Counter("error_count_006_02_06_Socialinvesting_Channel_GetList"),
        errorRate: new Rate("error_rate_006_02_06_Socialinvesting_Channel_GetList"),
        httpDuration: new Trend("duration_006_02_06_Socialinvesting_Channel_GetList"),
        httpWaiting: new Trend("waiting_006_02_06_Socialinvesting_Channel_GetList"),
        requestRate: new Counter("rps_006_02_06_Socialinvesting_Channel_GetList"),
        http_reqs: new Counter("sample_006_02_06_Socialinvesting_Channel_GetList"),
    },
    Socialinvesting_Channel_GetProfile_2: {
        errorCount: new Counter("error_count_006_02_07_Socialinvesting_Channel_GetProfile"),
        errorRate: new Rate("error_rate_006_02_07_Socialinvesting_Channel_GetProfile"),
        httpDuration: new Trend("duration_006_02_07_Socialinvesting_Channel_GetProfile"),
        httpWaiting: new Trend("waiting_006_02_07_Socialinvesting_Channel_GetProfile"),
        requestRate: new Counter("rps_006_02_07_Socialinvesting_Channel_GetProfile"),
        http_reqs: new Counter("sample_006_02_07_Socialinvesting_Channel_GetProfile"),
    },
    Socialinvesting_CommunityProfile_GetProfile_2: {
        errorCount: new Counter("error_count_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_006_02_08_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_JoinedByUser_2: {
        errorCount: new Counter("error_count_006_02_09_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_006_02_09_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_006_02_09_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_006_02_09_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_006_02_09_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_006_02_09_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_Social_Join: {
        errorCount: new Counter("error_count_006_02_10_Socialinvesting_Social_Join"),
        errorRate: new Rate("error_rate_006_02_10_Socialinvesting_Social_Join"),
        httpDuration: new Trend("duration_006_02_10_Socialinvesting_Social_Join"),
        httpWaiting: new Trend("waiting_006_02_10_Socialinvesting_Social_Join"),
        requestRate: new Counter("rps_006_02_10_Socialinvesting_Social_Join"),
        http_reqs: new Counter("sample_006_02_10_Socialinvesting_Social_Join"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP006(data) {
    const scenarioName = 'BP006';
    const base_url = data.base_url;
    const isIntEnv = `${__ENV.ENV}` === 'INT';
    
    // ✅ GET CORRECT TOKEN FROM BP-SPECIFIC ARRAY
    const bp006Tokens = data.bpTokens[scenarioName];
    if (!bp006Tokens || bp006Tokens.length === 0) {
        console.error(`❌ ${scenarioName} - No tokens available!`);
        return;
    }
    
    // ✅ USE ITERATION INDEX TO GET CORRECT USER
    const iterationIndex = exec.scenario.iterationInInstance;
    const tokenIndex = iterationIndex % bp006Tokens.length; // Wrap around if iterations > tokens
    
    const userToken = bp006Tokens[tokenIndex];
    if (!userToken || !userToken.token) {
        console.error(`❌ ${scenarioName} Iteration ${iterationIndex} - No valid token at index ${tokenIndex}!`);
        return;
    }
    
    // ✅ CRITICAL VALIDATION - ENSURE CORRECT POOL
    if (userToken.pool !== 'REGULAR') {
        console.error(`❌ CRITICAL: ${scenarioName} using ${userToken.pool} user (${userToken.email}) instead of REGULAR! ABORTING.`);
        return;
    }
    
    // // ✅ DEBUG LOG - Confirm correct mapping
    // console.log(`🔍 ${scenarioName} K6-VU${__VU} Iter${iterationIndex} → Setup-VU${userToken.vuId} → User${userToken.userNum} (${userToken.email}) | Pool: ${userToken.pool} ✅`);
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;

    const channel_id = getChannelId(base_url, token, scenarioName, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-list`,
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
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_GetList,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'INT') {
                    // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 2
    let joinedChannelID;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
        ];

        const stepTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
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
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_GetProfile,
                CommunityDetailUserTrialJoinLeave.Socialinvesting_CommunityProfile_GetProfile,
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_JoinedByUser,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (index === 2) { // index 2 = joined-by-user endpoint
                    try {
                        const joinedChannels = response.json();
                        if (joinedChannels && joinedChannels.data && joinedChannels.data.length > 0) {
                            // Cari channel pertama dengan join_status === "JOINED"
                            const joinedChannel = joinedChannels.data.find(ch => ch.join_status === "JOINED");

                            if (joinedChannel) {
                                joinedChannelID = joinedChannel.channel_id;
                                if (`${__ENV.ENV}` != 'INT') {
                                    console.log(`Got JOINED Channel ID: ${joinedChannelID}`);
                                }
                            } else {
                                if (`${__ENV.ENV}` != 'INT') {
                                    console.log(`No channel with JOINED status found`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to parse JOINED Channel ID: ${e.message}`);
                    }
                }

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 3
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/leave?channel_id=${joinedChannelID}`,
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
            ['POST', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Social_Leave,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.

    // Batch 4
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-list`,
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
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_GetList_2,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 5
    let leftedChannelID;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
        ];

        const stepTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
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
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_GetProfile_2,
                CommunityDetailUserTrialJoinLeave.Socialinvesting_CommunityProfile_GetProfile_2,
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_JoinedByUser_2,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (index === 2) { // index 2 = joined-by-user endpoint
                    try {
                        const leftChannels = response.json();
                        if (leftChannels && leftChannels.data && leftChannels.data.length > 0) {
                            // Cari channel pertama dengan join_status === "JOINED"
                            const joinedChannel = leftChannels.data.find(ch => ch.join_status === "LEFT");

                            if (joinedChannel) {
                                leftedChannelID = joinedChannel.channel_id;
                                if (`${__ENV.ENV}` != 'INT') {
                                    console.log(`Got LEFTED Channel ID: ${leftedChannelID}`);
                                }
                            } else {
                                if (`${__ENV.ENV}` != 'INT') {
                                    console.log(`No channel with LEFTED status found`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to parse LEFTED Channel ID: ${e.message}`);
                    }
                }

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }

    // Batch 6
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/join`,
        ];

        const Socialinvesting_Social_Join_Payload = JSON.stringify({
            // channel_id: leftedChannelID, 
            channel_id: channel_id,
            is_join_community_consent: true
        });

        const stepOneHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], Socialinvesting_Social_Join_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Social_Join,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }
    sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}