import faker from 'faker';
import { query } from './db.js';

function getRandomDate(from, to) {
  return new Date(from + Math.random() * (to - from));
}

function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeFaker() {
  let nottoday = Date.now() - 12096e5;
  const date = getRandomDate(Date.now(), nottoday);
  let name = '';
  let anon = false;
  if (getRandomNumberBetween(0, 1) === 1) {
    name = faker.lorem.sentence();
  }
  if (getRandomNumberBetween(0, 1) === 1) {
    anon = true;
  }
  const ssn = getRandomNumberBetween(0, 9999999999);
  let text = '';
  if (getRandomNumberBetween(0, 1) === 1) {
    text = faker.lorem.sentence();
  }
  let person = {
    date: date,
    name: name,
    ssn: ssn,
    text: text,
    anon: anon
  };
  return person;
}

function initData() {
  for (let i = 0; i < 500; i += 1) {
    const person = makeFaker();
    query('INSERT INTO signatures(name, nationalId, comment, anonymous, signed) VALUES($1, $2, $3, $4, $5) RETURNING *', [person.name, person.ssn, person.text, person.anon, person.date]);
  }
}

initData();
