---
name: nueva-adr
description: Documenta una decisión de arquitectura nueva (o la revisión de una existente) en docs/architecture.md siguiendo el formato ADR ya establecido del proyecto. Usar cuando se toma una decisión de diseño no trivial, se descarta una alternativa, o se revierte una ADR anterior.
---

# Nueva ADR

`docs/architecture.md` tiene 14 ADRs (ADR-1 a ADR-14), todas con la misma estructura. No inventar
un formato nuevo.

## Cuándo escribir una ADR (y cuándo no)

Escribir una si:
- Se eligió entre al menos dos alternativas reales y una perdió por una razón concreta.
- La decisión tiene una consecuencia que otro cambio futuro podría violar sin darse cuenta.
- Se está revirtiendo o corrigiendo una ADR anterior (ver ADR-6 y ADR-11 para ejemplos de
  auto-corrección honesta: "esto se afirmó y no era cierto, queda corregido acá").

No escribir una para: elegir un nombre de variable, una decisión ya cubierta por una ADR
existente (extenderla en vez de duplicar), o una preferencia sin alternativa real considerada.

## Estructura obligatoria

```markdown
### ADR-N — <título corto, la decisión en sí, no el problema>

**Contexto:** qué problema o tensión motivó la decisión. Si compite con una regla existente
(ej. ADR-1 "sin backend"), decirlo explícitamente.
**Decisión:** qué se hizo, en una o dos frases verificables.
**Por qué:** la razón real — con datos si los hay (bundle size, contraste calculado, benchmark).
Nunca "porque es mejor práctica" sin más.
**Alternativa(s) descartada(s):** si hubo más de una opción, cuál se descartó y por qué —
aunque sea en una frase.
**Consecuencia:** qué queda vinculante a partir de ahora. Si aplica, qué código lo verifica
(un test, un lint rule).
```

## Pasos

1. Buscar el número siguiente disponible (`grep "^### ADR-" docs/architecture.md`, tomar el
   último + 1).
2. Escribir la ADR con la estructura de arriba. Si corrige una ADR anterior, dejarlo explícito en
   ambas: un `**Nota:**` en la ADR vieja apuntando a la nueva, y `**Contexto:**` en la nueva
   citando cuál corrige.
3. Si la decisión afecta reglas de código, reflejarlo también en
   `docs/engineering-guidelines.md` (no dejar la ADR como única fuente si es una regla operativa
   del día a día).
4. Actualizar la fecha de "Estado" al pie del documento si corresponde.
5. Commit `docs(arquitectura): ADR-N <resumen>` (ver convención en AGENTS.md).
