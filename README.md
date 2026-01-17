# ⚔️ OMEGA: The Life RPG

> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Visión y Filosofía del Proyecto
Omega no es una simple lista de tareas. Es un **Sistema Operativo Vital Gamificado**. Su objetivo es eliminar la fricción de hacer cosas aburridas (estudiar, ir al gym, tareas domésticas) convirtiéndolas en misiones de un RPG medieval.

**Los Pilares:**
1.  **Centralización Absoluta:** Adiós a la fragmentación (Forest, Strong, Notion, Habitica). Todo vive en una sola base de datos (Supabase).
2.  **Contexto Inteligente:** La app sabe dónde estás (GPS), qué programas usas en el PC y qué tiempo hace. Se adapta a ti proactivamente, no al revés.
3.  **Inmersión Total:** No usas menús nativos de iOS. Usas pergaminos, mapas, runas y metáforas mágicas.
4.  **Omnipresencia:** Funciona en **iPhone**, **Android** y **PC (Windows)** compartiendo el 99% del código y sincronizándose en tiempo real.

---

## 🗺️ Hoja de Ruta (Roadmap Paso a Paso)

### 🛠️ Fase 0: La Fundación Técnica (Infraestructura)
*Objetivo: Tener el "esqueleto" del código listo, escalable y conectado a la nube.*
- [x] **Configuración del Monorepo:** Implementar Turborepo. Estructura de carpetas:
    - `packages/ui`: Componentes visuales compartidos (botones, estilos).
    - `apps/movil`: Proyecto Expo (compila para iOS y Android).
    - `apps/desktop`: Proyecto Electron (Windows).
- [x] **Base de Datos:** Crear proyecto en **Supabase** (Free Tier).
    - Configurar tablas iniciales (`users`, `tasks`, `projects`, `logs`).
    - Copiar claves API al `.env`.
- [x] **Entorno de Desarrollo:** Vincular repositorio GitHub con **Google Antigravity** para utilizar Agentes de IA en la generación de código repetitivo.

### 🎨 Fase 1: Arte, UI y el HUD (La Cara del Juego)
*Objetivo: Definir la identidad visual y la navegación rápida.*
- [ ] **Pipeline de Assets:** Generar con IA (Midjourney/DALL-E) los fondos isométricos para las 8 ubicaciones del mapa (incluyendo la Torre).
- [ ] **Sistema de Componentes UI:** Crear `MedievalButton` (imagen de fondo + texto) y `ParchmentCard` en `packages/ui`.
- [ ] **El HUD (Interfaz Siempre Visible):** Programar la capa flotante que persiste sobre el mapa para acceso rápido:
    - [ ] *El Pergamino:* Lista rápida de tareas overlay (Checklist diario).
    - [ ] *El Cuervo:* Centro de notificaciones (Badge rojo para avisos).
    - [ ] *El Quickadd:* Botón de acción rápida (Quick Add: Nota, Gasto, Idea).
    - [ ] *El Medallón:* Acceso directo al perfil y estadísticas vitales.

### 🌲 Fase 2: Módulo de Enfoque y Proyectos (Biblioteca y Torre)
*Objetivo: Gestión del conocimiento, estudio teórico y creación práctica.*
- [x] **Castillo (Gestión):**
    - [x] *Mesa de Guerra:* Calendario de "Jefes Finales" (Exámenes).
    - [ ] *Archivos Reales:* Subida y visualización de PDFs en Supabase Storage.
- [x] **Biblioteca (Estudio Teórico):**
    - [x] *Sección Prohibida:* Cronómetro con bloqueo estricto. Usar `AppState` para detectar salidas de la app y penalizar HP.
    - [x] *Atril:* Sistema de Flashcards.
- [ ] **Torre de Hechicería (Proyectos/Maker):**
    - [ ] *Grimorio de Proyectos:* Gestor de proyectos personales (Programación, Electrónica). Permite anidar tareas, ideas y recursos.
    - [ ] *Modo "Casteo":* Interfaz específica para cuando estás trabajando en el PC (Timer + Lista de tareas del proyecto activo).

### ⚔️ Fase 3: Módulo Físico (Barracones y Salud)
*Objetivo: El tracker de gimnasio más avanzado y visual del mundo.*
- [x] **Datos Semilla:** Script para importar ejercicios de Wger/ExerciseDB a Supabase (evitar entrada manual).
- [x] **Motor de Rutinas:** Lógica de ciclos complejos y alternos (Ej: Semana A: PPL / Semana B: Arnold Split).
- [ ] **Heatmap Corporal:** SVG interactivo del cuerpo humano.
    - [ ] Lógica: `Ejercicio` -> `Músculos` -> `Calculo de Volumen` -> `Pintar Rojo en SVG`.
