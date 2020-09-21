# CitizenEngagement

## User permissions

The app supports two types of users discriminated by their roles:
- Citizens can report new issues, edit/delete the issues they reported, comment any issue, access the list of all issues and detailed pages about each issue.
- Staff can do what citizens can, but also edit/delete any issue.

## Menu

Menu entries are displayed depending on whether the current user is logged in or not.
Unauthenticated users can only log in or register, the other routes being protected by a dedicated guard.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

