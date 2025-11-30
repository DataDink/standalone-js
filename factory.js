/** @typedef {(this: Factory, dependencies: any[]) => Promise<any>} TypeFactory */
/** @typedef {{factory: TypeFactory, dependencies: string[]}} ConfigurationEntry */
/** @typedef {{[key: string]: ConfigurationEntry}} Configuration */
/** @typedef {{[key: string]: string[]}} JsonConfiguration */
export default
/**
 * @class Factory - A class for constructing types based on a dependency configuration.
 * @author Greenwald
 * @license PublicDomain
 */
class Factory {
  /** @type {Configuration} */
  #configuration;
  constructor(/** @type {Configuration|null|undefined} */ configuration = null) { this.#configuration = configuration || {}; }
  /**
   * @method resolve - Constructs an instance of the specified type using the factory configuration with optional override configurations.
   * @param {string} name - The key of the type to construct.
   * @param {Configuration|null|undefined} [overrides={}] - An optional object containing override configurations for dependencies.
   * @returns {Promise<any>} - The constructed instance of the specified type.
   */
  async resolve(name, overrides = null) {
    const config = /** @type {Configuration} */(overrides ? {...this.#configuration, ...overrides} : this.#configuration);
    const session = overrides ? new Factory(config) : this;
    const entry = config[name];
    if (!entry || typeof(entry.factory) !== 'function') { return null; }
    const dependencies = await Promise.all(entry.dependencies?.map(async n => await session.resolve(n)) || []);
    return await entry.factory.call(session, dependencies);
  }
  /**
   * @static
   * @method toSingleton - Wraps a factory function to ensure it only creates a single instance (singleton pattern).
   * @param {TypeFactory} factory - The factory function to wrap.
   * @returns {TypeFactory} - A new factory function that returns the same instance on subsequent calls.
   */
  static toSingleton(factory) {
    let instance = /** @type {any} */ (null);
    return async function(dependencies) {
      if (!instance) { instance = await factory.call(this, dependencies); }
      return instance;
    };
  }
  /**
   * @static
   * @method fromJson - Creates a factory instance from a JSON configuration.
   * @param {JsonConfiguration|string} json - The JSON configuration object or string.
   * @param {(name: string) => TypeFactory} resolver - A function that resolves factory functions by name.
   * @returns {Factory} - A new Factory instance configured from the JSON.
   */
  static fromJson(json, resolver) {
    if (typeof(json) === 'string') { json = /** @type {JsonConfiguration} */ (JSON.parse(json)); }
    const config = /** @type {Configuration} */(
      Object.fromEntries(Object.entries(json)
        .map(([key, value]) => [
          key,
          {factory: Factory.toSingleton(resolver(key) ?? (() => null)), dependencies: Array.isArray(value) ? value : []}
        ])
      )
    );
    return new Factory(config);
  }
}
export {Factory};