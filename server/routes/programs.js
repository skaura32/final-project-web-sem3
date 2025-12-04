const express = require('express');
const router = express.Router();
const { useSql, dbSql, loadJSON, sendServerError } = require('../lib/common');

router.get('/', async (req, res) => {
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const result = await pool.request().query('SELECT * FROM Programs');
      return res.json(result.recordset);
    }
    const programs = loadJSON('programs.json') || [];
    res.json(programs);
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
