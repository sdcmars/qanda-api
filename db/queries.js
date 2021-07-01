/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const pool = require('./index.js');

pool.connect()
  .then(console.log('connected to db'))
  .catch(e => console.log(e));

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
                if (p.a_id === a.answer) {
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

    const query = `
      SELECT answer_id, body, date, answerer_name, helpfulness
      FROM answers
      WHERE answers.q_id = $1 AND answers.reported = 0
      LIMIT ${count} OFFSET ${(page - 1) * count};
    `;

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
            client.release();

            let photos = res.flatMap(p => p.rows);

            for (let p of photos) {
              answers[p.a_id].photos.push(p.url);
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
  },
  getQs: ({ product_id, count, page }) => {
    count = count || 5;
    page = page || 1;

    // DISTINCT ON (q.question_id)
    // need to fix the limit and offset for the join
    const query =`
      WITH
        count_qs AS (
          SELECT
            q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness
          FROM questions q
          WHERE q.product_id = $1 AND q.reported = 0
          ORDER BY q.question_id
          LIMIT ${count} OFFSET ${(page - 1) * count}
        )
      SELECT
        question_id, question_body, question_date, asker_name, question_helpfulness,
        a.answer_id, a.q_id, a.body, a.date, a.answerer_name, a.helpfulness,
        p.a_id, p.id, p.url
      FROM count_qs
      LEFT JOIN
        answers a ON count_qs.question_id = a.q_id AND a.reported = 0
      LEFT JOIN
        photos p ON a.answer_id = p.a_id;
      `;

    const value = [product_id];

    let response = {
      product_id: product_id,
      results: []
    }

    return pool.query(query, value)
      .then(res => {

        let rows = res.rows;
        let questions = {};
        let answers = {};
        let photos = {};

        for (let x of rows) {
          questions[x.question_id] = {
            question_id: x.question_id,
            question_body: x.question_body,
            question_date: new Date(Number(x.question_date)),
            asker_name: x.asker_name,
            question_helpfulness: x.question_helpfulness,
            answers: {}
          };

          if (x.answer_id) {
            answers[x.answer_id] = {
              answer_id: x.answer_id,
              question: x.q_id,
              body: x.body,
              date: new Date(Number(x.date)),
              answerer_name: x.answerer_name,
              helpfulness: x.helpfulness,
              photos: []
            }
          }

          if (x.id) {
            photos[x.id] = {
              id: x.a_id,
              url: x.url
            }
          }

        }

        for (let p in photos) {
          answers[photos[p].id].photos.push(photos[p].url);
        }

        for (let a in answers) {
          questions[answers[a].question].answers[answers[a].answer_id] = answers[a];
          delete answers[a].question;
        }

        for (let q in questions) {
          response.results.push(questions[q]);
        }

        return response;

      })
      .catch(err => console.log(err));

  },
  getAs: ({ question_id, count, page }) => {
    count = count || 5;
    page = page || 1;

    const query = `
      SELECT
        a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness,
        p.a_id, p.url, p.id
      FROM answers a
      LEFT JOIN photos p
      ON a.answer_id = p.a_id
      WHERE a.q_id = $1 AND a.reported = 0
      ORDER BY a.answer_id;
    `;

    const value = [question_id];

    let response = {
      question: question_id,
      page: page,
      count: count,
      results: []
    }

    return pool.query(query, value)
      .then(res => {
        let rows = res.rows;

        let answers = {};
        let photos = {};

        for (let a of rows) {
          answers[a.answer_id] = {
            answer_id: a.answer_id,
            body: a.body,
            date: new Date(Number(a.date)),
            answerer_name: a.answerer_name,
            helpfulness: a.helpfulness,
            photos: []
          }
          if (a.id) {
            photos[a.id] = {
              id: a.a_id,
              url: a.url
            }
          }
        }
        console.log(answers);

        for (let p in photos) {
          answers[photos[p].id].photos.push(photos[p].url);
        }

        for (let a in answers) {
          response.results.push(answers[a]);
        }

        let start = (page - 1) * count;
        let end = start + count;
        response.results = response.results.slice(start, end);

        console.log(answers);

        return response;


      //   {
      //     "answer_id": 1991604,
      //     "body": "what is your question?",
      //     "date": "2021-06-14T00:00:00.000Z",
      //     "answerer_name": "hmm",
      //     "helpfulness": 6,
      //     "photos": []
      // },
      })
      .catch(e => console.log(e));
  },
  add: (info) => {
    let columns;
    let values;

    if (info.type === 'questions') {
      columns = 'question_id, product_id, question_body, question_date, asker_name, email';
      values = `nextval('question_id_seq'), ${info.product_id}, '${info.body}', '${Date.now()}', '${info.name}', '${info.email}'`
    } else if (info.photos) {
      // look into CTEs for adding to two tables at once
      // currently front end doesn't accept photo upload
      columns = '?';
      values = '?';
    } else {
      columns = 'answer_id, q_id, body, date, answerer_name, email';
      values = `nextval('answer_id_seq'), '${info.question_id}', '${info.body}', ${Date.now()}, '${info.name}', '${info.email}'`
    }

    const query = `
      INSERT INTO ${info.type} (${columns})
      VALUES (${values})
      RETURNING *;
      `;

    return pool.query(query)
      .then(res => res.rows)
      .catch(e => console.log(e));

  },
  report: (id, table) => {
    let column = table === 'questions' ? 'question_id' : 'answer_id';

    const query =`
      UPDATE ${table}
      SET reported = 1
      WHERE ${column} = ${id}
      RETURNING *;
    `;

    return pool.query(query)
      .then(res => res.rows)
      .catch(e => console.log(e));
  },
  help: (id, table) => {
    let idCol, helpCol;

    if (table === 'questions') {
      idCol = 'question_id';
      helpCol = 'question_helpfulness';
    } else {
      idCol = 'answer_id';
      helpCol = 'helpfulness';
    }

    const query = `
      UPDATE ${table}
      SET ${helpCol} = ${helpCol} + 1
      WHERE ${idCol} = ${id}
      RETURNING *;
    `;

    return pool.query(query)
      .then(res => res.rows)
      .catch(e => console.log(e));
  },
  getQuestionsAgg: ({ product_id, count, page }) => {
    count = count || 5;
    page = page || 1;

    const query =`
    SELECT
      q.question_id,
      q.question_body,
      q.question_date,
      q.asker_name,
      q.question_helpfulness,
      ARRAY_AGG(json_build_object('answer_id', a.answer_id, 'body', a.body, 'date', a.date, 'answerer_name', a.answerer_name, 'helpfulness', a.helpfulness)) answers,
      ARRAY_REMOVE(ARRAY_AGG(p.url), NULL) photos
    FROM questions q
    LEFT JOIN answers a
      ON q.question_id = a.q_id
    LEFT JOIN photos p
      ON a.answer_id = p.a_id
    WHERE q.product_id = $1
    ORDER BY q.question_id
    GROUP BY q.question_id;
      `;

    const value = [product_id];

    let response = {
      product_id: product_id,
      results: []
    }

    return pool.query(query, value)
      .then(res => {
        let rows = res.rows;
        return rows;
      })
      .catch(e => console.log(e));
  },
  getAnswersAgg: ({ question_id, count, page }) => {
    count = count || 5;
    page = page || 1;

    const query = `
      SELECT
        a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness,
        ARRAY_REMOVE(ARRAY_AGG(p.url), NULL) photos
      FROM answers a
      LEFT JOIN photos p
        ON a.answer_id = p.a_id
      WHERE a.q_id = $1
      GROUP BY a.answer_id
      ORDER BY a.answer_id
      LIMIT ${count} OFFSET ${(page - 1) * count};
    `;

    const value = [question_id];

    return pool.query(query, value)
      .then(res => {
        let rows = res.rows;
        let response = {
          question: question_id,
          page: page,
          count: count,
          results: rows
        }

        return response;

      })
      .catch(e => console.log(e));
  }
};
