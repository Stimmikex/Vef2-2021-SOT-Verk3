import express from 'express';
import dotenv from 'dotenv';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { query } from './db.js';
import passport from 'passport';
import session from 'express-session';
import { Strategy } from 'passport-local';
import { comparePasswords, findByUsername, findById } from './users.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

// TODO setja upp rest af virkni!

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({
  extended: true,
}));

async function getData(low, high) {
  let data = await query(`SELECT * FROM signatures ORDER BY signed DESC LIMIT ${low} OFFSET ${high};`);
  console.log(data);
  data = data.rows;
  try {
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return 'No Data';
}

async function getAmountOfData() {
  const data = await query('SELECT COUNT(*) FROM signatures');
  try {
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return 'No Data';
}

function checker(check) {
  if (check === 'on') {
    return true;
  }
  return false;
}

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
let errorMessages = '';
let curPage = 0;

app.get('/', async (req, res) => {
  const data = await getData(50, 1);
  curPage = 0;
  const amount = await getAmountOfData();
  try {
    res.render('index', { title: 'Undirskriftarlisti', data, errorMessages, amount, curPage });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
});

app.post(
  '/',
  // Þetta er bara validation, ekki sanitization
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn er of langt'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('text'),
  body('check'),

  async (req, res, next) => {
    // const {
    //   name = '',
    //   nationalId = '',
    //   text = '',
    //   check = '',
    // } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errorMessages = errors.array().map((i) => i.msg);
      // return res.send(
      //   `
      //   <p>Villur:</p>
      //   <ul>
      //     <li>${errorMessages.join('</li><li>')}</li>
      //   </ul>
      // `,
      // );
      return res.redirect('/');
    }
    return next();
  },
  /* Nú sanitizeum við gögnin, þessar aðgerðir munu breyta gildum í body.req */
  // Fjarlægja whitespace frá byrjun og enda
  // „Escape“ á gögn, breytir stöfum sem hafa merkingu í t.d. HTML í entity
  // t.d. < í &lt;
  body('name').trim().escape(),

  // Fjarlægjum - úr kennitölu, þó svo við leyfum í innslátt þá viljum við geyma
  // á normalizeruðu formi (þ.e.a.s. allar geymdar sem 10 tölustafir)
  // Hér gætum við viljað breyta kennitölu í heiltölu (int) en... það myndi
  // skemma gögnin okkar, því kennitölur geta byrjað á 0
  body('nationalId').blacklist('-'),

  body('text').trim().escape(),

  async (req, res) => {
    const {
      name,
      nationalId,
      text,
      check,
    } = req.body;

    const xssName = xss(name);
    const xssNational = xss(nationalId);
    const xssText = xss(text);

    const test = await query('INSERT INTO signatures(name, nationalId, comment, anonymous) VALUES($1, $2, $3, $4) RETURNING *', [xssName, xssNational, xssText, checker(check)]);

    if (test.detail) {
      errorMessages = [test.detail];
    }
    return res.redirect('/');
  },
);

const sessionSecret = 'leyndarmál';

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 20 * 1000, // 20 sek
}));

/**
 * Athugar hvort username og password sé til í notandakerfi.
 * Callback tekur við villu sem fyrsta argument, annað argument er
 * - `false` ef notandi ekki til eða lykilorð vitlaust
 * - Notandahlutur ef rétt
 *
 * @param {string} username Notandanafn til að athuga
 * @param {string} password Lykilorð til að athuga
 * @param {function} done Fall sem kallað er í með niðurstöðu
 */
async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user);
    return done(null, result);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

// Notum local strategy með „strattinu“ okkar til að leita að notanda
passport.use(new Strategy(strat));

// getum stillt með því að senda options hlut með
// passport.use(new Strategy({ usernameField: 'email' }, strat));

// Geymum id á notanda í session, það er nóg til að vita hvaða notandi þetta er
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Sækir notanda út frá id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Látum express nota passport með session
app.use(passport.initialize());
app.use(passport.session());

// Gott að skilgreina eitthvað svona til að gera user hlut aðgengilegan í
// viewum ef við erum að nota þannig
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

// app.get('/', (req, res) => {
//   if (req.isAuthenticated()) {
//     // req.user kemur beint úr users.js
//     return res.send(`
//       <p>Innskráður notandi er ${req.user.username}</p>
//       <p>Þú ert ${req.user.admin ? 'admin.' : 'ekki admin.'}</p>
//       <p><a href="/logout">Útskráning</a></p>
//       <p><a href="/admin">Skoða leyndarmál</a></p>
//     `);
//   }

//   return res.send(`
//     <p><a href="/login">Innskráning</a></p>
//   `);
// });

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  // Ef við breytum name á öðrum hvorum reitnum að neðan mun ekkert virka
  // nema við höfum stillt í samræmi, sjá línu 64
  return res.send(`
    <form method="post" action="/login" autocomplete="off">
      <label>Notendanafn: <input type="text" name="username"></label>
      <label>Lykilorð: <input type="password" name="password"></label>
      <button>Innskrá</button>
    </form>
    <p>${message}</p>
  `);
});

app.get('/0', async (req, res) => {
  return res.redirect('/');
});

app.get('/:data?', async (req, res) => {
  const id = req.params.data;
  curPage = id;
  const data = await getData(50, curPage * 50);
  const amount = await getAmountOfData();
  try {
    res.render('index', { title: 'Undirskriftarlisti', data, errorMessages, amount, curPage });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
});

app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
