# Macrova

**Nutrition. Training. Progress.**

Macrova és una aplicació premium de seguiment nutricional i esportiu per a iPhone i ordinador (web/PWA), preparada per afegir Android en el futur amb la mateixa base de codi.

> **Estat: Fase 1 (fonaments) completada. L'app encara no és funcional per a l'usuari final.** Vegeu [Estat de les funcionalitats](#estat-de-les-funcionalitats).

## Què serà Macrova

- Registre d'aliments amb càlcul automàtic de calories, proteïnes, carbohidrats i greixos.
- Cerca per nom, marca o codi de barres (Open Food Facts i altres fonts), aliments propis, preferits i plantilles d'àpats.
- Càlcul personalitzat de necessitats calòriques (Mifflin-St Jeor, TDEE, dèficit/superàvit) amb tots els valors editables, i objectius de macros per dia de la setmana.
- Activitats esportives amb formularis per esport, estimació de calories (MET) i importació des de Strava.
- Mòdul de gimnàs: catàleg d'exercicis, rutines, sessions amb sèries/pesos/repeticions i evolució de la força.
- Estadístiques i constància (diari, setmanal, mensual, rang personalitzat).
- Sincronització segura entre dispositius i funcionament sense connexió.
- Aparença clara per defecte, mode fosc i seguiment del sistema; català i anglès (castellà preparat).

Cinc seccions principals: **Today · Food · Activity · Progress · Profile**. Barra inferior a mòbil, barra lateral a ordinador.

## Tecnologies

| Capa | Tecnologia |
|---|---|
| App | Expo SDK 58, React Native, TypeScript (strict), Expo Router, React Native Web |
| Estat de servidor | TanStack Query |
| Validació i formularis | Zod, React Hook Form |
| i18n | i18next (`ca`, `en`) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) |
| Seguretat de dades | Row Level Security a totes les taules personals |

Arquitectura detallada: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Comptes i configuració externa: [docs/SETUP.md](docs/SETUP.md) · Full de ruta: [docs/ROADMAP.md](docs/ROADMAP.md).

## Estructura del projecte

```
app/                 Rutes (Expo Router): (app)/today, food, activity, progress, profile
src/design/          Tokens, tema clar/fosc/sistema i components base
src/i18n/            Traduccions (ca.json, en.json)
src/lib/             Client de Supabase
supabase/migrations/ Migracions SQL versionades
docs/                Arquitectura, configuració i full de ruta
dev-fixtures/        Dades de prova (separades de producció)
```

## Posada en marxa

Requisits: Node 20+ i npm.

```bash
npm install
cp .env.example .env     # omple les claus de Supabase quan les tinguis
npx expo start --web     # versió web
npx expo start           # mòbil (Expo Go / development build)
```

Sense `.env` l'app arrenca igualment; la pantalla Profile mostra que Supabase no està configurat.

### Variables d'entorn

Només es posen al client valors públics (`EXPO_PUBLIC_*`). **Mai** la clau `service_role` ni secrets de Strava/Google al client: van com a secrets d'Edge Functions. Vegeu [.env.example](.env.example) i [docs/SETUP.md](docs/SETUP.md).

## Estat de les funcionalitats

**Completat (Fase 1)**
- Projecte Expo + TypeScript + Expo Router + React Native Web.
- Sistema de disseny: tokens de color/espaiat, tema clar (per defecte), fosc i sistema amb selector manual persistent, colors per macronutrient.
- Navegació principal de 5 seccions, adaptativa (barra inferior / lateral).
- i18n amb català i anglès i selector d'idioma.
- Client de Supabase (només clau pública) i detecció de configuració.
- Migració inicial: `profiles` i `user_preferences` amb RLS i creació automàtica en registrar-se.
- Les pantalles Today/Food/Activity/Progress són **marcadors de posició** que ho indiquen; no simulen dades.

**Pendent** (vegeu [ROADMAP](docs/ROADMAP.md)): autenticació i esquema complet (F2), pantalles reals (F3), alimentació (F4), motor de calories (F5), activitats i Strava (F6), gimnàs (F7), progrés (F8), sincronització/offline (F9), llançament (F10).

**Limitacions conegudes**
- La migració SQL encara no s'ha aplicat a cap projecte Supabase (cal crear-lo; vegeu SETUP).
- El tema i la sessió de Supabase es guarden amb AsyncStorage (la mida màxima de SecureStore no hi cap per a sessions).
- No hi ha API pública dels supermercats; la cobertura vindrà d'Open Food Facts i dels aliments dels usuaris.
- Pendent de verificar visualment en dispositiu i en navegador (l'export web compila i `tsc` passa).

## Historial de canvis

- **0.1.0 — Fase 1**: fonaments del projecte, sistema de disseny, navegació, i18n, client Supabase i migració inicial.
- **Fase 0**: auditoria, arquitectura i full de ruta.
