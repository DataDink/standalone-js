export default
/**
 * @module xml
 * @description Rudimentary XML parsing.
 * @namespace Xml
 * @author Greenwald
 * @license PublicDomain
 * @note This is only a parser and does not enforce XML standards.
 * @note Not memory efficient, intended for small XML content.
 */
class Xml {
  static #unset = (() => {})();
  static #namePattern = '[\\w\\.\\-_:]+';
  static #nameValidator = new RegExp(`^${Xml.#namePattern}$`);

  /**
   * @property parent
   * @description The parent Xml.Node of this XML item.
   */
  get parent() { return this.#parent; } #parent = Xml.#unset;

  /**
   * @method validateName
   * @description Validates an XML name.
   */
  static validateName(name) { if (typeof(name) !== 'string' || !Xml.#nameValidator.test(name)) { throw new Error(`Unparsable name: ${name}`); } }

  /**
   * @method escape
   * @description Escapes special XML characters in a string.
   */
  static escape(text) {
    return `${text}`.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
  }
  /**
   * @method esscapeValue
   * @description Escapes special XML characters for a value.
   */
  static escapeValue(value) {
    return Xml.escape(value)
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;')
              .replace(/\n/g, '&#10;')
              .replace(/\r/g, '&#13;');
  }
  /**
   * @method unescape
   * @description Unescapes special XML characters in a string.
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
   * @method canParse
   * @description Base canParse method.
   */
  static canParse(text) { return true; }

  /**
   * @method parse
   * @description Base parse method.
   */
  static parse(text, parsers = []) {
    parsers = [
      ...parsers,
      ...Object.getOwnPropertyNames(Xml).map(n => Xml[n])
        .filter(p => !parsers.includes(p))
    ].filter(p => typeof(p) === 'function' && typeof(p.canParse) === 'function' && typeof(p.parse) === 'function');
    const doc = new Xml.Node();
    while (text.length) {
      const parser = parsers.find(cls => cls.canParse(text));
      if (!parser) { throw new Error(`Couldn't parse: ${text.slice(0, 50)}...`); }
      const [item, remaining] = parser.parse(text, parsers);
      doc.add(item);
      text = remaining;
    }
    return doc;
  }

  /**
   * @class Xml.Content
   * @description A base class for non-structural XML content, such as text, comments, and CDATA sections.
   */
  static Content = class Content extends Xml {
    get content() { return this.#content; } #content = '';
    set content(content) { this.#content = `${content}`; }
    toString() { return Xml.escape(this.content); }
    static canParse(text) { return false; }
    static parse(text) { throw new Error(`${this.name} isn't a parser`); }
  }

  /**
   * @class Xml.Text
   * @description Represents text content in XML.
   */
  static Text = class Text extends Xml.Content {
    static canParse(text) { return !text.startsWith('<'); }
    static parse(text) {
      const term = text.indexOf('<');
      const content = term < 0 ? text : text.slice(0, term);
      const remaining = term < 0 ? '' : text.slice(term);
      const item = new Xml.Text();
      item.content = content;
      return [item, remaining];
    }
  }

  /**
   * @class Xml.Comment
   * @description Represents a comment in XML.
   */
  static Comment = class Comment extends Xml.Content {
    toString() { return `<!--${super.toString()}-->`; }
    static canParse(text) { return text.startsWith('<!--'); }
    static parse(text) {
      const end = (text = text.slice(4)).indexOf('-->');
      const content = end < 0 ? text : text.slice(0, end);
      const remaining = end < 0 ? '' : text.slice(end + 3);
      const item = new Xml.Comment();
      item.content = Xml.unescape(content);
      return [item, remaining];
    }
  }

  /**
   * @class Xml.CData
   * @description Represents a CDATA section in XML.
   */
  static CData = class CData extends Xml.Content {
    toString() { return `<![CDATA[${this.content.replace(/\]\]>/g, ']]&gt;')}]]>`; }
    static canParse(text) { return text.startsWith('<![CDATA['); }
    static parse(text) {
      const end = text.indexOf(']]>');
      const content = end < 0 ? text : text.slice(9, end);
      const remaining = end < 0 ? '' : text.slice(end + 3);
      const item = new Xml.CData();
      item.content = content;
      return [item, remaining];
    }
  }

  /**
   * @class Xml.Declaration
   * @description Represents an XML declaration.
   */
  static Declaration = class Declaration extends Xml {
    get type() { return this.#type; } #type = 'declaration';
    set type(type) {
      Xml.validateName(type);
      this.#type = type;
    }
    get pairs() { return this.#pairs; } #pairs = new Proxy({}, {
      set(t, k, v) { // valid names: version, encoding, standalone
        Xml.validateName(k);
        t[k] = `${v}`;
        return true;
      }
    });
    toString() {
      return `<?${this.type} ${Object.entries(this.#pairs).map(([k,v]) => `${k}="${Xml.escapeValue(v)}"`).join(' ')}?>`;
    }
    static #typeParser = new RegExp(`^${Xml.#namePattern}`);
    static canParse(text) { return text.startsWith('<?'); }
    static parse(text) {
      const end = (text = text.slice(2)).indexOf('?>');
      const content = end < 0 ? text : text.slice(0, end).trim();
      const remaining = end < 0 ? '' : text.slice(end + 2);
      const item = new Declaration();
      item.type = Declaration.#typeParser.exec(content)?.[0] ?? 'declaration';
      const pairsContent = content.slice(item.type.length).trim();
      const pairs = pairsContent.matchAll(/(\S+)\s*=\s*"([^"]*)"/g) || [];
      for (const [_, key, value] of pairs) {
        item.pairs[key] = Xml.unescape(value);
      }
      return [item, remaining];
    }
  }

  /**
   * @class Xml.Metadata
   * @description A common type for metadata in XML, such as DOCTYPE, ENTITY, and NOTATION.
   */
  static Metadata = class Metadata extends Xml {
    get type() { return this.#type; } #type = 'METADATA';
    set type(type) {
      Xml.validateName(type);
      this.#type = type;
    }
    get names() { return this.#names; } #names = new Proxy([], {
      set(t,k,v) {
        const isIndex = !isNaN(Number(k));
        if (isNaN(Number(k))) {
          t[k] = v;
        } else {
          Xml.validateName(v);
          t[k] = `${v}`;
        }
        return true;
      }
    });
    get values() { return this.#values; } #values = new Proxy([], {
      set(t, k, v) {
        t[k] = `${v}`;
        return true;
      }
    });
    toString() {
      let result = `<!${this.type}`;
      for (const name of this.#names) { result += ` ${name}`; }
      for (const value of this.#values) { result += ` "${Xml.escapeValue(value)}"`; }
      return `${result}>`;
    }
    static #typeParser = new RegExp(`^${Xml.#namePattern}`);
    static canParse(text) { return text.startsWith(`<!`); }
    static parse(text) {
      const end = (text = text.slice(2)).indexOf('>');
      const content = end < 0 ? text : text.slice(0, end).trim();
      const remaining = end < 0 ? '' : text.slice(end + 1);
      const item = new Xml.Metadata();
      item.type = Metadata.#typeParser.exec(content)?.[0] ?? 'METADATA';
      const valueContent = content.slice(item.type.length).trim();
      const values = valueContent.matchAll(/"([^"]*)"/g) || [];
      item.values.push(...values.map(v => v[1]));
      const nameContent = valueContent.replace(/"[^"]*"/g, '').trim();
      const names = [...nameContent.matchAll(/\S+/g)].map(t => t[0]);
      if (names.length) { item.names.push(...names); }
      return [item, remaining];
    }
  }

  /**
   * @class Xml.Node
   * @description A base class for structural XML content.
   */
  static Node = class Node extends Xml {
    [Symbol.iterator]() { return this.#children[Symbol.iterator](); } #children = [];
    get length() { return this.#children.length; }
    add(item) {
      if (!(item instanceof Xml)) { return Xml.#unset; }
      if (item.#parent instanceof Xml) { item.#parent.remove(item); }
      item.#parent = this;
      this.#children.push(item);
      return item;
    }
    remove(item) {
      if (item.#parent !== this) { return; }
      item.#parent = Xml.#unset;
      this.#children = this.#children.filter(child => child !== item);
      return item;
    }
    toString() { return this.#children.map(c => c.toString()).join(''); }
    static canParse(text) { return false; }
    static parse(text) { throw new Error(`${this.name} isn't a parser`); }
  }

  /**
   * @class Xml.Element
   * @description Represents an XML element with a name and attributes.
   */
  static Element = class Element extends Xml.Node {
    get type() { return this.#type; } #type = 'element';
    set type(name) {
      Xml.validateName(name);
      this.#type = name;
    }
    get attributes() { return this.#attributes; } #attributes = new Proxy({}, {
      set(t,k,v) {
        Xml.validateName(k);
        t[k] = `${v}`;
        return true;
      }
    });
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
    static #typeParser = new RegExp(`^${Xml.#namePattern}`);
    static canParse(text) { return /^<\w/.test(text); }
    static parse(text, parsers) {
      const end = (text = text.slice(1)).indexOf('>');
      const content = text.slice(0, end).trim();
      let remaining = text.slice(end + 1);
      const termed = content.endsWith('/');
      const node = new Xml.Element();
      node.type = Xml.Element.#typeParser.exec(content)?.[0] ?? 'element';
      const attrContent = content.replace(/\/$/, '').slice(node.type.length).trim();
      const attributes = attrContent.matchAll(/(\S+)\s*=\s*"([^"]*)"/g) || [];
      for (const [_, key, value] of attributes) {
        node.attributes[key] = Xml.unescape(value);
      }
      const nameContent = attrContent.replace(/\S+\s*=\s*"[^"]*"/g, '').trim();
      const names = nameContent.matchAll(/\S+/g) || [];
      for (const name of names) {
        node.attributes[name] = name;
      }
      if (termed) { return [node, remaining]; }
      while (remaining.length) {
        if (remaining.startsWith('</')) { break; }
        const parser = parsers.find(cls => cls.canParse(remaining));
        if (!parser) { throw new Error(`Couldn't parse: ${remaining.slice(0, 50)}...`); }
        const [item, rest] = parser.parse(remaining, parsers);
        node.add(item);
        remaining = rest;
      }
      if (new RegExp(`^</\s*${node.type}`, 'i').test(remaining)) {
        const term = remaining.indexOf('>');
        remaining = term < 0 ? '' : remaining.slice(term + 1);
      }
      return [node, remaining];
    }
  }
}
