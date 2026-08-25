# ALIENSKILEZ — sitio web

One-pager de conversión para ALIENSKILEZ, productor musical en La Serena, Chile. Todo el sitio
existe para un solo resultado: que el visitante escriba por WhatsApp.

> 📚 **Documentación completa en [`docs/`](docs/README.md)** — arquitectura y ADRs, lineamientos de
> ingeniería, sistema de diseño, puertas de calidad, requisitos, casos de uso y backlog.
> El estado real del proyecto vive en [`docs/backlog.md`](docs/backlog.md).

## Stack

React 19 + TypeScript estricto + Vite (flavor rolldown) · Tailwind CSS v4 · Framer Motion ·
react-hook-form + zod · Vitest.

Sin backend: el formulario arma un mensaje y abre `wa.me` con el chat ya iniciado.

## Comandos

```bash
npm run dev       # servidor de desarrollo
npm run lint      # ESLint (incluye las reglas del React Compiler)
npm test          # Vitest — schema de validación y armado del mensaje
npm run build     # tsc -b && vite build
npm run format    # Prettier
```

## ⚠️ Pendientes antes de desplegar

Estos valores son placeholders. El sitio compila y funciona con ellos, pero **no debe publicarse**
hasta reemplazarlos:

| Qué | Dónde | Estado |
|---|---|---|
| Número de WhatsApp | `src/shared/constants/whatsapp.ts` | ✅ Resuelto (ALS-001) — número real, personal. Migrar a Business queda como ALS-030. |
| URL de Spotify | `src/shared/constants/site.ts` | ✅ Resuelto (ALS-002, 2026-08-25) — Artist ID real cargado, ya no es `pending`. |
| URL de YouTube | `src/shared/constants/site.ts` | Construida como `youtube.com/@alienskilez`. Verificar que resuelva (ALS-002, parte pendiente). |
| Trabajos del portfolio | `src/shared/constants/portfolio.ts` | 5 entradas placeholder, una por línea de servicio, con espacio para embeds de Spotify/YouTube. |
| Cifras de trayectoria | `src/shared/constants/alcance.ts` | 4 métricas en `[XX]`. Cada una documenta **cómo se calcula** en el campo `measurement`. |
| Testimonios | `src/shared/constants/testimonials.ts` | 3 slots vacíos. Pedir la cita por escrito y autorización para publicarla con nombre. |

Criterio aplicado: **no se inventan datos de negocio**. Una cifra o un testimonio falso es algo que
después hay que desmentir frente a un cliente, así que los placeholders son visiblemente
placeholders.

## Arquitectura

```
aws/spotify-catalog/            # Lambda del catálogo de Spotify (ALS-026) — deploy separado del sitio
src/
├── App.tsx                     # solo compone secciones — cero lógica
├── styles/index.css            # design tokens (@theme de Tailwind v4) — fuente de verdad
├── features/
│   ├── booking/                 # validación + armado del mensaje de WhatsApp
│   │   ├── booking.schema.ts    # validación pura (zod)
│   │   └── hooks/useBookingForm.ts
│   └── discografia/              # fetch + validación del catálogo de Spotify (ALS-044)
│       ├── discografia.ts        # parseo/validación pura de la respuesta de la Lambda
│       └── hooks/useDiscografia.ts
├── shared/
│   ├── components/ui/          # primitivos propios (Button, Section, Kicker…)
│   ├── components/sections/    # una sección de la landing por archivo
│   ├── constants/              # datos de negocio — nada hardcodeado fuera de acá
│   └── hooks/
└── test/
```

Regla de separación: **el componente nunca orquesta**. Validar, armar el mensaje y abrir WhatsApp
vive en `useBookingForm`, nunca en el JSX.

## Notas técnicas

- **React Compiler activo.** No uses `useMemo` / `useCallback` / `React.memo` manuales. Sus reglas
  de lint (`purity`, `immutability`, `set-state-in-render`…) vienen dentro de
  `eslint-plugin-react-hooks@7`; el paquete `eslint-plugin-react-compiler` quedó absorbido ahí y no
  se instala por separado.
- **Contraste calculado** (no asumido): el verde `#08CB00` rinde 9.55:1 sobre negro, pero los
  botones con fondo verde llevan texto **negro** (9.55:1), no gris claro (1.89:1, reprueba).
  Tabla completa en [docs/design-system.md](docs/design-system.md).
- **`prefers-reduced-motion`** se respeta vía `<MotionConfig reducedMotion="user">` y un bloque en
  `index.css` que apaga glow, parallax y scroll suave.

## Despliegue

- **Sitio:** [AWS Amplify Hosting](https://us-east-2.console.aws.amazon.com/amplify/) conectado a
  `github.com/Ragnarsss/alienskilez-web` (rama `main`) — build automático en cada push
  (`npm run build`, output `dist/`). Variables de entorno de build (`VITE_GA_MEASUREMENT_ID`,
  `VITE_SPOTIFY_CATALOG_URL`) se cargan a mano en la consola de Amplify, nunca en el repo. Ver
  ADR-16 en [`docs/architecture.md`](docs/architecture.md) para el porqué (no es Vercel/Netlify,
  como decía una versión anterior de este documento).
- **Catálogo de Spotify (Discografía):** función AWS Lambda con Function URL propia, desplegada por
  separado. Registro completo del despliegue en
  [`aws/spotify-catalog/README.md`](aws/spotify-catalog/README.md).

Gate antes de mergear: `npm run lint && npm test && npm run build`.
