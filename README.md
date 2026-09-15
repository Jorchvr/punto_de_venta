# Black Mamba POS

Punto de venta móvil offline-first para gimnasio/tienda, hecho con **Expo (managed) + expo-router + SQLite + NativeWind**. Corre en **Expo Go** sin dev build. Responsive tablet/celular. Toda la data vive en el dispositivo.

## Cómo correrlo

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android/iOS). La primera vez el dispositivo baja el bundle de desarrollo desde tu Mac/PC (requiere red local). Una vez cargado puedes poner el teléfono en modo avión — la app sigue funcionando al 100%.

### Probar en Expo Go

- **Android**: instala [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent), abre la app, escanea el QR.
- **iOS**: instala [Expo Go](https://apps.apple.com/app/expo-go/id982107779) desde el App Store, abre la app Cámara, escanea el QR, toca la notificación.

## Flujo básico

1. Al arrancar por primera vez se crea la BD SQLite con **8 productos demo** y un usuario **ADMIN sin PIN**.
2. Login → tap en ADMIN → entra directo.
3. **POS** (`/`): tap en producto para agregar al carrito, elige método de pago, ingresa monto recibido si es efectivo/dólares, cobra → se muestra ticket con opción de compartir PDF.
4. **BACKOFFICE** (header derecho): hub a Productos, Historial, Devoluciones, Corte, Ajustes.
5. **Corte de caja**: muestra ticket estilo térmico con desglose por método + botones "Compartir PDF" y "Respaldar BD".

## Respaldar y restaurar la BD

### Respaldar
En **Corte de caja** → botón **"RESPALDAR BD"**. Se copia `blackmamba.db` a caché y se abre el share sheet del sistema (WhatsApp, Drive, Files, correo). Sin red, la app receptora la guardará y podrá subirla cuando haya internet.

### Restaurar
En **Ajustes** → **"RESTAURAR BD"** → elige un archivo `.db` previamente respaldado. La app reemplaza la BD local. **Reinicia la app** para que los cambios se apliquen.

## Offline-first

- Cero fetches a APIs — todo es SQLite local.
- Fuentes (Space Grotesk) empaquetadas vía `@expo-google-fonts/space-grotesk`.
- Iconos: `@expo/vector-icons` (bundleados).
- No hay banners de "sin conexión", ni checks de red, ni NetInfo.
- `expo-print` y `expo-sharing` generan/comparten archivos locales — el usuario decide cuándo los sube.

## Responsive

- **≥ 768px** (tablet): 2 columnas — grid de productos (izq, ~60%) + carrito+cobro pegado a la derecha.
- **< 768px** (celular): 1 columna con tabs inferiores (Productos / Carrito / Historial / Corte / Ajustes).

## Limitaciones vs versión desktop (WPF)

- **Sin impresora térmica bluetooth**: en Expo Go no hay soporte nativo. Se sustituye por **PDF vía `expo-print` → share** (WhatsApp/Drive/AirPrint/imprimir desde el share sheet).
- **Sin escáner de código de barras físico**: la búsqueda por código funciona tecleándolo. Para escanear con la cámara se requiere dev build (fuera del alcance).
- **Sin backend/sincronización**: cada dispositivo mantiene su propia BD. Usa el respaldo/restauración para transferir datos.
- **Sin cajón monedero**: no aplica en móvil.

## Stack

- Expo SDK 52 (managed)
- expo-router 4 (file-based)
- expo-sqlite (API async)
- NativeWind v4 + Tailwind
- TypeScript estricto
- zustand (estado)
- @expo-google-fonts/space-grotesk
- expo-print + expo-sharing + expo-file-system + expo-document-picker

## Estructura

```
/app                    → rutas (expo-router)
  _layout.tsx           → theme + fonts + DB init
  index.tsx             → POS
  login.tsx
  backoffice.tsx        → hub del backoffice
  historial.tsx
  devoluciones.tsx
  productos.tsx         → CRUD
  corte.tsx
  ajustes.tsx
/src
  /db                   → schema, client, repos
  /stores               → zustand (cart, session, theme)
  /components           → NeoButton, ProductCard, CartItem, PaymentMethodChip, Ticket, Header
  /theme                → colors
  /utils                → money, date
```

## Verificación offline

1. Escanea el QR con red activa (solo la primera vez, para bajar el bundle de dev).
2. Espera que cargue la pantalla de login.
3. Activa **modo avión** en el teléfono.
4. Verifica: login → venta → ticket → compartir → historial → corte → respaldar BD. Todo debe funcionar sin errores.

## Versión web (PWA) — Cloudflare Pages

La misma app corre en el navegador como PWA offline. En web:

- La BD SQLite corre en el navegador con **sql.js** (WebAssembly) y persiste en **IndexedDB**.
- El respaldo descarga un archivo `.db` (mismo formato que en móvil).
- El "compartir PDF" abre el diálogo de imprimir/guardar del navegador (Ctrl+P / share).
- Service Worker cachea assets → arranca offline luego del primer load.

### Build local

```bash
npm run build:web
```

Genera `dist/` con el sitio estático + `_redirects` y `_headers` para Cloudflare Pages.

Para probarlo local:

```bash
npx serve dist
```

### Deploy en Cloudflare Pages

1. Empujar el repo a GitHub.
2. En Cloudflare Pages: **Create project → Connect to Git → seleccionar el repo**.
3. Configuración de build:
   - **Build command**: `npm run build:web`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Node version**: 20 (variable `NODE_VERSION=20`).
4. Deploy. Cada push a `main` genera nuevo build. Costo: $0.

### Datos en la versión web

Los datos viven en el navegador del dispositivo (IndexedDB). Si el usuario borra caché o cambia de equipo, pierde la BD. Solución:

- Usar **Respaldar BD** desde Corte de caja regularmente → descarga `.db`.
- En otro dispositivo/browser: **Restaurar BD** desde Ajustes → subir el `.db`.
