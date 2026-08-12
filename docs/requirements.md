# Requisitos — ALIENSKILEZ web

Fecha: 2026-08-12
Fuente: especificación del Productor (dueño del negocio).

> Versión narrativa y breve, pensada como punto de entrada. Para la versión formal con IDs,
> métricas, umbrales y trazabilidad, ver [`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md).

## 1. El negocio en una frase

**ALIENSKILEZ** es un productor musical que trabaja en **La Serena, Chile**. Ofrece diez líneas de
servicio que van desde grabar una voz hasta construir un estudio completo. Cierra sus tratos por
**WhatsApp** y no publica tarifas, porque el valor depende del alcance real de cada proyecto.

El sitio existe para **una sola cosa**: que un artista interesado termine escribiéndole. Todo lo
demás —estética, storytelling, portfolio— está al servicio de eso.

## 2. Requisitos funcionales

### RF-01 — Una sola página, un solo embudo
El sitio es un one-pager recorrible por scroll, con navegación por anclas y un llamado a la acción
persistente. No hay rutas, no hay login, no hay áreas privadas.

### RF-02 — Identidad antes que pedido
Antes de pedir nada, el visitante tiene que entender quién es ALIENSKILEZ y qué lo diferencia de
otro estudio: un productor de autor que lleva el proceso completo, no una sala que se arrienda.

### RF-03 — Servicios explícitos, sin precios
Las diez líneas de servicio se listan con una descripción que permite entender qué se contrata.
**No se publican tarifas**: el CTA reemplaza al precio.

### RF-04 — Dos llamados a la acción, un solo destino
Los servicios que se contratan por fecha y sala (producción, grabación, mezcla, máster, visuales,
show en vivo) invitan a **"Agenda tu sesión"**. Los que se contratan por alcance (asesoría,
manager, marketing, construcción de estudios) invitan a **"Cotiza tu proyecto"**. Ambos llevan al
mismo formulario.

### RF-05 — Portfolio como progresión
Los trabajos destacados se presentan como una línea de tiempo que cuenta una evolución, no como
una grilla plana de logos. Cuando exista la pista, se embebe el reproductor.

### RF-05b — Integración directa con Spotify del artista (nuevo, sumado 2026-08-12)
El portfolio debe conectar con el catálogo real de ALIENSKILEZ en Spotify — lanzamientos y
discografía traídos de la fuente real, no copiados a mano cada vez que sale un tema nuevo. Es
requisito **propuesto**, todavía sin decidir *cómo* se implementa: ver ADR-11 en
[`architecture.md`](./architecture.md) y el ticket ALS-026 en [`backlog.md`](./backlog.md) — la
opción elegida (embed oficial vs. función serverless vs. carga manual) cambia si este proyecto
sigue siendo 100% estático o gana su primera pieza de infraestructura.

### RF-06 — Trayectoria y testimonios verificables
El sitio puede mostrar cifras de trayectoria y citas de artistas — **solo si son reales**. Mientras
no existan, las secciones se publican con marcadores explícitos de dato pendiente, nunca con
valores inventados. Cada métrica documenta además cómo se calcula, para que sea reproducible.

### RF-07 — Proceso visible
El agendamiento se explica en cuatro pasos (contás qué necesitás → te cotizan → se agenda → se
trabaja). Baja la incertidumbre de quien nunca reservó un estudio.

### RF-08 — Preguntas frecuentes orientadas a objeciones
Las dudas que hoy llegan por WhatsApp —cómo se cotiza, qué traer, cuánto dura, si se puede
reprogramar, si trabajan con gente sin experiencia, si atienden a distancia— se responden antes
del formulario.

### RF-09 — Formulario que califica el lead
Un único formulario captura nombre, tipo de servicio, fecha estimada (opcional) y detalle libre
(opcional). Valida en el cliente antes de dejar continuar.

### RF-10 — Cierre en WhatsApp
Al enviar, se abre WhatsApp con un mensaje ya redactado que identifica al solicitante y lo que
pide. **El mensaje no se envía solo**: el visitante lo revisa y decide. No hay backend que reciba
nada.

## 3. Requisitos no funcionales

### RNF-01 — Rendimiento
Carga rápida en móvil con conexión modesta. Es la primera impresión de un negocio que vende
producción audiovisual: un sitio lento contradice el producto.

### RNF-02 — Accesibilidad
WCAG 2.1 nivel AA. Navegación completa por teclado, foco siempre visible, errores de formulario
anunciados, y respeto de `prefers-reduced-motion` — el sitio tiene animación y un fondo con
movimiento, así que esto no es opcional.

### RNF-03 — Contraste verificado, no asumido
La paleta es de alto contraste salvo en una combinación crítica: el texto claro sobre el verde de
acento reprueba cualquier umbral. Todo par de colores publicado se calcula antes de usarse.

### RNF-04 — Mantenibilidad
Ningún dato de negocio, ancla o límite vive fuera de `shared/constants/`. TypeScript estricto sin
supresiones. La lógica que puede fallar está aislada de React y cubierta por tests.

### RNF-05 — Despliegue sin infraestructura
Sitio 100% estático. Sin servidor propio, sin base de datos, sin variables de entorno secretas.
Se despliega en cualquier CDN con `npm run build`.

### RNF-06 — Integridad del contenido
Ningún dato de negocio inventado, nunca. Y ningún dato pendiente puede romper la interfaz: la
ausencia degrada la presentación (marcador en vez de iframe vacío, enlace omitido en vez de roto),
no falla.

### RNF-07 — Compatibilidad
Usable entre 320px y 1440px sin scroll horizontal ni solapamientos.

## 4. Fuera de alcance (diferido a propósito)

- **Backend propio, CMS o panel de administración.** El contenido cambia poco y se edita en las
  constantes.
- **Analítica de conversión.** Se agrega cuando haya tráfico real que medir.
- **Internacionalización.** Un solo idioma: español. El negocio es local.
- **Blog, catálogo de beats o tienda.** No están en el embudo de agendamiento.
- **Pipeline de CI bloqueante.** Las puertas de calidad se corren a mano antes de desplegar.

Ver [`architecture.md`](./architecture.md) §7 para la justificación de cada diferimiento.

## 5. Documentos relacionados

- [`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md) — versión formal con IDs y criterios verificables.
- [`architecture.md`](./architecture.md) — cómo se satisfacen estos requisitos.
- [`casos-uso.md`](./casos-uso.md) — los flujos concretos detrás de cada requisito.
