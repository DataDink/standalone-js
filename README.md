# standalone-js

_Pure-JS, Standalone Solutions_

> [!WARNING]
> Breaking changes are sure to happen here.
> These modules will continue to evolve and deprioritize backwards compatibility.
> These files should only be copy/pasted into projects, not linked to.

# Rules
* Portable
* Standalone
* ES Module
* No Compile / Raw JS
* JSDOC/TS Fully Documented

# Tests

All tests are modules with exported functions.
Requires Node to execute.
Executes any file ending in `.test.js`

```
node test.js 
```

# Modules

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
