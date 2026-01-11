# ⚔️ OMEGA: The Life RPG
> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Resumen del Proyecto
Omega es un ecosistema de productividad y gestión personal gamificado, diseñado con una estética de RPG medieval. El objetivo es centralizar todos los aspectos de la vida (estudio, gimnasio, ocio, salud) en una única base de datos modular, flexible y multiplataforma (iOS y Windows).

A diferencia de las apps convencionales, Omega transforma la vida en un videojuego: los exámenes son "Jefes Finales", el gimnasio sube tus estadísticas de fuerza y distraerse con el móvil reduce tu vida. Todo ello bajo una arquitectura técnica robusta que permite sincronización en la nube (y futura auto-soberanía en NAS).

---

## 🗺️ Hoja de Ruta (Roadmap)

### 🛠️ Fase 0: Configuración del Entorno (La Fundación)
- [ ] Configurar Monorepo (Turborepo/Yarn Workspaces) con estructura `apps/` y `packages/`.
- [ ] Inicializar proyecto React Native (Expo) en `apps/movil`.
- [ ] Inicializar proyecto Electron en `apps/desktop`.
- [ ] Crear proyecto en Supabase (Free Tier) y conectar credenciales.
- [ ] Configurar repositorio en GitHub y conectar con Google Antigravity.
- [ ] Configurar EAS (Expo Application Services) para OTAs.

### 🎨 Fase 1: Arte y UI (La Estética Medieval)
- [ ] Generar assets con IA (Midjourney/DALL-E) para fondos y texturas.
- [ ] Limpiar assets (PNGs transparentes) para botones e iconos.
- [ ] Crear componente `MedievalButton` (imagen de fondo + texto).
- [ ] Crear componente `ParchmentCard` (marco para textos).
- [ ] Diseñar el "Mapa del Mundo" (Home Screen) con zonas interactivas.
- [ ] Diseñar el avatar del personaje principal.

### 🌲 Fase 2: Módulo de Enfoque (Biblioteca/Castillo)
- [ ] Programar lógica del Cronómetro (Timer).
- [ ] Implementar `AppState` en iOS para detectar salidas de la app.
- [ ] Crear sistema de "Castigo" (restar vida al salir de la app).
- [ ] Crear sistema de notificaciones locales ("¡Vuelve a la app!").
- [ ] Conectar tiempos de estudio a la base de datos Supabase.

### ⚔️ Fase 3: Módulo de Entrenamiento (Barracones)
- [ ] Crear tablas SQL en Supabase (`Ejercicios`, `Logs`, `Rutinas`).
- [ ] Desarrollar script para importar base de datos "semilla" (Wger/ExerciseDB).
- [ ] Implementar lógica matemática de 1RM y Volumen de Carga.
- [ ] Integrar SVG del cuerpo humano interactivo.
- [ ] Programar lógica de coloreado del SVG según intensidad del entreno.

### 🖥️ Fase 4: Módulo PC (La Torre de Vigilancia)
- [ ] Implementar librería `active-win` en Electron.
- [ ] Crear "listener" en segundo plano que detecte la ventana activa.
- [ ] Lógica de filtrado (asignar `chrome.exe` a ocio o estudio).
- [ ] Sincronización automática de tiempos de PC con Supabase.

### 📅 Fase 5: Gestión y Jefes (El Pergamino)
- [ ] Crear el "Inbox de Notificaciones" (Pergamino centralizado).
- [ ] Desarrollar lógica de "Jefes Finales" (Exámenes) con cuenta atrás.
- [ ] Implementar alertas de intensidad progresiva según cercanía del examen.
- [ ] Sistema de subida de apuntes (PDFs) a Supabase Storage.

### 🚀 Fase 6: Despliegue y Mantenimiento
- [ ] Instalar SideStore en dispositivo iOS.
- [ ] Compilar `.ipa` inicial y desplegar.
- [ ] Configurar OTA Updates para actualizaciones de código (JS).
- [ ] (Futuro) Migración a NAS propio con Docker y Tailscale.

---

## 🔮 Funcionalidades Detalladas

