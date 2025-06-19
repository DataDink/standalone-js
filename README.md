# standalone-js

_Pure-JS, Standalone Solutions_

## Rules

* Raw JS
* Single File
* No Dependencies
* No Post-Processing

## Guidelines

* Simplistic
* Single Scope
* JS Modules

## Tests

For now, tests are just module exported functions.
Requires only NodeJS to execute.

```
node run-tests.js
```

Naming: `<module-name>.test.js`

## Modules

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
