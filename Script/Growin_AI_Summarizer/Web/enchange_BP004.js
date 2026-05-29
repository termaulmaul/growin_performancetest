// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_AI_Summarizer/Web/BP004.js
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
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// POST	marketdata/api/v1/gpt/financial_summarizer
// POST	marketdata/api/v1/gpt/feedback?user_id={}&feature_name=ANALYSIS&ticker={}
// POST	marketdata/api/v1/gpt/recommendation_question
// POST	marketdata/api/v1/gpt/title_insert?title_name={}
// POST	marketdata/api/v1/gpt/conversation_activity_insert
// POST	marketdata/api/v1/gpt/conversation_activity_insert
// POST	marketdata/api/v1/gpt/feedback_insert
// PUT 	marketdata/api/v1/gpt/feedback_update

// Marketdata_Gpt_FinancialSummarizer
// Marketdata_Gpt_Feedback
// Marketdata_Gpt_RecommendationQuestion
// Marketdata_Gpt_TitleInsert
// Marketdata_Gpt_ConversationActivityInsert
// Marketdata_Gpt_ConversationActivityInsert_2
// Marketdata_Gpt_FeedbackInsert
// Marketdata_Gpt_FeedbackUpdate

// Define custom metrics
const StockDetailAnalysisTab = {
    Marketdata_Gpt_FinancialSummarizer: {
        errorCount: new Counter("error_count_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
        errorRate: new Rate("error_rate_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
        httpDuration: new Trend("duration_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
        httpWaiting: new Trend("waiting_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
        requestRate: new Counter("rps_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
        http_reqs: new Counter("sample_004_01_01_Marketdata_Gpt_FinancialSummarizer"),
    },
    Marketdata_Gpt_Feedback: {
        errorCount: new Counter("error_count_004_01_02_Marketdata_Gpt_Feedback"),
        errorRate: new Rate("error_rate_004_01_02_Marketdata_Gpt_Feedback"),
        httpDuration: new Trend("duration_004_01_02_Marketdata_Gpt_Feedback"),
        httpWaiting: new Trend("waiting_004_01_02_Marketdata_Gpt_Feedback"),
        requestRate: new Counter("rps_004_01_02_Marketdata_Gpt_Feedback"),
        http_reqs: new Counter("sample_004_01_02_Marketdata_Gpt_Feedback"),
    },
    Marketdata_Gpt_RecommendationQuestion: {
        errorCount: new Counter("error_count_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
        errorRate: new Rate("error_rate_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
        httpDuration: new Trend("duration_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
        httpWaiting: new Trend("waiting_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
        requestRate: new Counter("rps_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
        http_reqs: new Counter("sample_004_01_03_Marketdata_Gpt_RecommendationQuestion"),
    },
    Marketdata_Gpt_TitleInsert: {
        errorCount: new Counter("error_count_004_01_04_Marketdata_Gpt_TitleInsert"),
        errorRate: new Rate("error_rate_004_01_04_Marketdata_Gpt_TitleInsert"),
        httpDuration: new Trend("duration_004_01_04_Marketdata_Gpt_TitleInsert"),
        httpWaiting: new Trend("waiting_004_01_04_Marketdata_Gpt_TitleInsert"),
        requestRate: new Counter("rps_004_01_04_Marketdata_Gpt_TitleInsert"),
        http_reqs: new Counter("sample_004_01_04_Marketdata_Gpt_TitleInsert"),
    },
    Marketdata_Gpt_ConversationActivityInsert: {
        errorCount: new Counter("error_count_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
        errorRate: new Rate("error_rate_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
        httpDuration: new Trend("duration_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
        httpWaiting: new Trend("waiting_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
        requestRate: new Counter("rps_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
        http_reqs: new Counter("sample_004_01_05_Marketdata_Gpt_ConversationActivityInsert"),
    },
    Marketdata_Gpt_ConversationActivityInsert_2: {
        errorCount: new Counter("error_count_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        errorRate: new Rate("error_rate_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        httpDuration: new Trend("duration_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        httpWaiting: new Trend("waiting_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        requestRate: new Counter("rps_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
        http_reqs: new Counter("sample_004_01_06_Marketdata_Gpt_ConversationActivityInsert_2"),
    },
    Marketdata_Gpt_FeedbackInsert: {
        errorCount: new Counter("error_count_004_01_07_Marketdata_Gpt_FeedbackInsert"),
        errorRate: new Rate("error_rate_004_01_07_Marketdata_Gpt_FeedbackInsert"),
        httpDuration: new Trend("duration_004_01_07_Marketdata_Gpt_FeedbackInsert"),
        httpWaiting: new Trend("waiting_004_01_07_Marketdata_Gpt_FeedbackInsert"),
        requestRate: new Counter("rps_004_01_07_Marketdata_Gpt_FeedbackInsert"),
        http_reqs: new Counter("sample_004_01_07_Marketdata_Gpt_FeedbackInsert"),
    },
    Marketdata_Gpt_FeedbackUpdate: {
        errorCount: new Counter("error_count_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
        errorRate: new Rate("error_rate_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
        httpDuration: new Trend("duration_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
        httpWaiting: new Trend("waiting_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
        requestRate: new Counter("rps_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
        http_reqs: new Counter("sample_004_01_08_Marketdata_Gpt_FeedbackUpdate"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP004(data) {
    const vuId = exec.vu.idInTest;
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
    const client_id = userToken.client_id;
    const SID = userToken.SID;
    const ksei_acc_no = userToken.ksei_acc_no;
    const account_name = userToken.account_name;
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
        // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3'
    };

    // let title_id;
    // if (token && user_id) {
    //     const urls = [base_url + `/marketdata/api/v1/gpt/title_insert?title_name=AutomationTest`];
    //     const requests = [
    //         ['POST', urls[0], null, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         if (response.status === 200 || response.status === 201) {
    //             title_id = response.json().data.title_id;
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`200 ${urls[index]} || Status: ${response.status} | Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`VU${exec.vu.idInTest} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/gpt/financial_summarizer`,
        ];

        const Marketdata_Gpt_FinancialSummarizer_Payload = JSON.stringify({
            message: "",
            feature: "ANALYSIS", 
            ticker: "BBCA",
            user_id: user_id
        });
        

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_FinancialSummarizer_Payload, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockDetailAnalysisTab.Marketdata_Gpt_FinancialSummarizer,
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

    // // Batch 2
    // let title_id;
    // if (token) {
    //     const urls = [
    //         base_url + `/marketdata/api/v1/gpt/feedback?user_id=${user_id}&feature_name=ANALYSIS&ticker=BBCA`,  
    //         // base_url + `/marketdata/api/v1/gpt/recommendation_question`,
    //         base_url + `/marketdata/api/v1/gpt/title_insert`,
    //     ];

    //     const Marketdata_Gpt_RecommendationQuestion_Payload = JSON.stringify({
    //         message: "",
    //         feature: "KEYSTAT",
    //         ticker: "BBCA",
    //         user_id: user_id,
    //         locale: "en"
    //     });
        
    //     const Marketdata_Gpt_TitleInsert_Payload = JSON.stringify({
    //         title_name: "Performance Test",
    //     });

    //     const requests = [
    //         ['POST', urls[0], null, { headers: headers, timeout: '300s' }],
    //         // ['POST', urls[1], Marketdata_Gpt_RecommendationQuestion_Payload, { headers: headers, timeout: '300s' }],
    //         ['POST', urls[1], Marketdata_Gpt_TitleInsert_Payload, { headers: headers, timeout: '300s' }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             StockDetailAnalysisTab.Marketdata_Gpt_Feedback,
    //             // StockDetailKeystatTab.Marketdata_Gpt_RecommendationQuestion,
    //             StockDetailAnalysisTab.Marketdata_Gpt_TitleInsert,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             if (index === 1) {
    //                 title_id = response.json().data.title_id;
    //             }
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 const timestamp = new Date().toISOString();
    //                 console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // // Batch 3
    // // console.log(`title_id = ${title_id}`)
    // let conversation_id;
    // if (token) {
    //     const urls = [
    //         base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`,
    //     ];

    //     const Marketdata_Gpt_ConversationActivityInsert_Payload = JSON.stringify({
    //         session_id: 16,
    //         title_id: title_id,
    //         user_id: user_id,
    //         agent_name: "AGENT",
    //         message: "Performance Test Message",
    //         chat_type: "IN",
    //         is_spam: false,
    //         remarks: "Performance Test",
    //         feature_name: [
    //             "ANALYSIS"
    //         ],
    //         source_name: "WEB",
    //         product_id: "BBCA",
    //         recommendation_chat_id: 0
    //     });
        
    //     const requests = [
    //         ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_Payload, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             StockDetailAnalysisTab.Marketdata_Gpt_ConversationActivityInsert,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             conversation_id = response.json().data.conversation_id;
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // // Batch 4
    // if (token) {
    //     const urls = [
    //         base_url + `/marketdata/api/v1/gpt/conversation_activity_insert`,
    //     ];

    //     const Marketdata_Gpt_ConversationActivityInsert_2_Payload = JSON.stringify({
    //         session_id: 1,
    //         title_id: title_id,
    //         user_id: user_id,
    //         agent_name: "AGENT",
    //         message: "test response",
    //         chat_type: "OUT",
    //         is_spam: false,
    //         remarks: "test",
    //         feature_name: [
    //             "ANALYSIS"
    //         ],
    //         source_name: "WEB",
    //         product_id: "BBCA",
    //         recommendation_chat_id: 0
    //     });
        

    //     const requests = [
    //         ['POST', urls[0], Marketdata_Gpt_ConversationActivityInsert_2_Payload, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             StockDetailAnalysisTab.Marketdata_Gpt_ConversationActivityInsert_2,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // // Batch 5
    // let feedback_id;
    // if (token) {
    //     const urls = [
    //         base_url + `/marketdata/api/v1/gpt/feedback_insert`,
    //     ];

    //     const Marketdata_Gpt_FeedbackInsert_Payload = JSON.stringify({
    //         feedback_name: "LIKE",
    //         conversation_id: conversation_id,
    //         remarks: "Performance Test Feedback"
    //     });
        

    //     const requests = [
    //         ['POST', urls[0], Marketdata_Gpt_FeedbackInsert_Payload, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             StockDetailAnalysisTab.Marketdata_Gpt_FeedbackInsert,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             feedback_id = response.json().data.feedback_id;
    //             conversation_id = response.json().data.conversation_id;
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }

    // // Batch 6
    // if (token) {
    //     const urls = [
    //         base_url + `/marketdata/api/v1/gpt/feedback_update`,
    //     ];

    //     const Marketdata_Gpt_FeedbackUpdate_Payload = JSON.stringify({
    //         feedback_id: feedback_id,
    //         feedback_name: "LIKE",
    //         conversation_id: conversation_id,
    //         remarks: "Performance Test Update"
    //     });
        

    //     const requests = [
    //         ['PUT', urls[0], Marketdata_Gpt_FeedbackUpdate_Payload, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             StockDetailAnalysisTab.Marketdata_Gpt_FeedbackUpdate,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
         metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
    //             }
    //         }
    //     });
    // }
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}