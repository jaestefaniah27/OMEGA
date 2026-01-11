# ⚔️ OMEGA: The Life RPG

> *El Alfa y el Omega. Una aplicación para gobernarlas a todas.*

## 📜 Visión y Filosofía del Proyecto

Omega no es simplemente una "To-Do List". Es un ecosistema de gestión vital gamificado (Life RPG) que busca resolver la fricción de la productividad mediante narrativa y mecánicas de juego.

El objetivo central es la **centralización absoluta**: fusionar las funcionalidades dispersas de apps como *Forest* (bloqueo), *Strong* (gym), *Notion* (notas) y *Habitica* (RPG) en una única base de datos modular. La app es contextualmente inteligente: utiliza geolocalización, clima y horarios para adaptarse al usuario, eliminando la necesidad de navegar por menús complejos.

---

## 🗺️ Hoja de Ruta de Desarrollo (Roadmap Detallado)

### 🛠️ Fase 0: La Fundación Técnica (Infraestructura)

Esta fase establece los cimientos para que el código sea escalable y compartido entre PC y Móvil.

- [ ] **Configuración del Monorepo:** Implementar Turborepo para gestionar múltiples paquetes. Crear carpeta `packages/ui` para compartir botones y estilos entre `apps/movil` (React Native) y `apps/desktop` (Electron).
- [ ] **Inicialización de Proyectos:**
  - Generar la app móvil con `npx create-expo-app`.
  - Generar la app de escritorio con un boilerplate de Electron + React.
- [ ] **Conexión de Base de Datos (Supabase):**
  - Crear proyecto en Supabase (Free Tier).
  - Configurar las tablas iniciales y copiar las claves API (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) en las variables de entorno `.env`.
- [ ] **Entorno de Desarrollo (Antigravity):** Vincular el repositorio de GitHub con Google Antigravity para habilitar el uso de Agentes de IA en el flujo de trabajo.

### 🎨 Fase 1: Arte, UI y el HUD (La Interfaz Viva)

Aquí definimos la identidad visual. No usamos componentes estándar de iOS/Android; creamos un motor gráfico propio basado en imágenes.

- [ ] **Pipeline de Assets:** Utilizar Midjourney/DALL-E para generar fondos isométricos o ilustraciones planas para cada ubicación (Castillo, Biblioteca, etc.).
- [ ] **Sistema de Componentes:** Programar `MedievalButton` (un componente que acepta una imagen de fondo y texto con tipografía antigua) y `ParchmentCard` (contenedores de texto con bordes irregulares).
- [ ] **Programación del HUD (Heads-Up Display):** Crear una capa de interfaz flotante (`absolute positioning`) que persista sobre cualquier pantalla, conteniendo:
  - *El Pergamino:* Overlay deslizante para checkear tareas rápidas.
  - *El Cuervo:* Icono con indicador numérico (badge) para notificaciones.
  - *El Zurrón:* Botón de acción flotante (FAB) que despliega un menú radial de acciones rápidas.

### 🌲 Fase 2: Módulo de Enfoque (Biblioteca y Castillo)

Desarrollo de la lógica de productividad pura y gestión de archivos.

- [ ] **Lógica de Gestión (Castillo):**
  - Crear vista de Calendario ("Mesa de Guerra") que filtre eventos por tipo "Jefe Final" (Exámenes).
  - Conectar Supabase Storage para permitir la subida y listado de PDFs ("Archivos Reales").
- [ ] **Lógica de Estudio (Biblioteca):**
  - Implementar `AppState` en React Native para detectar cuándo la app pasa a segundo plano.
  - Programar el "Castigo": Si `AppState` cambia a `background` durante una sesión activa, disparar notificación local y restar HP en la base de datos tras 10 segundos.

### ⚔️ Fase 3: Módulo Físico (Barracones y Salud)

El módulo más complejo a nivel de datos. Requiere lógica matemática para el fitness.

- [ ] **Importación de Datos Semilla:** Escribir un script (Python/JS) que descargue el dataset de Wger/ExerciseDB, lo limpie de duplicados y lo inserte en la tabla `exercises` de Supabase.
- [ ] **Motor de Rutinas (Smart Coach):** Programar la lógica que determine qué rutina cargar basándose en la fecha actual y el tipo de ciclo (ej: si `week % 2 == 0` cargar Arnold Split).
- [ ] **Visualización Corporal (Heatmap):**
  - Integrar un SVG del cuerpo humano con IDs por grupo muscular.
  - Crear función que mapee `ejercicio_realizado` -> `musculos_afectados` -> `cambiar_color_SVG`.
