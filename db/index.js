const { Pool } = require('pg');

const pool = new Pool({
  user: 'chris',
  host: '3.129.87.69',
  database: 'qanda',
  password: 'password',
  port: 5432,
});

module.exports = pool;
