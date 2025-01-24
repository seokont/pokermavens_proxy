const pool = require("../db/config");

const setCards = async (data, timing) => {
  const query = `INSERT INTO open_card (cards, timing_id, time) VALUES (?, ?, NOW())`;
  await pool.execute(query, [JSON.stringify(data), timing]);
};

module.exports = setCards;
