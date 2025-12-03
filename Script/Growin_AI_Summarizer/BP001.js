import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

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

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP008(data) {
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

    // ✅ Ambil channel_id untuk BP ini dari data yang sudah di-fetch di setup()
    const channel_id = data.channelIds ? data.channelIds[bp] : null;
    
    if (!channel_id) {
        console.error(`❌ ${email} (${bp}) - No channel_id available, skipping iteration`);
        return;
    }

    // ... rest of BP001 logic
    
    sleep(0.25);
}