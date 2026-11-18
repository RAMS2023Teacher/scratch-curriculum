# Reliability guide for classroom web apps on Google Apps Script

How to keep an app from (1) losing or "resetting" its data and (2) falling over when a whole class uses it at once.
Written after a real incident in Scratch Quest. Nothing here depends on Scratch Quest: it applies to any Apps Script
web app that runs as the teacher ("Execute as: Me") and stores data in a Google Sheet, Drive files, or script properties.

**How to use this:** paste this whole file into a Claude session in the other project and say:
*"Audit this project against this reliability guide. Tell me which problems it has, then fix them and add the tests."*
Reference code is in the Scratch Quest repository (paths given), but every section includes code you can adapt.

---

## 1. What went wrong (the incident)

1. A class was working. More requests arrived at the same moment than Google allows for one account, and Google
   answered some of them with "too many simultaneous invocations".
2. Under that load, opening the data spreadsheet failed once.
3. The code that opened the spreadsheet was written like this:

   ```js
   // THE BUG. Do not write this.
   var ss = null;
   if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
   if (!ss) { ss = SpreadsheetApp.create('App Data'); props.setProperty('DB_ID', ss.getId()); }
   ```

   "I could not open it right now" was treated as "it does not exist". The app created a new, empty spreadsheet and
   pointed itself at it. Every student looked like a stranger, and classes seemed to be gone.
4. The original data was never touched, but the app no longer knew where it was, and students who kept working
   were now saving into the new sheet. The two had to be combined.

Two separate problems, two separate fixes: **never replace storage on an error** (section 3) and
**send fewer requests at once** (section 4).

---

## 2. The limits you are working inside

- A web app that runs as the owner counts **every student's request against the owner's account**. Google allows
  about **30 executions at the same moment** per account. Request number 31 fails immediately.
- So what matters is: (number of requests per student) x (how long each request runs). Slow requests are the real
  danger, because they overlap.
- `LockService.getScriptLock()` makes writes take turns. Anything slow done while holding the lock makes every
  other write wait, and waiting requests still count toward the 30.
- Google services occasionally fail for a moment ("Service Spreadsheets failed...", "Service unavailable").
  This is normal. Code must treat it as "try again", never as "the data is gone".

---

## 3. Never lose or reset data

### Rule 1: An error is not "missing". Only create storage on the very first run.

Applies to spreadsheets, Drive folders, Drive files, and property keys alike.

```js
function db_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('DB_ID'), ss = null;
  if (id) {
    for (var i = 0; i < 4 && !ss; i++) {
      try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; Utilities.sleep(300 * (i + 1)); }
    }
    if (!ss) throw new Error('BUSY: The app is very busy right now. Your work is safe. Trying again...');
    return ss;
  }
  // No id has EVER been saved: this is the first run. Lock so two first visitors can't each create one.
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    id = props.getProperty('DB_ID');
    if (id) return SpreadsheetApp.openById(id);
    ss = SpreadsheetApp.create('App Data');
    props.setProperty('DB_ID', ss.getId());
    return ss;
  } finally { lock.releaseLock(); }
}
```

For **Drive files** (for example one JSON file per student): keep the folder id in script properties and apply the
same rule to the folder. For a student's file, three outcomes must be kept apart:

| What happened | What to do |
|---|---|
| The lookup **threw an error** | Throw `BUSY`. Do not create anything. Do not return a blank record. |
| The lookup worked and found **nothing** | The student is new. Create the record only in the "join / first sign-in" action, inside a lock. |
| Found | Use it. |

### Rule 2: Never save a default record over a real one

The same bug hides in "read, change, write" code:

```js
// DANGEROUS: if the read failed, this writes an empty record over the student's real one.
var rec = readStudent(email) || newBlankStudent();
rec.xp += 10;
saveStudent(rec);
```

Reads must **throw** on failure, and "not found" must be an explicit, separate result. Only the join action may
create a record. If JSON in a cell or file does not parse, throw; do not fall back to `{}` and then save.

### Rule 3: Remember where the data is

Each time the storage id is set, append it to a history list (`DB_HISTORY` in script properties). If the app is ever
pointed at the wrong place, the right one can be found without searching Drive.

### Rule 4: Backups that need no extra permission

`Spreadsheet.copy(name)` works with the ordinary spreadsheets permission. Make a copy when the teacher opens the
app, at most once per day, and keep the links in script properties so the app can list them.

