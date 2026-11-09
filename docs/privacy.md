# Scratch Quest: Student Data & Privacy Summary

Plain-language summary for teachers, administrators, and families. This describes how the app is built. It is not a legal review, so please share it with your district's data privacy contact before you use the app with students.

## The short version
- Scratch Quest runs **inside your school's Google Workspace**, as a Google Apps Script web app that only people **signed in to your school domain** can open.
- All student data is kept in **one Google Sheet in the teacher's Google Drive**. There is no outside server, company or database.
- It stores the **minimum**: school email, first name + last initial, and course progress.
- Google Classroom access is **teacher-only**, rosters are **read-only**, and the app only **creates** assignments when the teacher clicks Post.

## What is stored, and where
| Data | Why | Where |
|---|---|---|
| School email address | To know which student is signed in | Teacher's Google Sheet |
| First name + last initial (e.g. "Maya L.") | Shown to the class on the quest map | Teacher's Google Sheet |
| Avatar choices (cartoon parts, no photos) | Game feature | Teacher's Google Sheet |
| Quest progress: steps checked, quiz answers, XP, badges | Progress tracking | Teacher's Google Sheet |
| Scratch project links and short reflections the student types | Turning in work | Teacher's Google Sheet |
| Teacher feedback, teacher badges, accommodation settings | Teaching | Teacher's Google Sheet |
| Private accommodation notes | Teacher reminders | Teacher's Google Sheet. **Never sent to students.** |

**Not stored:** full last names, photos, Classroom user IDs, birthdays, grades from other classes, location, or anything from a student's Drive or Gmail.

## Who can see what
- **Teacher (the account that deployed the app, plus any co-teachers listed in the code):** everything above, through the app and the Sheet.
- **A student:** their own progress, plus classmates' **first name + initial, avatar, level, and current quest** on the class map. Students can't see each other's reflections, project links, feedback, or accommodation settings. The XP leaderboard is **off** by default.
- **Nobody outside the school domain** can open the app (Who has access: "Anyone within [your domain]").

## Google Classroom permissions (and why)
The app asks for these Google permissions when the teacher first sets it up. Students are never asked for Classroom permissions.
| Permission | Used for |
|---|---|
| See your Google Classroom classes (read-only) | Listing the teacher's classes to import |
| See class rosters (read-only) | Pre-enrolling students in the class the teacher picks |
| See students' email addresses | Matching each student's sign-in to their roster entry |
| Manage topics | Creating one "Scratch Quest" topic |
| Manage coursework for students | Creating quest assignments when the teacher clicks Post |
| Google Sheets | Reading and writing the Scratch Quest Data sheet |
| Your email address | Knowing who is signed in |

The app **doesn't** change rosters, grades, other assignments, or any student's work in Classroom. Only teacher accounts can use any Classroom feature; this is enforced on the server and checked by automated tests.

## Outside services
- **Scratch (scratch.mit.edu)** is a separate service. Students build projects there and paste a link. For students under 13, use **teacher-created Scratch class accounts**, or let them "show the teacher" instead of sharing a link (links are optional by default).
- **Google Fonts** loads the app's typefaces from Google.
- **Lesson videos** (optional) embed from the link the teacher provides. YouTube links play in privacy-enhanced (no-cookie) mode.
- Read-aloud uses the **voice built into the browser**. No audio is sent anywhere.

## Keeping and deleting data
- **Remove a student:** Dashboard → student → Remove student. This deletes their row from the Sheet.
- **End of year:** Classes → Delete this class and all its student data. This removes the class and every student record in it. The Sheet can also be deleted from Drive.
- Data stays only as long as the teacher keeps the Sheet.

## Questions to confirm with your district
1. Is Google Apps Script allowed for student-facing apps in our Workspace, and can it use the Classroom API?
2. Are our Scratch accounts set up through teacher accounts (needed for students under 13)?
3. Does showing first name + last initial on a class map fit our directory-information policy? (A first-name-only option is available at import.)
