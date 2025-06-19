import XML from './xml.js';
const validNameChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-:';

export function validateNameInvalidatesEmpty(assert) {
  try { XML.validateName(''); assert(false, 'Expected exception'); }
  catch (e) { assert(true); }
}

export function validateNameInvalidatesInvalidChars(assert) {
  for (let i = 0; i < 65536; i++) {
    const char = String.fromCharCode(i);
    if (validNameChars.indexOf(char) >= 0) { continue; }
    try { XML.validateName(char); assert(false, `Expected exception for 'code: ${i}, char: ${char}'`); }
    catch (e) { assert(true); }
  }
}

export function validateNameValidatesValidChars(assert) {
  for (let char of validNameChars) {
    try { XML.validateName(char); assert(true); }
    catch (e) { assert(false, `Unexpected exception for char: ${char}`); }
  }
}

export function escapeEscapesAmpersands(assert) {
  const result = XML.escape('AT&T');
  assert(result === 'AT&amp;T', `Expected 'AT&amp;T', got '${result}'`);
}

export function escapeEscapesLessThan(assert) {
  const result = XML.escape('3 < 4');
  assert(result === '3 &lt; 4', `Expected '3 &lt; 4', got '${result}'`);
}

export function escapeEscapesGreaterThan(assert) {
  const result = XML.escape('4 > 3');
  assert(result === '4 &gt; 3', `Expected '4 &gt; 3', got '${result}'`);
}

export function escapeDoesntEscapeQuotes(assert) {
  const result = XML.escape('"Hello"');
  assert(result === '"Hello"', `Expected '"Hello"', got '${result}'`);
}

export function escapeDoesntEscapesApostrophes(assert) {
  const result = XML.escape("It's me");
  assert(result === "It's me", `Expected '"It's me"', got '${result}'`);
} 

export function escapeValueEscapesAmpersands(assert) {
  const result = XML.escapeValue('AT&T');
  assert(result === 'AT&amp;T', `Expected 'AT&amp;T', got '${result}'`);
}

export function escapeValueEscapesLessThan(assert) {
  const result = XML.escapeValue('3 < 4');
  assert(result === '3 &lt; 4', `Expected '3 &lt; 4', got '${result}'`);
}

export function escapeValueEscapesGreaterThan(assert) {
  const result = XML.escapeValue('4 > 3');
  assert(result === '4 &gt; 3', `Expected '4 &gt; 3', got '${result}'`);
}

export function escapeValueEscapesQuotes(assert) {
  const result = XML.escapeValue('"Hello"');
  assert(result === '&quot;Hello&quot;', `Expected '&quot;Hello&quot;', got '${result}'`);
}

export function escapeValueEscapesApostrophes(assert) {
  const result = XML.escapeValue("It's me");
  assert(result === 'It&apos;s me', `Expected 'It&apos;s me', got '${result}'`);
}

export function escapeValueEscapesNewlines(assert) {
  const result = XML.escapeValue('Line1\nLine2');
  assert(result === 'Line1&#10;Line2', `Expected 'Line1&#10;Line2', got '${result}'`);
}

export function escapeValueEscapesCarriageReturns(assert) {
  const result = XML.escapeValue('Line1\rLine2');
  assert(result === 'Line1&#13;Line2', `Expected 'Line1&#13;Line2', got '${result}'`);
}

export function unescapeUnescapesAmpersands(assert) {
  const result = XML.unescape('AT&amp;T');
  assert(result === 'AT&T', `Expected 'AT&T', got '${result}'`);
}

export function unescapeUnescapesLessThan(assert) {
  const result = XML.unescape('3 &lt; 4');
  assert(result === '3 < 4', `Expected '3 < 4', got '${result}'`);
}

export function unescapeUnescapesGreaterThan(assert) {
  const result = XML.unescape('4 &gt; 3');
  assert(result === '4 > 3', `Expected '4 > 3', got '${result}'`);
}

export function unescapeUnescapesQuotes(assert) {
  const result = XML.unescape('&quot;Hello&quot;');
  assert(result === '"Hello"', `Expected '"Hello"', got '${result}'`);
}

export function unescapeUnescapesApostrophes(assert) {
  const result = XML.unescape('It&apos;s me');
  assert(result === "It's me", `Expected "It's me", got '${result}'`);
}

export function unescapeUnescapesNewlines(assert) {
  const result = XML.unescape('Line1&#10;Line2');
  assert(result === 'Line1\nLine2', `Expected 'Line1\nLine2', got '${result}'`);
}

export function unescapeUnescapesCarriageReturns(assert) {
  const result = XML.unescape('Line1&#13;Line2');
  assert(result === 'Line1\rLine2', `Expected 'Line1\rLine2', got '${result}'`);
}

