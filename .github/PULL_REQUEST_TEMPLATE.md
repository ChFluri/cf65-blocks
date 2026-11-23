## Was ändert sich?

<!-- Kurze Beschreibung, verlinktes Issue: Closes #… -->

## Art der Änderung

- [ ] Fehlerbehebung
- [ ] Neue Funktion / neuer Block
- [ ] Refactoring / Tooling
- [ ] Dokumentation

## Sicherheits-Checkliste (Pflicht, siehe `docs/UMSETZPLAN.md` Kap. 7)

- [ ] **Eingaben:** Alle Block-Attribute, REST-Parameter und Einstellungen werden serverseitig validiert/sanitisiert (Attribute gelten als unvertrauenswürdig).
- [ ] **Ausgaben:** Jede Ausgabe wird spät und kontextgerecht escaped (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`); HTML-Änderungen nur über `WP_HTML_Tag_Processor`.
- [ ] **CSS:** Stilwerte laufen durch den typisierten Sanitizer; kein Freitext im CSS (ausser Custom CSS mit `unfiltered_html`).
- [ ] **Rechte:** Jede REST-Route hat einen sinnvollen `permission_callback`; Editor-Sperren (Role Manager) werden serverseitig durchgesetzt.
- [ ] **Daten:** Dynamic Content gibt nur öffentlich sichtbare Objekte und erlaubte Felder aus.
- [ ] **Kein** `eval`, `unserialize` auf Benutzerdaten, dynamische Funktionsaufrufe aus Attributen, `innerHTML` mit Attributdaten.
- [ ] **Tests:** Payload-Tests (XSS/CSS-Injection) für neue Attribute ergänzt.

## Update-Sicherheit (Kap. 2.2)

- [ ] `save()`-Markup unverändert **oder** neue Fixture + `deprecated`-Eintrag hinzugefügt.

## Performance (Kap. 8)

- [ ] Debug-Messpunkte für neue Render-/Auflösungspfade vorhanden.
- [ ] Assets werden nur geladen, wenn der Block bzw. das Feature verwendet wird.

## Tests

- [ ] `composer lint && composer analyse && composer test`
- [ ] `npm run lint && npm run test:unit && npm run build`
- [ ] E2E (`npm run test:e2e`) lokal oder in CI grün
