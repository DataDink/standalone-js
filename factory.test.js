/** @import {AssertFunction} from './test.js' */
import Factory from './factory.js';

export async function canConstructNoConfig(/** @type {AssertFunction} */ assert) {
  try {
    const factory = new Factory();
    assert(factory instanceof Factory, 'Expected factory to be instance of Factory');
  } catch (e) { assert(false, `Failed to construct Factory with no config: ${e}`); }
}

export async function canConstructEmptyConfig(/** @type {AssertFunction} */ assert) {
  try {
    const factory = new Factory({});
    assert(factory instanceof Factory, 'Expected factory to be instance of Factory');
  } catch (e) { assert(false, `Failed to construct Factory with empty config: ${e}`); }
}

export async function missingTypeResolvesNull(/** @type {AssertFunction} */ assert) {
  const factory = new Factory({});
  const result = await factory.resolve('NonExistentType');
  assert(result === null, 'Expected resolving a missing type to return null');
}

export async function resolveResolvesTypeWithNoDependencies(/** @type {AssertFunction} */ assert) {
  const expected = {};
  const factory = new Factory({
    'SimpleType': {
      factory: async function() { return expected; },
      dependencies: []
    }
  });
  const result = await factory.resolve('SimpleType');
  assert(result === expected, 'Unexpected result when resolving type with no dependencies');
}

export async function resolveResolvesTypeWithMissingDependencies(/** @type {AssertFunction} */ assert) {
  const deps = /** @type {any[]} */([]);
  const factory = new Factory({
    'DependentType': {
      factory: async function(dependencies) { return deps.push(...dependencies); },
      dependencies: ['MissingDependency']
    }
  });
  await factory.resolve('DependentType');
  assert(deps.length === 1, 'Expected one dependency to be resolved (even if missing)');
  assert(deps[0] === null, 'Expected missing dependency to resolve to null');
}

export async function resolveResolvesTypeWithDependencies(/** @type {AssertFunction} */ assert) {
  const expected = {};
  const factory = new Factory({
    'DependencyType': {
      factory: async function() { return expected; },
      dependencies: []
    },
    'ResolveType': {
      factory: async function(dependencies) {
        return dependencies;
      },
      dependencies: ['DependencyType']
    }
  });
  const result = await factory.resolve('ResolveType');
  assert(Array.isArray(result), 'Expected result to be an array of dependencies');
  assert(result.length === 1, 'Expected one dependency to be resolved');
  assert(result[0] === expected, 'Resolved dependency does not match expected instance');
}

export async function resolveResolvesDependencyWithDependency(/** @type {AssertFunction} */ assert) {
  const expected = {};
  const factory = new Factory({
    'InnerDependency': {
      factory: async function() { return expected; },
      dependencies: []
    },
    'OuterDependency': {
      factory: async function(dependencies) { return dependencies[0]; },
      dependencies: ['InnerDependency']
    },
    'MainType': {
      factory: async function(dependencies) { return dependencies[0]; },
      dependencies: ['OuterDependency']
    }
  });
  const result = await factory.resolve('MainType');
  assert(result === expected, 'Resolved nested dependency does not match expected instance');
}

export async function toSingletonCreatesSingletonFactory(/** @type {AssertFunction} */ assert) {
  let creationCount = 0;
  const singletonFactory = Factory.toSingleton(async function() {
    creationCount += 1;
    return {};
  });
  const factory = new Factory();
  const resultA = await singletonFactory.call(factory, []);
  const resultB = await singletonFactory.call(factory, []);
  assert(creationCount === 1, 'Expected singleton factory to create only one instance');
  assert(resultA === resultB, 'Expected both singleton instances to be the same');
}

export async function fromJsonCreatesFactoryFromJsonConfig(/** @type {AssertFunction} */ assert) {
  const jsonConfig = {
    'TypeA': [],
    'TypeB': ['TypeA']
  };
  const factory = Factory.fromJson(jsonConfig, name => async (deps) => ({name, deps}));
  const result = await factory.resolve('TypeB');
  assert(result && result.name === 'TypeB', 'Expected resolved type to be TypeB');
  assert(Array.isArray(result.deps), 'Expected dependencies to be an array');
  assert(result.deps.length === 1, 'Expected one dependency for TypeB');
  assert(result.deps[0] && result.deps[0].name === 'TypeA', 'Expected dependency to be TypeA');
}
