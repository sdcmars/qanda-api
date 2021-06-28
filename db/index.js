const { Pool } = require('pg');

const pool = new Pool({
  user: 'chris',
  host: 'localhost',
  database: 'chris',
  password: '',
  port: 5432,
});

module.exports = pool;
