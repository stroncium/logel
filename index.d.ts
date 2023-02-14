// import { LOGEL_RENDER } from ".";
// import { renderRootObject } from ".";

export interface Log{
  readonly logel:Logel;

  trace(message: string, context?:{}): void;
  debug(message: string, context?:{}): void;
  info(message: string, context?:{}): void;
  warn(message: string, context?:{}): void;
  error(message: string, context?:{}): void;
  fatal(message: string, context?:{}): void;
  temp(message: string, context?:{}): void;

  tagged(tag: string): Log;
}

interface Context {
  seen: Set<unknown>;
  sym: Symbol;
}

type Renderer = (data: unknown, ctx: Context) => unknown;

export class Logel {
  static make(): Logel;

  setDefaultRenderers(): Logel;

  log(): Log;

  close(): Promise<void>;
}

export const setLogelRender: <T>(v: unknown, sym: Symbol, fn: (v:T, ctx: Context) => unknown) => unknown;
export const renderRootObject: (v: unknown, sym: Symbol) => unknown;
export const LOGEL_RENDER: Symbol;
export const LOGEL_FINAL: Symbol;
