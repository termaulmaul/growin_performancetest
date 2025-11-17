import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";

// ##READ ME
//BP001 - Stock Detail Keystat Tab
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=90 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1216_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=700 -e DURATION=5m -e NUMSTART=0 --out dashboard=export=../../Report/Growin_AI_Summarizer/BP001/Manual/Manual_DryRun_2021_1049_BP001_Local.html
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

    const headers = {
        'Content-Type': 'application/json',
    };

    const payload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    let res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

    let token;
    if (res.status === 200) {
        token = res.json().data.token;
        if (`${__ENV.ENV}`!='INT') {
            console.log(`VU${exec.vu.idInTest} - ${email} Login Success`);
        }
    } else {
        if (`${__ENV.ENV}`!='INT') {
            console.error(`VU${exec.vu.idInTest} - ${email} Failed to Login || Status: ${res.status} || Status: ${res.body}`);
        }
        return;
    }

    // Get user profile trading
    const profileHeaders = {
        'Content-Type': 'application/json',
        'Cookie': `ACCESS_TOKEN=${token}`
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
        const batchHeaders = {
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
            ['POST', urls[0], null, { headers: batchHeaders }],
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
    
    sleep(0.25);
    
    // 1. Financial Summarizer
    if (token && userID) {
        const batchHeaders = {
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
            message: "Performance Test",
            feature: "KEYSTAT", 
            ticker: "BBCA",
            user_id: userID
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/financial_summarizer`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FinancialSummarizer_Payload, { headers: batchHeaders }],
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
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // 2. Feedback, Recommendation, Title
    if (token && userID) {
        const batchHeaders = {
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
            message: "",
            feature: "KEYSTAT",
            ticker: "BBCA",
            user_id: userID,
            locale: "en"
        });

        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback?user_id=${userID}&feature_name=KEYSTAT&ticker=BBCA`,
            base_url + `/marketdata/api/v1/gpt/recommendation_question`,
            base_url + `/marketdata/api/v1/gpt/title_insert?title_name=Test%20Title`,
        ];

        const requests = [
            ['POST', urls[0], null, { headers: batchHeaders }],
            ['POST', urls[1], Marketdata_Gpt_RecommendationQuestion_Payload, { headers: batchHeaders }],
            ['POST', urls[2], null, { headers: batchHeaders }],
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
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    
    // 3. Conversation Activity Insert    
    if (token && userID) {
        const batchHeaders = {
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
            message: "test message",
            chat_type: "IN",
            is_spam: false,
            remarks: "test",
            feature_name: ["KEYSTAT"],
            source_name: "MOBILE-ANDROID",
            product_id: "BBCA",
            recommendation_chat_id: 0
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_1_Payload, { headers: batchHeaders }],
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
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // 4. Conversation Activity Insert 2
    if (token && userID) {
        const batchHeaders = {
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
            message: "test response",
            chat_type: "OUT",
            is_spam: false,
            remarks: "test",
            feature_name: ["KEYSTAT"],
            source_name: "MOBILE-ANDROID",
            product_id: "BBCA",
            recommendation_chat_id: 0
        });

        const urls = [base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`];
        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_2_Payload, { headers: batchHeaders }],
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
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
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

        const batchHeaders = {
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
            ['POST', urls[0], Marketdata_Gpt_FeedbackInsert_Payload, { headers: batchHeaders }],
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
                const responseData = JSON.parse(response.body);
                feedback_id = responseData.data.feedback_id;
                if (`${__ENV.ENV}`!='INT') {
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]} || Response Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // 6. Feedback Update
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_update`
        ];
        
        const batchHeaders = {
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
            ['PUT', urls[0], Marketdata_Gpt_FeedbackUpdate_Payload, { headers: batchHeaders }],
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
                    console.log(`VU${exec.vu.idInTest} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}`!='INT') {
                    const requestBody = requests[index][2];
                    console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.25);
}

export function handleSummary(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ind-EG').replace(/\//g, '');
    const timeStr = now.toLocaleTimeString('ind-EG').replace(/:/g, '');
    if(`${__ENV.RUNBY}`=='Manual'){
        return {
            [`../../Report/Growin_AI_Summarizer/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    } else if(`${__ENV.RUNBY}`=='Regression'){
        return {
            [`../../Report/Growin_AI_Summarizer/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}


