const shouldEvaluate: unique symbol = Symbol('evaluate');
const shouldCycle: unique symbol = Symbol('cycle');

declare global {
	interface Function {
		[shouldEvaluate]?: boolean
	}

	interface Array<T> {
		[shouldCycle]?: boolean
	}
}

type LooseObject = {
	[key: string]: any
}

type ChainableFunctions<T> = {
	[key in keyof T]: (...args: any[]) => ChainableFunctions<T>
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

	add(item: T): void {
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

	generate(count: number, params?: any[]): void {
		for (let i = 0; i < count; i++) {
			const passed: Array<any> = params ? params.map(e => parseParam(e, i)) : [];

			this.add(new this.instance(...passed));
		}

	}

	query(key: string): any[] {
		return this.items.map(i => i[key]);
	}

	get items(): T[] {
		return this._items;
	}

	static eval(func: Function): Function {
		func[shouldEvaluate] = true;
		return func;
	}

	static cycle(array: any[]): any[] {
		array[shouldCycle] = true;
		return array;
	}

	static get index(): Function {
		return this.eval((i: number) => i);
	}

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

export default Collection;