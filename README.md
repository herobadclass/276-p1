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
    user
    user in a group

  STORIES:
    Sign up:
      user opens the application and redirected to the login page
      user clicks the register button and is redirected to the register page
      user creates an account, account is logged into the database, user is redirected to the login page

    Log in:
      user opens the application or successfully created an account is directed to the login page
      user inputs email and password and clicks the log in button
      upon successful login user will be redirected to their landing page
      if email or password is wrong the login page will be reloaded with error message informing user of the issue

    Create list:
      after a user is logged in
      they enters a list name and presses the enter key or the + button next to the input field
      upon submitting the list name a new row is created in the accounts database table
      page is reloaded with the new list displayed in the list container

    Select list:
      after a user is logged in and there is a list in the list container
      they select a list by clicking on the name of the list
      upon selecting a list, the list title, lists tasks, and number of remaining tasks in the list will be displayed along with a form to create new tasks and button to delete the list

    Delete list:
      after a user is logged in, there is a list in the list container and a list is selected
      they click the delete list button and the current list will be removed from the user database table
      page is reloaded without the deleted list in the list container

    Create task:
      after a user is logged in, there is a list in the list container and a list is selected
      they enter a task name and press the enter key or the + button next to the input field
      upon submitting the task will be appended to the jsonb array in the tasks column of the list's row in the users database table
      page will be reloaded with the new task displayed in the task container

    Toggle task:
      after a user is logged in, there is a list in the list container, a list is selected and there is a task in the task container
      they click the check box or the task and the task will be checked and crossed off or unchecked and not crosses off
      change is saved to the jsonb array in the tasks column of the list's row in the users database table
      page is reloaded with the task toggled/untoggled in the task container

    Delete task:
      after a user is logged in, there is a list in the list container, a list is selected and there is a task in the task container
      they click the x button next to the task
      upon clicking the button the task will be removed from the jsonb array in the tasks column of the list's row in the user database table
      page will be reloaded without the deleted task in the task container
#DATABASES
login/register: create table users(id text, name text, email text, password text)
