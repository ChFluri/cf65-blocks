# Sicherheitsrichtlinie

## Unterstützte Versionen

| Version | Sicherheitsupdates |
|---|---|
| neueste Hauptversion (`main` / letztes Release) | ✅ |
| ältere Versionen | ❌ |

## Sicherheitslücke melden

**Bitte keine öffentlichen Issues für Sicherheitslücken.**

Meldungen bitte vertraulich über GitHub:
**Security → [Report a vulnerability](https://github.com/ChFluri/cf65-blocks/security/advisories/new)**

Hilfreich sind:

- betroffene Version(en) von cf65 Blocks, WordPress und PHP
- Art der Lücke (z. B. Stored XSS, Rechteausweitung, Datenabfluss über Dynamic Content)
- benötigte Benutzerrolle (anonym, Mitarbeiter, Autor, Redakteur, Admin)
- Schritte zur Reproduktion bzw. Proof of Concept

## Ablauf

| Schritt | Ziel |
|---|---|
| Eingangsbestätigung | innerhalb von 3 Werktagen |
| Erste Einschätzung (Schweregrad nach CVSS) | innerhalb von 7 Tagen |
| Fix für kritische/hohe Lücken | so schnell wie möglich, Ziel 14 Tage |
| Veröffentlichung | Security Advisory nach Release des Fixes, mit Dank an die meldende Person (falls gewünscht) |

## Geltungsbereich

Im Fokus stehen insbesondere:

- XSS / CSS-Injection über Block-Attribute, Einstellungen oder Import
- Umgehung von Rechteprüfungen (REST-Routen, Role Manager, Custom CSS)
- Datenabfluss über Dynamic Content (private Beiträge, geschützte Felder, Benutzerdaten)
- Probleme in der Lieferkette (Abhängigkeiten, Build, Release-Artefakte)

Nicht im Geltungsbereich: Lücken in WordPress-Core, ACF, Pods oder anderen Drittanbieter-Plugins – bitte direkt dort melden.

## Release-Integrität

Jedes Release enthält `cf65-blocks.zip.sha256`. Prüfung:

```sh
sha256sum -c cf65-blocks.zip.sha256
```
