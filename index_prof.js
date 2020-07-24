if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

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
  connectionString: process.env.DATABASE_URL
  // ||
  // 'postgres://postgres:andy1999@localhost/account'
})

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => pool.query(`SELECT * FROM users WHERE email = '${email}'`),
  id => pool.query(`SELECT * FROM users WHERE id = '${id}'`)
)

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))
app.use(flash())
app.use(session({
  secret: "this should be in .env",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var http = require('http'),
    fs = require('fs');
//---------------------------------------------------------------------

app.get('/about', (req,res) => {
  res.sendFile(path.resolve('./public/homepage.html'));
})

// display all contents
app.get('/', checkAuthenticated, (req, res) => {
  const getPostQuery = `SELECT * FROM id_${req.user.id}`;
  pool.query(getPostQuery , (error,result) => {
      if (error) {
        console.log(error);
      }
      var results = {'rows':result.rows, name: req.user.name}
      res.render('pages/index',results)

      // res.render('pages/index', {'list':JSON.stringify(result.rows)})
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('pages/login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('pages/register')
})

app.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const id = Date.now().toString()
    const addUserQuery = {
      text:`INSERT INTO users (id,name,email,password) VALUES ($1,$2,$3,$4)`,
      values: [id, req.body.name, req.body.email, hashedPassword]
    }
    pool.query(addUserQuery, (error,result) => {
      if (error) {
        res.end(error)
      }
      console.log('added user')
    })

    // date for data type: '2020-08-01'(insert like that)
    // time data type: "5:03:51"
    const createUserTable = `CREATE TABLE id_${id} (id serial primary key, title text, description text,
      day date, start_time time, end_time time)`
    pool.query(createUserTable, (error,result) => {
      if (error) {
        res.end(error)
      }
      console.log('created user table')
    })

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

// add an event
app.post('/post', (req, res) => {
  const postQuery = {
    text:`INSERT INTO id_${req.user.id} (title, description, day, start_time, end_time) VALUES ($1,$2,$3,$4,$5)`,
    values: [req.body.title, req.body.description, req.body.day, req.body.start_time, req.body.end_time]
  }
  pool.query(postQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('added post')
  })
  res.redirect('/')
})

app.post('/edit', (req, res) => {
  const editQuery = {
    text:`UPDATE id_${req.user.id} SET title=$1, description=$2, day=$3, start_time=$4, end_time=$5 WHERE id=$6`,
    values: [req.body.title, req.body.description, req.body.day, req.body.start_time, req.body.end_time, req.body.id]
  }
  pool.query(editQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('edited post')
  })
  res.redirect('/')
})

app.post('/del', (req, res) => {
    const delQuery = {
      text: `DELETE FROM id_${req.user.id} WHERE id=$1`,
      values: [req.body.id]
    }
    pool.query(delQuery, (error,result) => {
      if (error) {
        console.log(error);
      }
      console.log('deleted post')
    })
    res.redirect('/')
  })

// view_list page
app.get('/list',(req, res)=>{
  const getPostQuery = `SELECT * FROM id_${req.user.id}`;
  pool.query(getPostQuery , (error,result) => {
      if (error) {
        console.log(error);
      }
      var results = {'rows':result.rows}
      res.render('pages/list', results)
    })
})


app.delete('/logout', (req, res) => {
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

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
