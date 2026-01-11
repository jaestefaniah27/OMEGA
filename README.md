# ⚔️ OMEGA: The Life RPG
> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Visión y Filosofía del Proyecto
Omega no es una simple lista de tareas. Es un **Sistema Operativo Vital Gamificado**. Su objetivo es eliminar la fricción de hacer cosas aburridas (estudiar, ir al gym, tareas domésticas) convirtiéndolas en misiones de un RPG medieval.

**Los Pilares:**
1.  **Centralización:** Adiós a tener 5 apps (Forest, Strong, Notion, Habitica). Todo vive en una sola base de datos (Supabase).
2.  **Contexto:** La app sabe dónde estás (GPS), qué tiempo hace y qué hora es. Se adapta a ti, no al revés.
3.  **Inmersión:** No usas menús nativos de iOS. Usas pergaminos, mapas y runas.
4.  **Multiplataforma:** Funciona en **iPhone**, **Android** y **PC (Windows)** compartiendo el 99% del código.

---

## 🗺️ Hoja de Ruta (Roadmap Paso a Paso)

### 🛠️ Fase 0: La Fundación Técnica (Infraestructura)
*Objetivo: Tener el "esqueleto" del código listo y conectado a la nube.*
- [ ] **Monorepo:** Configurar Turborepo. Crear carpetas:
    - `packages/ui`: Componentes compartidos (botones, estilos).
    - `apps/movil`: Proyecto Expo (iOS/Android).
    - `apps/desktop`: Proyecto Electron (Windows).
- [ ] **Base de Datos:** Crear proyecto en **Supabase** (Free Tier). Copiar claves API al `.env`.
- [ ] **IDE:** Vincular repositorio GitHub con **Google Antigravity** para usar Agentes de IA en el desarrollo.

### 🎨 Fase 1: Arte, UI y el HUD (La Cara del Juego)
*Objetivo: Que no parezca una app, sino un videojuego.*
- [ ] **Assets:** Generar con IA (Midjourney) los fondos isométricos para las 7 ubicaciones del mapa.
- [ ] **Componentes UI:** Crear `MedievalButton` (imagen de fondo + texto) y `ParchmentCard` en `packages/ui`.
- [ ] **El HUD (Interfaz Siempre Visible):** Programar la capa flotante que persiste sobre el mapa:
    - [ ] *El Pergamino:* Lista rápida de tareas overlay.
    - [ ] *El Cuervo:* Centro de notificaciones (Badge rojo).
    - [ ] *El Zurrón:* Botón de acción rápida (Quick Add).
    - [ ] *El Medallón:* Acceso al perfil/stats.

### 🌲 Fase 2: Módulo de Enfoque (Biblioteca y Castillo)
*Objetivo: Gestión del tiempo y bloqueo de distracciones.*
- [ ] **Castillo (Gestión):**
    - [ ] *Mesa de Guerra:* Calendario de "Jefes Finales" (Exámenes).
    - [ ] *Archivos Reales:* Subida de PDFs a Supabase Storage.
- [ ] **Biblioteca (Estudio):**
    - [ ] *Sección Prohibida:* Cronómetro con bloqueo. Usar `AppState` para detectar si sales de la app.
    - [ ] *Castigo:* Si la app pasa a "background" durante la sesión -> Restar HP.

### ⚔️ Fase 3: Módulo Físico (Barracones y Salud)
*Objetivo: El tracker de gimnasio más avanzado del mundo.*
- [ ] **Datos Semilla:** Script para importar ejercicios de Wger/ExerciseDB a Supabase.
- [ ] **Motor de Rutinas:** Lógica de ciclos complejos (Semana A: PPL / Semana B: Arnold Split).
- [ ] **Heatmap Corporal:** SVG interactivo del cuerpo humano.
    - [ ] Lógica: `Ejercicio` -> `Músculos` -> `Pintar Rojo en SVG`.
- [ ] **Sub-módulos:** Hidratación (Taberna) y Sueño (Templo).

### 🎭 Fase 4: Contexto y Sensores (El Mundo Vivo)
*Objetivo: Que la app "sienta" el entorno.*
- [ ] **PC (Windows):** Implementar librería `active-win` en Electron para saber qué ventana usas (Chrome vs Steam).
- [ ] **Móvil (GPS):** Implementar `expo-location`. Geofencing para detectar entrada en Gym/Uni.
- [ ] **Clima:** Conectar API OpenWeatherMap. Si llueve fuera, llueve en el mapa.

### 📅 Fase 5: Gestión y Sincronización
*Objetivo: Unir el juego con la agenda real.*
- [ ] **Calendario Nativo (`expo-calendar`):**
    - [ ] Importar eventos del móvil a la "Mesa de Guerra".
    - [ ] Exportar Exámenes (Jefes) al calendario de Google/iOS.
- [ ] **Tareas RPG:** Clasificar en Principales (Obligatorias), Secundarias y Diarias.

