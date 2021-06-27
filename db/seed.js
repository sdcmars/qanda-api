/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const path = require('path');
const copyFrom = require('pg-copy-streams').from;
const pool = require('./index');

//const { insertQuestions, insertAnswers, insertPhotos } = require('./queries.js');

const fileNameQ = '../data/questions.csv';
const filePathQ = path.join(__dirname, fileNameQ);
const copyCommandQ = `COPY questions FROM STDIN WITH DELIMITER ',' CSV HEADER`;

const fileNameA = '../data/answers.csv';
const filePathA = path.join(__dirname, fileNameA);
const copyCommandA = `COPY answers FROM STDIN WITH DELIMITER ',' CSV HEADER`;

const fileNameAP = '../data/answers_photos.csv';
const filePathAP = path.join(__dirname, fileNameAP);
const copyCommandAP = `COPY photos FROM STDIN WITH DELIMITER ',' CSV HEADER`;


const cleanup = () => {
  pool.end();
  process.exit();
};

// seed questions
// pool.connect(function(err, client, done) {
//   if (err) {
//     console.log('pool connect error: ', err);
//     return;
//   }

//   var stream = client.query(copyFrom(copyCommandQ));
//   var fileStream = fs.createReadStream(filePathQ);

//   fileStream.on('error', (err) => {
//     console.log('filestream error: ', err);
//     cleanup();
//   });

//   stream.on('error', (err) => {
//     console.log('stream error: ', err);
//     cleanup();
//   });

//   stream.on('end', () => {
//     console.log('complete');
//     cleanup();
//   });

//   fileStream.pipe(stream)
// })


// seed answers
// pool.connect(function(err, client, done) {
//   if (err) {
//     console.log('pool connect error: ', err);
//     return;
//   }

//   var stream = client.query(copyFrom(copyCommandA));
//   var fileStream = fs.createReadStream(filePathA);

//   fileStream.on('error', (err) => {
//     console.log('filestream error: ', err);
//     cleanup();
//   });

//   stream.on('error', (err) => {
//     console.log('stream error: ', err);
//     cleanup();
//   });

//   stream.on('end', () => {
//     console.log('complete');
//     cleanup();
//   });

//   fileStream.pipe(stream);
// })


// seed photos
pool.connect((err, client, done) => {
  if (err) {
    console.log('pool connect error: ', err);
    return;
  }

  const stream = client.query(copyFrom(copyCommandAP));
  const fileStream = fs.createReadStream(filePathAP);

  fileStream.on('error', (err) => {
    console.log('filestream error: ', err);
    cleanup();
  });

  stream.on('error', (err) => {
    console.log('stream error: ', err);
    cleanup();
  });

  stream.on('end', () => {
    console.log('complete');
    cleanup();
  });

  fileStream.pipe(stream);
})


// this gives the complete message but prevents the piping
// fileStream.on('end', () => {
//   console.log('complete');
//   cleanup();
// })