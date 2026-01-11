# ⚔️ OMEGA: The Life RPG
> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Resumen del Proyecto
Omega es un ecosistema de productividad y gestión personal gamificado, diseñado con una estética de RPG medieval. El objetivo es centralizar todos los aspectos de la vida (estudio, gimnasio, ocio, salud) en una única base de datos modular, flexible y multiplataforma (iOS y Windows).

A diferencia de las apps convencionales, Omega transforma la vida en un videojuego: los exámenes son "Jefes Finales", el gimnasio sube tus estadísticas de fuerza y distraerse con el móvil reduce tu vida. La app es consciente del contexto: sabe dónde estás, recuerda tus pesos anteriores en el gym y se adapta a tus ciclos de rutina automáticamente.

---

## 🗺️ Hoja de Ruta (Roadmap)

### 🛠️ Fase 0: Configuración del Entorno (La Fundación)
- [ ] Configurar Monorepo (Turborepo/Yarn Workspaces) con estructura `apps/` y `packages/`.
- [ ] Inicializar proyecto React Native (Expo) en `apps/movil` y Electron en `apps/desktop`.
- [ ] Crear proyecto en Supabase (Free Tier) y conectar credenciales.
- [ ] Configurar repositorio en GitHub y conectar con Google Antigravity.
- [ ] Configurar EAS (Expo Application Services) para OTAs.

### 🎨 Fase 1: Arte y UI (La Estética Medieval)
- [ ] Generar assets con IA (Midjourney/DALL-E) para fondos, texturas y mapa.
- [ ] Limpiar assets (PNGs transparentes) para botones e iconos.
- [ ] Crear componentes base: `MedievalButton`, `ParchmentCard` y `QuestItem`.
- [ ] Diseñar el "Mapa del Mundo" (Home Screen) con zonas interactivas (Castillo, Barracones, etc.).

### 🌲 Fase 2: Módulo de Enfoque y Contexto (Sentidos)
- [ ] Programar lógica del Cronómetro (Timer) y `AppState` (bloqueo/castigo).
- [ ] Implementar **Geofencing/GPS**: Detectar coordenadas del Gimnasio, Biblioteca y Casa.
- [ ] Crear "Auto-Trigger": Abrir el módulo correspondiente automáticamente al entrar en la zona (ej: entrar al gym -> abrir Barracones).
- [ ] Crear sistema de notificaciones locales ("¡Vuelve a la app o pierdes vida!").

### ⚔️ Fase 3: Módulo de Entrenamiento (El Entrenador Inteligente)
- [ ] Importar base de datos "semilla" (Wger/ExerciseDB) a Supabase.
- [ ] Crear lógica de **Ciclos de Rutina**: Soporte para splits alternos complejos (Semana A: PPL / Semana B: Arnold Split).
- [ ] Interfaz de Registro (Logger): Mostrar "Peso Anterior" (referencia histórica) y "1RM Récord" junto al input actual.
- [ ] Integrar SVG del cuerpo humano interactivo (Heatmap).
- [ ] Programar lógica de coloreado del SVG según intensidad del entreno.

### 🖥️ Fase 4: Módulo PC (La Torre de Vigilancia)
- [ ] Implementar librería `active-win` en Electron.
- [ ] Crear "listener" en segundo plano que detecte la ventana activa.
- [ ] Lógica de filtrado automática (asignar `chrome.exe` a ocio o estudio según título de ventana).

### 📅 Fase 5: Gestión de Misiones (Task Board RPG)
- [ ] Crear sistema de clasificación de tareas:
    - **Misiones Principales:** Obligatorias (Taller, Reuniones) -> Penalización grave.
    - **Misiones Secundarias:** Necesarias (Comprar, Felicitar) -> Recompensa media.
    - **Grind Diario:** Higiene/Repetitivas (Leer, Gym) -> Mantener buffs.
- [ ] Desarrollar lógica de "Jefes Finales" (Exámenes) con cuenta atrás.
- [ ] Implementar el "Inbox de Notificaciones" (Pergamino centralizado).

### 🚀 Fase 6: Despliegue y Mantenimiento
- [ ] Instalar SideStore en dispositivo iOS.
- [ ] Configurar OTA Updates para actualizaciones de código (JS) sin cables.
- [ ] (Futuro) Migración a NAS propio con Docker y Tailscale.

### 🔮 Fase 8: EXTRAS (Expansion Packs RPG)
- [ ] **Tienda del Alquimista (Economía):** Sistema para canjear Oro ganado por recompensas reales (Pizza, Videojuegos).
- [ ] **Árbol de Talentos:** Visualización de constelaciones (Intelecto, Vigor, Carisma) que suben según la categoría de la tarea.
- [ ] **El Bardo (IA Narrativa):** Edge Function que envía logs semanales a Gemini para generar crónicas épicas de tu semana.
- [ ] **Clima Dinámico:** Conexión con API OpenWeatherMap para sincronizar lluvia/nieve en el juego y aplicar buffs estacionales.

