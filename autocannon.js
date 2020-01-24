'use strict'
const envy = require('envy');
const fetch = require('node-fetch');
const autocannon = require('autocannon');
const fs = require('fs');

const env = envy();
console.log(env);
let apiToken = '';
let connection = 0;
let responseTextChunks = '';

async function getUserAsync(name) {
    const response = await fetch(`${env.apiHost}/graphql`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            query: `
        mutation LoginMutation {
          dashboardLogin(input: {email: "${env.apiSystemUsername}", password: "${env.apiSystemPassword}", inStore: false, clientMutationId: "1"}) {
            clientMutationId
            viewer {
              personId
              token
            }
          }
        }
        `,
        }),
    });
    const responseAsJson = await response.json();
    console.log(responseAsJson.data.dashboardLogin.viewer.token);
    apiToken = responseAsJson.data.dashboardLogin.viewer.token;

    const response2 = await fetch(`${env.apiHost}/graphql`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=utf-8',
            'X-Request-ID': 'asdsad',
            'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({query: `
                query personLocation {
                  viewer {
                    personId
                    personConnection {
                      totalCount
                      pageInfo {
                        hasNextPage
                      }
                      edges {
                        node {
                          firstName
                          lastName
                          address {
                            address
                            city
                          }
                        }
                      }
                    }
                  }
                }
                `
        }),
    });
    console.log(response2.headers.get('Content-Length'));

    const response2AsJson = await response2.json();
    console.log(JSON.stringify(response2AsJson).length.toString());

    console.log(response2AsJson);


    const instance = autocannon({
        url: `${env.apiHost}`,
        connections: 20,
        pipelining: 1, // default
        duration: 20,
        timeout: 60,
        // amount:1000,
        requests: [
            {
                method: 'POST',
                path: '/graphql',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({query: `
                query personLocation {
                  viewer {
                    personId
                    personConnection {
                      totalCount
                      pageInfo {
                        hasNextPage
                      }
                      edges {
                        node {
                          firstName
                          lastName
                          address {
                            address
                            city
                          }
                        }
                      }
                    }
                  }
                }
                `
                })
            }
        ]
    }, function finishedBench(err, results) {
        console.log('finished bench', err, results);
        // console.log(responseTextChunks);
    });

    instance.on('response', function handleResponse(client, statusCode, resBytes, responseTime) {
        console.log(`Got response with code ${statusCode} in ${responseTime} milliseconds`);
        console.log(`response: ${resBytes}`);
        // client.on('body', function body(bufferChunk) {
        //     // console.log(bufferChunk.toString('utf8'));
        //     // responseTextChunks += bufferChunk.toString('utf8');
        //     // connection++;
        //     // fs.writeFile(`response${connection}.txt`,bufferChunk.toString('utf8'), function (err) {
        //     //     if (err) throw err;
        //     //     console.log('Saved!');
        //     // });
        // })
    });


// this is used to kill the instance on CTRL-C
    process.once('SIGINT', () => {
        instance.stop()
    });

// just render results
    autocannon.track(instance);
}


getUserAsync().catch(function (err) {
    console.error(err);
});



