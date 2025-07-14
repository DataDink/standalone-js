export async function assertIsFunction(assert) {
  assert(typeof(assert) === 'function', 'If you see this, all tests are invalid');
}

export async function testCanAwait(assert) {
  await new Promise(r => setTimeout(r, 1));
  assert(true);
}
