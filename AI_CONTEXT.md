# 🧠 OMEGA AI CONTEXT & RULES

## 1. Resumen del Proyecto
Omega es un "Life RPG" (Gestor de vida gamificado) que centraliza productividad, gym y salud.
- **Arquitectura:** Monorepo (Turborepo/Yarn Workspaces).
- **Apps:** - `apps/movil`: React Native (Expo) para iOS y Android.
  - `apps/desktop`: Electron + React para Windows.
  - `packages/ui`: Librería de componentes compartidos.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime).
- **Estética:** RPG Medieval Fantástico (Piedra, Pergamino, Oro, Oscuro).

## 2. Reglas de Programación (Tech Stack)
Cuando generes código, sigue estas reglas estrictas:
- **Estructura de Archivos:** Respeta la separación del Monorepo. No pongas código de móvil en desktop ni viceversa, salvo que esté en `packages/ui`.
- **UI:** NO uses componentes nativos (`Button`, `Switch`). Usa SIEMPRE componentes personalizados de `packages/ui` (`MedievalButton`, `ParchmentCard`).
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