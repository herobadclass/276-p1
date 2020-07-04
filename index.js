const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')

const { Pool } = require('pg')
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/login', (req, res) => {
  res.render('pages/login')
})

app.post('/login', (req, res) => {
})

app.get('/register', (req, res) => {
  res.render('pages/register')
})

app.post('/register', async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const addUserQuery = {
    text: `INSERT INTO users (id,name,email,password) VALUES ($1,$2,$3,$4)`,
    values: [Date.now().toString(), req.body.name, req.body.email, hashedPassword]
    }
    pool.query(addUserQuery, (error,result) => {
      if (error) {
        console.log(error);
      }
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
