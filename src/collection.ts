const shouldEvaluate: unique symbol = Symbol('evaluate');
const shouldCycle: unique symbol = Symbol('cycle');

const flags: { [key: string]: symbol } = {
	evaluate: shouldEvaluate,
	cycle: shouldCycle
};

export type Flaggable<T> = T & {
	[shouldEvaluate]?: boolean
	[shouldCycle]?: boolean
}

export interface LooseObject {
	[key: string]: any
}

export type ChainableFunctions<T> = {
	[key in keyof T]: (...args: any[]) => ChainableFunctions<T>
}

function setFlag(val: Flaggable<any>, flag: string) {
	const symbol: symbol = flags[flag];
	val[symbol] = true;
}

function parseParam(e: any, i: number): any {
	if (e[shouldEvaluate]) {
		return e(i);
	}

	if (e[shouldCycle]) {
		return e[i % e.length];
	}

	if (e instanceof Array || e.__proto__ === Object.prototype) {
		e = { ...e };
		Object.keys(e).forEach(k => {
			e[k] = parseParam(e[k], i);
		});
	}

	return e;
}

class Collection<T extends LooseObject> {
	public methods: string[] = [];
	private _items: T[] = [];

	constructor(public instance: { new(...args: any[]): T }) {
		Object.getOwnPropertyNames(instance.prototype).forEach(k => {
			if (k === 'constructor') return;
			if (typeof instance.prototype[k] === 'function') this.methods.push(k);
		});

	}

	public add(item: T): void {
		if (!(item instanceof this.instance)) throw new Error(`Collection expects ${this.instance.prototype.constructor.name}; got ${item.constructor.name}`);
		this._items.push(item);
	}

	public each(): ChainableFunctions<T>;
	public each(callback: (v: T, i: number, a: any) => void): void;
	public each(callback?: (v: T, i: number, a: any) => void): void | ChainableFunctions<T> {
		if (callback) {
			this._items.forEach(callback);
		} else {
			return this.methods.reduce((obj: ChainableFunctions<T>, e: string) => {
				obj[e] = (): ChainableFunctions<T> => {
					this._items.forEach((item: T) => {
						item[e]();
					});

					return obj;
				};

				return obj;
			}, ({} as ChainableFunctions<T>));
		}
	}

	public generate(count: number, params?: any[]): void {
		for (let i = 0; i < count; i++) {
			const passed: Array<any> = params ? params.map(e => parseParam(e, i)) : [];

			this.add(new this.instance(...passed));
		}

	}

	public query(key: string): any[] {
		return this.items.map(i => i[key]);
	}

	public get items(): T[] {
		return this._items;
	}

	public static eval(func: Flaggable<Function>): Flaggable<Function> {
		setFlag(func, 'evaluate');
		return func;
	}

	public static cycle(array: Flaggable<any[]>): Flaggable<any[]> {
		setFlag(array, 'cycle');
		return array;
	}

	public static get index(): Function {
		return this.eval((i: number) => i);
	}
}

export default Collection;