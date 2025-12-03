import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /socialinvesting/api/v1/portfolio-sharing/share-to-community?portfolio_id=string&template_type=bear-metal&channel_id=string&channel_type=string

// Socialinvesting_PortfolioSharing_ShareToCommunity

// Define custom metrics
const SharePortfolio = {
    Socialinvesting_PortfolioSharing_ShareToCommunity: {
        errorCount: new Counter("error_count_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        errorRate: new Rate("error_rate_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpDuration: new Trend("duration_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpWaiting: new Trend("waiting_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        requestRate: new Counter("rps_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        http_reqs: new Counter("sample_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP012(data) {
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
    } else {
        console.error(`${email} UserPortfolioStock Failed - Status: ${resUserPortfolioStock.status} - Body: ${resUserPortfolioStock.body}`);
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