/** @import {AssertFunction} from './test.js' */
import XML from './xml.js';
const validNameChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-:';

export function validateNameInvalidatesEmpty(/** @type {AssertFunction} */ assert) {
  try { XML.validateName(''); assert(false, 'Expected exception'); }
  catch (e) { assert(true); }
}

export function validateNameInvalidatesInvalidChars(/** @type {AssertFunction} */ assert) {
  for (let i = 0; i < 65536; i++) {
    const char = String.fromCharCode(i);
    if (validNameChars.indexOf(char) >= 0) { continue; }
    try { XML.validateName(char); assert(false, `Expected exception for 'code: ${i}, char: ${char}'`); }
    catch (e) { assert(true); }
  }
}

export function validateNameValidatesValidChars(/** @type {AssertFunction} */ assert) {
  for (let char of validNameChars) {
    try { XML.validateName(char); assert(true); }
    catch (e) { assert(false, `Unexpected exception for char: ${char}`); }
  }
}

export function validateNameReturnsValidatedName(/** @type {AssertFunction} */ assert) {
  const name = 'valid_Name-123:.';
  try {
    const result = XML.validateName(name);
    assert(result === name, `Expected '${name}', got '${result}'`);
  } catch (e) {
    assert(false, `Unexpected exception for name: ${name}`);
  }
}

export function escapeEscapesAmpersands(/** @type {AssertFunction} */ assert) {
  const result = XML.escape('AT&T');
  assert(result === 'AT&amp;T', `Expected 'AT&amp;T', got '${result}'`);
}

export function escapeEscapesLessThan(/** @type {AssertFunction} */ assert) {
  const result = XML.escape('3 < 4');
  assert(result === '3 &lt; 4', `Expected '3 &lt; 4', got '${result}'`);
}

export function escapeEscapesGreaterThan(/** @type {AssertFunction} */ assert) {
  const result = XML.escape('4 > 3');
  assert(result === '4 &gt; 3', `Expected '4 &gt; 3', got '${result}'`);
}

export function escapeDoesntEscapeQuotes(/** @type {AssertFunction} */ assert) {
  const result = XML.escape('"Hello"');
  assert(result === '"Hello"', `Expected '"Hello"', got '${result}'`);
}

export function escapeDoesntEscapesApostrophes(/** @type {AssertFunction} */ assert) {
  const result = XML.escape("It's me");
  assert(result === "It's me", `Expected '"It's me"', got '${result}'`);
} 

export function escapeValueEscapesAmpersands(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('AT&T');
  assert(result === 'AT&amp;T', `Expected 'AT&amp;T', got '${result}'`);
}

export function escapeValueEscapesLessThan(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('3 < 4');
  assert(result === '3 &lt; 4', `Expected '3 &lt; 4', got '${result}'`);
}

export function escapeValueEscapesGreaterThan(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('4 > 3');
  assert(result === '4 &gt; 3', `Expected '4 &gt; 3', got '${result}'`);
}

export function escapeValueEscapesQuotes(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('"Hello"');
  assert(result === '&quot;Hello&quot;', `Expected '&quot;Hello&quot;', got '${result}'`);
}

export function escapeValueEscapesApostrophes(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue("It's me");
  assert(result === 'It&apos;s me', `Expected 'It&apos;s me', got '${result}'`);
}

export function escapeValueEscapesNewlines(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('Line1\nLine2');
  assert(result === 'Line1&#10;Line2', `Expected 'Line1&#10;Line2', got '${result}'`);
}

export function escapeValueEscapesCarriageReturns(/** @type {AssertFunction} */ assert) {
  const result = XML.escapeValue('Line1\rLine2');
  assert(result === 'Line1&#13;Line2', `Expected 'Line1&#13;Line2', got '${result}'`);
}

export function unescapeUnescapesAmpersands(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('AT&amp;T');
  assert(result === 'AT&T', `Expected 'AT&T', got '${result}'`);
}

export function unescapeUnescapesLessThan(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('3 &lt; 4');
  assert(result === '3 < 4', `Expected '3 < 4', got '${result}'`);
}

export function unescapeUnescapesGreaterThan(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('4 &gt; 3');
  assert(result === '4 > 3', `Expected '4 > 3', got '${result}'`);
}