export function xmlCanParseAlwaysTrue(assert) {
  assert(XML.canParse() === true, 'Expected Xml.canParse with no args');
  assert(XML.canParse('') === true, 'Expected Xml.canParse with empty string');
  assert(XML.canParse('<root/>') === true, 'Expected Xml.canParse with valid XML');
  assert(XML.canParse('text') === true, 'Expected Xml.canParse with text');
}

export function textCanParseNonTag(assert) {
  assert(XML.Text.canParse('Hello World') === true, 'Expected Text.canParse non-tag');
  assert(XML.Text.canParse('<root/>') === false, 'Expected !Text.canParse tag');
}

export function elementCanParseTag(assert) {
  assert(XML.Element.canParse('<root/>') === true, 'Expected Element.canParse tag');
  assert(XML.Element.canParse('Hello World') === false, 'Expected !Element.canParse non-tag');
}

export function commentCanParseComment(assert) {
  assert(XML.Comment.canParse('<!-- This is a comment -->') === true, 'Expected Comment.canParse comment');
  assert(XML.Comment.canParse('<root/>') === false, 'Expected !Comment.canParse tag');
  assert(XML.Comment.canParse('Hello World') === false, 'Expected !Comment.canParse non-tag');
} 

export function declarationCanParseDeclaration(assert) {
  assert(XML.Declaration.canParse('<?xml version="1.0"?>') === true, 'Expected Declaration.canParse declaration');
  assert(XML.Declaration.canParse('<root/>') === false, 'Expected !Declaration.canParse tag');
  assert(XML.Declaration.canParse('Hello World') === false, 'Expected !Declaration.canParse non-tag');
} 

export function metadataCanParseMetadata(assert) {
  assert(XML.Metadata.canParse('<!METADATA NAME TAG "value">') === true, 'Expected Metadata.canParse metadata');
  assert(XML.Metadata.canParse('<root/>') === false, 'Expected !Metadata.canParse tag');
  assert(XML.Metadata.canParse('Hello World') === false, 'Expected !Metadata.canParse non-tag');
}

export function cdataCanParseCdata(assert) {
  assert(XML.CData.canParse('<![CDATA[ some <cdata> content ]]>') === true, 'Expected CDATA.canParse cdata');
  assert(XML.CData.canParse('<root/>') === false, 'Expected !CDATA.canParse tag');
  assert(XML.CData.canParse('Hello World') === false, 'Expected !CDATA.canParse non-tag');
}

export function contentCanParseNothing(assert) {
  assert(XML.Content.canParse() === false, 'Expected !Content.canParse no args');
  assert(XML.Content.canParse('') === false, 'Expected !Content.canParse empty string');
  assert(XML.Content.canParse('Hello World') === false, 'Expected !Content.canParse text');
  assert(XML.Content.canParse('<root/>') === false, 'Expected !Content.canParse element');
}

export function nodeCanParseNothing(assert) {
  assert(XML.Node.canParse() === false, 'Expected !Node.canParse no args');
  assert(XML.Node.canParse('') === false, 'Expected !Node.canParse empty string');
  assert(XML.Node.canParse('Hello World') === false, 'Expected !Node.canParse text');
  assert(XML.Node.canParse('<root/>') === false, 'Expected !Node.canParse element');
}




// Integration




export function parseEmpty(assert) {
  const result = XML.parse('');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  const items = [...result];
  assert(items.length === 0, 'Expected 0 items');
}

export function parseText(assert) {
  const result = XML.parse('Hello World');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 1, 'Expected 1 item');
  const item = [...result][0];
  assert(item instanceof XML.Text, 'Expected XML.TextNode');
  assert(item.content === 'Hello World', `Expected 'Hello World', got '${item.content}'`);
}

