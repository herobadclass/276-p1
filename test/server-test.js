const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()

chai.use(chaiHttp)

 // steps required to do inorder to tests the following functions OR use index-test.js instead of index.js
 // test in 3 parts as labled below, functions get executed out of order
 // 1. comment out line 338 in index.js
 // 2. replace line 173 with "values: [req.body.id , req.body.name, req.body.email, hashedPassword]"
 // 3. replace line 180 with "const createUserListTable = `CREATE TABLE list_${req.body.id} (id text, name text, tasks JSONB)`"
 // 4. replace line 194 with "text:`INSERT INTO list_${req.body.userid} (id,name,tasks) VALUES ($1,$2,$3)`,"
 // 5. replace line 205 with "text:`DELETE FROM list_${req.body.userid} WHERE id = $1`,"
 // 6. replace line 217 with "text: `UPDATE list_${req.body.userid} SET tasks = tasks || $1::JSONB WHERE id = $2`,"
 // 7. replace line 230, 234 "${req.user.id}" with "${req.body.id}"
 // 8. replace line 458, 252 "${req.user.id}" with "${req.body.id}"
 // 9. replace line 268 with "const id = req.body.id"

// PART 1
// describe('register', function() {
//   it('should add a single user into users on successful POST request for /register', function(done) {
//     chai.request(server).get('/user_count').end(function (err, res) {
//       var num_users0 = res.text
//       chai.request(server).post('/register').send({'id':1,'name':'test','email':'test@test','password':'test'})
//         .end(function(err,res) {
//           chai.request(server).get('/user_count').end(function (err, res) {
//             var num_users1 = res.text
//             var difference = (num_users1 - num_users0)
//             difference.should.equal(1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('login', function() {
//   it('should redirect a user to their page on successful POST request for /login', function(done) {
//     chai.request(server).post('/login').send({'email':'test@test','password':'test'})
//       .end(function(err,res) {
//         var redirect = res.redirects[0]
//         redirect = redirect.split('/').pop()
//         redirect.should.equal('')
//         done()
//       })
//   })
// })

// PART 2
// describe('add list', function() {
//   it('should add a single list into list_%{req.user.id} on successful POST request for /add_list', function(done) {
//     chai.request(server).get('/list_count').end(function (err, res) {
//       var num_lists0 = res.text
//       chai.request(server).post('/add_list').send({'userid':1,'id':2,'name':'list_test','tasks':[]})
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
// describe('add task', function() {
//   it('should add a single task into array in tasks column of listId row from list_%{req.user.id} on successful POST request for /add_task', function(done) {
//     chai.request(server).get('/task_count').end(function (err, res) {
//       var num_task0 = res.text
//       chai.request(server).post('/add_task').send({'userid':1,'listId':'2','id':3,'name':'task_test','complete':false})
//         .end(function(err,res) {
//           chai.request(server).get('/task_count').end(function (err, res) {
//             var num_task1 = res.text
//             var difference = (num_task1 - num_task0)
//             difference.should.equal(1)
//           })
//           done()
//         })
//     })
//   })
// })
// describe('update complete', function() {
//   it('should change complete property for task object in tasks column of listId row from list_%{req.user.id} on successful POST request for /update_complete', function(done) {
//     chai.request(server).post('/update_complete').send({'id':1,'list_id':2,'task_id':3,'complete':true})
//       .end(function(err,res) {
//         chai.request(server).get('/task_complete').end(function (err, res) {
//           var task_complete = res.text
//           task_complete.should.equal('true')
//         })
//         done()
//       })
//   })
// })

// PART 3
// describe('delete task', function() {
//   it('should remove a single task from array in tasks column of listId row from list_%{req.user.id} on successful POST request for /del_task', function(done) {
//     chai.request(server).get('/task_count').end(function (err, res) {
//       var num_task0 = res.text
//       chai.request(server).post('/del_task').send({'id':1,'list_id':2,'task_id':3})
//         .end(function(err,res) {
//           chai.request(server).get('/task_count').end(function (err, res) {
//             var num_task1 = res.text
//             var difference = (num_task1 - num_task0)
//             difference.should.equal(-1)
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
//       chai.request(server).post('/del_list').send({'userid':1,'id':2})
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
// describe('delete account', function() {
//   it('should remvoe a single user from users and delete their list table on successful POST request for /del_user', function(done) {
//     chai.request(server).get('/user_count').end(function (err, res) {
//       var num_users0 = res.text
//       chai.request(server).post('/del_user').send({'id':1})
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
