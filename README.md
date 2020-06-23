# Project Proposal
BANANA
Requirements and Specification Document
06/23/2020, version 0

PROJECT ABSTRACT
Routine is an online web application, akin to a to-do list, that reminds users of daily tasks they intend to finish. Users will be able to add, edit and delete the tasks on their list and their group members lists. Set tasks as completed or uncompleted, to be time sensitive, to continuously reappear; resetting at a certain time, and more. This application is designed to help users stay productive and organized.

CUSTOMER
This application has a wide range of users as it is designed to help individuals stay productive and keep their day organized. People who like to stay organized and plan their day can use this application to do so. People who usually forget what they need to do next or are unsure of what task to prioritize can use this application.

COMPETITIVE ANALYSIS
There are many competitors with similar applications that carry out the same general purpose of our application. One of the most notable ones are Keep and Calendar from Google which share similar functionality with our application. One of the main features that sets our application apart from others is the ability to set tasks to “reset” at a certain time, and the group functionality.

USER STORIES
Actors:
regular user
regular user in a group
administrator

STORIES:
Sign up:
regular user opens application and greeted with login page
regular user creates an account and account is logged into the database
regular user logs in and greeted by their landing page

Log in:
regular user creates task and task appears on landing page
regular user edits task and task on landing page updated
regular user deletes task and task is removed from landing page

# node-js-getting-started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
