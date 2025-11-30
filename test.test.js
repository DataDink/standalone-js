/** @import {AssertFunction} from './test.js' */

export async function assertIsFunction(/** @type {AssertFunction} */ assert) {
  assert(typeof(assert) === 'function', 'If you see this, all tests are invalid');
}

export async function testCanAwait(/** @type {AssertFunction} */ assert) {
  await new Promise(r => setTimeout(r, 1));
  assert(true);
}
