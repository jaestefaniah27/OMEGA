# ⚔️ OMEGA: The Life RPG
> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Resumen del Proyecto
Omega es un ecosistema de productividad y gestión personal gamificado, diseñado con una estética de RPG medieval. El objetivo es centralizar todos los aspectos de la vida (estudio, gimnasio, ocio, salud) en una única base de datos modular, flexible y multiplataforma (iOS y Windows).

A diferencia de las apps convencionales, Omega transforma la vida en un videojuego: los exámenes son "Jefes Finales", el gimnasio sube tus estadísticas de fuerza y distraerse con el móvil reduce tu vida. La app es consciente del contexto (ubicación, clima, estación del año) y narra tu progreso de forma épica mediante IA.

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
- [ ] Diseñar el "Mapa del Mundo" (Home Screen) con zonas interactivas.

### 🌲 Fase 2: Módulo de Enfoque y Contexto (Sentidos)
- [ ] Programar lógica del Cronómetro (Timer) y `AppState` (bloqueo).
- [ ] Implementar **Geofencing/GPS**: Detectar coordenadas del Gimnasio, Biblioteca y Casa.
- [ ] **Integración Climática:** Conectar API de OpenWeatherMap.
- [ ] Lógica de Estaciones: Detectar hemisferio y estación actual (Invierno/Verano) para aplicar buffs pasivos.
- [ ] Crear "Auto-Trigger": Abrir el módulo correspondiente automáticamente al entrar en la zona.

### ⚔️ Fase 3: Módulo de Entrenamiento (El Entrenador Inteligente)
- [ ] Importar base de datos "semilla" (Wger/ExerciseDB) a Supabase.
- [ ] Crear lógica de **Ciclos de Rutina**: Soporte para splits alternos (Semana A: PPL / Semana B: Arnold Split).
- [ ] Interfaz de Registro (Logger): Mostrar "Peso Anterior" y "1RM Récord".
- [ ] Integrar SVG del cuerpo humano interactivo (Heatmap).
- [ ] Programar lógica de coloreado del SVG según intensidad del entreno.

### 🔮 Fase 4: Progresión y Narrativa (RPG Puro)
- [ ] **Árbol de Talentos:** Crear visualización de constelaciones (Intelecto, Vigor, Carisma).
- [ ] Lógica de XP: Asignar puntos de experiencia a cada tarea completada según su categoría.
- [ ] **El Bardo (IA):** Configurar Edge Function en Supabase que envíe logs semanales a la API de Gemini.
- [ ] Crear interfaz de "Crónicas": Un libro donde se guardan las historias generadas por la IA.

### 🖥️ Fase 5: Módulo PC (La Torre de Vigilancia)
- [ ] Implementar librería `active-win` en Electron.
- [ ] Crear "listener" en segundo plano que detecte la ventana activa.
- [ ] Lógica de filtrado (asignar `chrome.exe` a ocio o estudio).

### 📅 Fase 6: Gestión de Misiones (Task Board)
- [ ] Crear sistema de clasificación de tareas (Principales/Secundarias/Diarias).
- [ ] Desarrollar lógica de "Jefes Finales" (Exámenes) con cuenta atrás.
- [ ] Implementar el "Inbox de Notificaciones" (Pergamino centralizado).

### 🚀 Fase 7: Despliegue y Mantenimiento
- [ ] Instalar SideStore en dispositivo iOS.
- [ ] Configurar OTA Updates para actualizaciones de código (JS).
- [ ] (Futuro) Migración a NAS propio con Docker y Tailscale.

---

## 🔮 Funcionalidades Detalladas

### 1. El Mapa del Mundo y Contexto (Geofencing)
La app "siente" dónde estás.
* **Navegación Visual:** Biblioteca, Barracones, Teatro, Castillo.
* **Auto-Apertura:** Si el GPS detecta que has entrado en tu gimnasio, la app salta la pantalla de inicio y abre directamente los "Barracones".

