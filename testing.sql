-- WITH answers_obj AS (
--   SELECT row_to_json(a)
--     FROM (
--       SELECT
--         a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness,
--         ARRAY_AGG (p.url) photos
--       FROM answers a
--       LEFT JOIN photos p
--         ON a.answer_id = p.a_id
--       GROUP BY a.answer_id
--     ) a
-- )

-- SELECT
--   q.question_id,
--   q.question_body,
--   q.question_date,
--   q.asker_name,
--   q.question_helpfulness,
--   ARRAY_AGG (row_to_json(a))
--   FROM (
--     SELECT
--       answer_id,
--       body,
--       date,
--       answerer_name,
--       helpfulness
--     FROM answers
--   ) a,
-- FROM questions q
-- LEFT JOIN answers a
--   ON q.question_id = a.q_id
-- WHERE q.product_id = 3
-- GROUP BY q.question_id;

-- WITH
--   count_qs AS (
--     SELECT
--       q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness
--     FROM questions q
--     WHERE q.product_id = 5 AND q.reported = 0
--     LIMIT 5
--   )
-- SELECT
--   count_qs.*,
--   ARRAY_AGG (
--     (select row_to_json(x)
--     from (
--       select answer_id, body, date, helpfulness from answers
--       ) x)
--   )
-- FROM count_qs
-- LEFT JOIN answers
--  ON count_qs.question_id = answers.q_id
-- GROUP BY count_qs.question_id, count_qs.question_body, count_qs.question_date, count_qs.asker_name, count_qs.question_helpfulness;

-- SELECT
--   q.question_id,
--   q.question_body,
--   q.question_date,
--   q.asker_name,
--   q.question_helpfulness,
--   ARRAY_AGG(rows_to_json(a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness)) answers,
--   ARRAY_AGG(p.url) photos
-- FROM questions q
-- LEFT JOIN answers a
--   ON q.question_id = a.q_id
-- LEFT JOIN photos p
--   ON a.answer_id = p.a_id
-- WHERE q.product_id = 1
-- GROUP BY q.question_id;