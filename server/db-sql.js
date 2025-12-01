const mssql = require('mssql');
const os = require('os');

let poolPromise = null;

function configFromEnv() {
  const server = process.env.DB_SERVER || 'localhost';
  const database = process.env.DB_NAME || 'bowdb';
  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASS || '';
  const useTrusted = (process.env.DB_TRUSTED || 'true') === 'true';

  // Default to windows integrated if no user/password provided
  if (useTrusted && (!user || !password)) {
    // Attempt to use msnodesqlv8 driver for Windows Integrated Auth
    return {
      server,
      database,
      driver: 'msnodesqlv8',
      options: {
        trustedConnection: true,
        enableArithAbort: true,
        trustServerCertificate: true,
      }
    };
  }

  return {
    user: user || undefined,
    password: password || undefined,
    server,
    database,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
    }
  };
}

function getPool() {
  if (poolPromise) return poolPromise;
  const cfg = configFromEnv();
  poolPromise = mssql.connect(cfg).then(pool => pool).catch(err => { poolPromise = null; throw err; });
  return poolPromise;
}

module.exports = { getPool, mssql };
