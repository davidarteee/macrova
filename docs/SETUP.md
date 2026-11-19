# Macrova — Comptes, credencials i configuració externa

> Tota credencial es guarda a `.env` (local, mai al repositori) o com a *secret* de Supabase. Res d'això s'ha configurat encara.

## 1. Comptes necessaris

| Servei | Per a què | Cost |
|---|---|---|
| Supabase | BD, Auth, Edge Functions | Pla Free per desenvolupar; Pro (~25 USD/mes) recomanat per a producció (el Free pausa projectes inactius i no té còpies de seguretat diàries) |
| Google Cloud Console | Google OAuth | Gratuït |
| Expo (EAS) | Builds iOS/Android | Free amb cua limitada; pagament opcional |
| Apple Developer Program | TestFlight / App Store | 99 USD/any (necessari per instal·lar a iPhone real fora d'Expo Go i publicar) |
| Google Play Console | Android (futur) | 25 USD un sol cop |
| Strava | API d'activitats | Gratuït (límits de peticions) |
| USDA FoodData Central | Aliments genèrics | Gratuït (clau API) |
| Hosting web (Vercel / Netlify / Cloudflare Pages) | Versió web/PWA | Free per començar |
| Domini propi (opcional) | URL de producció, redirects OAuth | ~10 USD/any |

Nota: per desenvolupar només a Windows, no es poden fer builds locals d'iOS; s'usa **EAS Build al núvol** + un iPhone amb TestFlight / development build.

## 2. Crear el projecte Supabase

1. Entra a <https://supabase.com/dashboard> i crea una organització (si no en tens).
2. **New project** → nom `macrova-dev`, regió **Europa (p. ex. `eu-west` / Frankfurt o París)**, contrasenya forta de BD (guarda-la al gestor de contrasenyes).
3. A **Project Settings → API** copia:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon` / *publishable* key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - ⚠️ La `service_role` / *secret* key **no** va mai a l'app ni al xat. Només a secrets d'Edge Functions.
4. Recomanació: crear un segon projecte `macrova-prod` més endavant; mai barrejar dades de prova i reals.
5. Jo instal·laré el CLI (`npx supabase`) i enllaçaré el projecte amb `supabase link` quan em passis el *project ref* (l'identificador curt de l'URL). El *database password* només l'haurà d'escriure tu al terminal.

## 3. Configurar Google OAuth

1. <https://console.cloud.google.com> → crea el projecte `Macrova`.
2. **APIs & Services → OAuth consent screen**: tipus *External*, nom de l'app, correu de suport, domini si en tens. Scopes: `openid`, `email`, `profile`. Mentre estigui en mode *Testing* afegeix-hi el teu correu com a usuari de prova; per al públic caldrà **Publish app** (i potser verificació).
3. **Credentials → Create credentials → OAuth client ID → Web application**:
   - *Authorized redirect URI*: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
   - *Authorized JavaScript origins*: `http://localhost:8081` (dev web) i el teu domini de producció.
4. Copia **Client ID** i **Client Secret**.
5. A Supabase: **Authentication → Providers → Google** → activa, enganxa Client ID i Secret, desa.
6. A Supabase: **Authentication → URL Configuration**:
   - *Site URL*: URL de producció web (temporalment `http://localhost:8081`).
   - *Redirect URLs*: `http://localhost:8081/**`, `https://<domini>/**`, i l'esquema natiu `macrova://**`.
7. Per a iOS natiu (fase posterior) afegirem els clients OAuth de tipus iOS (Bundle ID) i el flux `expo-auth-session`/deep link `macrova://auth/callback`. Es documentarà a la Fase 2.
8. **Authentication → Providers → Email**: activa; decideix si cal confirmació per correu (recomanat sí). Per a producció configura un **SMTP propi** (Resend, Postmark…); el SMTP per defecte de Supabase té límits molt baixos.

## 4. Strava

1. <https://www.strava.com/settings/api> → crea l'aplicació.
   - *Authorization Callback Domain*: `<PROJECT_REF>.supabase.co` (la callback serà una Edge Function).
2. Obtindràs `Client ID` i `Client Secret`.
3. Secrets (els posaré jo via CLI quan els tingui, o ho fas tu):
   ```
   supabase secrets set STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... STRAVA_WEBHOOK_VERIFY_TOKEN=<aleatori>
   ```
4. Limitació: fins que Strava aprovi l'ampliació, **només el propietari de l'app** pot connectar-se. Per a milers d'usuaris cal sol·licitar-ho (formulari de Strava) complint les seves *API Brand Guidelines* (logo «Powered by Strava», enllaços a l'activitat original) i les restriccions d'ús de dades.

## 5. Fonts de dades d'aliments

- **Open Food Facts**: no cal clau. Cal `User-Agent: Macrova/<versió> (<correu de contacte de l'app>)`. Llicència ODbL: atribució visible a l'app.
- **USDA FoodData Central**: demana una clau gratuïta a <https://fdc.nal.usda.gov/api-key-signup>.
- **BEDCA / CIQUAL**: s'avaluaran a la Fase 4 (llicència i format).

## 6. Fitxer `.env.example` (es crearà a la Fase 1)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_ENV=development
# Només per a Edge Functions (supabase secrets set), MAI al client:
# SUPABASE_SERVICE_ROLE_KEY, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, USDA_API_KEY, OFF_USER_AGENT
```

## 7. Pendent per publicar (Fase 10)

Apple Developer (99 USD/any), Bundle ID `com.<tu>.macrova`, política de privacitat i URL de suport (obligatòries), eliminació de compte dins l'app (ja prevista), etiquetes de privacitat de l'App Store, captures de pantalla, i classificació d'edat. Atès que tracta dades de salut, cal una política de privacitat acurada i, en tractar-se d'usuaris de la UE, compliment del **RGPD** (consentiment, exportació i supressió de dades).
