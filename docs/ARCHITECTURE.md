# Macrova — Arquitectura tècnica (Fase 0)

Estat de la carpeta en iniciar: **buida** (cap fitxer, cap dependència, cap `.env`). No hi ha res a preservar.
Entorn detectat: Node 24.11.1, npm 11.6.2, Git 2.54. **Supabase CLI no instal·lat** (s'usarà via `npx supabase`).

## 1. Decisions tècniques

| Àrea | Decisió | Motiu |
|---|---|---|
| Framework | Expo (SDK estable actual) + React Native + TypeScript estricte | Una sola base per iOS, web i Android futur |
| Rutes | Expo Router (file-based) amb layouts per plataforma | Deep links, web URLs reals |
| Web | React Native Web + PWA (manifest + service worker) | Requisit d'escriptori/Windows |
| Estat servidor | TanStack Query + persistència a disc | Cache, reintents, optimistic updates |
| Offline | **SQLite local (expo-sqlite; a web, wa-sqlite/OPFS)** + cua de mutacions (outbox) | Vegeu §3. AsyncStorage no escala per a logs d'aliments |
| Validació | Zod (esquemes compartits client / Edge Functions) | Una sola font de veritat |
| Formularis | React Hook Form + `@hookform/resolvers/zod` | |
| Gràfics | `victory-native` (Skia) a mòbil / alternativa SVG compartida a web; encapsulat en `components/charts` per poder-ho canviar | Cal verificar compatibilitat a Fase 1 (Skia a web requereix CanvasKit); si falla, `react-native-svg` + d3-shape |
| i18n | `i18next` + `react-i18next`, fitxers `ca`, `en`, (`es` preparat) | Cap text hardcoded |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions Deno) | |
| Builds | EAS Build / EAS Submit | |
| Tests | Vitest (lògica pura: nutrició, calories, sync), pgTAP / SQL tests per a RLS, Playwright per a web | |

**Canvi de decisió prevenit (norma 13):** el prompt demana «sistema d'emmagatzematge local» sense especificar-lo. Proposo SQLite (no AsyncStorage/MMKV) per suportar consultes per data, agregats i una outbox fiable. Si no hi estàs d'acord, digues-ho abans de la Fase 1.

## 2. Principis de disseny de dades

