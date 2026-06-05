import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP005 - Community Detail USER TRIAL SWITCH
//RUN QA : ../../../k6 run BP005.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=42 --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_1112_1106_BP005_Web_Local.html
//RUN INT: ../../../k6 run BP005.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_1124_1611_BP005_Web_Local.html
//RUN STRESS TEST: ../../../k6 run BP005.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_2021_1128_BP005_Web_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// Define options for test execution
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
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
};

// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'per-vu-iterations',
//             vus: 1,
//             iterations: 1,
//             maxDuration: '1h',
//         },
//     },
// };

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

// SETUP FUNCTION - Runs once before test starts
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    // Determine base_url
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
    const channelIds = {};  // ✅ Store channel_id for each user
    
    console.log(`Starting login for ${totalUsers} users...`);
    
    // Login untuk semua user sekaligus di setup phase
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

        const payload = JSON.stringify({
            password: 'M@nsek.123',
            email: email,
            recaptcha: '',
        });

        const headers = {
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
            'User-Agent':'PostmanRuntime/7.43.0'
        };

        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
            
            // ✅ GET channel_id after successful login
            const channelHeaders = {
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type': 'application/json',
                'Accept-Language':'en',
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            };
            
            const channelRes = http.get(
                base_url + '/socialinvesting/api/v1/channel/joined-by-user',
                { headers: channelHeaders }
            );
            
            if (channelRes.status === 200) {
                try {
                    const channelData = channelRes.json();
                    if (channelData.data && channelData.data.length > 0) {
                        const channelId = channelData.data[0].channel_id;
                        channelIds[i] = channelId;
                        console.log(`User ${i}/${totalUsers} - ${email} Channel ID: ${channelId}`);
                    } else {
                        console.warn(`User ${i}/${totalUsers} - ${email} No channels found`);
                        channelIds[i] = null;
                    }
                } catch (e) {
                    console.error(`User ${i}/${totalUsers} - ${email} Failed to parse channel data: ${e.message}`);
                    channelIds[i] = null;
                }
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} Failed to get channel - Status: ${channelRes.status}`);
                channelIds[i] = null;
            }
            
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
            tokens[i] = { email: email, token: null };
            channelIds[i] = null;
        }
    }
    
    console.log(`Login phase completed for ${totalUsers} users`);
    
    return { 
        base_url: base_url, 
        tokens: tokens,
        channelIds: channelIds  // ✅ Return channel IDs
    };
}

// MAIN TEST FUNCTION
export default function (data) {
    // Get token and channel_id for this VU
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    const channelId = data.channelIds[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const base_url = data.base_url;

    // Batch 1
    let channel_Id;
    let new_Channel_Id;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-list`,
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
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_GetList,
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
                        channel_Id = ChannelGetProfile.data[0].channel_id;
                        new_Channel_Id = ChannelGetProfile.data[0].channel_id;
                        if (`${__ENV.ENV}` != 'INT') {
                            console.log(`Got New Channel ID: ${channelId}`);
                        }
                    } else {
                        console.error(`No Channel ID available`);
                    }
                } catch (e) {
                    console.error(`Failed to parse Channel ID: ${e.message}`);
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

    // Batch 2
    let newChannelId;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channelId}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
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
            ['GET', urls[2], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_GetProfile,
                CommunityDetailUserTrialSwitch.Socialinvesting_CommunityProfile_GetProfile,
                CommunityDetailUserTrialSwitch.Socialinvesting_Channel_JoinedByUser,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                if (index === 1) {
                    try {
                        const ChannelGetProfile = response.json();
                        if (ChannelGetProfile && ChannelGetProfile.data && ChannelGetProfile.data.length > 0) {
                                newChannelId = ChannelGetProfile.data.channel_id;
                            if (`${__ENV.ENV}` != 'INT') {
                                console.log(`Got New Channel ID: ${newChannelId}`);
                            }
                        } else {
                            console.error(`No Channel ID available`);
                        }
                    } catch (e) {
                        console.error(`Failed to parse Channel ID: ${e.message}`);
                    }
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

    // Batch 3
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/switch`,
        ];

        const Socialinvesting_Social_Switch_Payload = JSON.stringify({
            new_channel_id: new_Channel_Id,
            // new_channel_id : "2d135f9d-6eef-42c8-9634-6b455cfc7d25"
        });
        

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
            const htmlPath = `../../../Report/Growin_Community/Web/BP005/Manual/${__ENV.RUNBY}_Detail_BP005_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/Web/BP005/Regression/${__ENV.RUNBY}_Detail_BP005_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/Web/BP005/LoadTest/${__ENV.RUNBY}_Detail_BP005_Web_${dateStr}_${timeStr}.html`;
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