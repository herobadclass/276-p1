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
const cors = require('cors')


const { Pool } = require('pg')
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => pool.query(`SELECT * FROM users WHERE email = '${email}'`),
  id => pool.query(`SELECT * FROM users WHERE id = '${id}'`)
)

var fs = require('fs');

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
app.use('/', cors())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });

});

// http.listen(3000, () => {
//   console.log('listening on *:3000');
// });


app.get('/about', (req,res) => {
  res.sendFile(path.resolve('./public/homepage.html'));
})

app.get('/', checkAuthenticated, (req, res) => {
  const getListQuery = `SELECT * FROM list_${req.user.id}`
  const getUsersQuery = `SELECT * FROM users`
  var USERS;
  pool.query(getUsersQuery, (error, result) =>{
    if (error) {
      console.log(error);
    }
    USERS = {'users':result.rows};
    
  })
  pool.query(getListQuery , (error,result) => {
    if (error) 
      console.log(error); 
    res.render('pages/index', { 'list':JSON.stringify(result.rows), username: req.user.name, USERS:JSON.stringify(USERS)})
    console.log(USERS);
  })
})

// app.post('/',checkAuthenticated, (req, res) =>{
//   const getUsersQuery = `SELECT * FROM users`
//   var USERS;
//   pool.query(getUsersQuery, (error, result) =>{
//     if (error) {
//       console.log(error);
//     }
//     console.log("1");
//   })
// })


app.get('/database', (req,res) => {
  var getUsersQuery = 'SELECT * FROM users';
  pool.query(getUsersQuery, (error, result) => {
    if(error)
      res.end(error);
    var results = {'rows':result.rows}
    res.render('pages/db',results);
  })
});

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
      values: [id , req.body.name, req.body.email, hashedPassword]
    }
    pool.query(addUserQuery, (error,result) => {
      if (error) {
        res.end(error)
      }
      console.log('added user')
    })

    const createUserListTable = `CREATE TABLE list_${id} (id text, name text, tasks JSONB)`
    pool.query(createUserListTable, (error,result) => {
      if (error) {
        res.end(error)
      }
      console.log('created user list table')
    })

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.post('/del_user', (req,res) => {
  const id = req.user.id
  req.logout()
  const delUserQuery = `DELETE FROM users WHERE id='${id}'`
  pool.query(delUserQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log(delUserQuery)
  })

  const dropUserTableQuery = `DROP TABLE list_${id}`
  pool.query(dropUserTableQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log(dropUserTableQuery)
  })

  res.redirect('/login')
})

app.post('/add_list', (req, res) => {
  const addListQuery = {
    text:`INSERT INTO list_${req.user.id} (id,name,tasks) VALUES ($1,$2,$3)`,
    values: [Date.now().toString(), req.body.list, '[]']
  }
  pool.query(addListQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('added list')
  })
  res.redirect('/')
})
app.post('/del_list', (req, res) => {
  const delListQuery = {
    text:`DELETE FROM list_${req.user.id} WHERE id = $1`,
    values: [req.body.id]
  }
  pool.query(delListQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('deleted list')
  })
  res.redirect('/')
})

app.post('/save_complete', (req, res) => {
  var saveCompleteQuery =
    `WITH task_complete AS (
      SELECT ('{'||INDEX-1||',complete}')::TEXT[] AS PATH
      FROM list_${req.user.id}, JSONB_ARRAY_ELEMENTS(tasks) WITH ORDINALITY arr(task, index)
      WHERE task ->> 'id' = '${req.body.task_id}'
      AND id = '${req.body.list_id}'
    )
    UPDATE list_${req.user.id}
    SET tasks = JSONB_SET(tasks, task_complete.PATH, '${req.body.complete}', false)
    FROM task_complete
    WHERE id = '${req.body.list_id}';`
  pool.query(saveCompleteQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('saved complete')
  })
  res.redirect('/')
})

app.post('/add_task', (req, res) => {
  var addTaskQuery = {
    text: `UPDATE list_${req.user.id} SET tasks = tasks || $1::JSONB WHERE id = $2`,
    values: [{id: Date.now().toString(), name: req.body.task, complete: false}, req.body.id]
  }
  pool.query(addTaskQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('added task')
  })
  res.redirect('/')
})
app.post('/del_task', (req, res) => {
  var delTaskQuery =
    `WITH task_index AS (
      SELECT INDEX-1 AS INDEX
      FROM list_${req.user.id}, JSONB_ARRAY_ELEMENTS(tasks) WITH ORDINALITY arr(task, index)
      WHERE task ->> 'id' = '${req.body.task_id}'
      AND id = '${req.body.list_id}'
    )
    UPDATE list_${req.user.id}
    SET tasks = tasks - CAST(task_index.index AS INTEGER)
    FROM task_index
    WHERE id = '${req.body.list_id}'`
  pool.query(delTaskQuery, (error,result) => {
    if (error) {
      res.end(error)
    }
    console.log('deleted task')
  })
  res.redirect('/')
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

app.get('/user_count', (req, res) => {
  const getUserCountQuery = 'SELECT * FROM users'
  pool.query(getUserCountQuery, (error,result) => {
    if (error) {
      console.log(error);
    }
    var results = result.rows.length
    res.send(`${results}`)
  })
})

// app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
http.listen(PORT, () => console.log(`Listening on ${ PORT }`))
module.exports = app
