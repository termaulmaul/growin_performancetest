import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP014 - Share Portfolio
//RUN QA : ../../../k6 run BP014.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=16 --out dashboard=export=../../../Report/Growin_Community/BP014/Manual/Manual_DryRun_1112_1059_BP014_Web_Local.html
//RUN INT: ../../../k6 run BP014.js -e RUNBY=Manual -e ENV=INT -e USER=58 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/BP014/Manual/Manual_DryRun_1023_1656_BP014_Web_Local.html
//RUN STRESS TEST: ../../../k6 run BP014.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP014/Manual/Manual_DryRun_2021_1128_BP014_Web_Local.html
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
    setupTimeout: '120m',
    teardownTimeout: '120m',
    summaryTimeUnit: '120m',
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

// /socialinvesting/api/v1/portfolio-sharing/share-to-community?portfolio_id=string&template_type=bear-metal&channel_id=string&channel_type=string

// Socialinvesting_PortfolioSharing_ShareToCommunity

// Define custom metrics
const SharePortfolio = {
    Socialinvesting_PortfolioSharing_ShareToCommunity: {
        errorCount: new Counter("error_count_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        errorRate: new Rate("error_rate_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpDuration: new Trend("duration_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpWaiting: new Trend("waiting_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        requestRate: new Counter("rps_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        http_reqs: new Counter("sample_011_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
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

    // Portfolio ID
    let portfolio_id;
    const user_Portfolio_Stock_Headers = {
        // 'Cookie': `ACCESS_TOKEN=${token}`,
        // 'Content-Type': 'application/json',

        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    let resUserPortfolioStock = http.get(base_url + `/user/api/protected/v2/portfolio/stock`, { headers: user_Portfolio_Stock_Headers })

    if (resUserPortfolioStock.status === 200) {
        const UserPortfolioStock = resUserPortfolioStock.json();
        portfolio_id = UserPortfolioStock.data[0].PortfolioId;
        
        console.log(UserPortfolioStock);
    } else {
        console.error(`${email} UserPortfolioStock Failed - Status: ${resUserPortfolioStock.status} - Body: ${resUserPortfolioStock.body}`);
    }


    // Joined by user - Channel ID 
    let channel_id;
    const channel_JoinedByUser_Headers = {
        // 'Cookie': `ACCESS_TOKEN=${token}`,
        // 'Content-Type': 'application/json',

        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    let resChannelJoinedByUser = http.get(base_url + `/socialinvesting/api/v1/channel/joined-by-user`, { headers: channel_JoinedByUser_Headers })

    if (resChannelJoinedByUser.status === 200) {
        const ChannelJoinedByUser = resChannelJoinedByUser.json();
        channel_id = ChannelJoinedByUser.data[0].channel_id;

        console.log(ChannelJoinedByUser);
    } else {
        console.error(`${email} ChannelJoinedByUser Failed - Status: ${resChannelJoinedByUser.status} - Body: ${resChannelJoinedByUser.body}`);
    }

    // Batch 1
    if (token && portfolio_id && channel_id) {
        const urls = [
            base_url + `/socialinvesting/api/v1/portfolio-sharing/share-to-community?portfolio_id=${portfolio_id}&template_type=bear-metal&channel_id=${channel_id}&channel_type=messaging`,
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
                SharePortfolio.Socialinvesting_PortfolioSharing_ShareToCommunity,
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
            const htmlPath = `../../../Report/Growin_Community/BP014/Manual/${__ENV.RUNBY}_Detail_BP014_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP014/Regression/${__ENV.RUNBY}_Detail_BP014_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP014/LoadTest/${__ENV.RUNBY}_Detail_BP014_Web_${dateStr}_${timeStr}.html`;
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