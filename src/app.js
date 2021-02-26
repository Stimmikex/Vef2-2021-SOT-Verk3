import express from 'express';
import dotenv from 'dotenv';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import session from 'express-session';
import { Strategy } from 'passport-local';
import { query } from './db.js';
import { comparePasswords, findByUsername, findById } from './users.js';
import { getData, deleteData, getAmountOfData } from './dataimp.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({
  extended: true,
}));

function checker(check) {
  if (check === 'on') {
    return true;
  }
  return false;
}

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
let errorMessages = '';
let curPage = 0;
let usertest = '';

app.get('/', async (req, res) => {
  const data = await getData(50, 1);
  curPage = 0;
  const amount = await getAmountOfData();
  try {
    res.render('index', {
      title: 'Undirskriftarlisti',
      data,
      errorMessages,
      amount,
      curPage,
      usertest,
    });
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errorMessages = errors.array().map((i) => i.msg);
      return res.redirect('/');
    }
    return next();
  },
  body('name').trim().escape(),
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
    const result = await comparePasswords(password, user.password);

    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  // console.log('user :>> ', user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// function ensureLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }

//   return res.redirect('/login');
// }

// Gott að skilgreina eitthvað svona til að gera user hlut aðgengilegan í
// viewum ef við erum að nota þannig
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
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

app.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('/admin', async (req, res) => {
  if (req.isAuthenticated()) {
    curPage = 0;
    usertest = req.user;
    const data = await getData(50, curPage * 50);
    const amount = await getAmountOfData();
    try {
      res.render('admin', {
        title: 'Undirskriftarlisti - Admin',
        data,
        usertest,
        curPage,
        amount,
        errorMessages,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
  return res.redirect('/');
});

app.post('/delete/:data?', (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.data;
    deleteData(id);
    return res.redirect('/admin');
  }
  return res.redirect('/');
});

app.get('/logout', (req, res) => {
  usertest = '';
  req.logout();
  res.redirect('/');
});

app.get('/:data?', async (req, res) => {
  const id = req.params.data;
  curPage = id;
  if (id === '0') {
    return res.redirect('/');
  }
  const data = await getData(50, (curPage * 50));
  const amount = await getAmountOfData();
  try {
    return res.render('index', {
      title: 'Undirskriftarlisti',
      data,
      errorMessages,
      usertest,
      amount,
      curPage,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return 'no data';
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
