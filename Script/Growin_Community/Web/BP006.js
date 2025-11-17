import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP006 - Community Detail USER TRIAL JOIN/LEAVE
//RUN QA : ../../../k6 run BP006.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=9 --out dashboard=export=../../../Report/Growin_Community/BP006/Manual/Manual_DryRun_1110_1125_BP006_Web_Local.html
//RUN INT: ../../../k6 run BP006.js -e RUNBY=Manual -e ENV=INT -e USER=205 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/BP006/Manual/Manual_DryRun_1117_0015_BP006_Web_Local.html
//RUN STRESS TEST: ../../../k6 run BP006.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP006/Manual/Manual_DryRun_2021_1128_BP006_Web_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// // Define options for test execution
export const options = {
    scenarios: {
        contacts: {
            executor: 'constant-vus',
            vus: `${__ENV.USER}`,
            duration: `${__ENV.DURATION}`,
            gracefulStop: '30s',
        },
    },
    noConnectionReuse: false,
    setupTimeout: '120m',
    teardownTimeout: '120m',
    summaryTimeUnit: '120m',
};

// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'per-vu-iterations',
//             vus: 205,
//             iterations: 1,
//             maxDuration: '1h',
//         },
//     },
// };

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
    Socialinvesting_Social_Join: {
        errorCount: new Counter("error_count_006_01_05_Socialinvesting_Social_Join"),
        errorRate: new Rate("error_rate_006_01_05_Socialinvesting_Social_Join"),
        httpDuration: new Trend("duration_006_01_05_Socialinvesting_Social_Join"),
        httpWaiting: new Trend("waiting_006_01_05_Socialinvesting_Social_Join"),
        requestRate: new Counter("rps_006_01_05_Socialinvesting_Social_Join"),
        http_reqs: new Counter("sample_006_01_05_Socialinvesting_Social_Join"),
    },
    Socialinvesting_Social_Leave: {
        errorCount: new Counter("error_count_006_01_06_Socialinvesting_Social_Leave"),
        errorRate: new Rate("error_rate_006_01_06_Socialinvesting_Social_Leave"),
        httpDuration: new Trend("duration_006_01_06_Socialinvesting_Social_Leave"),
        httpWaiting: new Trend("waiting_006_01_06_Socialinvesting_Social_Leave"),
        requestRate: new Counter("rps_006_01_06_Socialinvesting_Social_Leave"),
        http_reqs: new Counter("sample_006_01_06_Socialinvesting_Social_Leave"),
    },
};

// SETUP FUNCTION - Runs once before test starts
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://dev-api.growin.id';
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id';
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id';
    }

    const tokens = {};
    
    console.log(`Starting login and PIN login for ${totalUsers} users...`);
    
    for (let i = 1; i <= totalUsers; i++) {
        let email = '';
        let formattedNum = '';
        
        if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
            formattedNum = String(startNum + i - 1).padStart(3, '0');
            email = 'mostng' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='DRC') {
            formattedNum = String(startNum + i - 1).padStart(0, '0');
            email = 'MOSTNG' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='INT') {
            formattedNum = String(startNum + i - 1).padStart(2, '0');
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }

        const loginPayload = JSON.stringify({
            password: 'M@nsek.123',
            email: email,
            recaptcha: '',
        });

        const headers = {
            // 'Content-Type': 'application/json',
            
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        let res = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: headers });

        let token = null;
        let pin_token = null;

        if (res.status === 200) {
            token = res.json().data.token;
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);

            const pinPayload = JSON.stringify({ value: "123456" });
            const pinHeaders = { 
                // 'Cookie': `ACCESS_TOKEN=${token}`
                // 'Content-Type': 'application/json', 

                'Cookie': `ACCESS_TOKEN=${token}` ,
                'Content-Type': 'application/json',
                'Accept-Language':'en',
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            };

            res = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

            if (res.status === 200) {
                pin_token = res.json().data.pin_token;
                console.log(`User ${i}/${totalUsers} - ${email} PIN Login Success`);
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} PIN Login Failed - Status: ${res.status}`);
            }
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
        }

        tokens[i] = { 
            email: email, 
            token: token,
            pin_token: pin_token
        };
    }
    
    console.log(`Login and PIN login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

export default function (data) {
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`VU${vuId} - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const base_url = data.base_url;

    // Batch 1
    let channel_id;
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
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Channel_GetList,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                try {
                    const ChannelGetList = response.json();
                    if (ChannelGetList && ChannelGetList.data && ChannelGetList.data.length > 0) {
                        channel_id = ChannelGetList.data[1].channel_id;
                        if (`${__ENV.ENV}` != 'TEST') {
                            console.log(`Got New Channel ID: ${channel_id}`);
                        }
                    } else {
                        console.error(`No Channel ID available`);
                    }
                } catch (e) {
                    console.error(`Failed to parse Channel ID: ${e.message}`);
                }

                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
        ];

        const stepTwoHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

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
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 3
    let channelIdJoin;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/join`,
        ];

        const Socialinvesting_Social_Join_Payload = JSON.stringify({
            channel_id: channel_id, 
            is_join_community_consent: true
        });

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
            ['POST', urls[0], Socialinvesting_Social_Join_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Social_Join,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                try {
                    const socialinvestingSocialJoin = response.json();
                    if (socialinvestingSocialJoin && socialinvestingSocialJoin.data && socialinvestingSocialJoin.data.length > 0) {
                        channelIdJoin = socialinvestingSocialJoin.data.channel_id;
                        if (`${__ENV.ENV}` != 'TEST') {
                            console.log(`Got New Channel ID: ${channelIdJoin}`);
                        }
                    } else {
                        console.error(`No Channel ID available`);
                    }
                } catch (e) {
                    console.error(`Failed to parse Channel ID: ${e.message}`);
                }

                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 4
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/leave`,
        ];

        const Socialinvesting_Social_Leave_Payload = JSON.stringify({
            // channel_id: channel_id,
            // channel_id: 'c484fd54-f435-47a9-8cc5-74936bf9a674'
        });

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
            ['POST', urls[0], Socialinvesting_Social_Leave_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialJoinLeave.Socialinvesting_Social_Leave,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                try {
                    const ChannelGetProfile = response.json();
                    if (ChannelGetProfile && ChannelGetProfile.data && ChannelGetProfile.data.length > 0) {
                        channelId = ChannelGetProfile.data.channel_id;
                        if (`${__ENV.ENV}` != 'TEST') {
                            console.log(`Got New Channel ID: ${channelId}`);
                        }
                    } else {
                        console.error(`No Channel ID available`);
                    }
                } catch (e) {
                    console.error(`Failed to parse Channel ID: ${e.message}`);
                }

                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
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
        
        if(`${__ENV.RUNBY}`=='Manual'){
            const htmlPath = `../../../Report/Growin_Community/BP006/Manual/${__ENV.RUNBY}_Detail_BP006_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP006/Regression/${__ENV.RUNBY}_Detail_BP006_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP006/LoadTest/${__ENV.RUNBY}_Detail_BP006_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
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