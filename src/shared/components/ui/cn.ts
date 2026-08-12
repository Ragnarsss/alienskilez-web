/** Une clases condicionales sin arrastrar una dependencia para tres líneas. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}
