# Macrova — Full de ruta i estat

Llegenda: ✅ fet · 🔄 en curs · ⏳ pendent · ⚠️ bloquejat per credencials externes

| Fase | Contingut | Sortida verificable | Bloquejadors externs | Estat |
|---|---|---|---|---|
| 0 | Auditoria, arquitectura, comptes | Aquests documents | — | ✅ |
| 1 | Expo + TS + Router + RNW, sistema de disseny (tokens clar/fosc), navegació (tabs/sidebar), client Supabase, `.env`, migracions inicials | `npm run web` arrenca; tema clar/fosc/sistema; `tsc` i lint nets | URL i anon key de Supabase per connectar | ✅ |
| 2 | Auth (email + Google + reset + delete), perfils, esquema complet, RLS | Tests SQL: usuari A no veu dades de B; login real | Projecte Supabase + Google OAuth | 🔄 (falta Google OAuth i prova manual) |
| 3 | Les 5 seccions amb dades de prova (`dev-fixtures/`) | Navegació completa, estats càrrega/buit/error | — | ⏳ |
| 4 | Catàleg, cerca, OFF, codi de barres, aliments propis, àpats, preferits, plantilles | Registrar un aliment real i veure els macros correctes | Clau USDA (opcional) | ⏳ |
| 5 | Motor BMR/TDEE/objectius setmanals/ajust d'exercici | Tests unitaris amb casos coneguts, sense doble recompte | — | ⏳ |
| 6 | Activitats manuals per esport, estimació MET, Strava, dedupe | Importar activitat de Strava sense duplicats | Credencials Strava | ⏳ ⚠️ |
| 7 | Catàleg d'exercicis, rutines, sessions, progrés de força | Completar un entrenament i veure l'evolució | Font d'imatges amb llicència | ⏳ |
| 8 | Estadístiques, gràfics, compliment | Gràfics diari/setmanal/mensual/rang | — | ⏳ |
| 9 | Sync multi-dispositiu, offline, conflictes, QA mòbil/escriptori/fosc | Tests de sync + prova manual a 2 dispositius | iPhone amb development build | ⏳ |
| 10 | Producció, seguretat, PWA, EAS iOS/Android, docs de publicació | Checklist de llançament complet | Comptes Apple/Google | ⏳ |

## Regla de pas de fase
No s'avança si hi ha errors crítics: tests en vermell, `tsc` amb errors, o una política RLS sense verificar.

## Seguiment de funcionalitats
S'actualitzarà a `docs/FEATURES.md` (completades / pendents / limitacions) al final de cada fase.

## Decisions obertes
1. SQLite local + outbox (proposat) vs. alternativa més simple.
2. Si cal Sign in with Apple abans de publicar a l'App Store.
3. Pla de Supabase per a producció (Pro).
