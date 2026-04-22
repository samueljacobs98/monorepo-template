import z from "zod";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Config = {};

const configSchema = z.object({}).strict();

let config: Config | undefined = undefined;

export function loadServerConfig(): Config {
  if (config === undefined) {
    config = configSchema.parse({});
  }
  return config;
}
