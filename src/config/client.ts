/**
 * Convenience subset of the config for client components.
 *
 * Note: this narrows the import surface, not the bundle — importing from
 * here still pulls in the parsed config module. Server-only modules
 * (prompt builders, the Gemini client) are guarded with the
 * `server-only` package instead.
 */
import { config } from "./index";

export const pages = config.pages;
export const questions = config.questions;
export const ui = config.ui;
