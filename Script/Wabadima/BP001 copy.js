import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from "k6/metrics";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// Define options for test execution
// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'constant-vus',
//             vus: `${__ENV.USER}`,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '30s',
//         },
//     },
//     noConnectionReuse: false,
//     setupTimeout: '120m',
//     teardownTimeout: '120m',
//     summaryTimeUnit: '120m',
// };
export const options = {
  scenarios: {
    contacts: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 1,
      maxDuration: '1h',
    },
  },
};

// Define custom metrics
const WhatsappIntegration = {
    Webhook: {
        errorCount: new Counter("error_count_001_01_01_Webhook"),
        errorRate: new Rate("error_rate_001_01_01_Webhook"),
        httpDuration: new Trend("duration_001_01_01_Webhook"),
        httpWaiting: new Trend("waiting_001_01_01_Webhook"),
        requestRate: new Counter("rps_001_01_01_Webhook"),
        http_reqs: new Counter("sample_001_01_01_Webhook"),
    },
};

// export default function () {
//   const url = 'https://whatsapp-integration-dev.growin.id/webhook';
  
//   // Customize these values
//   const payload = JSON.stringify({
//     contacts: [
//       {
//         profile: {
//           name: "Izaz Rakha Anggara" // Change this name as needed
//         },
//         wa_id: "6281227170922"
//       }
//     ],
//     // messages: [
//     //   {
//     //     context: {
//     //       from: "62895377745753",
//     //       id: "HBgNNjI4MTI5Mjg3NjkyMhUCABEYEkY1Q0UyQzg4M0I5QTA2Qjg0NwA="
//     //     },
//     //     from: "YOUR_NUMBER", // Replace with your actual number
//     //     id: "HBgNNjI4MTI5Mjg3NjkyMhUCABIYIERCMDAxQTcxNzI0NUU3MzAyREM5NEFGRTg5QUZGRjcxAA==",
//     //     interactive: {
//     //       button_reply: {
//     //         id: "JUrc5sB0R4rU3XKmWynIX",
//     //         title: "Agent"
//     //       },
//     //       type: "button_reply"
//     //     },
//     //     timestamp: "1763537552",
//     //     type: "interactive"
//     //   }
//     // ]
//     messages: [
//         {
//         from: "6281227170922",
//         id: "HBgNNjI4NTI1NjM4MzQ3OBUCABIYIDA5NzlENjMxNTJEQjg5N0UzMEFGODVCMzA4MzMzMEEwAA==",
//         text: {
//             body: "Berapa harga saham BMRI hari ini?"
//         },
//         timestamp: "1763537552",
//         type: "text"
//         }
//     ]
//   });

//   const params = {
//     timeout: '360s',
//     headers: {
//       'Content-Type': 'application/json',
//       // Add authentication headers if needed:
//       // 'Authorization': 'Bearer YOUR_TOKEN',
//     },
//   };

//   // Send POST request
//   const response = http.post(url, payload, params);

//   // Validate response
//   check(response, {
//     'status is 200': (r) => r.status === 200,
//     'response time < 500ms': (r) => r.timings.duration < 500,
//     'response time < 1000ms': (r) => r.timings.duration < 1000,
//   });

//   // Log response details (useful for debugging)
//   if (response.status !== 200 && response.status !== 201) {
//     console.log(`Failed request: Status ${response.status}, Body: ${response.body}`);
//   }

//   console.log(`Response Body : ${response.body}`)

//   // Wait 1 second between iterations
//   sleep(1);
// }

// // Optional: Setup function runs once before test
// export function setup() {
//   console.log('Starting WhatsApp webhook load test...');
// }

// // Optional: Teardown function runs once after test
// export function teardown(data) {
//   console.log('Load test completed!');
// }

//////////////////////////////////////////////////

export default function (data) {
    // const vuId = exec.vu.idInTest;
    // const userToken = data.tokens[vuId];
    
    // if (!userToken || !userToken.token || !userToken.pin_token) {
    //     console.error(`VU${vuId} - No valid token or pin_token available, skipping iteration`);
    //     return;
    // }
    
    // const token = userToken.token;
    // const pin_token = userToken.pin_token;
    // const email = userToken.email;
    // const base_url = data.base_url;

    // Batch 1
    // if (token) {
        const urls = [
            `https://whatsapp-integration-dev.growin.id/webhook`,
        ];

        const test = JSON.stringify({
          contacts: [
            {
              profile: {
                name: "Izaz Rakha Anggara" // Change this name as needed
              },
              wa_id: "6281227170922"
            }
          ],
          // messages: [
          //   {
          //     context: {
          //       from: "62895377745753",
          //       id: "HBgNNjI4MTI5Mjg3NjkyMhUCABEYEkY1Q0UyQzg4M0I5QTA2Qjg0NwA="
          //     },
          //     from: "YOUR_NUMBER", // Replace with your actual number
          //     id: "HBgNNjI4MTI5Mjg3NjkyMhUCABIYIERCMDAxQTcxNzI0NUU3MzAyREM5NEFGRTg5QUZGRjcxAA==",
          //     interactive: {
          //       button_reply: {
          //         id: "JUrc5sB0R4rU3XKmWynIX",
          //         title: "Agent"
          //       },
          //       type: "button_reply"
          //     },
          //     timestamp: "1763537552",
          //     type: "interactive"
          //   }
          // ]
          messages: [
              {
              from: "6281227170922",
              id: "HBgNNjI4NTI1NjM4MzQ3OBUCABIYIDA5NzlENjMxNTJEQjg5N0UzMEFGODVCMzA4MzMzMEEwAA==",
              text: {
                  body: "Berapa harga saham BMRI hari ini?"
              },
              timestamp: "1763537552",
              type: "text"
              }
          ]
        });

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], test, { headers: stepOneHeaders, timeout: '5m'}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                WhatsappIntegration.Webhook,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
                    console.error(`ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    // }
    sleep(0.25);
}