### 2. Clima y Estaciones Dinámicas
El mundo de Omega refleja el mundo real mediante la API de OpenWeatherMap.
* **Visuales:** Si llueve fuera, llueve en el menú principal. Si es invierno, hay nieve en el mapa.
* **Sistema de "Buffs" Estacionales:**
    * **Invierno:** +10% XP en Estudio (Buff "Hogar Cálido").
    * **Verano:** +10% XP en Actividades al aire libre (Buff "Espíritu Solar").
    * **Lluvia:** +15% Enfoque (Bonus de concentración por mal tiempo).
    * **Calor Extremo:** Penalización de energía en el Gym (Debuff "Fatiga").

### 3. Árbol de Talentos (Constelaciones)
Tu progreso no es solo un número, es una constelación que se dibuja en el cielo de tu app.
* **Intelecto (Azul):** Sube completando horas de estudio y exámenes. Desbloquea títulos como "Erudito".
* **Vigor (Rojo):** Sube con sesiones de gym y 1RMs superados. Desbloquea skins de armadura.
* **Carisma (Verde):** Sube completando tareas sociales (cumpleaños, eventos).
* **Destreza (Amarillo):** Sube con hobbies técnicos (Piano, Arte).

### 4. El Bardo (IA Narrativa)
Tu vida es una historia épica, y Omega la escribe por ti.
* **Crónicas Semanales:** Cada domingo, una IA (Gemini) analiza tus logs de la semana (qué entrenaste, cuánto estudiaste, qué tareas hiciste) y redacta un resumen narrativo medieval.
    * *Ejemplo:* "En la segunda luna de Enero, Sir Usuario libró una dura batalla en la Biblioteca, resistiendo el asedio de las Matemáticas durante 4 horas..."
* **Archivo:** Estas historias se guardan en el "Libro de Crónicas" para que puedas releer tu año como si fuera una novela.

### 5. Gimnasio Inteligente (Smart Coach)
Omega gestiona tu memoria muscular y tu calendario.
* **Ciclos Complejos:** Soporta rotaciones no semanales (ej: PPL x Arnold Split).
* **Referencia Histórica:** Muestra tus pesos anteriores para motivarte a la sobrecarga progresiva.
* **Heatmap:** El cuerpo humano se ilumina según el volumen de carga real calculado con fórmulas de 1RM.

### 6. Sistema de Tareas y Jefes
* **Misiones Principales:** Obligatorias (Taller, Reuniones). Penalización crítica si fallan.
* **Misiones Secundarias:** Necesarias. Dan oro y XP.
* **Jefes Finales (Exámenes):** Cuentas atrás con "Modo Alerta" que aumentan la intensidad de los recordatorios.

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend Móvil:** React Native + Expo.
    * *Librerías Clave:* `expo-location` (GPS), `react-native-svg` (Árbol/Heatmap).
* **Frontend Desktop:** Electron + React.
* **Lenguaje:** TypeScript / JavaScript.
* **Estilos:** Componentes propios basados en imágenes (`ImageBackground`) para estética medieval.

### Backend & Datos (Supabase)
* **Base de Datos:** PostgreSQL.
* **Edge Functions:** Para ejecutar la lógica del **Bardo** (conectar con API de Gemini) y actualizaciones de **Clima** programadas.
* **Tablas Clave:**
    * `tasks`: clasificación y xp_reward.
    * `skills`: tabla para guardar el progreso del árbol de talentos.
    * `chronicles`: historial de textos generados por IA.
    * `routines`: lógica de ciclos de gym.

### Code Sharing (Monorepo)
* `packages/ui`: Componentes visuales compartidos.
* `apps/movil`: Lógica de GPS, Haptics, AppState.
* `apps/desktop`: Lógica de active-win.

### Desarrollo (CI/CD)
* **IDE:** Google Antigravity (Agentes de IA para scripts de automatización).
* **Control de Versiones:** GitHub.
* **Actualizaciones:** EAS Update + SideStore.

---
*Hecho con sangre, sudor y código.* 🛡️
