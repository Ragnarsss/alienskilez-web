import { SERVICE_OPTIONS, todayAsInputValue } from "@/features/booking/booking.schema"
import { useBookingForm } from "@/features/booking/hooks/useBookingForm"
import { Button } from "@/shared/components/ui/Button"
import { Container } from "@/shared/components/ui/Container"
import { Kicker } from "@/shared/components/ui/Kicker"
import { LIMITS } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"
import { SITE } from "@/shared/constants/site"
import { IS_WHATSAPP_PLACEHOLDER } from "@/shared/constants/whatsapp"

const FIELD =
  "w-full rounded-sm border border-border bg-surface-alt/60 px-4 py-3 text-base text-text " +
  "placeholder:text-text-muted/60 transition-colors " +
  "focus:border-border-accent focus:outline-none " +
  "aria-invalid:border-red-500/70"

const LABEL = "block text-sm font-medium tracking-tight"

// Fuera del render: `new Date()` es impuro y el React Compiler lo rechaza en
// el cuerpo del componente. El schema igual revalida al enviar, así que este
// `min` es solo la ayuda del datepicker.
const MIN_DATE = todayAsInputValue()

export function Contacto() {
  const { form, submitForm } = useBookingForm()
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const messageLength = watch("message")?.length ?? 0

  return (
    <section id={SECTION_IDS.CONTACTO} className="scroll-mt-20 py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Kicker index="08" label="CONTACTO" className="mb-4" />
            <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Tu próxima sesión empieza con <span className="text-accent">un solo mensaje</span>.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
              Completa los datos y se abre WhatsApp con el mensaje ya escrito. Lo revisas, lo
              envías, y te respondemos con una cotización concreta para tu caso.
            </p>

            <dl className="mt-10 space-y-5 border-t border-border pt-8">
              <div>
                <dt className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                  Ubicación
                </dt>
                <dd className="mt-1 text-sm text-text-muted">{SITE.LOCATION}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                  Trabajo remoto
                </dt>
                <dd className="mt-1 text-sm text-text-muted">
                  Mezcla, máster y asesoría se trabajan a distancia desde cualquier ciudad.
                </dd>
              </div>
            </dl>
          </div>

          {/* El componente no valida ni arma la URL: todo vive en useBookingForm. */}
          <form
            onSubmit={submitForm}
            noValidate
            className="hud-frame rounded-sm border border-border bg-surface-alt/40 p-6 sm:p-8"
          >
            {IS_WHATSAPP_PLACEHOLDER && import.meta.env.DEV && (
              <p
                role="alert"
                className="mb-6 rounded-sm border border-amber-500/50 bg-amber-500/10 p-3 font-mono text-xs leading-relaxed text-amber-300"
              >
                AVISO DE DESARROLLO: el número de WhatsApp sigue siendo el placeholder. Configúralo
                en src/shared/constants/whatsapp.ts antes de desplegar.
              </p>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className={LABEL}>
                  Nombre <span className="text-accent">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre o nombre artístico"
                  className={`${FIELD} mt-2`}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p id="fullName-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="serviceType" className={LABEL}>
                  Tipo de servicio <span className="text-accent">*</span>
                </label>
                <select
                  id="serviceType"
                  className={`${FIELD} mt-2`}
                  aria-invalid={Boolean(errors.serviceType)}
                  aria-describedby={errors.serviceType ? "serviceType-error" : undefined}
                  {...register("serviceType")}
                >
                  <option value="">Selecciona un servicio</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.serviceType && (
                  <p id="serviceType-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.serviceType.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="preferredDate" className={LABEL}>
                  Fecha estimada <span className="text-text-muted">(opcional)</span>
                </label>
                <input
                  id="preferredDate"
                  type="date"
                  min={MIN_DATE}
                  className={`${FIELD} mt-2 scheme-dark`}
                  aria-invalid={Boolean(errors.preferredDate)}
                  aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
                  {...register("preferredDate")}
                />
                {errors.preferredDate && (
                  <p id="preferredDate-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.preferredDate.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className={LABEL}>
                  Cuéntanos tu proyecto <span className="text-text-muted">(opcional)</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Qué necesitas, en qué etapa está el proyecto, referencias de sonido…"
                  className={`${FIELD} mt-2 resize-y`}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : "message-counter"}
                  {...register("message")}
                />
                <p
                  id="message-counter"
                  className="mt-2 text-right font-mono text-xs text-text-muted"
                >
                  {messageLength}/{LIMITS.BOOKING_MESSAGE_MAX_LENGTH}
                </p>
                {errors.message && (
                  <p id="message-error" role="alert" className="text-sm text-red-400">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-8 w-full"
              disabled={isSubmitting}
            >
              Enviar por WhatsApp
            </Button>

            <p className="mt-4 text-center font-mono text-xs leading-relaxed text-text-muted">
              Se abre WhatsApp con el mensaje listo. Nada se envía hasta que tú lo hagas.
            </p>
          </form>
        </div>
      </Container>
    </section>
  )
}
