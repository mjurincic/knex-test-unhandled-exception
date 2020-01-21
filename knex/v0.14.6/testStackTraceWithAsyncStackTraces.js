'use strict';

const Knex = require('knex');
const envy = require('envy');
const env = envy();

const knex = Knex({
    client: 'mysql',
    debug: true,
    asyncStackTraces: true,
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

const test = async () => {
    await knex("users").where({ id: "asdf" });
};

test().finally(() => {
    knex.destroy();
});