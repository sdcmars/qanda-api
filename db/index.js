const { Pool } = require('pg');

const pool = new Pool({
  user: 'chris',
  host: '18.219.217.69',
  database: 'qanda',
  password: 'password',
  port: 5432,
});


module.exports = pool;
