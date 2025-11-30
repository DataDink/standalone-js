/**
 * @description A barebones unit-test runner.
 * @author Greenwald
 * @license PublicDomain
 * @requires NodeJS
 */
/** @typedef {(condition: boolean, message?: string) => void} AssertFunction */
/**
 * @typedef TestSuite
 * @property {string} name - The name of the test suite.
 * @property {string} path - The path to the test suite file.
 * @property {boolean} failed - Whether the suite has failed.
 * @property {TestCase[]} tests - The test cases in the suite.
 */
/**
 * @typedef TestCase
 * @property {string} name - The name of the test case.
 * @property {Function} test - The test function.
 * @property {Array<{assertion: boolean, message: string}>} asserts - The assertions made in the test.
 * @property {string[]} errors - The errors encountered during the test.
 * @property {string[]} warns - The warnings encountered during the test.
 */

import {promises as FS} from 'fs';
import PATH from 'path';

const pass = '\x1b[32m✔\x1b[0m';
const fail = '\x1b[31m✘\x1b[0m';
const warn = '\x1b[33m⚠️\x1b[0m';
const root = PATH.resolve('.');
const suites = /** @type {TestSuite[]} */([]);
const [suitename, testname] = process.argv.slice(2);

let unhandledRejection = (/** @type {any} */reason) => {};
process.on('unhandledRejection', (reason, promise) => { unhandledRejection(reason); });
process.on('uncaughtException', (error) => { unhandledRejection(error); });

console.info(`\x1b[47m
  Running Test(s)\x1b[0m
`);

const search = /** @type {string[]} */([root]);
while (search.length) {
  const dir = /** @type {string} */(search.pop());
  const entries = await FS.readdir(dir);
  for (const entry of entries) {
    if (/^\.+$/.test(entry)) { continue; }
    const path = PATH.join(dir, entry);
    const stat = await FS.lstat(path);
    if (stat.isDirectory()) { search.push(path); }
    else if (suitename && !entry.endsWith(`${suitename}.test.js`)) { continue; }
    else if (/^.+?\.test\.js$/.test(entry)) {
      const suite = /** @type {TestSuite} */({
        path,
        name: entry.replace(/\.test.js$/, ''),
        failed: false,
        tests: []
      }); 
      suites.push(suite);
      console.log(`\x1b[33m${suite.name}\x1b[0m`);

      try { 
        const tests = /** @type {TestCase[]} */(Object.entries(await import(path))
          .filter(([name,item]) => typeof(item) === 'function')
          .filter(([name]) => !testname || name === testname)
          .map(([name,test])=>({
            name,
            test,
            asserts: [],
            errors: [],
            warns: []
          })));
        if (!tests.length) {
          suite.failed = true;
          console.error(`  \x1b[31mNo tests found in ${suite.name}.\x1b[0m`);
        }
        for (const test of tests) {
          suite.tests.push(test);
          try {
            await new Promise(async (resolve, reject) => {
              unhandledRejection = e => reject(new Error(`Unhandled Async Rejection: ${e?.message ?? e}`));
              await test.test(/** @type {AssertFunction} */((assertion, message) => test.asserts.push({assertion, message: message ?? 'Assertion failed'})));
              resolve(undefined);
            });
          } catch (/** @type {any} */ error) { test.errors.push(error?.message ?? `${error ?? 'Unknown Error'}`); }
          if (!test.asserts.length) { test.warns.push(`${warn} No assertions made.`); }
          const failures = test.asserts.filter(a => !a.assertion).map(a => a.message).concat(test.errors);
          if (failures.length) { console.log(`  ${fail} ${test.name}`); } 
          else if (test.warns.length) { console.log(`  ${warn} ${test.name}`); } 
          else { console.log(`  ${pass} ${test.name}`); }
          if (failures.length || test.errors.length || test.warns.length) { suite.failed = true; }
          for (const failure of failures) { console.error(`    \x1b[31m${failure}\x1b[0m`); }
          for (const warn of test.warns) { console.warn(`    \x1b[33m${warn}\x1b[0m`); }
        }
      } catch (/** @type {any} */ error) { 
        suite.failed = true;
        console.error(`  \x1b[31m[Error: ${error?.message ?? error}]\x1b[0m`); 
      }
    }
  }
}

const total = suites.reduce((c, s) => c + s.tests.length, 0);
const failed = suites.reduce((c, s) => c + s.tests.filter(t => t.asserts.some(a => !a.assertion) || t.errors.length).length, 0);
const broken = suites.filter(s => s.failed).length;
if (broken) { console.error(`\n\x1b[31m${broken} of ${suites.length} suites failed\x1b[0m`); }
else { console.log(`\n\x1b[32mAll ${suites.length} suites passed.\x1b[0m`); }
if (failed) { console.log(`\x1b[31m${failed} of ${total} tests failed.\x1b[0m`); } 
else { console.log(`\x1b[32mAll ${total} tests passed.\x1b[0m`); }
process.exit(failed + broken ? 1 : 0);
