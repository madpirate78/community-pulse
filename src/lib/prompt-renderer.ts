/**
 * Replace {{key}} markers in a prompt template with values from vars.
 * Missing keys are replaced with an empty string.
 */
export function renderPrompt(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : ""
  );
}
