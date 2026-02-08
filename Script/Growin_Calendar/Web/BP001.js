import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /marketdata/api/v1/marketinfo/corporate-actions-calendar-order/detail?selected_date=2026-02-06
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-detail?selected_date=2026-02-06&corporate_action_type=

// /marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events?selected_date=2026-02-06&corporate_action_type=
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events?selected_date=2026-02-06
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-dates/my-events?start_date=2026-02-01&end_date=2026-02-28
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-order/detail/my-events?selected_date=2026-02-18

// CorporateActionsCalendarOrder_Detail_SelectedDate
// CorporateActionsCalendarDetail_SelectedDate_CorporateActionType

// CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType
// CorporateActionsCalendarDetail_MyEvents_Selected_date
// CorporateActionsCalendarDates_MyEvents_Start_date
// CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date

// Define custom metrics
const CalendarDetail = {
    CorporateActionsCalendarOrder_Detail_SelectedDate: {
        errorCount: new Counter("error_count_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
        errorRate: new Rate("error_rate_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
        httpDuration: new Trend("duration_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
        httpWaiting: new Trend("waiting_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
        requestRate: new Counter("rps_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
        http_reqs: new Counter("sample_001_01_01_CorporateActionsCalendarOrder_Detail_SelectedDate"),
    },
    CorporateActionsCalendarDetail_SelectedDate_CorporateActionType: {
        errorCount: new Counter("error_count_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
        errorRate: new Rate("error_rate_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
        httpDuration: new Trend("duration_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
        httpWaiting: new Trend("waiting_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
        requestRate: new Counter("rps_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
        http_reqs: new Counter("sample_001_01_02_CorporateActionsCalendarDetail_SelectedDate_CorporateActionType"),
    },
    CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType: {
        errorCount: new Counter("error_count_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
        errorRate: new Rate("error_rate_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
        httpDuration: new Trend("duration_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
        httpWaiting: new Trend("waiting_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
        requestRate: new Counter("rps_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
        http_reqs: new Counter("sample_001_02_03_CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType"),
    },
    CorporateActionsCalendarDetail_MyEvents_Selected_date: {
        errorCount: new Counter("error_count_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
        errorRate: new Rate("error_rate_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
        httpDuration: new Trend("duration_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
        httpWaiting: new Trend("waiting_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
        requestRate: new Counter("rps_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
        http_reqs: new Counter("sample_001_02_04_CorporateActionsCalendarDetail_MyEvents_Selected_date"),
    },
    CorporateActionsCalendarDates_MyEvents_Start_date: {
        errorCount: new Counter("error_count_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
        errorRate: new Rate("error_rate_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
        httpDuration: new Trend("duration_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
        httpWaiting: new Trend("waiting_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
        requestRate: new Counter("rps_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
        http_reqs: new Counter("sample_001_02_05_CorporateActionsCalendarDates_MyEvents_Start_date"),
    },
    CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date: {
        errorCount: new Counter("error_count_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
        errorRate: new Rate("error_rate_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
        httpDuration: new Trend("duration_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
        httpWaiting: new Trend("waiting_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
        requestRate: new Counter("rps_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
        http_reqs: new Counter("sample_001_02_06_CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP001(data) {
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
    const email = userToken.email;
    const bp = mapping.bp;
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Hari ini
    const today = new Date();
    const todayFormatted = formatDate(today);

    // 1 minggu kedepan (7 hari)
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const oneWeekFormatted = formatDate(oneWeekLater);

    // 2 minggu kedepan (14 hari)
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    const twoWeeksFormatted = formatDate(twoWeeksLater);

    console.log(todayFormatted);      // 2026-02-08
    console.log(oneWeekFormatted);    // 2026-02-15
    console.log(twoWeeksFormatted);   // 2026-02-22

    // Fungsi untuk mendapatkan tanggal pertama dan terakhir bulan ini
    function getMonthBoundaries(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Tanggal pertama bulan ini
        const firstDay = new Date(year, month, 1);
        
        // Tanggal terakhir bulan ini (hari ke-0 dari bulan berikutnya)
        const lastDay = new Date(year, month + 1, 0);
        
        return {
            first: firstDay.toISOString().split('T')[0],
            last: lastDay.toISOString().split('T')[0]
        };
    }

    const { first, last } = getMonthBoundaries();
    console.log(first);  // 2026-02-01
    console.log(last);   // 2026-02-28

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
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-order/detail?selected_date=${todayFormatted}`,
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-detail?selected_date=${todayFormatted}&corporate_action_type=`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.CorporateActionsCalendarOrder_Detail_SelectedDate,
                CalendarDetail.CorporateActionsCalendarDetail_SelectedDate_CorporateActionType,
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

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events?selected_date=${todayFormatted}&corporate_action_type=`,
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events?selected_date=${todayFormatted}`,
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-dates/my-events?start_date=${first}&end_date=${last}`,
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-order/detail/my-events?selected_date=${oneWeekFormatted}`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
            ['GET', urls[2], null, { headers: headers }],
            ['GET', urls[3], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.CorporateActionsCalendarDetail_MyEvents_SelectedDate_CorporateActionType,
                CalendarDetail.CorporateActionsCalendarDetail_MyEvents_Selected_date,
                CalendarDetail.CorporateActionsCalendarDates_MyEvents_Start_date,
                CalendarDetail.CorporateActionsCalendarOrder_Detail_MyEvents_Selected_date,

                



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