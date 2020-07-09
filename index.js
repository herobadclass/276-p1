const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const { Pool } = require('pg')
var pool;
pool = new Pool({
  connectionString:
  process.env.DATABASE_URL || 'postgres://postgres:andy1999@localhost/account'
})

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => pool.query(`SELECT * FROM acc WHERE email = '${email}'`),
  id => pool.query(`SELECT * FROM acc WHERE id = '${id}'`)
)

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))
app.use(flash())
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var http = require('http'),
    fs = require('fs');

app.get('/', (req,res)=>{
  res.sendFile(path.resolve('./public/homepage.html'));
})

app.get('/After_login', checkAuthenticated, (req, res) => {
  res.render('pages/index', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('pages/login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/After_login',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('pages/register')
})

app.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const addUserQuery =
    {
    // `'${Date.now().toString()}', '${req.body.name}',
    //    '${req.body.email}', '${hashedPassword}'`
      text:`INSERT INTO acc (id,name,email,password) VALUES ($1,$2,$3,$4)`,
      values: [Date.now().toString(), req.body.name, req.body.email, hashedPassword]
    }
    pool.query(addUserQuery, (error,result) => {
      if (error) {
        res.end(error)
      }
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) =>{
  req.logout()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
// app.all('/display',(req,res)=>{
//   var queryString8 = `select * from acc`;
//   pool.query(queryString8,(error,result)=>{
//     if(error) res.send(error);
//     var results = {'rows':result.rows};
//     res.render('pages/db',results);
//   });
// });
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