### 🚀 Fase 6: Despliegue Multiplataforma
*Objetivo: Instalar la app en dispositivos reales.*
- [ ] **iOS:** Configurar SideStore y generar `.ipa` (Development Build).
- [ ] **Android:** Generar `.apk` con Expo para instalación directa.
- [ ] **Actualizaciones:** Configurar EAS Update (OTA) para actualizar código sin reinstalar.

### 💰 Fase 7: Economía y Progresión
*Objetivo: Gamificación profunda.*
- [ ] **Árbol de Talentos:** Visualización de constelaciones (Intelecto/Vigor) según XP ganada.
- [ ] **Tienda del Alquimista:** Tabla `shop_items`. Canjear Oro virtual por recompensas reales (Pizza, Videojuegos).

### 📜 Fase 8: Narrativa (El Bardo)
*Objetivo: Tu vida contada como leyenda.*
- [ ] **Edge Function:** Cron job semanal en Supabase.
- [ ] **IA:** Enviar logs a Gemini -> Recibir crónica épica -> Guardar en `chronicles`.

### 🔮 Fase 9: Inmersión y Magia (Extras)
*Objetivo: La guinda del pastel.*
- [ ] **Runas de Visión (Widgets):**
    - Widgets nativos para iOS/Android (Runa de Batalla/Vitalidad).
- [ ] **El Bestiario (Mascotas):**
    - Sistema de huevos que eclosionan con rachas.
    - Evolución según hábito dominante (Fuerza=Dragón / Estudio=Búho).

---

## 💎 Guía de Funcionalidades (La "Biblia" del Juego)

### 1. El HUD (Cinturón de Herramientas)
Es la interfaz que **siempre** ves, estés donde estés (salvo en bloqueo estricto).
* **📜 El Pergamino:** Toca para desplegar tus tareas del día sobre la pantalla actual. Marca cosas como hechas sin salir del gimnasio.
* **🐦 El Cuervo:** Tu bandeja de entrada. Avisa de: Jefes cercanos, Historias del Bardo, recordatorios de salud.
* **🎒 El Zurrón:** El botón mágico. Al pulsarlo, captura rápida de: Pensamiento, Gasto, Tarea o Nota.

### 2. Las Ubicaciones del Mapa

#### 🏰 El Castillo (Gestión)
* **Sala del Trono:** Tu Dashboard. Si cumples, brilla. Si fallas, se llena de telarañas.
* **Mesa de Guerra:** Calendario táctico. Los exámenes son Jefes con barra de vida (Dificultad).
* **Archivos Reales:** Tu Google Drive medieval.

#### 🏛️ La Biblioteca (Intelecto)
* **Sección Prohibida:** Modo Focus agresivo. Bloqueo de notificaciones y penalización de vida si sales.
* **Grimorio:** Donde ves tu Árbol de Talentos (Constelaciones).

#### ⚔️ Los Barracones (Fuerza)
* **La Forja:** Donde diseñas tus rutinas.
* **El Coliseo:** Historial de récords. "La última vez levantaste 80kg".
* **Espejo Mágico:** Heatmap corporal. Músculos rojos = Entrenados. Azules = Atrofiados.

#### 🍺 La Taberna (Vitalidad)
* **La Barra:** Cuenta jarras de agua.
* **Despensero:** Control de comida. Comida basura = +Moral pero -Salud.

#### ⛪ El Templo (Espíritu)
* **El Altar:** Diario de gratitud obligatorio (3 líneas al día).
* **La Cripta:** Registro de sueño.

#### ⚖️ El Mercado (Economía)
* **Tienda del Alquimista:** Aquí gastas tu oro ganado estudiando. ¿Quieres pedir comida basura el sábado? Cuesta 500 monedas de oro. Paga el precio.

---

## 🧪 Guía de Desarrollo y Testing

### ¿Cómo pruebo mientras programo?
1.  **Móvil (iOS y Android):**
    * Usa **Expo Go** (`npx expo start`) para cambios visuales rápidos.
    * Usa **Development Build** (instalada con SideStore en iOS o APK en Android) cuando toques cosas nativas como GPS o Widgets.
2.  **PC (Windows):**
    * Ejecuta `yarn dev:desktop`. Se abre una ventana nativa de Windows con herramientas de depuración (`Ctrl+Shift+I`).

### ¿Cómo funciona en Android?
* Es mágico. Al usar Expo, el mismo código de React Native se compila para los dos.
* Solo necesitas ejecutar `eas build --platform android` para obtener el archivo `.apk` e instalártelo.

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend:** React Native + Expo (Móvil) / Electron (PC).
* **Backend:** Supabase (PostgreSQL + Auth + Edge Functions).
* **Lenguaje:** TypeScript.
* **Estilos:** Motor propio basado en `ImageBackground` (No usamos componentes nativos de Apple/Google).

### Sensores y Librerías Clave
* `expo-location`: Geofencing (Saber si estás en el Gym).
* `expo-calendar`: Leer/Escribir en la agenda del móvil.
* `active-win`: Detectar ventana activa en Windows.
* `react-native-svg`: Para el mapa de calor corporal y árbol de talentos.

---
*Hecho con sangre, sudor y código.* 🛡️
