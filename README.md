## 0. Change Log
N/A

# Assessment 3 - Vanilla JS: LurkForWork

[Please see course website for full spec](https://cgi.cse.unsw.edu.au/~cs6080/NOW/assessments/assignments/ass3)

This assignment is due Friday the 4th of April, 8pm.

**Please run `./util/setup.sh` in your terminal before you begin. This will set up some checks in relation to the "Git Commit Requirements".**

## 2. The Task (Frontend)

Your task is to build a frontend for a UNSW rip-off version of the popular professional social networking tool [LinkedIn](https://linkedin.com/). If you haven't used this application before, we would recommend creating your own LinkedIn profile - it's probably good for your career anyway!

UNSW's rip-off of LinkedIn is called "LurkForWork". However, you don't have to build the entire application. You only have to build the frontend. The backend is already built for you as an express server built in NodeJS (see section 3.2).

Instead of providing visuals of what the frontend (your task) should look like, we instead are providing you with a number of clear and short requirements about expected features and behaviours.

The requirements describe a series of **screens**. Screens can be popups/modals, or entire pages. The use of that language is so that you can choose how you want it to be displayed. A screen is essentially a certain state of your web-based application.

### 2.1. Milestone 1 - Registration & Login (10%)

This focuses on the basic user interface to register and log in to the site.

#### 2.1.1. Login
 * When the user isn't logged in, the site shall present a login form that contains:
   * an email field (text)
   * a password field (password)
   * submit button to login
 * When the submit button is pressed, the form data should be sent to `POST /auth/login` to verify the credentials. If there is an error during login an appropriate error should appear on the screen.

#### 2.1.2. Registration
 * When the user isn't logged in, the login form shall provide a link/button that opens the register form. The register form will contain:
   * an email field (text)
   * a name field (text)
   * a password field (password)
   * a confirm password field (password) - not passed to the backend, but an error should be shown on submit if it doesn't match the other password
   * submit button to register
 * When the submit button is pressed, if the two passwords don't match the user should receive an error popup. If they do match, the form data should be sent to `POST /auth/register` to verify the credentials. If there is an error during registration an appropriate error should appear on the screen.

#### 2.1.3. Error Popup
 * Whenever the frontend or backend produces an error, there shall be an error popup on the screen with a message (either a message derived from the backend error response, or one meaningfully created on the frontend).
 * This popup can be closed/removed/deleted by pressing an "x" or "close" button.

#### 2.1.4. Home Page
* Once a user has registered or logged in, they should arrive on the home page.
* For now, the home page will be a blank screen that contains only a "logout" button visible at all times.
* When this logout button is pressed, it removes the token from the state of the website (e.g. local storage) and then sends the user back to the login screen.

### 2.2. Milestone 2 - Basic Feed (15%)

Milestone 2 focuses on fetching feed data from the API. A feed and it's associated content should only be accessible to logged in users.

#### 2.2.1. Basic Feed (Feed screen)

The application should present a "feed" of user content on the home page derived `GET /job/feed`. Note that the feed will only return information from people that the logged in user is watching.

The jobs should be displayed in reverse chronological order (most recent jobs first). 

Each job should display:
1. Who the job post was made by
2. When it was posted
  * If the job was posted today (in the last 24 hours), it should display how many hours and minutes ago it was posted
  * If the job was posted more than 24 hours ago, it should just display the date DD/MM/YYYY that it was posted
3. The job content itself. The job content includes the following:
  * An image to describe the job (jpg in base64 format) - can be any aspect ratio
  * A title for the new job
  * A starting date for the job (in the format DD/MM/YYYY) - it can't be earlier than today
  * How many likes it has (or none)
  * The job description text
  * How many comments the job post has

### 2.3. Milestone 3 - Advanced Feed (10%)
 
Milestone 3 focuses on a richer UX and will require some backend interaction.

#### 2.3.1. Show likes on a job
* Allow a user to see a list of all users who have liked a job. In terms of how it is displayed, consider your preferred user experience approach out of the following 3 options:
  * The list of names is visible on each job in the feed by default
  * The list of names is visible on a job in the feed if a show/hide toggle is clicked (hidden by default).
  * The list of names is visible in a popup, modal, or new screen, when a button/link is clicked on the feed.

#### 2.3.2. Show comments on a job
* Allow a user to see a list of all the comments on the job. Each comment should contain at minimum the user's name and their comment. In terms of how it is displayed, consider your preferred user experience approach out of the following 3 options:
  * The list of names and comments are visible on each job in the feed by default
  * The list of names and comments are visible on a job in the feed if a show/hide toggle is clicked (hidden by default).
  * The list of names and comments are visible in a popup, modal, or new screen, when a button/link is clicked on the feed.

#### 2.3.3. Liking a job
* A user can like a job on their feed and trigger a api request (`PUT /job/like`)
* For this milestone, it's OK if the like doesn't appear/update until the page is refreshed.

#### 2.3.4. Feed Pagination
* Users can page between sets of results in the feed using the position token with (`GET /job/feed`).
* Note: You will automatically receive marks for this section if you end up implementing the infinite scroll alternative in a later milestone.

### 2.4. Milestone 4 - Other users & profiles (15%)

Milestone 4 focuses predominately on user profiles and how users interact with them.

#### 2.4.1. Viewing others' profiles
* Let a user click on a user's name from a job, like, or comment, and be taken to a profile screen for that user.
* The profile screen should contain all information the backend provides for that particular user ID via (`GET /user`) (excludes the user ID).
* The profile should also display all jobs made by that person. The jobs shown should also show likes, comments, and be able to have likes/comments interacted with just like the feed screen.
* The profile should also display somewhere all other users this profile is watched by (information via `GET /user`). This should consist of a list of names (which for each name links to another profile), as well as a count somewhere on the page that shows the total number of users they are watched by.

#### 2.4.2. Viewing your own profile
* Users can view their own profile as if they would any other user's profile
* A link to the users profile (via text or small icon) should be visible somewhere common on most screens (at the very least on the feed screen) when logged in.

#### 2.4.3. Updating your profile
* Users can update their own personal profile via (`PUT /user`). This allows them to update their:
  * Email address
  * Password
  * Name
  * Image (uploading a file from your system)

#### 2.4.4. Watching / Unwatching
* Watching on user profiles:
  * When a logged in user is visiting another user's profile page, a button should exist that allows them to "watch" the other user (via `PUT /user/watch`).
  * If the logged in user already watches this person, an unwatch button should exist.
* Somewhere on the feed screen a button should also exist that prompts the user to enter an email address in a popup. When entered, the email address is sent to `PUT /user/watch` to watch that particular user.

### 2.5. Milestone 5 - Adding & updating content (10%)

Milestone 5 focuses on interacting with content and comments.

#### 2.5.1. Adding a job
* Users can upload a new job content from a modal, component, or seperate screen via (`POST /job`)
* Users can open this component, modal, or separate screen in a single or multiple places (at the very least on the feed screen), and should be easily and clearly accessible. User can add a job by providing:
  * A title for the new job
  * A starting date for the job (in the format DD/MM/YYYY)
  * The job description text
  * An image to describe the job

#### 2.5.2. Updating & deleting a job
* Users can update a job they made via (`PUT /job`)
  * Every single feed should have a update button that allows them to update the job (e.g. by new page or modal)
  * Any details of a job can be modified
  * This screen should also contain some form of save button
  * Update button will only visible to the job creator
* Users can delete a job they made via (`DELETE /job`)
  * Every single feed should have a delete button that allows them to delete the job 
  * Delete button will only visible to the job creator

#### 2.5.3. Leaving comments
* Users can write comments on "jobs" via (`POST /job/comment`)
* Every single feed should have a button to make comment
  * When this comment button is pressed, a modal should appear that contains an input/textarea box and a "comment" button.
  * When the comment button is pressed, the text inside the text comment should be posted as a new comment for the thread at `POST /job/comment` and the modal should disappear.

### 2.6. Milestone 6 - Challenge Components (`advanced`) (5%)

#### 2.6.1. Infinite Scroll 
* Instead of pagination, users an infinitely scroll through results on the feed. For infinite scroll to be properly implemented you need to progressively load jobs as you scroll. 

#### 2.6.2. Live Update
* If a user likes a job or comments on a job, the job's likes and comments should update without requiring a page reload/refresh. This should be done with some kind of polling.

*Polling is very inefficient for browsers, but can often be used as it simplifies the technical needs on the server.*

#### 2.6.3. Push Notifications
* Users can receive push notifications when a user they watch posts a job. To know whether someone or not has posted a job, you must "poll" the server (i.e. intermittent requests, maybe every second, that check the state). You can implement this either via browser's built in notification APIs or through your own custom built notifications/popups. The notifications are not required to exist outside of the webpage.

_No course assistance in lectures will be provided for this component, you should do your own research as to how to implement this. There are extensive resources online._

### 2.7. Milestone 7 - Very Challenge Components (`advanced *= 2`) (5%)

#### 2.7.1. Static feed offline access
* Users can access the most recent feed they've loaded even without an internet connection.
* Cache information from the latest feed in local storage in case of outages.
* When the user tries to interact with the website at all in offline mode (e.g. comment, like) they should receive errors

_No course assistance will be provided for this component, you should do your own research as to how to implement this._

#### 2.7.2 Fragment based URL routing
Users can access different pages using URL fragments:
```
* `/#feed` to access the feed screen
* `/#profile` to view the authorised user's own profile
* `/#profile={userId}` to view the profile of the user with the particular `userId`
```

_No course assistance in lectures or on the forum will be provided for this component, you should do your own research as to how to implement this._

### 2.8. Bonus Marks (5%)

An extra 5% of the assignment can be attained via bonus marks, meaning a maximum mark of 105/100. Any bonus marks that extend your ass2 mark above 100% will bleed into other assignment marks, but cannot contribute outside of the 75% of the course that is allocated for assignment marks

Your bonus feature(s) can be anything. You just have to think of something that could make your web app stand out in some minor or major way. Simple examples would include just making sure that your user interface and user experience stands out amongst other students, maybe through some user testing.

You could also add extra features, such as some additional frontend form validations - the possibilities are limitless.

If you do implement a bonus feature, describe the feature and its details in `bonus.md` in the root directory of this repository.
