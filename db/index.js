const { Pool } = require('pg');

const pool = new Pool({
  user: 'chris',
  host: '18.116.61.39',
  database: 'qanda',
  password: 'password',
  port: 5432,
});


module.exports = pool;
