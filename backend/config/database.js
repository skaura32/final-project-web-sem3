const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

const getConnection = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(config);
            console.log('✓ Database connection pool created');
        }
        return await poolPromise;
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        throw err;
    }
};

module.exports = {
    sql,
    getConnection
};