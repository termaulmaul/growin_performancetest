import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP001 - Stock Detail Keystat Tab
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=90 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1706_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=205 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_1112_1330_BP001_Local.html
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

// marketdata/api/v1/gpt/financial_summarizer
// marketdata/api/v1/gpt/feedback?user_id={}&feature_name=KETSTAT&ticker={}
// marketdata/api/v1/gpt/recommendation_question
// marketdata/api/v1/gpt/title_insert?title_name={}
// marketdata/api/v1/gpt/conversation_activity_insert
// marketdata/api/v1/gpt/conversation_activity_insert
// marketdata/api/v1/gpt/feedback_insert
// marketdata/api/v1/gpt/feedback_update

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
        errorCount: new Counter("error_count_001_01_07_Marketdata_Gpt_FeedbackInsert"),
        errorRate: new Rate("error_rate_001_01_07_Marketdata_Gpt_FeedbackInsert"),
        httpDuration: new Trend("duration_001_01_07_Marketdata_Gpt_FeedbackInsert"),
        httpWaiting: new Trend("waiting_001_01_07_Marketdata_Gpt_FeedbackInsert"),
        requestRate: new Counter("rps_001_01_07_Marketdata_Gpt_FeedbackInsert"),
        http_reqs: new Counter("sample_001_01_07_Marketdata_Gpt_FeedbackInsert"),
    },
    Marketdata_Gpt_FeedbackUpdate: {
        errorCount: new Counter("error_count_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
        errorRate: new Rate("error_rate_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
        httpDuration: new Trend("duration_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
        httpWaiting: new Trend("waiting_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
        requestRate: new Counter("rps_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
        http_reqs: new Counter("sample_001_01_08_Marketdata_Gpt_FeedbackUpdate"),
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
            // 'Content-Type': 'application/json',

            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
            tokens[i] = { email: email, token: null };
        }
    }
    
    console.log(`Login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

export default function (data) {
    // Get token for this VU
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const base_url = data.base_url;

    // Get user profile trading
    const profileHeaders = {
        // 'Cookie': `ACCESS_TOKEN=${token}`,
        // 'Content-Type': 'application/json',

        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
        'User-Agent':'PostmanRuntime/7.43.0',
    };
    
    let resProfileTrading = http.get(base_url + '/user/api/v1/profile/trading', { headers: profileHeaders });

    let userID;
    if (resProfileTrading.status === 200) {
        userID = resProfileTrading.json().data.user_id;
        if (`${__ENV.ENV}`!='INT') {
            console.log(`VU${exec.vu.idInTest} - userID: ${userID}`);
        }
    } else {
        if (`${__ENV.ENV}`!='INT') {
            console.error(`VU${exec.vu.idInTest} - Failed to get userID`);
        }
        return;
    }

    let title_id;
    if (token && userID) {
        const titleInsertHeader = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const urls = [base_url + `/marketdata/api/v1/gpt/title_insert?title_name=AutomationTest`];
        const requests = [
            ['POST', urls[0], null, { headers: titleInsertHeader }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_1;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                title_id = response.json().data.title_id;
                if (`${__ENV.ENV}`!='INT') {
                    console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${response.body}`);
                }
            } else {
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // 1. Financial Summarizer
    if (token && userID) {
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

        // PERBAIKAN: Kirim object, bukan array
        const Marketdata_Gpt_FinancialSummarizer_Payload = JSON.stringify({
            message: "How the company solvency",
            feature: "KEYSTAT", 
            ticker: "BMRI",
            user_id: userID
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/financial_summarizer`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FinancialSummarizer_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_FinancialSummarizer;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
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

    // 2. Feedback, Recommendation, Title
    if (token && userID) {
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

        // PERBAIKAN: Kirim object, bukan array
        const Marketdata_Gpt_RecommendationQuestion_Payload = JSON.stringify({
            message: "How the company solvency",
            feature: "KEYSTAT",
            ticker: "BMRI",
            user_id: userID,
            locale: "en"
        });

        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback?user_id=${userID}&feature_name=KEYSTAT&ticker=BMRI`,
            base_url + `/marketdata/api/v1/gpt/recommendation_question`,
            base_url + `/marketdata/api/v1/gpt/title_insert?title_name=Test%20Title`,
        ];

        const requests = [
            ['POST', urls[0], null, { headers: stepTwoHeaders }],
            ['POST', urls[1], Marketdata_Gpt_RecommendationQuestion_Payload, { headers: stepTwoHeaders }],
            ['POST', urls[2], null, { headers: stepTwoHeaders }],
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
                if (`${__ENV.ENV}`!='INT') {
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

    
    // 3. Conversation Activity Insert    
    if (token && userID) {
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

        // PERBAIKAN: Kirim object, bukan array
        const Marketdata_Gpt_ConversationActivityInsert_1_Payload = JSON.stringify({
            session_id: 1,
            title_id: title_id,
            user_id: userID,
            agent_name: "AGENT",
            message: "How the company solvency",
            chat_type: "IN",
            is_spam: false,
            remarks: "test",
            feature_name: ["KEYSTAT"],
            source_name: "MOBILE-ANDROID",
            product_id: "BMRI",
            recommendation_chat_id: 0
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_1_Payload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_1;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
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
    
    // 4. Conversation Activity Insert 2
    if (token && userID) {
        const stepFourHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const Marketdata_Gpt_ConversationActivityInsert_2_Payload = JSON.stringify({
            session_id: 1,
            title_id: title_id,
            user_id: userID,
            agent_name: "AGENT",
            message: "How the company solvency",
            chat_type: "OUT",
            is_spam: false,
            remarks: "test",
            feature_name: ["KEYSTAT"],
            source_name: "MOBILE-ANDROID",
            product_id: "BMRI",
            recommendation_chat_id: 0
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_2_Payload, { headers: stepFourHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_2;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
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
    
    // 5. Feedback Insert
    let feedback_id;
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_insert`
        ];

        const stepFiveHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        // PERBAIKAN: Kirim object, bukan array
        const Marketdata_Gpt_FeedbackInsert_Payload = JSON.stringify({
            feedback_name: "LIKE",
            conversation_id: 0,
            remarks: "test feedback"
        });

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FeedbackInsert_Payload, { headers: stepFiveHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_FeedbackInsert;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                feedback_id = response.json().data.feedback_id;
                if (`${__ENV.ENV}`!='INT') {
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
    
    // 6. Feedback Update
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_update`
        ];
        
        const stepSixHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const Marketdata_Gpt_FeedbackUpdate_Payload = JSON.stringify({
            feedback_id: feedback_id,
            feedback_name: "LIKE",
            conversation_id: "1",
            remarks: "Performance Test Update"
        });

        const requests = [
            ['PUT', urls[0], Marketdata_Gpt_FeedbackUpdate_Payload, { headers: stepSixHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = StockDetailKeystatTab.Marketdata_Gpt_FeedbackUpdate;
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200 || response.status === 201) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
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
            const htmlPath = `../../Report/Growin_AI_Summarizer/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../Report/Growin_AI_Summarizer/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`;
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