- [ ] **Sub-módulos de Salud:**
    - [ ] *Taberna:* Contador de Hidratación (Jarras) y Macros simplificados.
    - [ ] *Templo:* Registro de Sueño y Diario de Gratitud.

### 🎭 Fase 4: Contexto y Sincronización Mágica (El Mundo Vivo)
*Objetivo: Que la app "sienta" el entorno y sincronice PC-Móvil.*
- [ ] **PC (Windows - El Ojo):** Implementar `active-win` en Electron.
    - Lógica: Si ventana activa = `VS Code` / `Antigravity` -> Enviar estado `CASTING_SPELL` a Supabase.
    - Lógica: Si ventana activa = `Steam` / `Netflix` -> Enviar estado `RESTING`.
- [ ] **Móvil (El Familiar):** Suscripción a Supabase Realtime.
    - Trigger: Si recibe estado `CASTING_SPELL`, abrir modal: *"¿En qué proyecto estás trabajando, mi señor?"*.
- [ ] **Sensores Físicos:**
    - *GPS:* `expo-location` para Geofencing (Detectar entrada en Gym/Uni).
    - *Clima:* API OpenWeatherMap. Sincronizar lluvia/sol en el mapa del juego.

### 📅 Fase 5: Gestión y Agenda
*Objetivo: Unir el juego con la realidad obligatoria.*
- [x] **Calendario Nativo (`expo-calendar`):**
    - [x] Importar eventos del móvil a la "Mesa de Guerra" para evitar conflictos.
    - [x] Exportar Exámenes (Jefes) al calendario de Google/iOS automáticamente.
- [ ] **Tareas RPG:** Clasificar tareas en Principales (Obligatorias/Penalizan), Secundarias (Oro/XP) y Diarias (Mantenimiento).

### 🚀 Fase 6: Despliegue Multiplataforma
*Objetivo: Llevar la app a los dispositivos reales.*
- [ ] **iOS:** Configurar SideStore y generar `.ipa` (Development Build con capacidades nativas).
- [ ] **Android:** Generar `.apk` universal con Expo para instalación directa.
- [ ] **Actualizaciones:** Configurar EAS Update (OTA) para desplegar parches de código sin reinstalar la app.

### 💰 Fase 7: Economía y Progresión Profunda
*Objetivo: Gamificación del esfuerzo.*
- [ ] **Árbol de Talentos:** Visualización de constelaciones que se dibujan al ganar XP.
    - *Intelecto (Azul):* Estudio.
    - *Vigor (Rojo):* Gym.
    - *Hechicería (Morado):* Coding/Proyectos.
    - *Carisma (Verde):* Social.
    - *Destreza (Amarillo):* Arte/Música.
- [ ] **Tienda del Alquimista:** Tabla `shop_items`. Sistema para canjear Oro virtual por recompensas reales (Pizza, Videojuegos).

### 📜 Fase 8: Narrativa (El Bardo)
*Objetivo: Tu vida contada como leyenda.*
- [ ] **Edge Function:** Cron job semanal en Supabase.
- [ ] **IA Generativa:** Enviar logs semanales a Gemini -> Recibir crónica épica -> Guardar en `chronicles`.

### 🔮 Fase 9: Inmersión y Magia (Extras)
*Objetivo: La guinda del pastel.*
- [ ] **Runas de Visión (Widgets):** Widgets nativos para iOS/Android (Runa de Batalla con cuenta atrás / Runa de Vitalidad).
- [ ] **El Bestiario (Mascotas):**
    - Sistema de huevos que eclosionan con rachas de hábitos.
    - Evolución según hábito dominante (Fuerza=Dragón / Estudio=Búho).
    - Vínculo emocional: Si rompes la racha, la mascota enferma.

---

## 💎 Guía de Funcionalidades (La "Biblia" del Juego)

### 1. La Torre de Hechicería (Nueva Ubicación)
Accesible desde la Biblioteca o el Castillo. Es el santuario de los **Creadores**.
* **El Grimorio de Proyectos:** Aquí registras tus proyectos personales (Coding, Arduino, Arte). A diferencia de las tareas sueltas, los Proyectos tienen objetivos a largo plazo, hitos y metodologías.
* **Sincronización Mágica (PC -> Móvil):**
    * Cuando te sientas al PC y abres tu IDE (VS Code, Antigravity), la app de escritorio detecta la "magia".
    * Inmediatamente, tu móvil vibra y el **Guardia de la Torre** pregunta: *"Veo que estás tejiendo realidad. ¿A qué Gran Proyecto canalizo este maná?"*.
    * Al responder, el tiempo empieza a contar para ese proyecto y ganas XP en la rama de **Hechicería (Morado)**.
