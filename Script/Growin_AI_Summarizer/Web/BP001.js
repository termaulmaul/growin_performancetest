import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

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

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP001(data) {const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        //  || !userToken.pin_token
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const user_id = userToken.user_id;
    const email = userToken.email;
    const bp = mapping.bp;

    const headers = {
        'Cookie': `ACCESS_TOKEN=${token};`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3'
    };

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/financial_summarizer`,
        ];

        const Marketdata_Gpt_FinancialSummarizer_Payload = JSON.stringify({
            message: "How the company solvency",
            feature: "KEYSTAT", 
            ticker: "BMRI",
            user_id: user_id
        });

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FinancialSummarizer_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FinancialSummarizer,
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

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback?user_id=${user_id}&feature_name=KEYSTAT&ticker=BMRI`,
            base_url + `/marketdata/api/v1/gpt/recommendation_question`,
            base_url + `/marketdata/api/v1/gpt/title_insert?title_name=Test%20Title`,
        ];

        const Marketdata_Gpt_RecommendationQuestion_Payload = JSON.stringify({
            message: "How the company solvency",
            feature: "KEYSTAT",
            ticker: "BMRI",
            user_id: user_id,
            locale: "en"
        });

        const requests = [
            ['POST', urls[0], null, { headers: headers }],
            ['POST', urls[1], Marketdata_Gpt_RecommendationQuestion_Payload, { headers: headers }],
            ['POST', urls[2], null, { headers: headers }],
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
    if (token) {
        const urls = [
            base_url + `marketdata/api/v1/gpt/conversation_activity_insert`,
        ];

        const Marketdata_Gpt_ConversationActivityInsert_1_Payload = JSON.stringify({
            session_id: 1,
            title_id: title_id,
            user_id: user_id,
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

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_1_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_1,
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

    // Batch 4
    if (token) {
        const urls = [
            base_url + `marketdata/api/v1/gpt/conversation_activity_insert`,
        ];

        const Marketdata_Gpt_ConversationActivityInsert_2_Payload = JSON.stringify({
            session_id: 1,
            title_id: title_id,
            user_id: user_id,
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

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_2_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_ConversationActivityInsert_2,
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

    // Batch 5
    let feedback_id;
    if (token) {
        const urls = [
            base_url + `marketdata/api/v1/gpt/feedback_insert`,
        ];

        const Marketdata_Gpt_FeedbackInsert_Payload = JSON.stringify({
            feedback_name: "LIKE",
            conversation_id: 0,
            remarks: "test feedback"
        });

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FeedbackInsert_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FeedbackInsert,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                feedback_id = response.json().data.feedback_id;
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

    // Batch 6
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/feedback_update`,
        ];

        const Marketdata_Gpt_FeedbackUpdate_Payload = JSON.stringify({
            feedback_id: feedback_id,
            feedback_name: "LIKE",
            conversation_id: "1",
            remarks: "Performance Test Update"
        });

        const requests = [
            ['PUT', urls[0], Marketdata_Gpt_FeedbackUpdate_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailKeystatTab.Marketdata_Gpt_FeedbackUpdate,
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