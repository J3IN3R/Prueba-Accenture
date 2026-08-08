# Respuestas — Prueba Técnica Desarrollador Mobile

## ¿Cuáles fueron los principales desafíos al implementar las nuevas funcionalidades?

El mayor reto fue mantener la app reactiva sin sacrificar rendimiento al añadir
categorías: cada tarea depende de una categoría que puede editarse o eliminarse
en cualquier momento, así que el filtro de tareas y el listado de categorías
necesitaban mantenerse sincronizados sin recargar toda la lista. Se resolvió
combinando `Observable`s (`combineLatest`) entre `TaskService` y
`CategoryService`, y manejando el caso de "categoría eliminada" reasignando
esas tareas a "sin categoría" en vez de dejarlas huérfanas o borrarlas.

Otro desafío fue integrar Remote Config sin acoplar la UI directamente al SDK
de Firebase: se aisló toda la lógica en `RemoteConfigService`, exponiendo un
simple `Observable<boolean>` que la página consume igual que cualquier otro
estado de la app, y con valores por defecto para que la app no dependa de que
el fetch remoto tenga éxito.

## ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- **Virtual scroll** (`ion-virtual-scroll`) para la lista de tareas: es la
  optimización con mayor impacto cuando el número de tareas crece, porque
  evita renderizar nodos DOM fuera de pantalla.
- **Lazy loading de módulos por ruta** + `PreloadAllModules`: reduce el bundle
  inicial (mejor carga inicial) sin perder la navegación instantánea entre
  pantallas una vez la app arrancó.
- **`ChangeDetectionStrategy.OnPush`** + `trackBy`: minimiza los ciclos de
  change detection y evita recrear el DOM innecesariamente al actualizar
  listas, reduciendo el uso de CPU y memoria.
- **Debounce de escrituras a Storage**: agrupa cambios rápidos (marcar varias
  tareas seguidas) en una sola escritura a disco en lugar de una por click.

## ¿Cómo aseguraste la calidad y mantenibilidad del código?

- Separación clara de responsabilidades: modelos, servicios (estado y lógica
  de negocio) y páginas (presentación) en carpetas independientes.
- Servicios con estado expuesto vía `Observable`/`BehaviorSubject`, siguiendo
  un patrón unidireccional simple de manejar y testear.
- Tipado estricto con TypeScript (`strict: true` en `tsconfig.json`) para
  detectar errores en tiempo de compilación.
- Nombres descriptivos y comentarios puntuales solo donde la decisión de
  diseño no es obvia (p. ej. por qué se usa debounce, por qué OnPush).
- Módulos independientes por feature (`home`, `categories`) que facilitan
  agregar pruebas unitarias o nuevas pantallas sin tocar código existente.
