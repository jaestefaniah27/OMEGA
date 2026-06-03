# OMEGA — Life RPG

App de gamificación de vida (RPG medieval). Uso personal del dueño; plan B = App Store.
Contexto funcional completo: **[AI_CONTEXT.md](AI_CONTEXT.md)**. **[ROADMAP.md](ROADMAP.md)** = backlog vivo priorizado por ROI + plan de ataque (sustituye el roadmap medieval de README.md).

## Stack

- Monorepo **Turborepo** + npm workspaces (`apps/*`, `packages/*`). React 19, TypeScript.
- `apps/movil` — React Native + Expo (~54). App principal (iOS/Android/Web). Corre en Expo Go.
- `apps/desktop` — Electron. Rastreador silencioso de actividad del PC (`active-win` + PowerShell), sube a Supabase.
- `packages/logic` — hooks + contexts + servicios compartidos (`@omega/logic`).
- `packages/ui` — pantallas y componentes compartidos (`@omega/ui`).
- `packages/db` — capa de datos (`@omega/db`).
- Backend: **Supabase** (Postgres + Auth + Realtime). Claves en `.env`.

## Comandos

```bash
npm run dev            # turbo: levanta todo en paralelo
npm run lint
npm run format         # prettier

# Móvil (Expo Go para cambios visuales rápidos)
cd apps/movil && npm start        # expo start
# Desktop (Electron, probar active-win)
cd apps/desktop && npm start      # electron .
```

No hay tests configurados aún.

## Mapa de pantallas (packages/ui/src/screens)

Home(Map) · Castle(calendario) · WarTable · Library(estudio/flashcards) · WizardTower(proyectos) ·
Barracks(gym) · Tavern(hidratación) · Temple(sueño/gratitud) · Theatre(contenido) · Market(economía) ·
Profile · Settings · ZenFireplace. Navegación: `apps/movil/src/navigation/AppNavigator.tsx` (native-stack).

## Reglas críticas (de AI_CONTEXT.md — NO romper)

- **desktop/main.js**: importar `active-win` con import dinámico robusto; diferenciar focus/background **por PID**, nunca por nombre de proceso (causa duplicados).
- `react` y `react-dom` **misma versión exacta** (19.1.0) en todo el monorepo.
- Env híbrido en desktop: `process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Cambios de esquema en BD → incluir SQL de migración.
- Lógica compartida vive en `packages/logic`/`packages/ui`; las apps solo orquestan. No duplicar lógica por plataforma — usar `PlatformInterfaces`/`PlatformContext`.

## Estilo

Nomenclatura de alto nivel con temática "Torre del Mago" (fantasía/RPG). Código limpio y tipado.
