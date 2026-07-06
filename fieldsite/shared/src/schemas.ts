import { z } from "zod";
import { EffectId } from "./effects.js";

/**
 * Fieldsite shared schemas — the single source of truth for a generated site.
 *
 * Pipeline: prompt → SitePlan (LLM) → validate (this file) → asset jobs →
 * deterministic Composer → single-file HTML. Edits are RFC-6902 JSON Patches
 * applied to a SitePlan, then re-validated and re-composed.
 */

const hex = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex color like #2E5B3F");

export const Palette = z.object({
  bg: hex,
  ink: hex,
  inkSoft: hex,
  accent: hex,
  accentDark: hex,
  surface: hex,
  line: hex,
});
export type Palette = z.infer<typeof Palette>;

export const Fonts = z.object({
  display: z.string(),
  body: z.string(),
});
export type Fonts = z.infer<typeof Fonts>;

export const Meta = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  slug: z
    .string()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/, "lowercase kebab, 2-50 chars"),
  palette: Palette,
  fonts: Fonts,
  language: z.string().default("en"),
});
export type Meta = z.infer<typeof Meta>;

export const AssetKind = z.enum(["image", "video"]);
export type AssetKind = z.infer<typeof AssetKind>;

export const AssetBrief = z.object({
  id: z.string().min(1),
  kind: AssetKind,
  prompt: z.string().min(1),
  /**
   * A fixed sentence describing palette, lighting and lens. Written ONCE by the
   * plan generator and injected into every image/video prompt to prevent visual
   * drift across assets.
   */
  styleToken: z.string().min(1),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5", "3:2"]).default("16:9"),
  budget: z.enum(["low", "standard", "high"]).default("standard"),
});
export type AssetBrief = z.infer<typeof AssetBrief>;

export const Section = z.object({
  id: z.string().min(1),
  effect: EffectId,
  /** Freeform copy slots consumed by the effect template (e.g. headline, sub). */
  copy: z.record(z.string()),
  /** Ids referencing entries in `SitePlan.assets`. */
  assetRefs: z.array(z.string()).default([]),
  /** Validated per-effect at compose time via `validateSectionParams`. */
  params: z.record(z.unknown()).default({}),
});
export type Section = z.infer<typeof Section>;

export const SitePlan = z.object({
  meta: Meta,
  assets: z.array(AssetBrief).default([]),
  sections: z.array(Section).min(1),
});
export type SitePlan = z.infer<typeof SitePlan>;

/** Extracted by Haiku before plan generation. */
export const Intent = z.object({
  industry: z.string(),
  tone: z.string(),
  pageGoal: z.string(),
  budget: z.enum(["low", "standard", "high"]).default("standard"),
  rawPrompt: z.string(),
});
export type Intent = z.infer<typeof Intent>;

/** RFC-6902 JSON Patch operation (what `editPlan` emits). */
export const JsonPatchOp = z.object({
  op: z.enum(["add", "remove", "replace", "move", "copy", "test"]),
  path: z.string(),
  from: z.string().optional(),
  value: z.unknown().optional(),
});
export type JsonPatchOp = z.infer<typeof JsonPatchOp>;
export const JsonPatch = z.array(JsonPatchOp);
export type JsonPatch = z.infer<typeof JsonPatch>;

/** Cross-check: every assetRef in a section must resolve to a declared asset. */
export function assertAssetRefsResolve(plan: SitePlan): void {
  const ids = new Set(plan.assets.map((a) => a.id));
  for (const s of plan.sections) {
    for (const ref of s.assetRefs) {
      if (!ids.has(ref)) {
        throw new Error(`Section "${s.id}" references unknown asset "${ref}"`);
      }
    }
  }
}

/** Socket.io event payloads (shared so frontend stays typed). */
export const SocketEvents = {
  planProgress: "plan:progress",
  assetDone: "asset:done",
  composeDone: "compose:done",
  publishDone: "publish:done",
  llmToken: "llm:token",
} as const;

export const ProjectStatus = z.enum([
  "queued",
  "planning",
  "assets",
  "composing",
  "ready",
  "publishing",
  "published",
  "error",
]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;