```js
var BACKUP_EVERY_DAYS = 1;
function maybeBackup_(ss) {
  try {
    var props = PropertiesService.getScriptProperties(), last = Number(props.getProperty('LAST_BACKUP') || 0);
    if (Date.now() - last < (BACKUP_EVERY_DAYS - 0.3) * 864e5) return;
    props.setProperty('LAST_BACKUP', String(Date.now()));          // set first, so two requests don't both copy
    var day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var copy = ss.copy('App Backup ' + day);
    var list = JSON.parse(props.getProperty('BACKUPS') || '[]');
    list.push({ id: copy.getId(), url: copy.getUrl(), day: day });
    props.setProperty('BACKUPS', JSON.stringify(list.slice(-8)));
  } catch (e) { /* a backup must never break the app */ }
}
```

For apps that store **Drive files instead of a sheet**: once a day, write every student record into one dated
spreadsheet or one dated JSON file ("App Backup 2026-11-18"). One file per day, not a copy of every file.

Before any risky operation (combining data, a migration, deleting a class), make a backup first.

### Rule 5: Give the owner recovery tools inside the app

Owner only (compare the signed-in email with `Session.getEffectiveUser().getEmail()`), reachable even when the app
shows no classes:

- **Your data**: which sheet or folder the app is using, with a link and counts (classes, students).
- **Switch**: point the app at a different sheet by pasting its link. Validate it first (has the expected tabs).
- **Combine**: bring everything from another sheet into the current one without removing anything. Show a preview
  ("adds 24 students and 1 class, combines 3") before doing it, back up first, and make it safe to run twice.
  For a student in both, keep the best of each lesson from either record and all rewards, and keep them in the
  class they used most recently. Counters that are separate histories (coins spent) are added once only: record
  on the student which source was already combined.
- **Back up now**.

Reference: `apps-script/Code.gs` (`db_`, `dataInfo_`, `dataReconnect_`, `dataMerge_`, `maybeBackup_`) and
`SQ_MERGE` at the end of `src/service.js`.

---

## 4. Stay under the limit

### In the browser

**One request at a time per browser, no duplicates, quiet retries.** Route every server call through one function.

```js
// Works with any google.script.run function: safeCall('api', action, args) or safeCall('saveStep', data)
var safeCall = (function () {
  var chain = Promise.resolve(), pending = {};
  var BUSY = /simultaneous|too many|BUSY|lock|try again later|invoked too many|quota/i;
  function raw(fn, args) {
    return new Promise(function (resolve, reject) {
      var run = google.script.run.withSuccessHandler(resolve)
        .withFailureHandler(function (e) { reject(new Error((e && e.message) || String(e))); });
      run[fn].apply(run, args);
    });
  }
  function attempt(fn, args, n) {
    return raw(fn, args).catch(function (e) {
      if (n < 5 && BUSY.test(e.message)) {
        window.dispatchEvent(new CustomEvent('app-busy', { detail: true }));   // show "Busy... saving your work"
        var wait = 1200 * Math.pow(1.8, n) + Math.random() * 1500;             // backoff + random spread
        return new Promise(function (r) { setTimeout(r, wait); }).then(function () { return attempt(fn, args, n + 1); });
      }
      if (BUSY.test(e.message)) throw new Error('The app is very busy right now. Your work is safe. Wait a few seconds and try again.');
      throw e;
    });
  }
  return function (fn) {
    var args = Array.prototype.slice.call(arguments, 1), key = fn + '|' + JSON.stringify(args);
    if (pending[key]) return pending[key];                    // the same request is already waiting: share it
    var p = chain.then(function () { return attempt(fn, args, 0); });
    var clear = function () { delete pending[key]; window.dispatchEvent(new CustomEvent('app-busy', { detail: false })); };
    chain = p.then(clear, clear);
    pending[key] = p;
    return p;
  };
})();
```

Why retrying is safe: "too many simultaneous invocations", a lock timeout, and the server's own `BUSY` errors all
mean **the request did not run**. Only retry on those. Do not blindly retry other errors on actions that are not
safe to repeat (buying something, starting a timed run).

**Polling (anything on `setInterval` that calls the server):**
- Skip the call while `document.hidden` (a background tab).
- Use the slowest interval that still works. 5 seconds is almost never needed; 15 to 45 seconds usually is fine.
- Only poll while it matters (for example, check on a help request only while one is open).
- Never have every student poll for something the teacher changes rarely; fetch it on page load instead.

**Static content:** anything large that only changes when you deploy (lesson text, catalogs) should be kept in
`localStorage` under a key that includes the build date, and only downloaded when that key is missing.

### On the server

**Read one row, not the whole tab.** The most common hidden cost is reading and parsing every student to find one.

```js
function fastRow_(sheet, key) {            // returns the row number, or -1, without reading the tab
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var cell = sheet.getRange(2, 1, last - 1, 1).createTextFinder(String(key)).matchEntireCell(true).matchCase(false).findNext();
  return cell ? cell.getRow() : -1;
}
```

Use it for "get this student" and "save this student". Only teacher pages and class-wide views should read a whole tab.

