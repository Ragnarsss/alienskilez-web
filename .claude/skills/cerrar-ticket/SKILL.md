---
name: cerrar-ticket
description: Cierra un ticket ALS-XXX aplicando la Definition of Done del proyecto — corre lint/test/build, verifica criterios de aceptación, aplica el checklist de quality-gates si tocó UI, actualiza backlog.md y prepara el commit. Usar al terminar cualquier ticket del backlog, antes de darlo por "Hecho".
---

# Cerrar ticket (DoD)

Implementa la Definition of Done de `docs/engineering-guidelines.md` §8. No saltear pasos aunque
"parezca" que el ticket es trivial — la regla existe porque un paso saltado se nota tarde.

## Pasos

1. **Identificar el ticket.** Buscar el ID (ALS-XXX) en `docs/backlog.md`. Leer su descripción y
   criterios de aceptación completos antes de continuar.

2. **Puerta automatizada** — los tres comandos, en este orden, todos deben quedar limpios:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
   Si alguno falla, arreglar antes de seguir. No hay excepción "lo arreglo después".

3. **Verificar criterios de aceptación de verdad**, no "debería andar":
   - Si el ticket tocó `features/booking/`: confirmar que hay test verde cubriéndolo — regla dura
     de §1, sin excepción.
   - Si el ticket tocó UI: correr `npm run dev` y revisar visualmente el cambio, no asumir por el
     diff.

4. **Checklist visual de `docs/quality-gates.md`** — solo si el ticket tocó UI. Repasar como
   mínimo:
   - Jerarquía y CTA (§4): un solo `<h1>`, foco visible y distinguible del glow decorativo.
   - Responsive (§3): 320px sin scroll horizontal.
   - Si se introdujo un color o combinación nueva → correr la skill `contraste-check` primero.
   - Si se tocó o agregó un SVG parseado → correr la skill `svg-asset-check` primero.

5. **Actualizar `docs/backlog.md`**: cambiar el `Estado:` del ticket a `Hecho`. Si el trabajo
   reveló un pendiente nuevo (deuda, seguimiento), agregarlo como ticket nuevo o nota — no dejarlo
   solo en la conversación, que no persiste.

6. **Commit atómico**, Conventional Commits, formato:
   ```
   <tipo>(<alcance>): <qué cambia, en minúscula, sin punto final> (ALS-XXX)
   ```
   Tipos válidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Si el cambio no
   cierra el ticket sino que lo avanza, igual referenciarlo — pero no marcar `Hecho` en backlog
   hasta que realmente esté completo.

## Cuándo NO usar esta skill completa

Para un cambio que no corresponde a ningún ticket del backlog (un typo, un ajuste de copy sin
ticket), el paso 5 no aplica — pero los pasos 2 y 6 siguen siendo obligatorios igual.