- [ ] **Sub-módulos de Salud:** Crear contadores simples con persistencia diaria para Hidratación (Taberna) y Sueño (Templo).

### 🎭 Fase 4: Ocio, Economía y Contexto

Gamificación de la vida real y conexión con el entorno.

- [ ] **Sistema de Economía:**
  - Crear tabla `shop_items` con costes en oro.
  - Programar lógica de transacción: `user_gold - item_cost`.
- [ ] **Sensores del Dispositivo:**
  - **PC:** Implementar librería `active-win` en un proceso de fondo de Electron para registrar el título de la ventana activa cada 5 segundos.
  - **Móvil:** Implementar `expo-location`. Definir "Geofences" (radios de coordenadas) para Casa, Gym y Uni.
  - **Clima:** Conectar API gratuita de OpenWeatherMap para obtener el estado del clima local al iniciar la app.

### 📅 Fase 5: Gestión de Misiones y Calendario (El Pergamino)

- [ ] **Sincronización de Calendario Nativo:**
  - [ ] Implementar librería `expo-calendar`.
  - [ ] **Lectura:** Importar eventos del móvil a la "Mesa de Guerra" para detectar conflictos de horario.
  - [ ] **Escritura:** Exportar "Jefes Finales" (Exámenes) y "Misiones Críticas" al calendario de iOS/Google automáticamente.
- [ ] **Sistema de Clasificación de Tareas:**
  - **Misiones Principales:** Obligatorias (Taller, Reuniones) -> Penalización grave.
  - **Misiones Secundarias:** Necesarias (Comprar, Felicitar) -> Recompensa media.
  - **Grind Diario:** Higiene/Repetitivas (Leer, Gym) -> Mantener buffs.
- [ ] **Jefes Finales (Exámenes):** Lógica de cuenta atrás y "Modo Alerta" progresivo.
- [ ] **Inbox Unificado:** Centralizar notificaciones del juego y eventos del calendario real.

### 🔮 Fase 6: Narrativa y Extras (IA)

La capa final que da "alma" al proyecto.

- [ ] **El Bardo (Generación de Texto):** Crear una Edge Function en Supabase que se ejecute cada domingo (Cron Job). Esta función debe:
  1. Leer los logs de la semana del usuario.
  2. Formatearlos en un prompt para Gemini Flash.
  3. Guardar la respuesta narrativa en la tabla `chronicles`.

---

## 💎 Profundización en las Funcionalidades

### 1. El HUD (Interfaz Siempre Visible)

Para evitar la fricción de navegar por menús tipo videojuego cuando necesitas algo rápido, el HUD actúa como tu cinturón de herramientas.

* **📜 El Pergamino (Tareas):** Una lista semitransparente que se despliega sobre la pantalla actual. Permite marcar "Misiones del Día" (Principales, Secundarias, Diarias) como completadas sin romper el flujo de lo que estés haciendo.
* **🐦 El Cuervo (Avisos):** El centro de notificaciones unificado. Aquí llegan los avisos de "Jefes cercanos" (exámenes), las nuevas historias generadas por El Bardo y recordatorios de salud.
* **🎒 El Zurrón (Quick Add):** Un botón de captura rápida. Al pulsarlo, permite registrar un pensamiento fugaz, un gasto imprevisto o una tarea nueva en segundos.

### 2. Ubicaciones del Mapa y sus Funciones

#### 🏰 El Castillo (Gestión Central)

El centro de mando.

* **Sala del Trono (Dashboard):** Tu estado vital. Si has cumplido tus tareas, el trono se ve majestuoso y brillante. Si tienes tareas atrasadas, aparecen telarañas o grietas visuales.
* **Mesa de Guerra (Planificación):** Calendario táctico. Los exámenes no son eventos, son "Batallas". Puedes ver la dificultad (HP del jefe) y los días restantes.
* **Archivos Reales:** Interfaz visual para navegar por tus apuntes en la nube.

#### 🏛️ La Biblioteca (Intelecto y Foco)

