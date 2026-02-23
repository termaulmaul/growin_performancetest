import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /marketdata/api/v1/marketinfo/corporate-actions-calendar-order/detail
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-detail
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-dates
// /marketdata/api/v1/marketinfo/corporate-actions-calendar-dates/my-events
// /marketdata/api/v1/marketinfo/corporate-actions-calendar/glossary

// Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail
// Marketdata_Marketinfo_CorporateActionsCalendarDetail
// Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents
// Marketdata_Marketinfo_CorporateActionsCalendarDates
// Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents
// Marketdata_Marketinfo_CorporateActionsCalendar_Glossary

// Define custom metrics
const CalendarDetail = {
    Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail: {
        errorCount: new Counter("error_count_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
        errorRate: new Rate("error_rate_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
        httpDuration: new Trend("duration_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
        httpWaiting: new Trend("waiting_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
        requestRate: new Counter("rps_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
        http_reqs: new Counter("sample_002_01_01_Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail"),
    },
    Marketdata_Marketinfo_CorporateActionsCalendarDetail: {
        errorCount: new Counter("error_count_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
        errorRate: new Rate("error_rate_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
        httpDuration: new Trend("duration_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
        httpWaiting: new Trend("waiting_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
        requestRate: new Counter("rps_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
        http_reqs: new Counter("sample_002_01_02_Marketdata_Marketinfo_CorporateActionsCalendarDetail"),
    },
    Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents: {
        errorCount: new Counter("error_count_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
        errorRate: new Rate("error_rate_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
        httpDuration: new Trend("duration_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
        httpWaiting: new Trend("waiting_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
        requestRate: new Counter("rps_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
        http_reqs: new Counter("sample_002_02_03_Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents"),
    },
    Marketdata_Marketinfo_CorporateActionsCalendarDates: {
        errorCount: new Counter("error_count_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
        errorRate: new Rate("error_rate_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
        httpDuration: new Trend("duration_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
        httpWaiting: new Trend("waiting_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
        requestRate: new Counter("rps_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
        http_reqs: new Counter("sample_002_02_04_Marketdata_Marketinfo_CorporateActionsCalendarDates"),
    },
    Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents: {
        errorCount: new Counter("error_count_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
        errorRate: new Rate("error_rate_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
        httpDuration: new Trend("duration_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
        httpWaiting: new Trend("waiting_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
        requestRate: new Counter("rps_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
        http_reqs: new Counter("sample_002_02_05_Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents"),
    },
    Marketdata_Marketinfo_CorporateActionsCalendar_Glossary: {
        errorCount: new Counter("error_count_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
        errorRate: new Rate("error_rate_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
        httpDuration: new Trend("duration_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
        httpWaiting: new Trend("waiting_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
        requestRate: new Counter("rps_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
        http_reqs: new Counter("sample_002_02_06_Marketdata_Marketinfo_CorporateActionsCalendar_Glossary"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP002(data) {
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

    // console.log(todayFormatted);      // 2026-02-08
    // console.log(oneWeekFormatted);    // 2026-02-15
    // console.log(twoWeeksFormatted);   // 2026-02-22

    // Fungsi untuk mendapatkan tanggal pertama dan terakhir tahun ini
    function getYearBoundaries(date = new Date()) {
        const year = date.getFullYear();
        
        // Tanggal pertama tahun ini (1 Januari)
        const firstDay = new Date(year, 0, 1);
        
        // Tanggal terakhir tahun ini (31 Desember)
        const lastDay = new Date(year, 11, 31);
        
        return {
            first: firstDay.toISOString().split('T')[0],
            last: lastDay.toISOString().split('T')[0]
        };
    }

    const { first, last } = getYearBoundaries();
    // console.log(first);  // 2026-01-01
    // console.log(last);   // 2026-12-31

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
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-detail?selected_date=${todayFormatted}`,
            
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendarOrder_Detail,
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendarDetail,
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
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-detail/my-events?selected_date=${oneWeekFormatted}`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendarDetail_MyEvents,
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
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-dates?start_date=${first}&end_date=${last}`,
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar-dates/my-events?start_date=${first}&end_date=${last}`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendarDates,
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendarDates_MyEvents,
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
            base_url + `/marketdata/api/v1/marketinfo/corporate-actions-calendar/glossary`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CalendarDetail.Marketdata_Marketinfo_CorporateActionsCalendar_Glossary,
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