- **Tots els IDs són UUID generats al client** (`uuidv7` quan sigui possible) → permet crear registres offline i evita duplicats en reintents (idempotència per PK).
- Cada taula personal té `user_id uuid not null references auth.users on delete cascade`, `created_at`, `updated_at`, `deleted_at` (soft delete per sincronitzar esborrats) i `version`/`updated_at` per a conflictes.
- **Snapshot nutricional** a cada `food_log_entries`: `kcal, protein_g, carbs_g, fat_g, fiber_g…` ja escalats + `per_100` original + `source` + `source_ref` + `fetched_at`. Els canvis posteriors al catàleg mai alteren l'historial.
- **Objectius històrics**: `nutrition_targets` amb `effective_from` (rang de vigència) + `daily_summaries.target_snapshot jsonb`.
- Fonts: enum `data_source` = `off | usda | bedca | ciqual | user | manual_estimate`; `verified boolean` només per a fonts externes revisades; l'entrada de l'usuari es marca com `user`.
- Unitats a la BD sempre mètriques (g, ml, m, s, kg); conversió a lb/mi només a la UI.
- Dates: `log_date date` (data local de l'usuari, **no** timestamp) + `tz text` al perfil. Evita errors de zona horària.
- Pes corporal futur: taula `body_measurements` (type, value, measured_at) creada buida des del principi, sense UI a la v1.

### Taules principals (esquema lògic)

```
profiles, user_preferences, physical_profiles
nutrition_settings (mode calories, activity multiplier, deficit, overrides, exercise_adjust_mode)
nutrition_targets (user_id, weekday|null, kcal, protein_g, carbs_g, fat_g, effective_from, effective_to)
foods (catalog global: source, source_ref, barcode, name, brand, per_100, serving_sizes, category, image_url, license/attribution)   -- lectura pública, escriptura només service_role
user_foods (aliments personalitzats, mateixa forma) ; food_favorites ; food_recent (derivat)
meal_types (per usuari: ordre, nom, per defecte)
food_log_entries (snapshot nutricional, meal_type_id, log_date, quantity, unit)
saved_meals + saved_meal_items (plantilles)
activity_types (catàleg extensible: key, MET, schema de camps JSON) ; activities (manual|strava)
strava_connections (tokens xifrats, accessible NOMÉS per service_role) ; strava_sync_state
exercises (catàleg global) ; user_exercises ; routines + routine_exercises
workout_sessions + workout_sets
daily_summaries (materialitzat, recalculat per trigger/funció)
body_measurements (futur)
sync: tombstones via deleted_at ; mutation_log opcional per a depuració
```

### RLS
- Taules personals: `using (user_id = auth.uid()) with check (user_id = auth.uid())` per a SELECT/INSERT/UPDATE/DELETE.
- Catàlegs globals (`foods`, `exercises`, `activity_types`): SELECT a `authenticated`; escriptura només `service_role`.
- `strava_connections`: **cap** política per a `authenticated`; només Edge Functions amb service key. El client només veu una vista `strava_status` (connectat sí/no, últim sync).
- Eliminació de compte: Edge Function amb service role → `auth.admin.deleteUser` (cascada).
- Prova obligatòria (Fase 2): dos usuaris de test, tests SQL que verifiquen que A no pot llegir/escriure/esborrar dades de B.

## 3. Estratègia de sincronització i offline

1. **Font de veritat**: Postgres. El client és una rèplica local parcial.
2. **Escriptures**: sempre a SQLite local primer (UI immediata) + fila a la **outbox** (`op`, `table`, `row_id`, `payload`, `client_ts`, `attempts`).
3. **Push**: worker que envia outbox en ordre quan hi ha connexió (upsert per PK UUID → idempotent; sense duplicats en reintents).
4. **Pull**: per taula, `select ... where updated_at > last_pulled_at order by updated_at` (cursor incremental) + **Supabase Realtime** per invalidar/actualitzar en viu entre dispositius.
5. **Conflictes**: per registre, *last-writer-wins per camp amb `updated_at` del servidor* per a entitats simples; per a `food_log_entries` i sessions, els registres són en gran part append-only, de manera que els conflictes reals són rars. Una escriptura mai sobreescriu una versió **més nova** del servidor: el servidor rebutja (`updated_at` més vell) i el client fusiona i mostra l'avís si hi ha conflicte real.
6. **Esborrats**: soft delete (`deleted_at`) per propagar-se a altres dispositius.
7. Indicador d'estat a la UI: `synced / syncing / offline (N pendents) / error`.
8. Prova (Fase 9): simulació de dos clients, offline → online, edicions concurrents; tests automàtics sobre el motor de sync.

## 4. Capa de càlcul centralitzada (`packages/core` / `src/core`)

Funcions pures, 100 % testejades, sense dependències de UI:

- `scaleNutrients(per100, quantity, unit)` · `sumNutrients(entries)` · `roundForDisplay`
- `bmrMifflinStJeor({sex, weightKg, heightCm, age})` — H: `10w + 6.25h − 5a + 5`; D: `… − 161`
- `tdee(bmr, activityFactor)` · `calorieTarget(tdee, delta)`
- `exerciseAdjustment(mode: 'fixed'|'dynamic', burned, activityIncludesExercise)` — evita doble recompte (§8.4)
- `estimateActivityKcal(type, weightKg, durationS, distanceM, intensity)` — MET (Compendium of Physical Activities) + models per esport
- `dailyProgress(targets, consumed, burned, mode)`
- Tests amb valors coneguts (p. ex. home 30 a, 80 kg, 180 cm → BMR 1.780 kcal).

## 5. Integracions externes

- **Open Food Facts**: consultes des d'una **Edge Function proxy** (`food-search`, `food-barcode`) amb `User-Agent` identificatiu, cache a `foods`, respecte de límits (~100 req/min lectura de producte, ~10 req/min cerca) i atribució ODbL/DbCL visible a l'app. No es copien imatges sense respectar CC-BY-SA.
- **Complements (a validar a Fase 4)**: USDA FoodData Central (domini públic CC0, clau gratuïta, bo per genèrics), CIQUAL (ANSES, llicència oberta), BEDCA (base espanyola, cal revisar disponibilitat/llicència d'API). Cap és garantia de cobertura completa.
- **Supermercats (Mercadona, Lidl…)**: **no existeixen API oficials públiques**. La cobertura vindrà d'Open Food Facts (comunitat) i de l'aportació d'usuaris. No faré scraping de webs de supermercats (ToS/legal). Ho documentaré com a limitació coneguda.
- **Strava**: OAuth 2.0 via Edge Function (`strava-oauth-start`, `strava-oauth-callback`, `strava-sync`, `strava-webhook`); tokens xifrats a BD; refresc automàtic; webhooks per a sync automàtic; deduplicació per `strava_activity_id` únic. Límits per defecte: 100 peticions/15 min i 1.000/dia; una app nova només admet **1 atleta (el propietari)** fins que Strava aprova l'ampliació (cal revisió i complir les *Brand Guidelines*). Cal tenir-ho en compte per al llançament.

## 6. Estructura de carpetes proposada

```
MACROVA/
├─ app/                      # Expo Router
│  ├─ (auth)/  sign-in · sign-up · forgot-password · callback
│  ├─ (app)/
│  │  ├─ _layout.tsx         # Tabs (mòbil) / Sidebar (web ample)
│  │  ├─ today/ food/ activity/ progress/ profile/
│  │  └─ food/search · scan · create · [foodId]
│  └─ +html.tsx · +not-found.tsx
├─ src/
│  ├─ core/                  # càlculs purs + tests  (nutrition, energy, activity, goals)
│  ├─ data/                  # SQLite, outbox, sync engine, repositoris, hooks TanStack
│  ├─ features/              # today, food, activity, gym, progress, profile, auth
│  ├─ design/                # tokens, tema clar/fosc, components base (Button, Card, Ring…)
│  ├─ i18n/                  # ca.json · en.json · (es.json)
│  ├─ lib/                   # supabase client, env, platform helpers (.native/.web)
│  └─ types/                 # tipus generats de Supabase
├─ supabase/
│  ├─ migrations/            # SQL versionat
│  ├─ functions/             # food-search, food-barcode, strava-*, delete-account
│  ├─ seed/                  # catàleg d'exercicis i tipus d'activitat (NO dades personals)
│  ├─ tests/                 # tests SQL de RLS
│  └─ config.toml
├─ dev-fixtures/             # dades de prova, separades de producció
├─ docs/                     # ARCHITECTURE, ROADMAP, SETUP, LIMITATIONS, STORE_RELEASE
├─ .env.example
├─ app.config.ts · eas.json · tsconfig.json · package.json
```

## 7. Seguretat

- Al client només `EXPO_PUBLIC_SUPABASE_URL` i `EXPO_PUBLIC_SUPABASE_ANON_KEY` (clau pública; la seguretat és RLS). **Mai** `service_role`, secret de Strava o de Google al client.
- Secrets d'Edge Functions amb `supabase secrets set`.
- Sessions: `expo-secure-store` a natiu, cookies/localStorage gestionat per supabase-js a web.
- Validació Zod a client **i** a Edge Functions; constraints `CHECK` a la BD.
- Sign in with Apple: l'App Store (guideline 4.8) exigeix oferir una opció d'inici de sessió equivalent si només hi ha Google; el correu+contrasenya podria complir-ho, però cal confirmar-ho abans d'enviar; si no, s'afegeix Apple.

## 8. Limitacions conegudes ja identificades

- Escàner de codis de barres: no disponible a web d'escriptori en tots els navegadors (a web: entrada manual/càmera si el navegador ho suporta).
- Google OAuth natiu en Expo requereix *development build* (no funciona a Expo Go amb redirecció personalitzada).
- Cobertura de supermercats limitada a Open Food Facts + contribucions.
- Imatges d'exercicis: cal una font amb llicència compatible (p. ex. `free-exercise-db`, domini públic/Unlicense, o il·lustracions originals); s'avaluarà a la Fase 7.
