// Fake Google Apps Script environment (Sheets, Classroom, Session, Properties, Lock, HtmlService)
// that loads the built files from dist/apps-script. Used by the test scripts.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const dir = path.join(__dirname, '..', 'dist', 'apps-script');
function makeEnv() {
// ---------------- fake Google services ----------------
let currentEmail = 'teacher@school.org';
const OWNER = 'teacher@school.org';
const props = {};
const sheetsById = {};
function makeSheet(name) {
  const data = [];
  const sh = {
    name, data,
    getLastRow: () => data.length,
    getRange: (r, c, nr, nc) => ({
      getValues: () => { const out = []; for (let i = 0; i < nr; i++) { const row = data[r - 1 + i] || []; out.push(Array.from({ length: nc }, (_, j) => row[c - 1 + j] === undefined ? '' : row[c - 1 + j])); } return out; },
      setValues: (vals) => { vals.forEach((row, i) => { data[r - 1 + i] = data[r - 1 + i] || []; row.forEach((v, j) => { data[r - 1 + i][c - 1 + j] = v; }); }); return sh.getRange(r, c, nr, nc); },
      setFontWeight: () => {}
    }),
    appendRow: (row) => { data.push(row.slice()); },
    deleteRow: (r) => { data.splice(r - 1, 1); },
    setFrozenRows: () => {}
  };
  return sh;
}
function makeSpreadsheet(id, name) {
  const sheets = [makeSheet('Sheet1')];
  return {
    id, name, sheets,
    getId: () => id, getUrl: () => 'https://docs.google.com/spreadsheets/d/' + id,
    getSheetByName: (n) => sheets.find(s => s.name === n) || null,
    insertSheet: (n) => { const s = makeSheet(n); sheets.push(s); return s; },
    getSheets: () => sheets.slice(),
    deleteSheet: (s) => { sheets.splice(sheets.indexOf(s), 1); }
  };
}
const created = { coursework: [], topics: [] };
const COURSES = [
  { id: '111', name: '6th Grade CS', section: 'Period 3', alternateLink: 'https://classroom.google.com/c/111' },
  { id: '222', name: '6th Grade CS', section: 'Period 5', alternateLink: 'https://classroom.google.com/c/222' }
];
const ROSTER = {
  '111': [
    { profile: { emailAddress: 'maya.lopez@school.org', name: { givenName: 'Maya', familyName: 'Lopez', fullName: 'Maya Lopez' } } },
    { profile: { emailAddress: 'liam.chen@school.org', name: { givenName: 'Liam', familyName: 'Chen', fullName: 'Liam Chen' } } },
    { profile: { emailAddress: 'ava.smith@school.org', name: { givenName: 'Ava', familyName: 'Smith', fullName: 'Ava Smith' } } }
  ],
  '222': [{ profile: { emailAddress: 'noah.k@school.org', name: { givenName: 'Noah', familyName: 'Kim' } } }]
};
const ctx = {
  console,
  Logger: { log: () => {} },
  SpreadsheetApp: {
    create: (name) => { const id = 'sheet' + (Object.keys(sheetsById).length + 1); return (sheetsById[id] = makeSpreadsheet(id, name)); },
    openById: (id) => { if (!sheetsById[id]) throw new Error('not found'); return sheetsById[id]; },
    flush: () => {}
  },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
  Session: { getActiveUser: () => ({ getEmail: () => currentEmail }), getEffectiveUser: () => ({ getEmail: () => OWNER }) },
  LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
  ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/a/macros/school.org/s/ABC/exec' }) },
  HtmlService: { createHtmlOutputFromFile: () => { const o = { setTitle: () => o, addMetaTag: () => o, setFaviconUrl: () => o }; return o; } },
  Classroom: {
    Courses: {
      list: (q) => { assert.strictEqual(q.teacherId, 'me'); return { courses: COURSES }; },
      Students: {
        // paginate one student per page to exercise nextPageToken handling
        list: (courseId, q) => { const all = ROSTER[courseId] || []; const i = q.pageToken ? Number(q.pageToken) : 0; return { students: all.slice(i, i + 1), nextPageToken: i + 1 < all.length ? String(i + 1) : undefined }; }
      },
      Topics: {
        list: (courseId) => ({ topic: created.topics.filter(t => t.courseId === courseId) }),
        create: (body, courseId) => { const t = { courseId, name: body.name, topicId: 'topic' + (created.topics.length + 1) }; created.topics.push(t); return t; }
      },
      CourseWork: {
        create: (cw, courseId) => { const id = 'cw' + (created.coursework.length + 1); created.coursework.push(Object.assign({ courseId, id }, cw)); return { id, alternateLink: 'https://classroom.google.com/c/' + courseId + '/a/' + id }; }
      }
    }
  }
};
// HtmlService that reads the built HTML files, like the Apps Script editor would hold them
const htmlFile = (name, files) => { const f = path.join(dir, name + '.html'); if (files && !files.includes(name)) throw new Error('No HTML file named ' + name + ' was found.'); if (!fs.existsSync(f)) throw new Error('No HTML file named ' + name + ' was found.'); return fs.readFileSync(f, 'utf8'); };
const out = (content) => { const o = { content, getContent: () => content, setTitle: () => o, addMetaTag: () => o, setFaviconUrl: () => o }; return o; };
ctx.__files = null; // optional allow-list to simulate missing files
ctx.HtmlService = {
  createHtmlOutputFromFile: (n) => out(htmlFile(n, ctx.__files).replace(/<!--[\s\S]*?-->/g, '')), // Google strips HTML comments
  createHtmlOutput: (h) => out(h),
  createTemplateFromFile: (n) => { const src = htmlFile(n, ctx.__files); return { evaluate: () => out(src.replace(/<\?!=\s*([\s\S]*?)\s*\?>/g, (m, expr) => String(vm.runInContext(expr, ctx)))) }; }
};
vm.createContext(ctx);
for (const f of ['Shared.gs', 'Code.gs']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });

  return { ctx, props, sheetsById, created, setUser: (e) => { currentEmail = e; }, api: (email, action, args) => { currentEmail = email; return JSON.parse(JSON.stringify(ctx.api(action, args))); } };
}
module.exports = { makeEnv };
