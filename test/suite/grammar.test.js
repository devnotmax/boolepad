const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Gramática boolepad', () => {
  it('scopeName debe ser source.boolepad', () => {
    const grammarPath = path.join(__dirname, '..', '..', 'syntaxes', '.tmLanguage.json');
    const raw = fs.readFileSync(grammarPath, 'utf8');
    const grammar = JSON.parse(raw);
    assert.strictEqual(grammar.scopeName, 'source.boolepad');
  });
});
