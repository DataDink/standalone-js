import FS from 'fs';
import PATH from 'path';
const pass = '✔';
const fail = '✘';
const warn = '⚠️';

const files = FS.readdirSync('./').filter(file => file.endsWith('.test.js'));
const results = {};
for (const file of files) {
  console.log(`Running Suite: ${file}`);
  const suite = results[file] = {};
  const mod = await import(`./${file}`);
  for (const key of Object.keys(mod)) {
    if (typeof(mod[key]) !== 'function') continue;
    const test = suite[key] = { passed: 0, failed: 0 };
    let any = false;
    let failure = false;
    console.log(`  Running Test: ${key}`);
    try {
      const wait = mod[key]((condition, message) => {
        any = true;
        if (condition) { return; }
        failure = true;
        console.error(`    ${fail} ${message}`);
      });
      if (wait instanceof Promise) { await wait; }
    } catch (e) {
      failure = true;
      console.error(`    ${fail} Exception: ${e.message}`);
    }
    if (!any) { console.warn(`    ${warn}  No assertions`); }
    if (failure) { test.failed++; } else { test.passed++; }
  }
}
var passes = Object.values(results).reduce((sum, suite) => sum + Object.values(suite).reduce((s,test) => s + test.passed, 0), 0);
var failures = Object.values(results).reduce((sum, suite) => sum + Object.values(suite).reduce((s,test) => s + test.failed, 0), 0);
console.log(`\nTest Suites: ${files.length} total`);
console.log(`Tests:       ${passes + failures} total, ${passes} passed, ${failures} failed`);
if (failures) { process.exit(1); }
