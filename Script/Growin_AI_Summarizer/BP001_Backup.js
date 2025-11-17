import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP001 - Stock Detail Keystat Tab
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=DEV -e USER=10 -e DURATION=1m -e NUMSTART=40 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1351_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=15m -e NUMSTART=0 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1445_BP001_Local.html
//RUN STRESS TEST: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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

// /marketdata/api/v1/gpt/financial_summarizer
// /marketdata/api/v1/gpt/feedback?user_id={}&feature_name=KEYSTAT&ticker={}
// /marketdata/api/v1/gpt/recommendation_question
// /marketdata/api/v1/gpt/title_insert?title_name={}
// /marketdata/api/v1/gpt/conversation_activity_insert
// /marketdata/api/v1/gpt/conversation_activity_insert
// /marketdata/api/v1/gpt/feedback_insert
// /marketdata/api/v1/gpt/feedback_update

// Marketdata_Gpt_FinancialSummarizer
// Marketdata_Gpt_Feedback
// Marketdata_Gpt_RecommendationQuestion
// Marketdata_Gpt_TitleInsert
// Marketdata_Gpt_ConversationActivityInsert_1
// Marketdata_Gpt_ConversationActivityInsert_2
// Marketdata_Gpt_FeedbackInsert
// Marketdata_Gpt_FeedbackUpdate

