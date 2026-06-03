# OMEGA — Roadmap de Producto (documento vivo)

> Lista de features priorizada por **ROI** (impacto ÷ esfuerzo) + plan de ataque.
> Marca `[x]` lo hecho. Reordena libremente. Sustituye al roadmap medieval de `README.md`.
> Última edición: 2026-06 · Rama de trabajo: `redesign/minimal-dark`.

## 0. Principios de producto

- **Autónoma al ~90%.** La app funciona sin red para el uso diario. El servidor es **respaldo**, no dependencia.
- **El servidor guarda todo** (logout, reinstalar, otro dispositivo → recuperas tu progreso).
- **Sin sync instantáneo entre dispositivos.** No hace falta tiempo real multi-device.
- **Sesión única (estilo Clash of Clans):** si entras en un 2º dispositivo, el 1º se expulsa. El último login manda.
- **Gamificación sutil**, naming plano, tema oscuro (ya establecido en el rediseño).
- Uso personal del dueño; plan B = App Store.

## 1. Estado actual (base)

- Backend self-host Supabase en server propio (`omega-api.duckdns.org`), robusto ante reinicios.
- Capa de datos: React Query + persister AsyncStorage → **lecturas cacheadas offline (maxAge 24h)**.
- **Escrituras: online-only** (van directas a Supabase; offline fallan, sin cola). ⚠️ Esto rompe el principio "autónoma 90%".
- Rediseño UI minimalista oscuro + tabs (Hoy/Enfoque/Gimnasio/Salud/Perfil). Núcleo de cada área funcional; varias sub-features diferidas (ver §3).

---

## 2. Cómo se puntúa (ROI)

`Impacto` (1-5, cuánto mejora el uso diario/satisfacción) · `Esfuerzo` (1-5) · **Tier**: 🅢 (hazlo ya) · 🅐 (alto) · 🅑 (medio) · 🅒 (cuando sobre tiempo).

---

## 3. P0 — Cimientos (desbloquean todo lo demás) 🅢

### 3.1 Offline-first real (escrituras sin red) — Impacto 5 / Esfuerzo 4
Hoy las mutaciones fallan sin conexión. Objetivo: registrar agua/serie/comida/tarea **siempre**, y sincronizar al volver la red.
- [ ] Añadir `@react-native-community/netinfo` + `onlineManager` de React Query (detección de red).
- [ ] `networkMode: 'offlineFirst'` en queries; mutaciones que **pausan** offline y **reanudan** online (`resumePausedMutations`).
- [ ] Convertir las mutaciones de `packages/logic/src/queries/*` a `useMutation` con `setMutationDefaults` (mutation keys estables) para que sobrevivan a cierre de app (persistencia de la cola).
- [ ] Optimistic update + rollback en todas (patrón ya hecho en tavern/temple).
- [ ] Resolución de conflictos: **last-write-wins** (suficiente sin sync instantáneo).
- [ ] Indicador visual "sin conexión / cambios pendientes de sincronizar".

### 3.2 Sesión única / expulsar dispositivo — Impacto 4 / Esfuerzo 2
- [ ] Migración SQL: `profiles.active_session_id uuid`, `active_session_at timestamptz`.
- [ ] En login: generar `session_id` local (uuid) + escribirlo en el perfil (último gana).
- [ ] Al abrir/enfocar la app (y vía realtime de `profiles` que ya escuchamos): si `active_session_id` del server ≠ local → cerrar sesión con aviso *"Tu cuenta se abrió en otro dispositivo"*.

### 3.3 Completar features diferidas del rediseño que rompen utilidad básica — Impacto 4 / Esfuerzo 3
- [ ] Gimnasio: precargar ejercicios de la rutina al iniciar sesión; editar contenido de rutina.
- [ ] Estudio: selector de libros + modo lectura (además de asignaturas).
- [ ] Agenda: editar/eliminar tarea, marcar recurrencia básica, fecha al crear.
- [ ] Proyectos: gestión de ámbitos (crear/borrar tema) + modal de mapeo apps PC→proyecto.

---

## 4. Backlog priorizado por dominio

### 4.1 🏋️ Gimnasio (referencia: Hevy / Strong / Setgraph)
- [ ] **Historial por ejercicio + "última vez" visible al registrar** (clave para sobrecarga progresiva). Impacto 5/E 2 🅢
- [ ] **PR automático** (detectar récord de peso/reps/volumen y avisar). Impacto 4/E 2 🅐
- [ ] **Rest timer** configurable con notificación entre series. Impacto 4/E 2 🅐
- [ ] **1RM estimado** + programación por % . Impacto 3/E 2 🅑
- [ ] Tipos de serie: warmup / normal / fallo / drop (ya parcial). Impacto 3/E 1 🅐
- [ ] Gráficas de progreso por ejercicio (volumen, mejor peso, total reps). Impacto 4/E 3 🅑
- [ ] Supersets / circuitos. Impacto 3/E 3 🅑
- [ ] Plantillas de rutina + duplicar. Impacto 3/E 2 🅐
- [ ] Heatmap muscular (estaba; re-skin oscuro). Impacto 3/E 2 🅑
- [ ] Plate calculator (qué discos poner). Impacto 2/E 1 🅒
- [ ] Medidas corporales + peso (gráfica). Impacto 3/E 2 🅑

### 4.2 🍽️ Nutrición — PRIORIDAD BAJA (decisión: se usa otra app)
El dueño usará una app de nutrición externa. Solo interesa **integración** ligera más adelante.
- [ ] (Baja) Importar/leer datos de la app externa (ej. Apple Health/HealthKit como puente) → peso, kcal. Impacto 2/E 3 🅒
- [ ] (Baja) Registro de peso corporal + tendencia (ligero, dentro de Salud). Impacto 2/E 2 🅒

