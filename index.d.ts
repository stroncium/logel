export interface Log{
  trace(message: string, context?:{}): void;
  debug(message: string, context?:{}): void;
  info(message: string, context?:{}): void;
  warn(message: string, context?:{}): void;
  error(message: string, context?:{}): void;
  fatal(message: string, context?:{}): void;
  temp(message: string, context?:{}): void;

  tagged(tag: string): Log;
}

type Renderer = (data: any) => any;

export class Logel{
  static make(): Logel;

  setRenderers(rends: {[key: string]: Renderer }): Logel;
  setDefaultRenderers(): Logel;

  log(): Log;

  close(): Promise<void>;
}