// Define custom metrics
const StockDetailKeystatTab = {
    Marketdata_Gpt_FinancialSummarizer: {
        errorCount: new Counter("error_count_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
        errorRate: new Rate("error_rate_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
        httpDuration: new Trend("duration_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
        httpWaiting: new Trend("waiting_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
        requestRate: new Counter("rps_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
        http_reqs: new Counter("sample_001_01_01_Marketdata_Gpt_FinancialSummarizer"),
    },
    Marketdata_Gpt_Feedback: {
        errorCount: new Counter("error_count_001_01_02_Marketdata_Gpt_Feedback"),
        errorRate: new Rate("error_rate_001_01_02_Marketdata_Gpt_Feedback"),
        httpDuration: new Trend("duration_001_01_02_Marketdata_Gpt_Feedback"),
        httpWaiting: new Trend("waiting_001_01_02_Marketdata_Gpt_Feedback"),
        requestRate: new Counter("rps_001_01_02_Marketdata_Gpt_Feedback"),
        http_reqs: new Counter("sample_001_01_02_Marketdata_Gpt_Feedback"),
    },
    Marketdata_Gpt_RecommendationQuestion: {
        errorCount: new Counter("error_count_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
        errorRate: new Rate("error_rate_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
        httpDuration: new Trend("duration_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
        httpWaiting: new Trend("waiting_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
        requestRate: new Counter("rps_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
        http_reqs: new Counter("sample_001_01_03_Marketdata_Gpt_RecommendationQuestion"),
    },
    Marketdata_Gpt_TitleInsert: {
        errorCount: new Counter("error_count_001_01_04_Marketdata_Gpt_TitleInsert"),
        errorRate: new Rate("error_rate_001_01_04_Marketdata_Gpt_TitleInsert"),
        httpDuration: new Trend("duration_001_01_04_Marketdata_Gpt_TitleInsert"),
        httpWaiting: new Trend("waiting_001_01_04_Marketdata_Gpt_TitleInsert"),
        requestRate: new Counter("rps_001_01_04_Marketdata_Gpt_TitleInsert"),
        http_reqs: new Counter("sample_001_01_04_Marketdata_Gpt_TitleInsert"),
    },
    Marketdata_Gpt_ConversationActivityInsert_1: {
        errorCount: new Counter("error_count_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
        errorRate: new Rate("error_rate_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
        httpDuration: new Trend("duration_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
        httpWaiting: new Trend("waiting_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
        requestRate: new Counter("rps_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
        http_reqs: new Counter("sample_001_01_05_Marketdata_Gpt_ConversationActivityInsert_1"),
    },
    Marketdata_Gpt_ConversationActivityInsert_2: {
        errorCount: new Counter("error_count_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        errorRate: new Rate("error_rate_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        httpDuration: new Trend("duration_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        httpWaiting: new Trend("waiting_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        requestRate: new Counter("rps_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        http_reqs: new Counter("sample_001_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
    },
    Marketdata_Gpt_FeedbackInsert: {
        errorCount: new Counter("error_count_001_01_06_Marketdata_Gpt_FeedbackInsert"),
        errorRate: new Rate("error_rate_001_01_06_Marketdata_Gpt_FeedbackInsert"),
        httpDuration: new Trend("duration_001_01_06_Marketdata_Gpt_FeedbackInsert"),
        httpWaiting: new Trend("waiting_001_01_06_Marketdata_Gpt_FeedbackInsert"),
        requestRate: new Counter("rps_001_01_06_Marketdata_Gpt_FeedbackInsert"),
        http_reqs: new Counter("sample_001_01_06_Marketdata_Gpt_FeedbackInsert"),
    },
    Marketdata_Gpt_FeedbackUpdate: {
        errorCount: new Counter("error_count_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
        errorRate: new Rate("error_rate_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
        httpDuration: new Trend("duration_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
        httpWaiting: new Trend("waiting_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
        requestRate: new Counter("rps_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
        http_reqs: new Counter("sample_001_01_07_Marketdata_Gpt_FeedbackUpdate"),
    },
};

// Main test function
export default function () {
    // Determine the environment and user email based on ENV
    let base_url = '';
    let base_wss = '';
    let email = '';
    let base_host = '';

    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://api-dev.growin.id';
        base_wss = 'wss://api-dev.growin.id';
        base_host = 'api-dev.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
        base_wss = 'wss://api-qa.growin.id';
        base_host = 'api-qa.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(3, '0');
        email = 'mostng' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id'
        base_wss = 'wss://drc-api.growin.id'
        base_host = 'drc-api.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(0, '0');
        email = 'MOSTNG' + formattedRandomNumber + '@guysmail.com'
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id'
        base_wss = 'wss://internal-api-pt.growin.id'
        base_host = 'internal-api-pt.growin.id';

        const usernum = parseInt(`${__ENV.NUMSTART}`) + exec.vu.idInTest
        const formattedRandomNumber = String(usernum).padStart(2, '0');
        email = 'TESTMON' + formattedRandomNumber + '@guysmail.com'
    }

    // Define request headers
    const headers = {
        'Content-Type':'application/json',
        'Accept-Language':'en',
        'Host':base_host,
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/json',
        'Accept':'*/*',
    };

    // Login payload
    const payload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    // Perform login request
    let res = http.post(base_url + '/auth/api/v1/login', payload, {headers:headers});

    let token;
    if (res.status === 200) {
        token = res.json().data.token;
    } else {
        console.error(`${email} Failed to Login || Status: ${res.status} | Body: ${res.body}`);
    }

    let resProfileTrading = http.get(base_url + '/user/api/v1/profile/trading', null, {headers:headers});

    let userID;
    if (resProfileTrading.status === 200) {
        userID = resProfileTrading.json().data.user_id;
        console.log(`userID : ${userID}`)
    } else {
        
    }
    sleep(0,25);
    
    // 1 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/financial_summarizer`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_FinancialSummarizer_Payload = JSON.stringify([
            {
                "message": "",
                "feature": "KEYSTAT",
                "ticker": "BBCA",
                "user_id": userID
            }
        ]);

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FinancialSummarizer_Payload, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FinancialSummarizer,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }

    // 2 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback?user_id={${userID}}&feature_name=KEYSTAT&ticker={BBCA}`,
            base_url + `/marketdata/api/v1/gpt/recommendation_question`,
            base_url + `/marketdata/api/v1/gpt/title_insert?title_name={}`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_RecommendationQuestion_Payload = JSON.stringify([
            {
                "message": "",
                "feature": "KEYSTAT",
                "ticker": "BBCA",
                "user_id": userID,
                "locale": "en"
            }
        ]);

        const requests = [
            ['POST', urls[0], null, batchHeaders],
            ['POST', urls[1], Marketdata_Gpt_RecommendationQuestion_Payload, batchHeaders],
            ['POST', urls[2], null, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_Feedback,
                StockDetailKeystatTab.Marketdata_Gpt_RecommendationQuestion,
                StockDetailKeystatTab.Marketdata_Gpt_TitleInsert,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    
    // 3 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_ConversationActivityInsert_1_Payload = JSON.stringify([
            {
                "session_id": 0,
                "title_id": 0,
                "user_id": "string",
                "agent_name": "AGENT",
                "message": "string",
                "chat_type": "IN",
                "is_spam": false,
                "remarks": "string",
                "feature_name": [
                    "string"
                ],
                "source_name": "MOBILE-ANDROID",
                "product_id": "string",
                "recommendation_chat_id": 0
            }
        ]);

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_1_Payload, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_1,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    
    // 4 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_ConversationActivityInsert_2_Payload = JSON.stringify([
            {
                "session_id": 0,
                "title_id": 0,
                "user_id": "string",
                "agent_name": "AGENT",
                "message": "string",
                "chat_type": "OUT",
                "is_spam": false,
                "remarks": "string",
                "feature_name": [
                    "string"
                ],
                "source_name": "MOBILE-ANDROID",
                "product_id": "string",
                "recommendation_chat_id": 0
            }
        ]);

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_2_Payload, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_2,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    
    // 5 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_insert`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_FeedbackInsert_Payload = JSON.stringify([
            {
                "feedback_name": "LIKE",
                "conversation_id": 0,
                "remarks": "string" 
            }
        ]);

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FeedbackInsert_Payload, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FeedbackInsert,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    
    // 6 //
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_update`,
        ];

        const batchHeaders = {
            headers:{
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type':'application/json',
                // 'Accept-Language':'en',
                // 'Host':base_host,
                // 'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            }
        };

        const Marketdata_Gpt_FeedbackUpdate_Payload = JSON.stringify([
            {
                "feedback_id": "string",
                "feedback_name": "LIKE",
                "conversation_id": "string",
                "remarks": "string"
            }
        ]);

        const requests = [
            ['PUT', urls[0], Marketdata_Gpt_FeedbackUpdate_Payload, batchHeaders],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FeedbackUpdate,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                console.error(`ERROR ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
            }
        });
    }
    sleep(0,25);
}

// Generate the test report
export function handleSummary(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ind-EG').replace(/\//g, ''); // Format the date
    const timeStr = now.toLocaleTimeString('ind-EG').replace(/:/g, ''); // Format the time
    if(`${__ENV.RUNBY}`=='Manual'){
        return {
            [`../../Report/Growin_AI_Summarizer/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_AI_Summarizer/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Text summary to be displayed in the terminal
        };
    }
}