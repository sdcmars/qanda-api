const pool = require('./index.js');


module.exports = {
  insertQuestions: (lines) => {
    let text = 'INSERT INTO questions (question_id, product_id, question_body, question_date, asker_name, email, reported, question_helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
    let values = lines.map(line => line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g));

    values.forEach(value => {
      value[3] = new Date(Number(value[3]))

      pool.query(text, value)
        .then(res => console.log(res.rows))
        .catch(e => console.log(e));
    });

  },
  insertAnswers: (lines) => {
    let text = 'INSERT INTO answers (answer_id, question_id, body, date, answerer_name, email, reported, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
    let values = lines.map(line => line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g));

    values.forEach(value => {
      value[3] = new Date(Number(value[3]))

      pool.query(text, value)
        .then(res => console.log(res))
        .catch(e => console.log(e));
    });

  },
  insertPhotos: (lines) => {
    let text = 'INSERT INTO photos (id, answer_id, url) VALUES ($1, $2, $3)'
    let values = lines.map(line => line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g));

    // const query = {
    //   name: 'insert-photos',
    //   text: text,
    //   values: values
    // };

    // pool.query(query)
    //   .then(res => console.log(res.rows[0]))
    //   .catch(e => console.log(e.stack));

    values.forEach(value => {

      pool.query(text, value)
        .then(res => console.log(res))
        .catch(e => console.log(e));
    });
  }
}