* **Misiones Emergentes:** Mientras trabajas, la app te preguntará ocasionalmente: *"¿Has completado algún hito, mi señor?"*. Puedes marcar tareas como hechas sin perder el foco.

### 2. El HUD (Cinturón de Herramientas)
Es la interfaz que **siempre** ves, estés donde estés (salvo en bloqueo estricto).
* **📜 El Pergamino:** Toca para desplegar tus tareas del día sobre la pantalla actual. Marca cosas como hechas sin salir del gimnasio.
* **🐦 El Cuervo:** Tu bandeja de entrada. Avisa de: Jefes cercanos, Historias del Bardo, recordatorios de salud.
* **🎒 El Quickadd:** El botón mágico central. Al pulsarlo, permite captura rápida de: Pensamiento, Gasto, Tarea o Nota.

### 3. Las Ubicaciones del Mapa

#### 🏰 El Castillo (Gestión)
* **Sala del Trono:** Tu Dashboard. Si cumples, brilla. Si fallas, se llena de telarañas.
* **Mesa de Guerra:** Calendario táctico. Los exámenes son Jefes con barra de vida (Dificultad) y cuenta atrás.
* **Archivos Reales:** Tu nube personal para documentos y apuntes.

#### 🏛️ La Biblioteca (Intelecto)
* **Sección Prohibida:** Modo Focus agresivo para estudio teórico. Bloqueo de notificaciones y penalización de vida si sales.
* **Grimorio de ATALAYA DEL CONOCIMIENTO:** Donde visualizas tu Árbol de Talentos Completo.

#### ⚔️ Los Barracones (Fuerza)
* **La Forja:** Donde diseñas tus rutinas y splits (PPL, Arnold, etc.).
* **El Coliseo:** Historial de récords. Referencia visual de tu progreso ("La última vez: 80kg").
* **Espejo Mágico:** Heatmap corporal. Músculos rojos = Entrenados hoy. Azules = Atrofiados/Descansados.

#### 🍺 La Taberna (Vitalidad)
* **La Barra:** Cuenta jarras de agua.
* **Despensero:** Control de comida/macros. Comida basura = +Moral pero -Salud.

#### ⛪ El Templo (Espíritu)
* **El Altar:** Diario de gratitud obligatorio (3 líneas al día) para salud mental.
* **La Cripta:** Registro de sueño.

#### ⚖️ El Mercado (Economía)
* **Tienda del Alquimista:** Aquí gastas tu oro ganado estudiando. ¿Quieres pedir comida basura el sábado? Cuesta 500 monedas de oro. Paga el precio virtual para disfrutar la recompensa real.

---

## 🧪 Guía de Desarrollo y Testing

### Sincronización Mágica (PC-Móvil)
* **Cómo funciona:** La app Electron envía `UPDATE users SET current_activity = 'CODING'` a Supabase. La app Móvil escucha `Supabase.channel('public:users').on(...)` y dispara el modal.
* **Cómo probarlo:** No necesitas estar compilando todo el rato. Puedes cambiar el valor en la tabla de Supabase manualmente desde el navegador y ver si tu móvil reacciona.

### Pruebas Generales
1.  **Móvil (iOS y Android):**
    * Usa **Expo Go** (`npx expo start`) para cambios visuales rápidos.
    * Usa **Development Build** (instalada con SideStore en iOS o APK en Android) cuando toques cosas nativas como GPS, Widgets o Calendario.
2.  **PC (Windows):**
    * Ejecuta `yarn dev:desktop`. Se abre una ventana nativa de Windows con herramientas de depuración (`Ctrl+Shift+I`) para probar `active-win`.

### Android vs iOS
* Gracias a Expo, el código es el mismo.
* Solo ejecuta `eas build --platform android` para obtener tu APK instalable.

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend:** React Native + Expo (Móvil) / Electron (PC).
* **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime).
* **Lenguaje:** TypeScript.
* **Estilos:** Motor propio basado en `ImageBackground` y SVGs.

### Sensores y Librerías Clave
* `active-win`: Detectar si estás programando o jugando en el PC.
* `expo-location`: Geofencing (Saber si estás en el Gym).
* `expo-calendar`: Leer/Escribir en la agenda del móvil.
* `react-native-svg`: Para el mapa de calor corporal y árbol de talentos.
* `expo-widgets` (o nativo): Para las Runas de Visión.

---
*Hecho con sangre, sudor, código y magia.* 🧙‍♂️
