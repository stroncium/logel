//biome-ignore lint/complexity/noBannedTypes: it is exactly what we need
type Context = {};

type Level = string; //TODO
type Tag = string;
type Time = number;

export interface Log {
	readonly logel: Logel;

	trace(message: string, context?: Context): void;
	debug(message: string, context?: Context): void;
	info(message: string, context?: Context): void;
	warn(message: string, context?: Context): void;
	error(message: string, context?: Context): void;
	fatal(message: string, context?: Context): void;
	temp(message: string, context?: Context): void;

	tagged(tag: string): Log;
}

export interface Output {
	writeLine(
		time: Time,
		level: LEvel,
		tag: Tag | undefined,
		msg: string,
		json?: unknown,
	);
}

export interface MemoryOutput extends Output {
	readonly lines: Array<{
		time: Time;
		level: Level;
		tag?: Tag;
		msg: string;
		json?: unknown;
	}>;
}

export class Logel<O extends Output = Output> {
	readonly output: O;

	log(): Log;

	flush(): Promise<void>;
	static createMemoryLogel(dump?: symbol, dump2?: symbol): Logel<MemoryOutput>;
}

export const logel: Logel;
export const log: Log;
export const LOGEL_DEFAULT_DUMP: symbol;
