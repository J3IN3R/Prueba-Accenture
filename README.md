# To-Do App con Categorías (Ionic + Angular + Cordova + Firebase Remote Config).

## Video demo

https://youtube.com/shorts/193pFJjbPVM?si=Hk8SP4k3q4L4klnK

## Qué incluye

- CRUD de tareas (agregar, completar, eliminar) — app base.
- CRUD de categorías (crear, editar, eliminar).
- Asignar categoría a cada tarea y **filtrar** la lista por categoría.
- Almacenamiento local con `@ionic/storage-angular` (IndexedDB/SQLite según plataforma).
- Firebase **Remote Config** con un feature flag (`enable_task_sorting`) que activa/desactiva
  el agrupamiento de tareas por categoría en tiempo real, sin publicar nueva versión.
- Estructura lista para compilar con **Cordova** en Android e iOS.
- Optimizaciones de rendimiento (ver sección abajo).

## Requisitos previos

- Node.js 18+ y npm
- Ionic CLI: `npm install -g @ionic/cli`
- Cordova CLI: `npm install -g cordova`
- Android Studio + Android SDK (para compilar Android)
- Xcode (solo en macOS, para compilar iOS)
- Una cuenta de Firebase (gratuita) para Remote Config

## 1. Instalación

```bash
git clone <URL_DE_TU_FORK>
cd ionic-todo-app
npm install
```

## 2. Configurar Firebase

1. Crea un proyecto en https://console.firebase.google.com (cuenta personal).
2. Agrega una app **Web** dentro del proyecto y copia el objeto de configuración.
3. Pega esos valores en `src/environments/environment.ts` y `environment.prod.ts`
   (reemplaza `TU_API_KEY`, `tu-proyecto`, etc.).
4. En la consola de Firebase ve a **Remote Config** → **Crear configuración**.
5. Crea el parámetro:
   - Nombre: `enable_task_sorting`
   - Tipo: Boolean
   - Valor por defecto: `false`
6. Publica los cambios.

### Probar el feature flag

- Con el parámetro en `false`: las tareas se muestran en orden de creación (normal).
- Cambia el valor a `true` en la consola de Firebase y publica. La próxima vez que
  la app haga fetch (o al reabrirla), verás las tareas **agrupadas por categoría**
  y un aviso "⚙️ Feature flag activo" en la pantalla principal.
- Para pruebas rápidas en desarrollo, baja `minimumFetchIntervalMillis` en
  `remote-config.service.ts` (por defecto está en 1 hora para no gastar cuota).

## 3. Ejecutar en el navegador (desarrollo)

```bash
ionic serve
```

## 4. Agregar plataformas nativas (Cordova)

```bash
ionic cordova platform add android
ionic cordova platform add ios
```

## 5. Compilar y ejecutar en Android

```bash
# Build de debug en emulador/dispositivo conectado
ionic cordova run android

# Generar APK (debug)
ionic cordova build android

# Generar APK firmado (release) - requiere keystore configurado
ionic cordova build android --prod --release
```

El APK generado queda en:
`platforms/android/app/build/outputs/apk/debug/app-debug.apk`
(o `release/app-release.apk` para el release firmado).

## 6. Compilar y ejecutar en iOS (requiere macOS + Xcode)

```bash
ionic cordova run ios

# Abrir el proyecto nativo en Xcode para generar el IPA (Product > Archive)
open platforms/ios/*.xcworkspace
```

El IPA se exporta desde Xcode: **Product → Archive → Distribute App**.

## Estructura del proyecto

```
src/app/
  models/           # Interfaces Task y Category
  services/
    storage.service.ts        # Wrapper de Ionic Storage
    task.service.ts            # CRUD de tareas + filtro + debounce de escritura
    category.service.ts        # CRUD de categorías
    remote-config.service.ts   # Feature flag vía Firebase Remote Config
  home/             # Pantalla principal (lista de tareas)
  categories/       # Pantalla de gestión de categorías
```

## Optimizaciones de rendimiento aplicadas

1. **Lazy loading + preloading de rutas**: cada página es su propio módulo cargado
   bajo demanda (`loadChildren`), con `PreloadAllModules` para precargar en segundo
   plano después del arranque. Reduce el bundle inicial y mejora el tiempo de carga.
2. **`ion-virtual-scroll`** en la lista de tareas: solo renderiza los elementos
   visibles en pantalla, en vez de miles de nodos DOM simultáneos. Es la mejora
   principal para manejar grandes cantidades de tareas sin degradar el scroll.
3. **`ChangeDetectionStrategy.OnPush`** en ambas páginas: Angular solo re-evalúa
   la vista cuando cambian los `Observable` (vía `async` pipe) o inputs, no en
   cada ciclo global de change detection.
4. **`trackBy`** en las listas (`trackById`) para que Angular reutilice los
   nodos DOM existentes en vez de destruir y recrear todo el `ion-list` en cada
   actualización.
5. **Debounce de escritura a Storage** (300ms) en `task.service.ts`: si el
   usuario marca/desmarca varias tareas seguidas, las escrituras a disco se
   agrupan en vez de golpear el storage en cada click, reduciendo I/O.
6. **Firebase Remote Config con caché y valores por defecto**: si el fetch
   remoto falla (sin red), la app sigue funcionando con el `defaultConfig`
   local, evitando bloqueos en el arranque.