* **La Sección Prohibida:** El modo "Do Not Disturb" definitivo. Al entrar, la app bloquea la navegación a otras zonas. Si sales de la app, recibes daño masivo. Ideal para Pomodoros estrictos.
* **Atril del Escriba:** Sistema de repaso espaciado (Flashcards) integrado para memorizar conceptos antes de una batalla (examen).
* **Grimorio de Sabiduría:** Visualización del Árbol de Talentos. Las horas de estudio se convierten en puntos para desbloquear constelaciones de "Sabiduría".

#### ⚔️ Los Barracones (Fuerza y Físico)

* **La Forja:** Un constructor de rutinas flexible. Permite configurar ciclos complejos (ej: Rotación de 4 días A-B-C-D) que no dependen de los días de la semana.
* **El Coliseo:** Visualización de progreso. Muestra gráficas de tus levantamientos históricos comparados con tu 1RM teórico actual.
* **El Espejo Mágico (Heatmap):** Un modelo anatómico interactivo. Los músculos brillan en rojo intenso si han recibido estímulo reciente y alto volumen. Se apagan a gris/azul si llevan días sin entrenar (atrofia visual).

#### 🍺 La Taberna (Vitalidad - Nutrición)

Un enfoque RPG a la dieta.

* **La Barra:** Registro de hidratación mediante jarras visuales.
* **El Despensero:** Registro de macros simplificado. La comida saludable regenera HP; la comida basura penaliza estadísticas pero sube la "Moral" (Ocio).

#### ⛪ El Templo (Espíritu - Salud Mental)

* **El Altar:** Registro de gratitud diario. Obliga al usuario a pausar y escribir 3 cosas positivas para ganar el buff de "Claridad Mental".
* **La Cripta:** Tracker de sueño manual o sincronizado con Apple Health. Dormir poco aplica un debuff de "Fatiga" que reduce la XP ganada al día siguiente.

#### 🎭 El Teatro (Carisma - Ocio)

* **Los Camerinos:** Herramientas para práctica deliberada de hobbies (Metrónomo, Cronómetro de práctica).
* **La Taquilla:** Tienda de Ocio. Aquí es donde gastas el oro ganado con esfuerzo. "Comprar" una hora de serie cuesta 100 monedas de oro. Gamifica la culpa del ocio pasivo.

#### ⚖️ El Mercado (Economía Real)

El puente entre el juego y la realidad.

* **Tienda del Alquimista:** Un catálogo configurable por el usuario. Puedes poner recompensas reales (ej: "Pedir Pizza", "Comprar videojuego de 60€").
* **Mecánica:** Estas recompensas cuestan cantidades altas de oro del juego, obligándote a ser productivo durante semanas para "permitirte" un capricho real sin remordimientos.

---

## ⚙️ Arquitectura Técnica Explicada

### Stack Tecnológico: ¿Por qué estas herramientas?

* **React Native + Expo:** Permite iterar rapidísimo. Usamos el sistema de *Over-The-Air Updates* (EAS) para arreglar bugs sin tener que reinstalar la app manualmente cada vez.
* **Electron:** Permite reutilizar el 90% del código de la interfaz del móvil en el PC, pero con acceso a APIs de Windows (como detectar ventanas activas) que una web normal no tendría.
* **Supabase:** Es un "Backend-as-a-Service". Nos da Base de Datos, Autenticación y Almacenamiento de archivos sin tener que configurar servidores complejos de Linux por ahora.
* *Librerías Clave:* `expo-location` (GPS), `react-native-svg` (Heatmap), `expo-calendar` (Sincronización de eventos).

### Estrategia de Datos

* **Cloud-First:** Inicialmente, todo se sincroniza con la nube de Supabase para asegurar que el iPad, el iPhone y el PC vean los mismos datos al instante.
* **Migración Futura:** La arquitectura está diseñada para ser dockerizada. En el futuro, se podrá desplegar una instancia de Supabase en un NAS casero (Raspberry Pi) y cambiar la URL de la API en la app para lograr soberanía total de datos.

### Desarrollo con IA (Google Antigravity)

Utilizamos un IDE potenciado por agentes para automatizar la "fontanería" del código:

* Los agentes se encargan de escribir los scripts de migración de base de datos.
* Los agentes generan los tipos de TypeScript basados en las tablas SQL.
* Nosotros nos centramos en la lógica de juego y la experiencia de usuario.

---

*Hecho con sangre, sudor y código.* 🛡️