---

## 💎 Funcionalidades Detalladas

### 1. El Mapa del Mundo y Contexto (Geofencing)
La app "siente" dónde estás.
* **Navegación Visual:** Biblioteca, Barracones, Teatro, Castillo.
* **Auto-Apertura:** Si el GPS detecta que has entrado en tu gimnasio, la app salta la pantalla de inicio y abre directamente los "Barracones" con la rutina de hoy ya cargada.

### 2. Gimnasio Inteligente (Smart Coach)
Omega gestiona tu memoria muscular y tu calendario.
* **Ciclos Complejos:** Soporta rotaciones no semanales. Ej: *Ciclo híbrido PPL x Arnold*. La app sabe automáticamente que si hoy es Lunes de la "Semana 2", toca "Pecho/Espalda" (Arnold) y no "Push" (PPL).
* **Referencia Histórica:** Al hacer una serie, la app te muestra en gris pequeño: *"La última vez hiciste 12 reps con 80kg"*.
* **Heatmap:** El cuerpo humano se ilumina según el volumen de carga real calculado con fórmulas de 1RM.

### 3. Sistema de Tareas y Jefes
* **Misiones Principales (Obligatorias):** Si no se completan en el día, el personaje sufre penalización crítica.
* **Jefes Finales (Exámenes):** Cuentas atrás con "Modo Alerta" que aumentan la intensidad de los recordatorios (bloqueo de ocio a T-3 días).

### 4. Expansion Packs (Fase 8)
* **El Bardo:** Cada domingo, una IA analiza tus datos y escribe una historia: *"Sir Usuario derrotó a la Bestia de los Pectorales..."*.
* **Economía Real:** Gamificación de la culpa. Gana oro estudiando para "comprar" el derecho a pedir comida basura el fin de semana.
* **Clima:** Si llueve en tu ciudad, llueve en Omega y ganas un buff de +10% XP en Estudio (invita a quedarse en casa).

---

## 🧪 Guía de Desarrollo y Testing

### 📱 Pruebas en Móvil (iOS)
* **Nivel A (Rápido - UI/Lógica):** Usar **Expo Go**.
    * Ejecutar `npx expo start` en terminal.
    * Escanear QR con iPhone.
    * Permite *Hot Reloading* instantáneo para cambios visuales.
* **Nivel B (Nativo - GPS/Background):** Usar **Development Build**.
    * Necesario para probar Geofencing, AppState y Bloqueo.
    * Ejecutar `eas build --profile development --platform ios`.
    * Instalar el `.ipa` resultante mediante **SideStore**.
    * Permite debugging real de funciones nativas manteniendo el *Hot Reloading*.

### 💻 Pruebas en Escritorio (Windows)
* Ejecutar en modo desarrollo (Web/Electron wrapper): `yarn dev:desktop`.
* Abre una ventana nativa de Windows con acceso a DevTools (`Ctrl+Shift+I`).
* Usar para probar la librería `active-win` y la detección de ventanas.

### 🐞 Debugging
* **En Móvil:** Agitar el dispositivo (Shake Gesture) para abrir el menú de desarrollador (Inspector de elementos, Logs).
* **Consola Unificada:** Todos los `console.log` del móvil y del PC aparecen centralizados en la terminal de Google Antigravity.

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend Móvil:** React Native + Expo.
    * *Librerías Clave:* `expo-location` (GPS), `react-native-svg` (Heatmap/Árbol).
* **Frontend Desktop:** Electron + React.
* **Lenguaje:** TypeScript / JavaScript.
* **Estilos:** Componentes propios basados en `ImageBackground` para estética medieval.

### Backend & Datos (Supabase)
* **Base de Datos:** PostgreSQL.
* **Tablas Clave:**
    * `tasks`: column `type` ('main', 'side', 'daily').
    * `routines`: lógica de `cycle_type` ('weekly', 'biweekly_split').
    * `shop_items`: catálogo de recompensas reales.
    * `chronicles`: historial generado por el Bardo.
* **Estrategia:** *Cloud-first* con migración a NAS.

### Desarrollo (CI/CD)
* **IDE:** Google Antigravity (Agentes de IA para automatización).
* **Control de Versiones:** GitHub.
* **Actualizaciones:** EAS Update (Cambios JS) + SideStore (Cambios Nativos).

---
*Hecho con sangre, sudor y código.* 🛡️
