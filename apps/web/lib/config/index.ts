import z from "zod";

export type Config = {};

const configSchema = z.object({}).strict();

let config: Config | undefined = undefined;

export function loadServerConfig(): Config {
  if (config === undefined) {
    config = configSchema.parse({});
  }
  return config;
}
