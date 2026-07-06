import { z } from "zod";

/**
 * The closed catalog of effects. The LLM may only *select and parameterize*
 * these — it never invents an effect. The Composer maps each id to a hand-built
 * template module in `backend/src/effects/`.
 */
export const EffectId = z.enum([
  "nav",
  "heroCanvasScrub",
  "heroVideoMask",
  "heroMinimal",
  "pinnedReveal",
  "parallaxStack",
  "horizontalScroll",
  "splitTextStagger",
  "featureGrid",
  "statsCounter",
  "testimonialMarquee",
  "pricingTable",
  "ctaBand",
  "footer",
]);
export type EffectId = z.infer<typeof EffectId>;

/**
 * Per-effect params schemas. `Section.params` is validated against the schema
 * for that section's effect (see `validateSectionParams`). Keep every field
 * optional-with-default where sensible so a sparse plan still composes.
 */
export const effectParamsSchemas = {
  nav: z.object({
    sticky: z.boolean().default(true),
    links: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .max(6)
      .default([]),
    ctaLabel: z.string().optional(),
  }),

  heroCanvasScrub: z.object({
    frameCount: z.number().int().min(30).max(180).default(90),
    frameWidth: z.number().int().default(1280),
    pinHeightVh: z.number().int().min(100).max(400).default(300),
  }),

  heroVideoMask: z.object({
    maskText: z.string().default(""),
    pinHeightVh: z.number().int().min(100).max(300).default(150),
    poster: z.boolean().default(true),
  }),

  heroMinimal: z.object({
    align: z.enum(["left", "center"]).default("center"),
    showScrollHint: z.boolean().default(true),
  }),

  pinnedReveal: z.object({
    revealShape: z.enum(["circle", "wipe"]).default("circle"),
    pinHeightVh: z.number().int().min(100).max(300).default(150),
  }),

  parallaxStack: z.object({
    layers: z.number().int().min(2).max(4).default(3),
    speeds: z.array(z.number()).default([0.2, 0.5, 0.8]),
  }),

  horizontalScroll: z.object({
    panels: z.number().int().min(2).max(8).default(4),
  }),

  splitTextStagger: z.object({
    splitBy: z.enum(["lines", "words", "chars"]).default("lines"),
    staggerMs: z.number().int().min(10).max(200).default(60),
  }),

  featureGrid: z.object({
    columns: z.number().int().min(2).max(4).default(3),
    items: z
      .array(z.object({ title: z.string(), body: z.string(), icon: z.string().optional() }))
      .default([]),
  }),

  statsCounter: z.object({
    stats: z
      .array(z.object({ value: z.number(), suffix: z.string().optional(), label: z.string() }))
      .default([]),
    durationMs: z.number().int().min(400).max(4000).default(1600),
  }),

  testimonialMarquee: z.object({
    speedSeconds: z.number().min(10).max(120).default(40),
    items: z
      .array(z.object({ quote: z.string(), author: z.string(), role: z.string().optional() }))
      .default([]),
  }),

  pricingTable: z.object({
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).default([]),
          highlighted: z.boolean().default(false),
          ctaLabel: z.string().default("Get started"),
        }),
      )
      .default([]),
  }),

  ctaBand: z.object({
    ctaLabel: z.string().default("Get started"),
    ctaHref: z.string().default("#"),
  }),

  footer: z.object({
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
        }),
      )
      .default([]),
    fineprint: z.string().optional(),
  }),
} as const satisfies Record<EffectId, z.ZodTypeAny>;

export type EffectParams = {
  [K in EffectId]: z.infer<(typeof effectParamsSchemas)[K]>;
};

/** One-line human descriptions injected into the plan-generation system prompt. */
export const effectDescriptions: Record<EffectId, string> = {
  nav: "Sticky top navigation with logo, links and an optional CTA button.",
  heroCanvasScrub: "Full-viewport canvas that scrubs a frame sequence as you scroll (Apple-style).",
  heroVideoMask: "Video playing inside an SVG text mask of the site title, pinned.",
  heroMinimal: "Clean typographic hero — big headline, subhead, CTA, generous whitespace.",
  pinnedReveal: "Pins a panel and clip-path reveals the next layer.",
  parallaxStack: "Stacked layers moving at different scroll speeds for depth.",
  horizontalScroll: "Pinned section that scrolls its panels horizontally.",
  splitTextStagger: "Headline whose lines/words/chars stagger in on scroll enter.",
  featureGrid: "Responsive grid of feature cards (title + body + optional icon).",
  statsCounter: "Row of numbers that count up when scrolled into view.",
  testimonialMarquee: "Continuously scrolling marquee of testimonial quotes.",
  pricingTable: "Pricing tiers with feature lists and a highlighted plan.",
  ctaBand: "Full-width call-to-action band with a single button.",
  footer: "Multi-column footer with link groups and fine print.",
};

/** Validate & fill defaults for a section's params given its effect id. */
export function validateSectionParams<E extends EffectId>(
  effect: E,
  params: unknown,
): EffectParams[E] {
  const schema = effectParamsSchemas[effect];
  return schema.parse(params ?? {}) as EffectParams[E];
}
