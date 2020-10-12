# CitizenEngagement

## User permissions

The app supports two types of users discriminated by their roles:
- Citizens can report new issues, edit/delete the issues they reported, comment any issue, access the list of all issues and detailed pages about each issue.
...An example of citizen credentials: username: laurent, pass: laurent
- Staff can do what citizens can, but also edit/delete any issue.
...An example of staff credentials: username: admin, pass: test

Note that anyone can register as a citizen as long as he/she submits a valid registration form. For example, there is no e-mail verification.

## Menu

Menu entries are displayed depending on whether the current user is logged in or not.
Unauthenticated users can only log in or register, the other routes being protected by a dedicated guard.
Authenticated users can report a new issue, see the list of all issues and logout.

## Issues list

All issues are fetched by looping through all back-end pages.
The issues are sorted from most recent to oldest.
Issues can be searched for their description to contain a free search string.
Four multiselect lists are populated with the issues' creators, types, states and tags lists (ordered alphabetically) whose purpose is to filter issues.

## Issue details page

Contains a section where all comments related to the issue are fetched and where new comments can be submitted.