export function unescapeUnescapesQuotes(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('&quot;Hello&quot;');
  assert(result === '"Hello"', `Expected '"Hello"', got '${result}'`);
}

export function unescapeUnescapesApostrophes(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('It&apos;s me');
  assert(result === "It's me", `Expected "It's me", got '${result}'`);
}

export function unescapeUnescapesNewlines(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('Line1&#10;Line2');
  assert(result === 'Line1\nLine2', `Expected 'Line1\nLine2', got '${result}'`);
}

export function unescapeUnescapesCarriageReturns(/** @type {AssertFunction} */ assert) {
  const result = XML.unescape('Line1&#13;Line2');
  assert(result === 'Line1\rLine2', `Expected 'Line1\rLine2', got '${result}'`);
}

export function textCanParseNonTag(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Text.Parser();
  assert(parser.canParse('Hello World') === true, 'Expected Text.canParse non-tag');
  assert(parser.canParse('<root/>') === false, 'Expected !Text.canParse tag');
}

export function elementCanParseTag(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Element.Parser();
  assert(parser.canParse('<root/>') === true, 'Expected Element.canParse tag');
  assert(parser.canParse('Hello World') === false, 'Expected !Element.canParse non-tag');
}

export function commentCanParseComment(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Comment.Parser();
  assert(parser.canParse('<!-- This is a comment -->') === true, 'Expected Comment.canParse comment');
  assert(parser.canParse('<root/>') === false, 'Expected !Comment.canParse tag');
  assert(parser.canParse('Hello World') === false, 'Expected !Comment.canParse non-tag');
} 

export function declarationCanParseDeclaration(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Declaration.Parser();
  assert(parser.canParse('<?xml version="1.0"?>') === true, 'Expected Declaration.canParse declaration');
  assert(parser.canParse('<root/>') === false, 'Expected !Declaration.canParse tag');
  assert(parser.canParse('Hello World') === false, 'Expected !Declaration.canParse non-tag');
} 

export function metadataCanParseMetadata(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Metadata.Parser();
  assert(parser.canParse('<!METADATA NAME TAG "value">') === true, 'Expected Metadata.canParse metadata');
  assert(parser.canParse('<root/>') === false, 'Expected !Metadata.canParse tag');
  assert(parser.canParse('Hello World') === false, 'Expected !Metadata.canParse non-tag');
}

export function cdataCanParseCdata(/** @type {AssertFunction} */ assert) {
  const parser = new XML.CData.Parser();
  assert(parser.canParse('<![CDATA[ some <cdata> content ]]>') === true, 'Expected CDATA.canParse cdata');
  assert(parser.canParse('<root/>') === false, 'Expected !CDATA.canParse tag');
  assert(parser.canParse('Hello World') === false, 'Expected !CDATA.canParse non-tag');
}

export function baseParserCanParseThrows(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Parser();
  // @ts-ignore
  try { parser.canParse(); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.canParse(''); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.canParse('Hello World'); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.canParse('<root/>'); assert(false, 'Expected exception'); } catch { assert(true); }
}

export function baseParserParseThrows(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Parser();
  // @ts-ignore
  try { parser.parse(); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.parse('', []); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.parse('Hello World', []); assert(false, 'Expected exception'); } catch { assert(true); }
  try { parser.parse('<root/>', []); assert(false, 'Expected exception'); } catch { assert(true); }
}

export function parseEmpty(/** @type {AssertFunction} */ assert) {
  const result = XML.parse('');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  const items = [...result];
  assert(items.length === 0, 'Expected 0 items');
}

export function textParserParsesText(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Text.Parser();
  const [result, remainer] = parser.parse('Hello World<123', []);
  assert(remainer === '<123', `Expected remainder '<123', got '${remainer}'`);
  assert(result instanceof XML.Text, 'Expected XML.TextNode');
  assert(result.content === 'Hello World', `Expected 'Hello World', got '${result.content}'`);
}

