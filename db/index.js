const { Pool } = require('pg');

const pool = new Pool({
  user: 'chris',
  host: '18.117.117.240',
  database: 'qanda',
  password: 'password',
  port: 5432,
});

module.exports = pool;
