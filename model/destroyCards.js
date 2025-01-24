const pool = require("../db/config");

const destroCards = async () => {
  const querySel = "DELETE FROM open_card";
  const [rows] = await pool.execute(querySel);
  return rows;
};

module.exports = destroCards;
