const functions = require('firebase-functions');
const { Pool } = require("pg");

//load env vars
let config = functions.config().env

//make conection to DB
const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.db_name,
    password: config.db.password,
    port: config.db.port
});

module.exports = {
    pool
};