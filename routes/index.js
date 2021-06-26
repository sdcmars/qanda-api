/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express');
const url = require('url');
const db = require('../db/queries.js');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/qa/questions*', (req, res) => {

  let data = url.parse(req.url, true);
  let path = data.pathname;

  // should it be data.query.question_id ?
  if (path.includes('answers')) {
    data.question_id = path.split('/')[3];
    db.getAnswers(data)
      .then(response => res.send(response))
      .catch(err => console.log(err));
  } else {
    return db.getQs(data.query)
      .then(response => res.send(response))
      .catch(err => console.log(err));
  }

});

app.post('/qa/questions', (req, res) => {

  let path = url.parse(req.url, true).pathname;
  let data = req.body;

  if (path.includes('answers')) {
    data.question_id = path.split('/')[3];
    data.type = 'answers';
    db.post(data)
      .then(response => res.send(resonse))
      .catch(e => console.log(e));
  } else {
    data.type = 'questions';
    db.post(data)
      .then(response => res.send(response))
      .catch(e => console.log(e));
  }
});

app.put('/qa/*', (req, res) => {

  let data = url.parse(req.url, true);
  let path = data.pathname;

  let type = path.split('/')[4]; // helpful or report

  console.log(type);
  res.end();

  if (path.includes('answers')) {
    // put answers w/ type
  } else {
    // put questions w/ type
  }
});



app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});


// get questions for product 19520
// /qa/questions?product_id=19520&count=100&page=1

// get answers for question 183056
// /qa/questions/183056/answers?count=100

// post question
// qa/questions

// post answer
// /qa/questions/:question_id/answers

// put question helpful/report
// /qa/questions/:question_id/:helpful || report

// put answer helpful/report
// /qa/answers/:answer_id/:helpful || report


// Url {
//   protocol: null,
//   slashes: null,
//   auth: null,
//   host: null,
//   port: null,
//   hostname: null,
//   hash: null,
//   search: '?count=100',
//   query: [Object: null prototype] { count: '100' },
//   pathname: '/qa/questions/183056/answers',
//   path: '/qa/questions/183056/answers?count=100',
//   href: '/qa/questions/183056/answers?count=100'
// }