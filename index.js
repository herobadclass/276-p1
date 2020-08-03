if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var thisUser;

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
var sessionID;
var userSessions = [];

io.on('connection', function(socket){
  console.log('a user connected');
  sessionID = socket.id;

  userSessions.push({id:sessionID, name:thisUser.name, mail:thisUser.email});
  io.emit('new user', sessionID, userSessions);

  // waiting for client to send signal
  socket.on('type chat message', (name,msg) => {
    io.emit('get chat message', name, msg);
  });

  socket.on('specified user', (id, name,msg) =>{
    socket.to(id).emit('whisper', id, name, msg);
  })

  socket.on('get user list', (id,list) =>{
    io.to(id).emit('get current users', id,list);
  })

  socket.on('disconnect', () =>{
    sessionID = socket.id;
    for (var i = 0; i < userSessions.length; i++) {
      if(sessionID == userSessions[i].id){
        userSessions.splice(i,1);
      }
    }
    io.emit('user disconnected', sessionID, userSessions);
  })

  // io.to(sessionID).emit('bleh', 'HI!!!!!');

});

app.get('/about', (req,res) => {
  res.sendFile(path.resolve('./public/homepage.html'));
})

app.get('/user_count', (req, res) => {
  const getUserCountQuery = 'SELECT * FROM users'
  pool.query(getUserCountQuery, (error,result) => {
    if (error) res.end(error)
    var results = result.rows.length
    res.send(`${results}`)
  })
})

app.get('/database', (req,res) => {
  var getUsersQuery = 'SELECT * FROM users';
  pool.query(getUsersQuery, (error, result) => {
    if(error) res.end(error);
    var results = {'rows':result.rows}
    res.render('pages/db',results);
  })
});

app.get('/', checkAuthenticated, (req, res) => {
  const getListQuery = `SELECT * FROM list_${req.user.id}`
  const getUsersQuery = `SELECT * FROM users`
  var USERS;
  pool.query(getUsersQuery, (error, result) =>{
    if (error) res.end(error)
    USERS = {'users':result.rows};
  })
  pool.query(getListQuery , (error,result) => {
    if (error) res.end(error)
    thisUser = req.user;
    res.render('pages/index', {'list':JSON.stringify(result.rows), username: req.user.name, USERS:JSON.stringify(USERS)})
    console.log(USERS);
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
      values: [id , req.body.name, req.body.email, hashedPassword]
    }
    pool.query(addUserQuery, (error,result) => {
      if (error) res.end(error)
      console.log('added user')
    })

    const createUserListTable = `CREATE TABLE list_${id} (id text, name text, tasks JSONB)`
    pool.query(createUserListTable, (error,result) => {
      if (error) res.end(error)
      console.log('created user list table')
    })

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.post('/add_list', (req, res) => {
  const addListQuery = {
    text:`INSERT INTO list_${req.user.id} (id,name,tasks) VALUES ($1,$2,$3)`,
    values: [req.body.id, req.body.name, JSON.stringify(req.body.tasks)]
  }
  pool.query(addListQuery, (error,result) => {
    if (error) res.end(error)
    console.log('added list')
  })
})
app.post('/del_list', (req, res) => {
  const delListQuery = {
    text:`DELETE FROM list_${req.user.id} WHERE id = $1`,
    values: [req.body.id]
  }
  pool.query(delListQuery, (error,result) => {
    if (error) res.end(error)
    console.log('deleted list')
  })
})

app.post('/add_task', (req, res) => {
  const addTaskQuery = {
    text: `UPDATE list_${req.user.id} SET tasks = tasks || $1::JSONB WHERE id = $2`,
    values: [{id: req.body.id, name: req.body.name, complete: req.body.complete, day: req.body.day, time: req.body.time}, req.body.listId]
  }
  pool.query(addTaskQuery, (error,result) => {
    if (error) res.end(error)
    console.log('added task')
  })
})
app.post('/del_task', (req, res) => {
  const delTaskQuery =
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
    if (error) res.end(error)
    console.log('deleted task')
  })
  res.redirect('/')
})
app.post('/update_complete', (req, res) => {
  const saveCompleteQuery =
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
    if (error) res.end(error)
    console.log('saved complete')
  })
  res.redirect('/')
})

app.delete('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})
app.post('/del_user', (req,res) => {
  const id = req.user.id
  req.logout()
  const delUserQuery = `DELETE FROM users WHERE id='${id}'`
  pool.query(delUserQuery, (error,result) => {
    if (error) res.end(error)
    console.log(delUserQuery)
  })

  const dropUserTableQuery = `DROP TABLE list_${id}`
  pool.query(dropUserTableQuery, (error,result) => {
    if (error) res.end(error)
    console.log(dropUserTableQuery)
  })

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

function checkReset() {
  var today = new Date()
  var day = today.getDay()
  var hour = ("0" + today.getHours()).slice(-2)
  var minute = ("0" + today.getMinutes()).slice(-2)

  const getUsersQuery = `SELECT * FROM users`
  pool.query(getUsersQuery, (error, result) =>{
    if (error) res.end(error)
    result.rows.forEach(user => {
      const getListQuery = `SELECT * FROM list_${user.id}`
      pool.query(getListQuery , (error,result) => {
        if (error) res.end(error)
        result.rows.forEach(list => {
          list.tasks.forEach(task => {
            if (task.complete) {
              if (task.day.includes(day)) {
                if (task.time == hour + ':' + minute) {
                  var saveCompleteQuery =
                    `WITH task_complete AS (
                      SELECT ('{'||INDEX-1||',complete}')::TEXT[] AS PATH
                      FROM list_${user.id}, JSONB_ARRAY_ELEMENTS(tasks) WITH ORDINALITY arr(task, index)
                      WHERE task ->> 'id' = '${task.id}'
                      AND id = '${list.id}'
                    )
                    UPDATE list_${user.id}
                    SET tasks = JSONB_SET(tasks, task_complete.PATH, 'false', false)
                    FROM task_complete
                    WHERE id = '${list.id}';`
                  pool.query(saveCompleteQuery, (error,result) => {
                    if (error) res.end(error)
                    console.log('saved complete')
                  })
                }
              }
            }
          })
        })
      })
    })
  })
  setTimeout(checkReset,10000)
}
checkReset()

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))
module.exports = app
