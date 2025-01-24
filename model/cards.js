const pool = require("../db/config");

const cards = async () => {
  const querySel = "SELECT * FROM open_card ORDER BY time DESC";
  const [rows] = await pool.execute(querySel);
  return rows;
};

module.exports = cards;
