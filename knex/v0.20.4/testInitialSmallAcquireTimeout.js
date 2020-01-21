'use strict';

const Knex = require('knex');
const envy = require('envy');
const env = envy();

const knex = Knex({
    client: 'mysql',
    debug: true,
    connection: {
        host: env.dbHost,
        port: 3306,
        user: env.dbUsername,
        password: env.dbPassword,
        database: env.dbName,
        dateStrings: true,
        multipleStatements: true
    },
    pool: {
        min: 1,
        max: 1,
        acquireTimeoutMillis: 300,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
        propagateCreateError: true
    }
});

const knexPool = knex.client.pool;
console.log(knexPool);

knex.raw('SELECT 1')
    .catch((err) => console.error('Expected1', err))
    .then(() => knex.raw('SELECT 1'))
    .catch((err) => console.error('Expected2', err))
    .then(() => {
        return new Promise((res, req) => {
            setTimeout(() => {
                console.log('Waited– a connection should be available despite previous errors');
                // knex.client.pool.requestTimeout = 100; // Uncomment to make example work
                knex.client.config.acquireConnectionTimeout = 10000;
                res();
            }, 100);
        });
    })
    .then(() => knex.raw('SELECT 1'))
    .then(() => knex.raw('SELECT 1'))
    .then(() => knex.raw('SELECT 1'))
    .then(() => knex.raw('SELECT 1'))
    .then(() => knex.raw('SELECT 1'))
    .then(() => knex.raw('SELECT 1'))
    .catch((err) => console.error('Unexpected', err))
    .then(() => process.exit(0));