**Share class-wide answers for a few seconds.** When the whole class opens the same view at once (class map,
leaderboard), build it once and keep it in `CacheService.getScriptCache()` for 15 to 30 seconds (values must be
under 100 KB). Use the same cache for anything read constantly that the teacher changes rarely.

**Keep slow things out of the lock.** Take the script lock only around your own reads-then-writes. Translation,
`UrlFetchApp`, Classroom calls, building reports, and making backups must not run while holding it. Read-only
actions should not take the lock at all.

```js
var lock = LockService.getScriptLock();
try { lock.waitLock(25000); }
catch (e) { throw new Error('BUSY: The app is very busy right now. Your work is safe. Trying again...'); }
try { /* read, change, write */ } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
```

**Don't re-check setup on every request.** Creating tabs, checking headers, or looking up folders belongs behind a
version check (`props.getProperty('SCHEMA') !== currentVersion`), not in every call.

**Things that change every few seconds** (help requests, "who is online") belong in script properties or the cache,
not in the main sheet.

**Cap anything a student can trigger in a loop:** automatic error reports (at most 3 per visit, and the server
drops repeats), feedback posts, translation batch sizes (stop after about 8 seconds and let the page ask again).

---

## 5. Audit checklist (search the code for these)

| Search for | Why | Fix |
|---|---|---|
| `create(` / `createFolder(` / `createFile(` near `catch` or after `\|\| ` or `if (!` | Storage replaced on error | Rule 1 |
| `catch (e) { ... = null }`, `catch (e) { return {} }`, `\|\| {}` after a read that is later saved | Blank record saved over real data | Rule 2 |
| `JSON.parse` with a silent fallback, then a save | Same | Throw instead |
| `getDataRange().getValues()` or reading a whole tab inside a per-student action | Slow requests | `fastRow_` |
| `getFilesByName`, `searchFiles`, `getFolders` inside a per-student action | Slow Drive lookups | Store ids in properties or a sheet index |
| `setInterval(` that reaches the server | Request floods | Polling rules |
| `waitLock(` with no `try/catch`, or slow calls between lock and release | Pile-ups | Lock rules |
| `google.script.run.` used directly in many places | No queue or retry | Route through `safeCall` |
| `UrlFetchApp`, `LanguageApp`, `Classroom.`, `MailApp` inside a locked section | Lock held for seconds | Move outside the lock |
| Large constant data returned by the server on every page load | Wasted slots | Cache on the device |
| Any action that deletes or overwrites many records | No way back | Back up first, ask for confirmation |

---

## 6. Tests to add

These run with a fake Google environment in Node (see `tools/fake-gas.js` and `tools/test-apps-script.js` in the
Scratch Quest repository for a working example).

1. **Storage errors never create storage.** Make `openById` (or the Drive lookup) throw. Every action must throw
   `BUSY`. Afterwards: the stored id is unchanged, the number of spreadsheets/folders is unchanged, and when the
   error stops, every student and class is still there.
2. **A failed read never saves a blank record.** Make reading one student fail during a write action; the stored
   record must be unchanged.
3. **One click reads one row.** Add 300 filler students, count cells read during a single student action, and assert
   it stays small (Scratch Quest: under 200 cells).
4. **The page retries by itself.** In a real browser (Playwright), make the server fail with a busy error while a
   student clicks; assert a "busy" note appears, no error is shown, and the click is saved after the error stops.
5. **Recovery.** Point the app at an empty sheet, then use Switch and Combine; assert students come back with the
   best of both records, nothing in the current sheet is lost, a backup exists, and combining twice changes nothing.
6. **Owner only.** A student or co-teacher calling the recovery actions gets an error.

---

## 7. Operating notes for the teacher

- Deploying a new version does not touch data. Students get the new version when they reload.
- If students see "Busy... saving your work" for more than a few seconds at a time, the app is near the limit:
  check Apps Script > Executions for failures and long runs, and tell Claude which actions are slow.
- If classes or students ever look missing, **do not re-create them**. Open the owner's "Your data" card first and
  check which sheet the app is using and how many students are in it.
- Backups appear in Google Drive as "<App> Backup <date>". Delete old ones whenever you like.
- At the end of the year, delete the data sheet and its backups together.

---

## 8. Short version

1. An error opening storage means "try again", never "create a new one".
2. Never write a default record over a record you failed to read.
3. Keep a history of storage ids, daily backups, and owner-only Switch / Combine tools.
4. One request at a time per browser, shared duplicates, quiet retries with backoff.
5. Poll slowly, never in background tabs, and cache static content on the device.
6. Read one row per student action; share class-wide answers through the cache.
7. Hold the lock only for your own read-change-write; never during slow calls.
8. Test all of it with a fake Google that can be told to fail.
