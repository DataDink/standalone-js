export default
/**
 * @class Xml - Rudimentary XML parsing.
 * @author Greenwald
 * @license PublicDomain
 * @note This is only a parser and does not enforce XML standards.
 */
class Xml {
  /** @type {undefined} */
  static #unset = (() => {})();
  /** @type {string} */
  static #namePattern = '[\\w\\.\\-_:]+';
  /** @type {RegExp} */
  static #nameValidator = new RegExp(`^${Xml.#namePattern}$`);
  /**
   * @method parse - Parses an XML string.
   * @param {string} text - The text to parse.
   * @param {InstanceType<Xml.Parser>[]} parsers - An optional override set of parsers to use.
   * @returns {InstanceType<Xml.Node>} - The parsed XML document node.
   */
  static parse(text, parsers = []) {
    if (!(parsers = parsers.filter(p => p instanceof Xml.Parser)).length) { 
      parsers = Xml.defaultParsers; 
    }
    const doc = new Xml.Node();
    while (text.length) {
      const parser = parsers.find(parser => parser.canParse(text));
      if (!parser) { throw new Error(`No Parser Found: -${text.length}`); }
      const [item, remaining] = parser.parse(text, parsers);
      doc.add(item);
      text = remaining;
    }
    return doc;
  }
  /** @static @readonly @property {InstanceType<Xml.Parser>[]} defaultParsers - The default set of parsers used by Xml.parse when no parsers are provided. */
  static get defaultParsers() { return /** @type {InstanceType<Xml.Parser>[]} */ ([
    new Xml.Text.Parser(),
    new Xml.CData.Parser(),
    new Xml.Comment.Parser(),
    new Xml.Metadata.Parser(),
    new Xml.Declaration.Parser(),
    new Xml.Element.Parser(),
  ]); }
  /**
   * @method escape - Escapes special XML characters in a string.
   * @param {string} text - The text to escape.
   */
  static escape(text) {
    return `${text}`.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
  }
  /**
   * @method escapeValue - Escapes special XML characters for a value.
   * @param {string} value - The value to escape.
   */
  static escapeValue(value) {
    return Xml.escape(value)
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;')
              .replace(/\n/g, '&#10;')
              .replace(/\r/g, '&#13;');
  }
  /**
   * @method unescape - Unescapes special XML characters in a string.
   * @param {string} text - The text to unescape.
   */
  static unescape(text) {
    let basic = `${text}`.replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&apos;/g, "'");
    for (const [reg, rep] of Object.entries({
      ...Object.fromEntries(basic.matchAll(/&#(\d+);/g))
    })) { 
      basic = basic.replace(new RegExp(reg, 'g'), String.fromCharCode(rep)); 
    }
    for (const [reg, rep] of Object.entries({
      ...Object.fromEntries(basic.matchAll(/&#x([0-9A-Fa-f]+);/g))
    })) { 
      basic = basic.replace(new RegExp(reg, 'g'), String.fromCharCode(parseInt(rep, 16))); 
    }
    return basic.replace(/&amp;/g, '&');
  }
  /**
   * @method validateName - Validates an XML name.
   * @param {string} name - The name to validate.
   * @returns {string} - The validated name.
   * @throws {Error} - If the name is invalid.
   */
  static validateName(name) { 
    if (typeof(name) !== 'string' || !Xml.#nameValidator.test(name)) { throw new Error(`Unparsable name: ${name}`); } 
    return name;
  }
  static Parser =
  /** @class Xml.Parser - A base class for XML parsers. */
  class Parser {
    /**
     * @method canParse - Base canParse method.
     * @param {string} text - The text to check.
     * @returns {boolean} - Whether this parser can parse the text.
     */
    canParse(text) { throw new Error(`${this.constructor.name} does not implement canParse`);  }
    /**
     * @method parse - Base parse method.
     * @param {string} text - The text to parse.
     * @param {InstanceType<Xml.Parser>[]} parsers - The set of parsers used in this session.
     * @returns {[InstanceType<Xml.Node>, string]} - The parsed XML node and the remaining text.
     */
    parse(text, parsers) { throw new Error(`${this.constructor.name} does not implement parse`); }
  }
  /** @class Xml.Node - A base class for representing XML content. */
  static Node = class Node {
    /** @type {InstanceType<Xml.Node>|undefined} */
    #parent = Xml.#unset;
    /** @property {InstanceType<Xml.Node>|undefined} parent - The parent Xml.Node of this XML.Node. */
    get parent() { return this.#parent; } 
    /** @type {InstanceType<Xml.Node>[]} */
    #children = [];
    [Symbol.iterator]() { return this.#children[Symbol.iterator](); } 
    /** @readonly @property {number} length - The number of child nodes. */
    get length() { return this.#children.length; }
    /**
     * @method add - Adds a child XML node.
     * @param {InstanceType<Xml.Node>} item - The XML node to add.
     * @returns {InstanceType<Xml.Node>} - Xml.Node being added to.
     */
    add(item) {
      if (!(item instanceof Xml.Node)) { return this; }
      if (item.#parent instanceof Xml.Node) { item.#parent.remove(item); }
      item.#parent = this;
      this.#children.push(item);
      return this;
    }
    /**
     * @method remove - Removes a child XML node.
     * @param {InstanceType<Xml.Node>} item - The XML node to remove.
     * @returns {InstanceType<Xml.Node>} - The Xml.Node being removed from.
     */
    remove(item) {
      if (item.#parent !== this) { return this; }
      item.#parent = Xml.#unset;
      this.#children = this.#children.filter(child => child !== item);
      return this;
    }
    /** @method toString @returns {string} */
    toString() { return this.#children.map(c => c.toString()).join(''); }
  }
  static ContentNode =
  /**
   * @class Xml.ContentNode - A base class for XML content nodes that contain text.
   * @extends Xml.Node
   */
  class ContentNode extends Xml.Node {
    /** @type {string} */
    #content = '';
    /** @property {string} content - The content of this XML element. */
    get content() { return this.#content; }
    set content(content) { this.#content = `${content}`; }
    /** @method toString @returns {string} */
    toString() { return Xml.escape(this.content); }
  }
  static Text =
  /** 
   * @class Xml.Text
   * @description Represents text content in XML.
   * @extends Xml.ContentNode
   */
  class Text extends Xml.ContentNode {
    static Parser = 
    /**
     * @class Xml.Text.Parser - A parser for XML text content.
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return !text.startsWith('<'); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        const term = text.indexOf('<');
        const content = term < 0 ? text : text.slice(0, term);
        const remaining = term < 0 ? '' : text.slice(term);
        const item = new Xml.Text();
        item.content = content;
        return /** @type {[InstanceType<Xml.Text>, string]} */ ([item, remaining]);
      }
    }
  }
  static Comment =
  /** 
   * @class Xml.Comment
   * @description Represents a comment in XML.
   * @extends Xml.ContentNode
   */
  class Comment extends Xml.ContentNode {
    /** @method toString @returns {string} */
    toString() { return `<!--${super.toString()}-->`; }
    static Parser = 
    /**
     * @class Xml.Comment.Parser - A parser for XML comments.
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return text.startsWith('<!--'); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        const end = (text = text.slice(4)).indexOf('-->');
        const content = end < 0 ? text : text.slice(0, end);
        const remaining = end < 0 ? '' : text.slice(end + 3);
        const item = new Xml.Comment();
        item.content = Xml.unescape(content);
        return /** @type {[InstanceType<Xml.Comment>, string]} */ ([item, remaining]);
      }
    }
  }
  static CData =
  /** 
   * @class Xml.CData
   * @description Represents a CDATA section in XML.
   * @extends Xml.ContentNode
   */
  class CData extends Xml.ContentNode {
    /** @method toString @returns {string} */
    toString() { return `<![CDATA[${this.content.replace(/\]\]>/g, ']]&gt;')}]]>`; }
    static Parser = 
    /**
     * @class Xml.CData.Parser - A parser for XML CDATA sections.
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return text.startsWith('<![CDATA['); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        const end = text.indexOf(']]>');
        const content = end < 0 ? text : text.slice(9, end);
        const remaining = end < 0 ? '' : text.slice(end + 3);
        const item = new Xml.CData();
        item.content = content;
        return /** @type {[InstanceType<Xml.CData>, string]} */ ([item, remaining]);
      }
    }
  }
  static Element = 
  /**
   * @class Xml.Element
   * @description Represents an XML element with a name and attributes.
   */
  class Element extends Xml.Node {
    /** @type {string} */
    #type = 'element';
    /** @property {string} type - The type/name of this XML element. */
    get type() { return this.#type; } 
    set type(name) { this.#type = Xml.validateName(name); }
    /** @type {Object<string, string>} */
    #attributes = new Proxy({}, {
      set(/** @type {any} */t, /** @type {string} */k, /** @type {any} */v) {
        t[Xml.validateName(k)] = `${v}`;
        return true;
      }
    });
    /** @property {Object<string, string>} attributes - The attributes of this XML element.*/
    get attributes() { return this.#attributes; } 
    toString() {
      const open = `<${this.#type} `;
      const attr = Object.entries(this.#attributes)
        .map(([k, v]) => `${k}="${Xml.escapeValue(v)}"`)
        .join(' ');
      const close = this.length > 0
        ? `>${super.toString()}</${this.#type}>`
        : '/>';
      return `${open}${attr}${close}`;
    }
    static Parser = 
    /**
     * @class Xml.Element.Parser - A parser for XML elements.
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      static #nameParser = new RegExp(`^${Xml.#namePattern}`);
      static #valueParser = /^=\s*("([^"]*)"|'([^']*)')/;
      static #closeParser = new RegExp(`^<\\s*\\/\\s*(${Xml.#namePattern})\\s*>`);
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return /^<\w/.test(text); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        if (!text.startsWith('<')) { throw new Error(`Element must start with <: -${text.length}`); }
        let remaining = text.slice(1);
        const node = new Xml.Element();
        node.type = Element.Parser.#nameParser.exec(remaining)?.[0] ?? '';
        remaining = remaining.slice(node.type.length);
        while ((remaining = remaining.trimStart()).length) {
          if (/^\/?\s*>/.test(remaining)) { break; }
          const name = Element.Parser.#nameParser.exec(remaining)?.[0];
          if (!name) { throw new Error(`Invalid attribute name in element ${node.type}: -${remaining.length}`); }
          remaining = remaining.slice(name.length).trimStart();
          const value = Element.Parser.#valueParser.exec(remaining);
          node.attributes[name] = value ? Xml.unescape(value[1].slice(1, -1)) : `${name}`;
          remaining = remaining.slice(value ? value[0].length : 0);
        }
        const closer = (/^\/?\s*>/.exec(remaining)?.[0]);
        if (!closer) { throw new Error(`Element ${node.type} not closed properly: -${remaining.length}`); }
        remaining = remaining.slice(closer.length);
        if (!closer.includes('/')) {
          while (remaining.length) {
            if (/^<\s*\//.test(remaining)) { break; }
            const parser = parsers.find(parser => parser.canParse(remaining));
            if (!parser) { throw new Error(`No Parser Found: -${remaining.length}`); }
            const [child, next] = parser.parse(remaining, parsers);
            node.add(child);
            if (next === remaining) { throw new Error(`${parser.constructor.name} did not consume content: -${remaining.length}`); }
            remaining = next;
          }
          const closingTag = Element.Parser.#closeParser.exec(remaining)?.[0] ?? '';
          remaining = remaining.slice(closingTag.length);
        }
        return /** @type {[InstanceType<Xml.Element>, string]} */ ([node, remaining]);
      }
    }
  }
  static Declaration = 
  /**
   * @class Xml.Declaration - Represents an XML declaration.
   * @extends Xml.Node
   */
  class Declaration extends Xml.Node {
    /** @type {string} */ 
    #type = 'declaration';
    /** @property {string} type - The type of declaration, usually "xml" */
    get type() { return this.#type; }
    set type(type) { this.#type = Xml.validateName(type); }
    /** @type {Record<string, string>} */
    #pairs = new Proxy({}, {
      set(/** @type {any} */t, /** @type {string} */k, /** @type {any} */v) {
        t[Xml.validateName(k)] = `${v}`;
        return true;
      }
    });
    /** @property {Record<string, string>} pairs - The key-value pairs of the declaration */
    get pairs() { return this.#pairs; } 
    toString() {
      return `<?${this.type} ${Object.entries(this.#pairs).map(([k,v]) => `${k}="${Xml.escapeValue(v)}"`).join(' ')}?>`;
    }
    static Parser =
    /** 
     * @class Xml.Declaration.Parser - A parser for XML declarations. 
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      /** @type {RegExp} */
      static #typeParser = new RegExp(`^${Xml.#namePattern}`);
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return text.startsWith('<?'); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        const end = (text = text.slice(2)).indexOf('?>');
        const content = end < 0 ? text : text.slice(0, end).trim();
        const remaining = end < 0 ? '' : text.slice(end + 2);
        const item = new Declaration();
        item.type = Declaration.Parser.#typeParser.exec(content)?.[0] ?? 'declaration';
        const pairsContent = content.slice(item.type.length).trim();
        const pairs = pairsContent.matchAll(/(\S+)\s*=\s*"([^"]*)"/g) || [];
        for (const [_, key, value] of pairs) {
          item.pairs[key] = Xml.unescape(value);
        }
        return /** @type {[InstanceType<Xml.Node>, string]} */ ([item, remaining]);
      }
    }
  }
  static Metadata = 
  /**
   * @class Xml.Metadata
   * @description A common type for metadata in XML, such as DOCTYPE, ENTITY, and NOTATION.
   */
  class Metadata extends Xml.Node {
    /** @type {string} */
    #type = 'METADATA';
    /** @property {string} type - The type of declaration, usually "xml" */
    get type() { return this.#type; }
    set type(type) { this.#type = Xml.validateName(type); }
    /** @type {string[]} */
    #names = new Proxy([], {
      set(/** @type {any} */t, /** @type {string} */k, /** @type {any} */v) {
        if (isNaN(Number(k))) { return false; }
        if (isNaN(Number(k))) { t[k] = `${Xml.validateName(v)}`; }
        return true;
      }
    });
    get names() { return this.#names; } 
    /** @type {string[]} */
    #values = new Proxy([], {
      set(/** @type {any} */t, /** @type {string} */k, /** @type {any} */v) {
        if (isNaN(Number(k))) { return false; }
        t[k] = `${v}`;
        return true;
      }
    });
    get values() { return this.#values; }
    toString() {
      let result = `<!${this.type}`;
      for (const name of this.#names) { result += ` ${name}`; }
      for (const value of this.#values) { result += ` "${Xml.escapeValue(value)}"`; }
      return `${result}>`;
    }
    static Parser =
    /**
     * @class Xml.Metadata.Parser - A parser for XML metadata declarations.
     * @extends Xml.Parser
     */
    class Parser extends Xml.Parser {
      /** @type {RegExp} */
      static #typeParser = new RegExp(`^${Xml.#namePattern}`);
      /** @inheritdoc */
      canParse(/** @type {string} */text) { return text.startsWith(`<!`); }
      /** @inheritdoc */
      parse(/** @type {string} */text, /** @type {InstanceType<Xml.Parser>[]} */parsers) {
        const end = (text = text.slice(2)).indexOf('>');
        const content = end < 0 ? text : text.slice(0, end).trim();
        const remaining = end < 0 ? '' : text.slice(end + 1);
        const item = new Xml.Metadata();
        item.type = Metadata.Parser.#typeParser.exec(content)?.[0] ?? 'METADATA';
        const valueContent = content.slice(item.type.length).trim();
        const values = [...(valueContent.matchAll(/"([^"]*)"/g) || [])].map(v => v[1]);
        item.values.push(...values);
        const nameContent = valueContent.replace(/"[^"]*"/g, '').trim();
        const names = [...nameContent.matchAll(/\S+/g)].map(t => t[0]);
        if (names.length) { item.names.push(...names); }
        return /** @type {[InstanceType<Xml.Metadata>, string]} */([item, remaining]);
      }
    }
  }
}
export {Xml};
export const Parser = Xml.Parser;
export const Node = Xml.Node;
export const Element = Xml.Element;
export const ContentNode = Xml.ContentNode;
export const Comment = Xml.Comment;
export const CData = Xml.CData;
export const Text = Xml.Text;
export const Metadata = Xml.Metadata;
export const Declaration = Xml.Declaration;
