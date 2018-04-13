import { shouldCycle, shouldEvaluate } from './flags';
export declare type Flaggable<T> = T & {
    [shouldEvaluate]?: boolean;
    [shouldCycle]?: boolean;
};
export interface LooseObject {
    [key: string]: any;
}
export declare type ChainableFunctions<T> = {
    [key in keyof T]: (...args: any[]) => ChainableFunctions<T>;
};
declare class Collection<T extends LooseObject> {
    instance: {
        new (...args: any[]): T;
    };
    methods: string[];
    private _items;
    constructor(instance: {
        new (...args: any[]): T;
    });
    add(item: T): void;
    each(): ChainableFunctions<T>;
    each(callback: (v: T, i: number, a: any) => void): void;
    generate(count: number, params?: any[]): void;
    query(key: string): any[];
    readonly items: T[];
    static eval(func: Flaggable<Function>): Flaggable<Function>;
    static cycle(array: Flaggable<any[]>): Flaggable<any[]>;
    static readonly index: Function;
}
export default Collection;