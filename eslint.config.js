import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // Incluye las reglas del React Compiler (immutability, purity,
      // preserve-manual-memoization, set-state-in-render, ...) desde
      // eslint-plugin-react-hooks v7 — el paquete standalone
      // eslint-plugin-react-compiler quedó absorbido acá.
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Equivalente de import/no-relative-parent-imports sin sumar un plugin
      // que aún no soporta ESLint 10 en flat config.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "Usa el alias @/ en vez de rutas relativas al directorio padre.",
            },
          ],
        },
      ],
    },
  },
])
