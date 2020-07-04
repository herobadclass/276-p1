
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const userByEmail = await getUserByEmail(email)
    if (userByEmail == null) {
      return done(null, false, { message: 'Email incorrect' })
    }
    try {
      if (await bcrypt.compare(password, userByEmail.rows[0].password)) {
        return done(null, userByEmail.rows[0])
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser( async (id, done) => {
    const userById = await getUserById(id)
    return done(null, userById.rows[0])
  })
}

module.exports = initialize
