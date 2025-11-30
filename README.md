# standalone-js

_Pure-JS, Standalone Solutions_

## Rules

* Raw JS
* Single File
* No Dependencies
* No Post-Processing
* Fully inline documented (JSDOC/TS)

## Guidelines

* Simplistic
* Single Scope
* JS Modules

## Tests

All tests are modules with exported functions.
Requires Node to execute.
Executes any file ending in `.test.js`

```
node test.js 
```

## Modules

### test.js

A barebones unit-test runner.

* Exits value 1 on failure for CI/CD integration
* Finds files ending in `.test.js`
* Executes exported functions as tests
* Supports async tests

Example:

```javascript
export function myUnitTest(assert) {
  assert(false, 'This is a failure');
  assert(true, 'This is a pass');
}

export function warnsIfNoAssert(assert) { }

export async function supportsAsyncTests(assert) {
  await new Promise(r => setTimeout(r, 1));
  assert(true);
}
```

### xml.js

```javascript
import XML from './xml.js'
```

A rudimentary XML parser.

_Note: Parser only, does not enforce XML standards_

```javascript
// deserialize
const node = XML.parse('<xml />');
// serialize
const text = node.toString();
```
