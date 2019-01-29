const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const User = require('./src/models/Users');
const hbs = require('express-handlebars'); 
const path = require('path'); 

const app = express();
app.set('port', 9000);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({
  key: 'user_sid',
  secret: 'somescreen',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000,
  },
}));

app.engine('hbs', hbs({ extname: 'hbs',defaultLayout: 'layout', layoutsDir: `${__dirname}/src/views/layouts` })); 
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'hbs');

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user)
    return res.clearCookie('user_sid');

  return next();
});

const hbsContent = { userName: '', loggedin: false, title: 'You are not logged', body: 'Hello World' };
const sessionChecker = (req, res, next) => {
  if (req.cookies.user_sid && req.session.user)
    return res.redirect('/dashboard');

  return next();
};

app.get('/', sessionChecker, (req, res) => {
  res.redirect('/login');
});

app.route('/signup')
  .get((req, res) => {
    res.render('signup', hbsContent);
  })
  .post((req, res) => {
    const { username, password, email } = req.body;
    User.create({
      username,
      password,
      email,
    })
    .then(user => {
      req.session.user = user.dataValues;
      res.redirect('/dashboard');
    })
    .catch(err => console.log('Error', err));
});

app.route('/login')
  .get(sessionChecker, (req, res) => {
    res.render('login', hbsContent);
  })
  .post((req, res) => {
    const { username, password } = req.body;
    User.findOne({ where: { username } })
      .then(user => {
        if (!user)
          return res.redirect('/login');
        if (!user.validPassword(password))
          return res.redirect('/login');
        
        req.session.user = user.dataValues;
        return res.redirect('/dashboard');
      })
    .catch(err => console.log('Error', err));
});

app.get('/dashboard', (req, res) => {
  const { user } = req.session;
  const { cookies } = req;
  if (!user && !cookies.user_sid)
    return res.redirect('/login');
  
  hbsContent.loggedin = true;
  hbsContent.userName = user.username;
  hbsContent.title = "You are Logged in!";
  res.render('index', hbsContent);
});

app.get('/logout', (req, res) => {
  const { user } = req.session;
  const { cookies } = req;
  if (!user && !cookies.user_sid)
    return res.redirect('/login');
  
  hbsContent.loggedin = false;
  hbsContent.title = "You are Logged out!";
  res.clearCookie('user_sid');
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).send("Can't Find that");
});

app.listen(app.get('port'), () => console.log(`App Started on port ${app.get('port')}`));
