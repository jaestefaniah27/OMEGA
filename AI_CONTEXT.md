# 🏰 PROYECTO OMEGA: Contexto Técnico y Funcional

**ROL PARA LA IA:** Actúa como el Arquitecto Principal y Lead Developer del Proyecto OMEGA. Este documento describe el estado actual, la arquitectura y la lógica de negocio de una aplicación de "Life RPG" (Gamificación de vida).

---

## 1. VISIÓN GENERAL
OMEGA es un ecosistema de aplicaciones diseñado para gamificar la vida del usuario. Convierte hábitos, tareas y uso del ordenador en experiencia (XP), atributos y progreso en un juego de rol medieval/fantástico.

## 2. ARQUITECTURA DEL SISTEMA (Monorepo)
El proyecto está estructurado como un monorepo con dos aplicaciones principales y paquetes compartidos:

### A. `apps/movil` (La Torre del Mago - Interfaz Principal)
* **Tech Stack:** React Native, Expo, TypeScript, React 19.
* **Función:** Es el cerebro y la interfaz del usuario. Visualización de stats, mapa, inventario y misiones.
* **Navegación:** React Navigation.
    * **Home (Map):** Vista principal.
    * **Castle:** Calendario y planificación.
    * **Barracks:** Entrenamiento y hábitos físicos.
    * **Theatre:** Consumo de contenido.
    * **Zurron:** Inventario y Quick Add.
* **Integración Desktop:** Contiene un hook `useDesktopSpy` que, cuando corre en entorno Electron, muestra un overlay visual (HUD) de la app activa.

### B. `apps/desktop` (El Familiar - Rastreador Silencioso)
* **Tech Stack:** Electron, Node.js, PowerShell (vía `child_process`).
* **Función:** Worker invisible en segundo plano que monitoriza la actividad del PC y la sube a la nube.
* **Interfaz:** Tray Icon (Bandeja del sistema). Sin ventana principal visible por defecto.
* **Lógica de Rastreo (V5 - PID System):**
    * **Intervalo de chequeo:** 5 segundos.
    * **Intervalo de subida:** 60 segundos.
    * **Ojo de Precisión (`active-win`):** Obtiene el PID de la ventana activa (Foco).
    * **Ojo de Área (PowerShell):** Obtiene lista de todos los procesos con ventana (Background).
    * **Algoritmo de Fusión:**
        1. Identifica el PID de la app en Foco.
        2. Barre todas las demás apps abiertas.
        3. Si `PID_App !== PID_Foco` → Se cuenta como tiempo 'background'.
        4. Si `PID_App === PID_Foco` → Se cuenta como tiempo 'focus'.
    * **Persistencia:** Acumula segundos en memoria (`activityBuffer`) y hace un `INSERT` masivo a Supabase cada minuto.

### C. `supabase` (El Libro de los Registros - Backend)
* **Base de Datos:** PostgreSQL.
* **Autenticación:** Supabase Auth (Usuario único gestionado por UUID fijo en `.env` del desktop).
* **Schema Actual (`computer_activities`):**
    ```sql
    create table computer_activities (
      id bigint primary key generated always as identity,
      user_id uuid references auth.users not null,
      app_name text not null,        -- Ej: "Google Chrome"
      duration_seconds int,          -- Tiempo acumulado en el intervalo
      state text,                    -- 'focus' o 'background'
      created_at timestamptz default now()
    );
    ```

---

## 3. SOLUCIONES TÉCNICAS CRÍTICAS (NO TOCAR)

### 🛡️ 1. Importación de Módulos ESM en Electron
La librería `active-win` es ESM puro y da problemas con Node.js/Electron estándar.
**Solución implementada:** Importación dinámica y verificación recursiva de exportaciones.
```javascript
// Patrón obligatorio en main.js
const imported = await import('active-win');
// Busca activeWindow en la raíz o en .default
let activeWinFunc = imported.activeWindow || imported.default?.activeWindow || imported.default;

```

### 🛡️ 2. Identificación de Procesos (PID vs Nombres)

Comparar nombres de procesos (`chrome` vs `Google Chrome`) o rutas de archivos causa duplicidad de datos (detecta la misma app como focus y background a la vez).
**Solución implementada:** Usar estrictamente el **Process ID (PID)** para diferenciar si una app es la misma que la que tiene el foco.

### 🛡️ 3. Versiones de React

* `apps/movil` corre sobre **React 19**.
* Es imperativo que los paquetes `react` y `react-dom` tengan **exactamente la misma versión** (actualmente `19.1.0`) en `package.json` para evitar conflictos de renderizado en Expo Web/Electron.

### 🛡️ 4. Variables de Entorno Híbridas

El Desktop usa un sistema híbrido para leer claves, compatible con el estándar web de Expo. El código de `main.js` busca ambas variantes:
`process.env.SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 4. ROADMAP INMEDIATO

1. **Visualización:** Crear componentes en `apps/movil` para leer `computer_activities` y mostrar gráficos de uso (Foco vs Fondo).
2. **Gamificación (XP):** Implementar lógica en base de datos o backend para asignar XP según la categoría de la app (Productividad vs Ocio).
3. **Deploy Desktop:** Configurar `electron-squirrel-startup` o similar para generar un `.exe` instalable que se inicie automáticamente con Windows.

---

## 5. INSTRUCCIONES DE USO DEL PROMPT

Al iniciar una nueva sesión, la IA debe leer este contexto primero.

* **Código:** Si se pide modificar `apps/desktop/main.js`, mantén SIEMPRE la lógica de comparación por PIDs y la importación robusta.
* **Estilo:** Mantén un tono profesional pero alineado con la temática "Torre del Mago" (Fantasía/RPG) para la nomenclatura de alto nivel.
* **Base de Datos:** Cualquier cambio de esquema debe incluir el SQL de migración correspondiente.
