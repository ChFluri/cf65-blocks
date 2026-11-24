/**
 * Frühere Markup-Versionen von cf65/subtitle (neueste zuerst).
 *
 * Vorgehen bei einer Änderung an save() (UMSETZPLAN Kap. 2.2):
 * 1. Bisheriges save() samt Attributen als Eintrag hier oben einfügen
 *    (`{ attributes, supports, save, migrate? }`).
 * 2. `markupVersion`-Default in block.json erhöhen.
 * 3. Neue Fixture tests/fixtures/blocks/<block>/v<neu>.html anlegen; die
 *    alten Fixtures bleiben und müssen weiter gültig sein (via deprecated).
 */
const deprecated = [];

export default deprecated;