export function parseElementSelfClosing(assert) {
  const result = XML.parse('<root/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 1, 'Expected 1 item');
  const item = [...result][0];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'root', `Expected 'root', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
}

export function parseElementOpenAndClose(assert) {
  const result = XML.parse('<root></root>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 1, 'Expected 1 item');
  const item = [...result][0];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'root', `Expected 'root', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
}

export function parseElementWithAttributes(assert) {
  const result = XML.parse('<root attr1="value1" attr2="value2"/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 1, 'Expected 1 item');
  const item = [...result][0];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'root', `Expected 'root', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
  assert(Object.entries(item.attributes).length === 2, 'Expected 2 attributes');
  assert(item.attributes.attr1 === 'value1', `Expected attr1 'value1', got '${item.attributes.attr1}'`);
  assert(item.attributes.attr2 === 'value2', `Expected attr2 'value2', got '${item.attributes.attr2}'`);
}

export function parseTextThenElementThenText(assert) {
  const result = XML.parse('Hello<root/>World');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 3, 'Expected 3 items');
  const items = [...result];
  let item = items[0];
  assert(item instanceof XML.Text, 'Expected XML.TextNode');
  assert(item.content === 'Hello', `Expected 'Hello', got '${item.content}'`);
  item = items[1];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'root', `Expected 'root', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
  item = items[2];
  assert(item instanceof XML.Text, 'Expected XML.TextNode');
  assert(item.content === 'World', `Expected 'World', got '${item.content}'`);
}

export function parseElementThenTextThenElement(assert) {
  const result = XML.parse('<root/>Hello<world/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 3, 'Expected 3 items');
  const items = [...result];
  let item = items[0];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'root', `Expected 'root', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
  item = items[1];
  assert(item instanceof XML.Text, 'Expected XML.TextNode');
  assert(item.content === 'Hello', `Expected 'Hello', got '${item.content}'`);
  item = items[2];
  assert(item instanceof XML.Element, 'Expected XML.Element');
  assert(item.type === 'world', `Expected 'world', got '${item.type}'`);
  assert(item.length === 0, 'Expected 0 children');
}

export function parseElementWithChildren(assert) {
  const result = XML.parse('<root><child1/><child2/></root>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 1, 'Expected 1 item');
  const root = [...result][0];
  assert(root instanceof XML.Element, 'Expected XML.Element');
  assert(root.type === 'root', `Expected 'root', got '${root.type}'`);
  assert(root.length === 2, 'Expected 2 children');
  const children = [...root];
  let child = children[0];
  assert(child instanceof XML.Element, 'Expected XML.Element');
  assert(child.type === 'child1', `Expected 'child1', got '${child.type}'`);
  assert(child.length === 0, 'Expected 0 children');
  child = children[1];
  assert(child instanceof XML.Element, 'Expected XML.Element');
  assert(child.type === 'child2', `Expected 'child2', got '${child.type}'`);
  assert(child.length === 0, 'Expected 0 children');
}

export function parseComment(assert) {
  const result = XML.parse('<!-- This is a comment --><root/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 2, 'Expected 2 items');
  const comment = [...result][0];
  assert(comment instanceof XML.Comment, 'Expected XML.Comment');
  assert(comment.content === ' This is a comment ', `Expected ' This is a comment ', got '${comment.content}'`);
  const root = [...result][1];
  assert(root instanceof XML.Element, 'Expected XML.Element');
  assert(root.type === 'root', `Expected 'root', got '${root.type}'`);
  assert(root.length === 0, 'Expected 0 children');
}

export function parseDeclaration(assert) {
  const result = XML.parse('<?xml version="1.0" encoding="UTF-8"?><root/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 2, 'Expected 2 items');
  const declare = [...result][0];
  assert(declare instanceof XML.Declaration, 'Expected XML.Declaration');
  assert(declare.type === 'xml', `Expected 'xml', got '${declare.type}'`);
  assert(Object.entries(declare.pairs).length === 2, 'Expected 2 pairs');
  assert(declare.pairs.version === '1.0', `Expected version '1.0', got '${declare.pairs.version}'`);
  assert(declare.pairs.encoding === 'UTF-8', `Expected encoding 'UTF-8', got '${declare.pairs.encoding}'`);
  const root = [...result][1];
  assert(root instanceof XML.Element, 'Expected XML.Element');
  assert(root.type === 'root', `Expected 'root', got '${root.type}'`);
  assert(root.length === 0, 'Expected 0 children');
}

export function parseMetadata(assert) {
  const result = XML.parse('<!METADATA NAME TAG "value" "other"><root/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 2, 'Expected 2 items');
  const meta = [...result][0];
  assert(meta instanceof XML.Metadata, 'Expected XML.Metadata');
  assert(meta.type === 'METADATA', `Expected 'METADATA', got '${meta.type}'`);
  assert(meta.names.length === 2, 'Expected 2 names');
  assert(meta.values.length === 2, 'Expected 2 values');
  assert(meta.names[0] === 'NAME', `Expected 'NAME', got '${meta.names[0]}'`);
  assert(meta.names[1] === 'TAG', `Expected 'TAG', got '${meta.values[1]}'`);
  assert(meta.values[0] === 'value', `Expected 'value', got '${meta.values[0]}'`);
  assert(meta.values[1] === 'other', `Expected 'other', got '${meta.values[1]}'`);
  const root = [...result][1];
  assert(root instanceof XML.Element, 'Expected XML.Element');
  assert(root.type === 'root', `Expected 'root', got '${root.type}'`);
  assert(root.length === 0, 'Expected 0 children');
}

export function parseCdata(assert) {
  const result = XML.parse('<![CDATA[ some <cdata> content ]]><root/>');
  assert(result instanceof XML.Node, 'Expected XML.Node');
  assert(result.length === 2, 'Expected 2 items');
  const cdata = [...result][0];
  assert(cdata instanceof XML.CData, 'Expected XML.CData');
  assert(cdata.content === ' some <cdata> content ', `Expected ' some <cdata> content ', got '${cdata.content}'`);
  const root = [...result][1];
  assert(root instanceof XML.Element, 'Expected XML.Element');
  assert(root.type === 'root', `Expected 'root', got '${root.type}'`);
  assert(root.length === 0, 'Expected 0 children');
}
