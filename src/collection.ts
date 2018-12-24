import { shouldCycle, shouldEvaluate } from './flags';

export interface LooseObject {
	[key: string]: any
}

export type Flaggable<T> = T & {
	[shouldEvaluate]?: boolean
	[shouldCycle]?: boolean
}

export type ChainableFunctions<T> = {
	[key in keyof T]: (...args: any[]) => ChainableFunctions<T>
}

function parseParam(property: any, currentIndex: number): any {
	if (property[shouldEvaluate]) {
		return property(currentIndex);
	}

	if (property[shouldCycle]) {
		return property[currentIndex % property.length];
	}

	if (property instanceof Array || property.__proto__ === Object.prototype) {
		property = { ...property };
		Object.keys(property).forEach(k => {
			property[k] = parseParam(property[k], currentIndex);
		});
	}

	return property;
}

class Collection<T extends LooseObject> {
	public methods: string[] = [];
	private _items: T[] = [];

	constructor(private type: { new(...args: any[]): T }) {
		Object.getOwnPropertyNames(type.prototype).forEach(k => {
			if (k === 'constructor') return;
			if (typeof type.prototype[k] === 'function') this.methods.push(k);
		});

	}

	public add(item: T): void {
		if (!(item instanceof this.type)) throw new Error(`Collection expects ${this.type.prototype.constructor.name}; got ${item.constructor.name}`);
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

			this.add(new this.type(...passed));
		}

	}

	public query(key: string): any[] {
		return this.items.map(i => i[key]);
	}

	public remove(condition: T): void;
	public remove(condition: (item: T) => boolean): void;
	public remove(condition: Function | T): void {
		this._items = this._items.filter(function (item: T) {
			if (typeof condition === 'function') {
				return !condition(item);
			} else {
				return condition !== item;
			}
		});
	}

	public get(i: number): T {
		return this._items[i];
	}

	public test(item: any): boolean {
		return (item instanceof this.type);
	}

	public [Symbol.iterator](): Iterator<T> {
		let index = -1;
		return {
			next: (): IteratorResult<T> => {
				index++;
				return {
					done: index === this._items.length,
					value: this._items[index]
				};
			}
		};
	}

	public random(): T {
		return this._items[Math.floor(Math.random() * this._items.length)];
	}

	public get items(): T[] {
		return this._items;
	}

	public get length(): number {
		return this._items.length;
	}

	public static invoke(func: Flaggable<Function>): Flaggable<Function> {
		func[shouldEvaluate] = true;
		return func;
	}

	public static cycle(array: Flaggable<any[]>): Flaggable<any[]> {
		array[shouldCycle] = true;
		return array;
	}

	public static get index(): Function {
		return this.invoke((i: number) => i);
	}
}

export default Collection;