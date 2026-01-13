# 🧠 OMEGA AI CONTEXT & RULES

## 1. Resumen del Proyecto
Omega es un "Life RPG" (Gestor de vida gamificado) que centraliza productividad, gym y salud.
- **Arquitectura:** Monorepo (Turborepo/NPM Workspaces).
- **Apps:** 
  - `apps/movil`: React Native (Expo) + React Navigation.
  - `apps/desktop`: Electron + Vite + React.
  - `packages/ui`: Librería de componentes compartidos (React Native Web compatible).
  - `packages/db`: Configuración y tipos de base de datos compartidos.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime).
- **Estética:** RPG Medieval Fantástico (Piedra, Pergamino, Oro, Oscuro).

## 2. Reglas de Programación (Tech Stack)
Cuando generes código, sigue estas reglas estrictas:
- **Estructura de Archivos:** Respeta la separación del Monorepo. No pongas código de móvil en desktop ni viceversa, salvo que esté en `packages/ui`.
- **UI:** NO uses componentes nativos (`Button`, `Switch`, `View` crudas para contenedores principales). Usa SIEMPRE componentes personalizados de `packages/ui`:
  - `MedievalButton`: Para acciones principales.
  - `ParchmentCard`: Para contenedores de información.
  - `GameHUD`: Para elementos de estado (vida, mana, oro).
- **Navegación Móvil:** Usa `React Navigation` (Stack/Tab), no Expo Router.
- **Estilos:** Usa `ImageBackground` con texturas de `assets/textures`. Evita colores planos.
- **Iconos:** `Lucide-React-Native` (Color Oro `#FFD700` o Papiro `#F5E6C6`).
- **Nombres:** Tablas SQL en `snake_case`. Código JS/TS en `camelCase`.

## 3. Prompts Maestros (Copia y Pega)

### 🎨 Para generar Assets (Bing Image Creator / Leonardo.ai)
Usa este estilo para mantener coherencia visual. Bing funciona mejor con descripciones descriptivas:

> "Isometric game asset representing [NOMBRE DEL LUGAR], video game style, medieval fantasy aesthetic, hand painted texture similar to Blizzard games, lighting from top-left, dark background, high definition, 3d render"

*Ejemplos:*
- **Torre de Hechicería:** "Isometric wizard tower, purple glowing crystals floating around, arcane runes on the floor, mystical atmosphere, dark background"
- **Barracones:** "Isometric medieval training grounds, wooden practice dummies, iron weights, weapon rack, stone floor, dark background"
- **Textura Botón:** "Square stone texture for UI button, ancient grey rock, cracks, rpg game interface element, isolated"

### 🧙‍♂️ Para "El Bardo" (Narrativa)
> "Eres El Bardo. Narra la vida de Sir Usuario basándote en sus logs. Usa tono épico. Metáforas de batalla para estudio/gym. Sé motivador pero severo."

### 💻 Para Agentes de Código (Antigravity)
> "Actúa como Ingeniero Senior. Crea [FUNCIONALIDAD]. Revisa `packages/ui` para componentes. Usa Supabase. Si es para PC, recuerda usar `active-win`. Si es para móvil, recuerda `expo-location`."

## 4. Diccionario de Datos & Ramas
- **Estudio** = "Rama de Intelecto" (Azul).
- **Gym** = "Rama de Vigor" (Rojo).
- **Programación/Maker** = "Rama de Hechicería" (Morado/Arcano).
- **Examen** = "Jefe Final" (Boss).
- **Tarea** = "Misión" (Quest).
- **Proyecto** = "Grimorio" (Conjunto de misiones).

## 5. Registro de Decisiones de Arquitectura (ADR)
Mantén estas decisiones en futuros desarrollos:

- **ADR-001 (Monorepo):** Usamos NPM Workspaces gestionado por Turbo.
- **ADR-002 (Navegación):** En móvil, preferimos `React Navigation` sobre Expo Router por control explícito.
- **ADR-003 (UI Components):** La UI debe ser **agnóstica** de plataforma cuando sea posible. Los componentes en `packages/ui` deben funcionar en Web (Desktop) y Native (Móvil).
- **ADR-004 (Offline):** Estrategia "Offline First" simple. Cachear datos críticos en `AsyncStorage` (Móvil) o `localStorage` (Desktop) al iniciar, y sincronizar con Supabase en segundo plano.
- **ADR-005 (Estética):** La inmersión es prioridad. No "parecer una app de productividad". Debe parecer un juego.
