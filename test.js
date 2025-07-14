/**
 * @module test
 * @description A barebones unit-test runner.
 * @author Greenwald
 * @license PublicDomain
 * @requires NodeJS
 */
import {promises as FS} from 'fs';
import PATH from 'path';

const pass = '\x1b[32m✔\x1b[0m';
const fail = '\x1b[31m✘\x1b[0m';
const warn = '\x1b[33m⚠️\x1b[0m';
const root = PATH.resolve('.');
const suites = [];

const search = [root];
while (search.length) {
  const dir = search.pop();
  const entries = await FS.readdir(dir);
  for (const entry of entries) {
    if (/^\.+$/.test(entry)) { continue; }
    const path = PATH.join(dir, entry);
    const stat = await FS.lstat(path);
    if (stat.isDirectory()) { search.push(path); }
    else if (/^.+?\.test\.js$/.test(entry)) { 
      suites.push({
        path,
        name: entry.replace(/\.test.js$/, ''),
        tests: Object.entries(await import(path))
          .filter(([name,item]) => typeof(item) === 'function')
          .map(([name,test])=>({
            name,
            test,
            asserts: [],
            errors: [],
            warns: []
          }))
      }); 
    }
  }
}

console.info(`\x1b[47m
  Running ${suites.length} Test Suites\x1b[0m
`);

for (const suite of suites) {
  console.log(`\x1b[33mSuite: ${suite.name}\x1b[0m`);
  for (const test of suite.tests) {
    try {
      await test.test((assertion, message) => test.asserts.push({assertion, message}));
      if (!test.asserts.length) { test.warns.push(`${warn} No assertions made.`); }
    } catch (error) { test.errors.push(error?.message ?? `${error ?? 'Unknown Error'}`); }
    const failed = test.asserts.some(({assertion}) => !assertion) || test.errors.length;
    if (!failed && !test.warns.length) { console.log(`  ${pass} ${test.name}`); }
    else if (!failed) {
      console.log(`  ${warn} ${test.name}`);
      for (const w of test.warns) {
        console.warn(`\x1b[33m    Warning: ${w.trim()}\x1b[0m`);
      }
    } else {
      console.log(`  ${fail} ${test.name}`);
      for (const {assertion, message} of test.asserts.filter(({assertion}) => !assertion)) {
        console.log(`    ${fail} ${message.trim()}`);
      }
      for (const e of test.errors) {
        console.error(`\x1b[31m    Error: ${e.trim()}\x1b[0m`);
      }
      for (const w of test.warns) {
        console.warn(`\x1b[33m    Warning: ${w.trim()}\x1b[0m`);
      }
    }
  }
}

var total = suites.reduce((c, s) => c + s.tests.length, 0);
var failed = suites.reduce((c, s) => c + s.tests.filter(t => t.asserts.some(a => !a.assertion) || t.errors.length).length, 0);
if (failed) {
  console.log(`\n\x1b[31m${failed} of ${total} tests failed.\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\n\x1b[32mAll ${total} tests passed.\x1b[0m`);
  process.exit(0);
}