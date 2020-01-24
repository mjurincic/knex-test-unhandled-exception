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

    let requestPromises = [];

    for (let i = 0; i < 200; i++) {
        requestPromises.push(fetch(`${env.apiHost}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    query: `
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
            })
        );
    }

    Promise.all(requestPromises)
        .then(function done(results) {
            results.forEach(async function (result, index) {
                const responseAsJson = await result.json();
                fs.writeFile(`./responses/response${index+1}.json`,JSON.stringify(responseAsJson), function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            })
        }).catch(function onError(error) {
        console.error(err);
    })
}


getUserAsync().catch(function (err) {
    console.error(err);
});



