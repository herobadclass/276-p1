const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()

chai.use(chaiHttp)

describe('register', function() {
  it('should add a single user into users on successful POST request for /register', function(done) {
    chai.request(server).get('/user_count').end(function (err, res) {
      var num_users0 = res.text
      chai.request(server).post('/register').send({'name':'test','email':'test@test','password':'test'})
        .end(function(err,res) {
          chai.request(server).get('/user_count').end(function (err, res) {
            var num_users1 = res.text
            var difference = (num_users1 - num_users0)
            difference.should.equal(1)
          })
          done()
        })
    })
  })
})
describe('login', function() {
  it('should redirect a user to their page on successful POST request for /login', function(done) {
    chai.request(server).post('/login').send({'email':'test@test','password':'test'})
      .end(function(err,res) {
        var redirect = res.redirects[0]
        redirect = redirect.split('/').pop()
        redirect.should.equal('')
        done()
      })
  })
})

// How the tests would be conducted if i find a way to set or get req.user.id
// describe('delete account', function() {
//   it('should remvoe a single user from users on successful POST request for /del_user', function(done) {
//     chai.request(server).get('/user_count').end(function (err, res) {
//       var num_users0 = res.text
//       chai.request(server).post('/del_user').send()
//         .end(function(err,res) {
//           chai.request(server).get('/user_count').end(function (err, res) {
//             var num_users1 = res.text
//             var difference = (num_users1 - num_users0)
//             difference.should.equal(-1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('add list', function() {
//   it('should add a single list into list_%{req.user.id} on successful POST request for /add_list', function(done) {
//     chai.request(server).get('/list_count').end(function (err, res) {
//       var num_lists0 = res.text
//       chai.request(server).post('/add_list').send({'name':'list_test','task':'[]'})
//         .end(function(err,res) {
//           chai.request(server).get('/list_count').end(function (err, res) {
//             var num_lists1 = res.text
//             var difference = (num_lists1 - num_lists0)
//             difference.should.equal(1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('delete list', function() {
//   it('should remove a single list from list_%{req.user.id} on successful POST request for /del_list', function(done) {
//     chai.request(server).get('/list_count').end(function (err, res) {
//       var num_lists0 = res.text
//       chai.request(server).post('/del_list').send({'id':`${req.body.id}`}) //req.body.id = id of list
//         .end(function(err,res) {
//           chai.request(server).get('/list_count').end(function (err, res) {
//             var num_lists1 = res.text
//             var difference = (num_lists1 - num_lists0)
//             difference.should.equal(-1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('add task', function() {
//   it('should add a single task into task column and list_id row of list_%{req.user.id} on successful POST request for /add_list', function(done) {
//     chai.request(server).get('/task_count').end(function (err, res) {
//       var num_lists0 = res.text
//       chai.request(server).post('/add_task').send({'name':'task_test','complete':false})
//         .end(function(err,res) {
//           chai.request(server).get('/task_count').end(function (err, res) {
//             var num_lists1 = res.text
//             var difference = (num_lists1 - num_lists0)
//             difference.should.equal(1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('delete list', function() {
//   it('should remove a single list from list_%{req.user.id} on successful POST request for /del_list', function(done) {
//     chai.request(server).get('/task_count').end(function (err, res) {
//       var num_tasks0 = res.text
//       chai.request(server).post('/del_task').send({'list_id':`${req.body.list_id}`,'task_id':`${req.body.task_id}`})
//         .end(function(err,res) {
//           chai.request(server).get('/task_count').end(function (err, res) {
//             var num_tasks1 = res.text
//             var difference = (num_tasks1 - num_tasks0)
//             difference.should.equal(-1)
//           })
//           done()
//         })
//     })
//   })
// })
