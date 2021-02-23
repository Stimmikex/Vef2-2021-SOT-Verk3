import { query } from './db.js';
/**
 * Function that gets limited data based on the users input of low and hight keys
 * @param {low} low end of the data by id
 * @param {higt} high end of the data by id
 */
export async function getData(low, high) {
  let data = await query(`SELECT * FROM signatures ORDER BY signed DESC LIMIT ${low} OFFSET ${high};`);
  data = data.rows;
  try {
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return 'No Data';
}

export async function deleteData(id) {
  await query(`DELETE FROM signatures WHERE id = ${id};`);
}

export async function getAmountOfData() {
  const data = await query('SELECT COUNT(*) FROM signatures');
  try {
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return 'No Data';
}