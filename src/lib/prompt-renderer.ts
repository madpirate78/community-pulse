import { log } from "./logger";

/**
 * Replace {{key}} markers in a prompt template with values from vars.
 * Missing keys are replaced with an empty string, with a warning so a
 * misspelled marker in the config doesn't vanish silently.
 */
export function renderPrompt(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (vars[key] == null) {
      log.warn(`renderPrompt: no value for {{${key}}} — replaced with ""`);
      return "";
    }
    return String(vars[key]);
  });
}
