/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const pool = require('./index.js');

module.exports = {
  getQuestions: ({ product_id, count, page }) => {
    count = count || 5;
    page = page || 1;

    const query = `SELECT question_id, question_body, question_date, asker_name, question_helpfulness
    FROM questions
    WHERE questions.product_id = $1 AND questions.reported = 0
    LIMIT ${count} OFFSET ${(page - 1) * count};`;

    const value = [product_id];

    const aQuery = `SELECT * FROM answers WHERE answers.question_id = $1 AND answers.reported = 0;`;

    const pQuery = `SELECT * FROM photos WHERE photos.answer_id = $1;`;

    let response = {
      product_id: product_id.toString(),
      results: []
    }

    let questions = {};
    let answers = {};
    let ids = [];

    return pool.connect()
      .then(client => {
        return client.query(query, value)
          .then(res => {
            let qs = res.rows;

            for(let q of qs) {
              questions[q.question_id] = {
                question_id: q.question_id,
                question_body: q.question_body,
                question_date: new Date(Number(q.question_date)),
                asker_name: q.asker_name,
                question_helpfulness: q.question_helpfulness,
                reported: false,
                answers: {}
              }
            }

            return Promise.all(qs.map(q => {
              return client.query(aQuery, [q.question_id]);
            }))

          })
          .then(res => {
            let ans = res.flatMap(a => a.rows);

            for (let a of ans) {
              ids.push({ question: a.question_id, answer: a.answer_id });

              questions[a.question_id].answers[a.answer_id] = {
                id: a.answer_id,
                body: a.body,
                date: new Date(Number(a.date)),
                answerer_name: a.answerer_name,
                helpfulness: a.helpfulness,
                photos: []
              }
            }


            return Promise.all(ids.map(id => {
              return client.query(pQuery, [id.answer]);
            }));

          })
          .then(res => {
            client.release();
            let photos = res.flatMap(p => p.rows);

            for (let p of photos) {
              for (let a of ids) {
                if (p.answer_id === a.answer) {
                  questions[a.question].answers[a.answer].photos.push(p.url);
                }
              }
            }

            for (let q in questions) {
              response.results.push(questions[q]);
            }


            return response;
          })
          .catch(err => {
            client.release();
            console.log(err.stack);
          })
      })
  },
  getAnswers: ({ question_id, count, page }) => {
    count = count || 5;
    page = page || 1;
    const query = `SELECT answer_id, body, date, answerer_name, helpfulness FROM answers
    WHERE answers.question_id = $1 AND answers.reported = 0
    LIMIT ${count} OFFSET ${(page - 1) * count};`;

    const value = [question_id];

    const pQuery = `SELECT * FROM photos WHERE answer_id = $1;`;

    let response = {
      question: question_id,
      page: page,
      count: count,
      results: []
    };

    let answers = {};

    return pool.connect()
      .then(client => {
        return client.query(query, value)
          .then(res => {
            let ans = res.rows;
            //console.log(res.rows);
            for (let a of ans) {
              answers[a.answer_id] = {
                answer_id: a.answer_id,
                body: a.body,
                date: new Date(Number(a.date)),
                answerer_name: a.answerer_name,
                helpfulness: a.helpfulness,
                photos: []
              }
            }

            return Promise.all(ans.map(a => {
              return client.query(pQuery, [a.answer_id])
            }))
          })
          .then(res => {
            let photos = res.flatMap(p => p.rows);

            for (let p of photos) {
              answers[p.answer_id].photos.push(p.url);
            }

            for (let a in answers) {
              response.results.push(answers[a]);
            }

            return response;
          })
          .catch(err => {
            client.release();
            console.log(err);
          })
      })
  }
};



// get all questions from product id and reported = 0
// all the info to an object
// then get all answers from all returned questions
// "email": "first.last@gmail.com",

// "product_id": 3,

// {
//   "question_id": 21,
//   "question_body": "Is it noise cancelling?",
//   "question_date": "1608732209572",
//   "asker_name": "jbilas",
//   "question_helpfulness": 4
//   "reported": 1,
// },

// "question_id": 183056,
// "question_body": "whattttt???",
// "question_date": "2021-04-25T00:00:00.000Z",
// "asker_name": "testing",
// "question_helpfulness": 9,
// "reported": false,