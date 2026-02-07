import { surveyConfigSchema } from "./schema";
import rawConfig from "./survey.config";

export const config = surveyConfigSchema.parse(rawConfig);
