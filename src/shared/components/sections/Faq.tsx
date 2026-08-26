import { Reveal, Section } from "@/shared/components/ui/Section"
import { FAQ_ITEMS } from "@/shared/constants/content"
import { LIMITS } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"

export function Faq() {
  return (
    <Section
      id={SECTION_IDS.FAQ}
      index="09"
      kicker="PREGUNTAS"
      geometry="hex"
      title="Antes de escribir"
      description="Lo que la mayoría pregunta por WhatsApp, respondido acá para que no tengas que preguntarlo."
    >
      <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
        {FAQ_ITEMS.map((item, index) => (
          <Reveal
            key={item.id}
            delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
          >
            {/* <details> nativo: accesible por teclado y funciona sin JS. */}
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-medium tracking-tight sm:text-lg">{item.question}</h3>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="pb-6 text-sm leading-relaxed text-text-muted sm:text-base">
                {item.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