### 1. El Mapa del Mundo (Navegación)
En lugar de un menú tradicional, la pantalla de inicio es un paisaje medieval interactivo:
* **Biblioteca:** Para sesiones de estudio profundo.
* **Barracones:** Para el registro de gimnasio.
* **Teatro:** Para registrar actividades de ocio (Piano, TV).
* **Castillo:** Gestión de universidad, trabajo y subida de apuntes.

### 2. Gamificación y Castigo (Focus Mode)
El sistema utiliza un enfoque de "palo y zanahoria".
* **iOS:** Al iniciar una sesión de estudio, si la app pasa a segundo plano (distracción), se envía una alerta crítica. Si no se regresa en X segundos, el personaje pierde vida/HP.
* **PC:** Registro pasivo de actividad. Diferencia entre tiempo productivo y tiempo perdido automáticamente detectando la ventana activa.

### 3. Gimnasio Inteligente (Heatmap Corporal)
No es un simple log. Omega entiende el esfuerzo.
* **Base de datos:** Importada de fuentes Open Source (Wger) para conocer qué músculos afecta cada ejercicio.
* **Cálculo de Intensidad:** Usa fórmulas de 1RM para determinar si el levantamiento de hoy es un esfuerzo real comparado con el histórico.
* **Visualización:** Un diagrama SVG del cuerpo humano se ilumina (mapa de calor) en tiempo real. Músculos entrenados intensamente brillan en rojo/fuego; músculos inactivos se enfrían/oscurecen.

### 4. Sistema de "Jefes Finales" (Exámenes)
Los exámenes se tratan como batallas contra Bosses.
* Se configuran con fecha y dificultad.
* **Cuenta atrás inteligente:** La app aumenta la insistencia de los recordatorios conforme se acerca la fecha (Modo Alerta a T-7 días).
* Puede bloquear funciones de "Ocio" si la batalla está cerca y no se ha cumplido el tiempo de estudio.

### 5. El Pergamino (Inbox Unificado)
Un centro de notificaciones dentro del juego donde convergen todos los avisos: recordatorios de gimnasio, alertas de estudio y mensajes del sistema.

---

## ⚙️ Arquitectura Técnica

### Stack Tecnológico
* **Frontend Móvil:** React Native + Expo (Managed Workflow).
* **Frontend Desktop:** Electron + React (Compartiendo UI con móvil).
* **Lenguaje:** TypeScript / JavaScript.
* **Estilos:** Componentes propios basados en imágenes (`ImageBackground`) para estética medieval.
* **Gestión de Estado:** React Query / Context API.

### Backend & Datos (Supabase)
* **Base de Datos:** PostgreSQL.
* **Auth:** Gestión de usuarios para sincronización multiplataforma.
* **Storage:** Almacenamiento de archivos grandes (Apuntes/PDFs).
* **Estrategia:** *Cloud-first* (Supabase Cloud) con migración planificada a *Self-hosted* (NAS + Docker) en el futuro.

### Code Sharing (Monorepo)
El proyecto utiliza una estructura de Monorepo para maximizar la reutilización de código:
* `packages/ui`: Componentes visuales (Botones medievales, Cards, Textos) y lógica de negocio compartida (Supabase hooks).
* `apps/movil`: Código específico de iOS (Haptics, AppState, Notifications).
* `apps/desktop`: Código específico de Windows (Electron main process, active-win).

### Desarrollo y Despliegue (CI/CD)
* **IDE:** Google Antigravity (aprovechando Agentes de IA para tareas repetitivas y scripting).
* **Control de Versiones:** GitHub.
* **Actualizaciones:**
    * **EAS Update (Expo):** Para cambios de lógica/UI (Over-The-Air).
    * **SideStore:** Para la gestión del certificado y la instalación del binario nativo (`.ipa`) en iOS sin depender de Mac ni pagar Apple Developer Program (renovación vía WiFi).
    * **VPN:** Uso de Tailscale (futuro) para acceso remoto seguro a la NAS.

---
*Hecho con sangre, sudor y código.* 🛡️
