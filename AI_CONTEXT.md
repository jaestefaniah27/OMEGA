# 🧠 OMEGA AI CONTEXT & RULES

## 1. Resumen del Proyecto
Omega es un "Life RPG" (Gestor de vida gamificado) que centraliza productividad, gym y salud.
- **Plataformas:** Móvil (React Native/Expo) y Desktop (Electron/React).
- **Backend:** Supabase (PostgreSQL).
- **Estética:** RPG Medieval Fantástico (Piedra, Pergamino, Oro, Oscuro).

## 2. Reglas de Programación (Tech Stack)
Cuando generes código, sigue estas reglas estrictas:
- **UI:** NO uses componentes nativos de iOS/Android (`Button`, `Switch`). Usa SIEMPRE componentes personalizados de `packages/ui` (`MedievalButton`, `ParchmentCard`).
- **Estilos:** No uses colores planos hexadecimales para fondos grandes. Usa `ImageBackground` con texturas de la carpeta `assets/textures`.
- **Iconos:** Usa `Lucide-React-Native` con colores dorados (`#FFD700`) o papiro (`#F5E6C6`).
- **Base de Datos:** Los nombres de tablas son en `snake_case` (ej: `user_quests`). El código JS usa `camelCase`.

## 3. Prompts Maestros (Copia y Pega)

### 🎨 Para generar Assets (Midjourney / DALL-E)
Usa este estilo para mantener coherencia visual:
> "Isometric game asset, [NOMBRE DEL LUGAR], medieval fantasy style, hand painted texture, blizzard/warcraft style, isolated on black background, high resolution, 4k"

*Ejemplos de lugares:*
- Torre de Hechicería: "Magical wizard tower with floating purple crystals"
- Barracones: "Medieval training grounds with wooden dummies and iron weights"

### 🧙‍♂️ Para "El Bardo" (Narrativa)
Usa este System Prompt cuando configures la IA de texto:
> "Eres El Bardo, un narrador de la corte en un mundo de fantasía medieval. Tu trabajo es narrar la vida del usuario (Sir Usuario) basándote en sus datos. Habla con tono épico, usa metáforas de batalla para el estudio y el gimnasio. Nunca rompas el personaje. Sé motivador pero severo si falla."

### 💻 Para Agentes de Código (Antigravity)
Si pides una nueva pantalla, diles:
> "Actúa como Ingeniero Senior de React Native. Crea la pantalla [NOMBRE]. Revisa `packages/ui` para usar los componentes existentes. Asegúrate de que el fondo sea la textura `bg_stone.png`. Usa Supabase para los datos."

## 4. Diccionario de Datos (Traducción)
- **Estudio** = "Rama de Intelecto" (Azul).
- **Gym** = "Rama de Vigor" (Rojo).
- **Programación** = "Rama de Hechicería" (Morado).
- **Examen** = "Jefe Final" (Boss).
- **Tarea** = "Misión" (Quest).