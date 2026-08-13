/**
 * Tokens de diseño que JavaScript necesita como valor literal.
 *
 * ADR-7 fija que la fuente de verdad de los tokens es `@theme` en
 * `src/styles/index.css`, y ningún componente escribe colores literales.
 * Esta constante es la **única excepción**, y tiene una razón concreta:
 * WebGL no lee CSS. Three.js parsea el color con `new THREE.Color(...)`,
 * que no resuelve `var(--color-accent)` — pasarle la variable da negro,
 * en silencio.
 *
 * Para que la excepción no se convierta en deriva, `theme.test.ts` lee el
 * CSS real y falla si este valor deja de coincidir con `--color-accent`.
 * Si alguien cambia la paleta y se olvida de acá, lo dice el test, no el
 * cliente mirando un alien negro.
 */
export const THEME_COLORS = {
  /** Espejo de `--color-accent` en `styles/index.css`. Verificado por test. */
  ACCENT: "#08cb00",
} as const
