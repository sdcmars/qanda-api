/* eslint-disable no-undef */
const express = require('express');
const db = require('../db/queries.js');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  return db.getQuestions(3)
    .then(response => res.send(response))
    .catch(err => console.log(err));
});



app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});