### 4.3 🎯 Enfoque / Estudio (referencia: Forest)
- [ ] Modo Pomodoro (sesiones + descansos) además de cronómetro. Impacto 4/E 2 🅐
- [ ] **Estadísticas de enfoque** (horas por día/semana/mes, por asignatura/tag). Impacto 4/E 2 🅐
- [ ] **Rachas** de enfoque + recompensa (XP/oro). Impacto 4/E 2 🅐
- [ ] Tags/etiquetas por sesión. Impacto 3/E 1 🅐
- [ ] Modo "deep focus" (bloqueo/aviso al salir de la app — ya existe Iron Will; portar). Impacto 3/E 2 🅑
- [ ] Flashcards / repaso espaciado (estaba planeado). Impacto 3/E 4 🅒
- [ ] Exámenes con cuenta atrás + nota + peso. Impacto 3/E 2 🅑

### 4.4 ✅ Tareas / Hábitos (referencia: Todoist / Habitica)
- [ ] **Recordatorios / notificaciones locales** (hábitos y tareas). Impacto 5/E 3 🅢
- [ ] Recurrencia rica (diaria, días concretos, cuota semanal — backend ya lo soporta). Impacto 4/E 2 🅐
- [ ] Prioridades + etiquetas. Impacto 3/E 1 🅑
- [ ] Subtareas. Impacto 2/E 2 🅒
- [ ] Captura rápida (añadir desde cualquier pantalla). Impacto 3/E 1 🅐
- [ ] Vista calendario con marcas. Impacto 3/E 3 🅑

### 4.5 🧙 Proyectos + maná de PC (feature única — diferenciador)
- [ ] Visualización clara: horas de enfoque acumuladas por proyecto + objetivo/meta. Impacto 4/E 2 🅐
- [ ] Mapeo apps del PC → ámbito/proyecto (UI de gestión). Impacto 3/E 3 🅑
- [ ] Desktop tracker: empaquetar `.exe` con autoarranque (electron-builder). Impacto 3/E 3 🅑
- [ ] Reparto automático del maná al proyecto "activo" del ámbito. Impacto 3/E 2 🅑

### 4.6 🎮 Gamificación / progresión
- [ ] **Tienda de recompensas reales** (gastar oro: pizza, videojuego…). Impacto 4/E 2 🅐
- [ ] Rachas globales + protección de racha. Impacto 3/E 2 🅑
- [ ] Árbol de talentos / constelaciones por atributo. Impacto 2/E 4 🅒
- [ ] Crónica semanal (IA resume tu semana). Impacto 2/E 3 🅒

### 4.7 ⚙️ Producción / infra (necesario para "lista para producción")
- [ ] **Notificaciones push** (expo-notifications) + permisos + scheduling. Impacto 5/E 3 🅢
- [ ] Onboarding (primer arranque: objetivos, datos básicos). Impacto 4/E 2 🅐
- [ ] Manejo de errores + estados de carga/vacío coherentes. Impacto 3/E 2 🅐
- [ ] **EAS Build** (.ipa/.apk instalables) + EAS Update (OTA). Impacto 4/E 2 🅐
- [ ] Limpieza de código muerto legacy (componentes medievales, GameContext inerte). Impacto 2/E 2 🅑
- [ ] Telemetría básica de errores (Sentry). Impacto 2/E 2 🅒
- [ ] Widgets (runa de batalla / vitalidad). Impacto 2/E 4 🅒

---

## 5. Plan de ataque (orden de ejecución)

Sprints cortos, cada uno deja la app usable + tsc verde + commit. Tras cada sprint: probar en móvil.

| Sprint | Objetivo | Incluye |
|---|---|---|
| **S1 — Autonomía** | App funciona sin red + sesión única | §3.1 offline-first, §3.2 sesión única |
| **S2 — Cerrar rediseño** | Sin agujeros de utilidad | §3.3 features diferidas |
| **S3 — Notificaciones + Hábitos** | "App encima de ti" | §4.7 notif. **locales**, §4.4 recordatorios+recurrencia+captura rápida |
| **S4 — Gimnasio pro** | Tracker de verdad | §4.1 (historial+última vez, PR auto, rest timer, plantillas) |
| **S5 — Enfoque** | Forest-like | §4.3 (pomodoro, stats, rachas, tags) |
| **S6 — Gamificación + Proyectos** | Recompensa y diferenciador | §4.6 tienda recompensas, §4.5 visualización maná |
| **S7 — Producción / iOS** | Usable a diario en tu iPhone | onboarding, errores, **EAS Build dev + SideStore**, limpieza |
| **S8 — Nutrición (integración)** | Baja prioridad | §4.2 puente con app externa |

> **ROI alto y temprano:** S1 (autonomía) primero (base de todo). S3 (notificaciones locales) por el objetivo "encima de ti". Gym (S4) por uso recurrente. Lo "bonito" (árbol talentos, crónica IA, widgets) y nutrición al final.

---

## 6. Decisiones tomadas
- **Nutrición:** se usa app externa. Solo integración ligera, prioridad baja (§4.2, S8).
- **Notificaciones:** **locales** (offline, gratis). Objetivo: app que recuerda obligaciones/objetivos de forma proactiva. Push remota descartada (requiere Apple Dev de pago).
- **Build iOS sin pagar 99€/año:** **EAS Build (perfil development, compila en la nube desde Windows) + SideStore** (instala con Apple ID gratis y auto-renueva la firma de 7 días en el propio iPhone). Notificaciones locales funcionan con firma gratis. Límites: máx 3 apps, sin push remota. (S7).
