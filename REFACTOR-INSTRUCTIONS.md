Nueva Estrategia: El Patrón "Strangler Fig"
En lugar de reescribir la app entera y cruzar los dedos, vamos a usar el patrón de estrangulamiento. Vamos a construir la nueva arquitectura al lado de la vieja, y vamos a ir sustituyendo módulo por módulo (Edificio por Edificio).

Regla de Oro: La app debe compilar y funcionar en cada paso. Nunca dejes la rama en estado roto ("broken build").

Fase 1: Cimientos (Sin romper nada)
Instala WatermelonDB en main: Configura el schema.ts y models.ts pero NO LO CONECTES A LA UI.

No cambies la BD de Supabase: Prohibido renombrar columnas (mana_amount se queda como mana_amount). Si necesitas campos nuevos (updated_at), añádelos, pero no borres los viejos.

Objetivo: La app funciona igual que siempre, pero ahora tiene una base de datos SQLite vacía e invisible instalada.

Fase 2: El "Doble Escritor" (Data Flow)
Antes de leer de la base de datos local, asegúrate de que tiene datos.

Modifica GameContext para que, cada vez que guardes algo (ej: guardar un libro):

A) Lo envíe a Supabase (como siempre).

B) TAMBIÉN lo guarde en WatermelonDB localmente.

Crea un script de "Initial Sync" sencillo que, al abrir la app, descargue todo de Supabase y rellene WatermelonDB si está vacío.

Objetivo: Tienes los datos duplicados (RAM vs SQLite), pero la UI sigue usando RAM (GameContext). Si algo falla en SQLite, el usuario ni se entera.

Fase 3: Migración Vertical (Módulo a Módulo)
Aquí es donde empiezas a ganar rendimiento. Elige el módulo más sencillo, por ejemplo, La Biblioteca.

Crea un hook useLibrary que lea SOLO de WatermelonDB usando withObservables.

Ve a LibraryScreen.tsx y cambia el consumo de datos:

~~const { books } = useGameContext()~~

const { books } = useLibrary()

Borra la lógica de libros de GameContext.

Testea solo la Biblioteca. Si funciona y es rápido, pasa al siguiente módulo (ej: Gimnasio).

Fase 4: Apagar el Monolito
Una vez que todos los edificios (Biblioteca, Gimnasio, Templo...) usen sus propios hooks y WatermelonDB:

Elimina GameContext.tsx por completo.

Activa la "Sincronización de Fondo" real (SyncService) que reemplaza a tu antiguo fetchAll.