export function commentParserParsesComment(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Comment.Parser();
  const [result, remainer] = parser.parse('<!-- This is a comment -->123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.Comment, 'Expected XML.Comment');
  assert(result.content === ' This is a comment ', `Expected ' This is a comment ', got '${result.content}'`);
}

export function cdataParserParsesCdata(/** @type {AssertFunction} */ assert) {
  const parser = new XML.CData.Parser();
  const [result, remainer] = parser.parse('<![CDATA[ some <cdata> content ]]>123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.CData, 'Expected XML.CData');
  assert(result.content === ' some <cdata> content ', `Expected ' some <cdata> content ', got '${result.content}'`);
}

export function elementParserParsesElementSelfClosing(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Element.Parser();
  const [result, remainer] = parser.parse('<root/>123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.Element, 'Expected XML.Element');
  assert(result.type === 'root', `Expected 'root', got '${result.type}'`);
  assert(result.length === 0, 'Expected 0 children');
}

export function elementParserParsesEmptyElement(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Element.Parser();
  const [result, remainer] = parser.parse('<root></root>123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.Element, 'Expected XML.Element');
  assert(result.type === 'root', `Expected 'root', got '${result.type}'`);
  assert(result.length === 0, 'Expected 0 children');
}

export function elementParserParsesSelfCloseWithAttributes(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Element.Parser();
  const [result, remainer] = parser.parse('<root attr1="value1" attr2="value2"/>123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.Element, 'Expected XML.Element');
  assert(result.type === 'root', `Expected 'root', got '${result.type}'`);
  assert(result.length === 0, 'Expected 0 children');
  assert(Object.entries(result.attributes).length === 2, 'Expected 2 attributes');
  assert(result.attributes.attr1 === 'value1', `Expected attr1 'value1', got '${result.attributes.attr1}'`);
  assert(result.attributes.attr2 === 'value2', `Expected attr2 'value2', got '${result.attributes.attr2}'`);
}

export function elementParserParsesEmptyElementWithAttributes(/** @type {AssertFunction} */ assert) {
  const parser = new XML.Element.Parser();
  const [result, remainer] = parser.parse('<root attr1="value1" attr2="value2"></root>123', []);
  assert(remainer === '123', `Expected remainder '123', got '${remainer}'`);
  assert(result instanceof XML.Element, 'Expected XML.Element');
  assert(result.type === 'root', `Expected 'root', got '${result.type}'`);
  assert(result.length === 0, 'Expected 0 children');
  assert(Object.entries(result.attributes).length === 2, 'Expected 2 attributes');
  assert(result.attributes.attr1 === 'value1', `Expected attr1 'value1', got '${result.attributes.attr1}'`);
  assert(result.attributes.attr2 === 'value2', `Expected attr2 'value2', got '${result.attributes.attr2}'`);
}

export function parseIntegrationTest(/** @type {AssertFunction} */ assert) {
  const xmlText = `
    <?xml version="1.0"?>
    <!-- This is a comment -->
    <root attr="value">
      Hello World
      <![CDATA[ some <cdata> content ]]>
      <child/>
    </root>
  `;
  const result = XML.parse(xmlText);
  const doc = [...result];
  assert(doc.length === 7, `Expected 7 outer items, got ${doc.length}`);
  assert(doc[0] instanceof XML.Text, 'Expected first item to be XML.Text');
  assert(doc[1] instanceof XML.Declaration, 'Expected second item to be XML.Declaration');
  assert(doc[2] instanceof XML.Text, 'Expected third item to be XML.Text');
  assert(doc[3] instanceof XML.Comment, 'Expected fourth item to be XML.Comment');
  assert(doc[4] instanceof XML.Text, 'Expected fifth item to be XML.Text');
  assert(doc[5] instanceof XML.Element, 'Expected sixth item to be XML.Element');
  assert(doc[6] instanceof XML.Text, 'Expected seventh item to be XML.Text');
  const root = [...doc[5]];
  assert(root.length === 5, `Expected 5 root items, got ${root.length}`);
  assert(root[0] instanceof XML.Text, 'Expected first root item to be XML.Text');
  assert(root[1] instanceof XML.CData, 'Expected second root item to be XML.CData');
  assert(root[2] instanceof XML.Text, 'Expected third root item to be XML.Text');
  assert(root[3] instanceof XML.Element, 'Expected fourth root item to be XML.Element');
  assert(root[4] instanceof XML.Text, 'Expected fifth root item to be XML.Text');
}
