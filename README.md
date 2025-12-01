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

Example: 

```javascript
// deserialize
const node = XML.parse('<xml />');
// serialize
const text = node.toString();
```

### factory.js

```javascript
import Factory from './factory.js'
```

A rudimentary dependency injection factory

Examples:

_basic configuration_
```javascript
// Some classes with dependency on each other
class ClassA {}
class ClassB {constructor(classa) {}}
class ClassC {constructor(classb) {}}

// Configure the factory
const factory = new Factory({
  'ClassA': {
    dependencies: [],
    Factory.toSingleton(async (deps) => new ClassA(...deps))
  },
  'ClassB': {
    dependencies: ['ClassA'],
    Factory.toSingleton(async (deps) => new ClassB(...deps))
  },
  'ClassC': {
    dependencies: ['ClassB'],
    Factory.toSingleton(async (deps) => new ClassC(...deps))
  }
});

// resolve an instance
const instance = await factory.resolve('ClassC');
```

_json configuration via modules_
```javascript
// configure the factory
const factory = Factory.fromJson(`
  {
    "./classa.js": [],
    "./classb.js": ["./classa.js"],
    "./classc.js": ["./classb.js"]
  }
`, Factory.toSingleton(Factory.toImport(path));

// resolve an instance
const instance = await factory.resolve('./classc.js');
```