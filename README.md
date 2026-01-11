# ⚔️ OMEGA: The Life RPG
> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Resumen del Proyecto
Omega es un ecosistema de productividad y gestión personal gamificado, diseñado con una estética de RPG medieval. El objetivo es centralizar todos los aspectos de la vida (estudio, gimnasio, ocio, salud) en una única base de datos modular, flexible y multiplataforma (iOS y Windows).

A diferencia de las apps convencionales, Omega transforma la vida en un videojuego: los exámenes son "Jefes Finales", el gimnasio sube tus estadísticas de fuerza y distraerse con el móvil reduce tu vida. La app es consciente del contexto: sabe dónde estás y qué rutina te toca según ciclos complejos, adaptándose a ti automáticamente.

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
- [ ] Crear "Auto-Trigger": Abrir el módulo correspondiente automáticamente al entrar en la zona (ej: entrar al gym -> abrir Barracones).
- [ ] Crear sistema de notificaciones locales ("¡Vuelve a la app!").

### ⚔️ Fase 3: Módulo de Entrenamiento (El Entrenador Inteligente)
- [ ] Importar base de datos "semilla" (Wger/ExerciseDB) a Supabase.
- [ ] Crear lógica de **Ciclos de Rutina**: Soporte para splits alternos (Semana A: PPL / Semana B: Arnold Split).
- [ ] Interfaz de Registro (Logger): Mostrar "Peso Anterior" y "1RM Récord" junto al input actual.
- [ ] Integrar SVG del cuerpo humano interactivo (Heatmap).
- [ ] Programar lógica de coloreado según intensidad del entreno y descanso.

### 🖥️ Fase 4: Módulo PC (La Torre de Vigilancia)
- [ ] Implementar librería `active-win` en Electron.
- [ ] Crear "listener" en segundo plano que detecte la ventana activa.
- [ ] Lógica de filtrado (asignar `chrome.exe` a ocio o estudio).

### 📅 Fase 5: Gestión de Misiones (Task Board RPG)
- [ ] Crear sistema de clasificación de tareas:
    - **Misiones Principales:** Obligatorias (Taller, Reuniones).
    - **Misiones Secundarias:** Necesarias (Comprar, Felicitar).
    - **Grind Diario:** Higiene/Repetitivas (Leer, Gym).
- [ ] Desarrollar lógica de "Jefes Finales" (Exámenes) con cuenta atrás.
- [ ] Implementar el "Inbox de Notificaciones" (Pergamino centralizado).

### 🚀 Fase 6: Despliegue y Mantenimiento
- [ ] Instalar SideStore en dispositivo iOS.
- [ ] Configurar OTA Updates para actualizaciones de código (JS).
- [ ] (Futuro) Migración a NAS propio con Docker y Tailscale.

---

## 🔮 Funcionalidades Detalladas

### 1. El Mapa del Mundo y Contexto (Geofencing)
La app "siente" dónde estás.
* **Navegación Visual:** Biblioteca, Barracones, Teatro, Castillo.
* **Auto-Apertura:** Si el GPS detecta que has entrado en tu gimnasio, la app salta la pantalla de inicio y abre directamente los "Barracones" con la rutina de hoy ya cargada. Lo mismo para la Biblioteca (Modo Estudio).

### 2. Gamificación y Castigo (Focus Mode)
* **iOS:** Al estudiar, si sales de la app (distracción), pierdes vida.
* **PC:** Registro pasivo de actividad en ventanas activas.

### 3. Gimnasio Inteligente (Smart Coach)
Omega gestiona tu memoria muscular y tu calendario.
* **Ciclos Complejos:** Soporta rotaciones no semanales. Ej: *Ciclo híbrido PPL x Arnold*. La app sabe automáticamente que si hoy es Lunes de la "Semana 2", toca "Pecho/Espalda" (Arnold) y no "Push" (PPL).
* **Referencia Histórica:** Al hacer una serie, la app te muestra en gris pequeño: *"La última vez hiciste 12 reps con 80kg"*. Así sabes si estás progresando o estancado.
* **Heatmap:** El cuerpo humano se ilumina según el volumen de carga real calculado con fórmulas de 1RM.

### 4. Sistema de Tareas (Quest Board)
Las tareas se clasifican por importancia rpg:
* **Misiones Principales (Obligatorias):** Si no se completan en el día, el personaje sufre penalización crítica o bloqueo de funciones de ocio. (Ej: Reuniones, Coche).
* **Misiones Secundarias (Necesarias):** Dan experiencia y oro, pero no penalizan gravemente. (Ej: Comprar regalo).
* **Misiones Diarias (Hygiene):** Se resetean cada día. Mantienen los "buffs" del personaje. (Ej: Leer, Creatina, Gym).

### 5. Jefes Finales (Exámenes)
* **Cuenta atrás inteligente:** La app aumenta la insistencia de los recordatorios conforme se acerca la fecha.
* **Input Manual:** El usuario puede invocar nuevos Jefes (añadir exámenes) y definir su dificultad (HP del Boss).

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend Móvil:** React Native + Expo.
    * *Librería Clave:* `expo-location` (Geofencing/GPS).
* **Frontend Desktop:** Electron + React.
* **Lenguaje:** TypeScript / JavaScript.
* **Estilos:** Componentes propios basados en imágenes (`ImageBackground`) para estética medieval.

### Backend & Datos (Supabase)
* **Base de Datos:** PostgreSQL.
* **Tablas Clave:**
    * `tasks`: con columna `type` ('main', 'side', 'daily').
    * `routines`: lógica de `cycle_type` ('weekly', 'biweekly_split') y `last_performed`.
    * `workout_logs`: historial para referencia visual.
* **Estrategia:** *Cloud-first* con migración a NAS.

### Code Sharing (Monorepo)
* `packages/ui`: Componentes visuales compartidos.
* `apps/movil`: Lógica de GPS, Haptics, AppState.
* `apps/desktop`: Lógica de active-win.

### Desarrollo (CI/CD)
* **IDE:** Google Antigravity (Agentes de IA).
* **Control de Versiones:** GitHub.
* **Actualizaciones:** EAS Update + SideStore.

---
*Hecho con sangre, sudor y código.* 🛡️
