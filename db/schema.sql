DROP DATABASE IF EXISTS qanda;

CREATE DATABASE qanda;

\c qanda;

CREATE TABLE questions (
  question_id int serial primary key,
  product_id int not null,
  question_body varchar(1000) not null,
  question_date text not null,
  asker_name varchar(60) not null,
  email varchar(60) not null,
  reported int default 0,
  question_helpfulness int default 0
);

CREATE TABLE answers (
  answer_id int serial primary key,
  question_id int references questions (question_id),
  body varchar(1000) not null,
  date text,
  answerer_name varchar(60),
  email varchar(60),
  reported int default 0,
  helpfulness int default 0
);

CREATE TABLE photos (
  id int primary key,
  answer_id int references answers (answer_id),
  url text not null
);