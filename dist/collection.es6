const shouldEvaluate = Symbol('evaluate');
const shouldCycle = Symbol('cycle');

function parseParam(e, i) {
    if (e[shouldEvaluate]) {
        return e(i);
    }
    if (e[shouldCycle]) {
        return e[i % e.length];
    }
    if (e instanceof Array || e.__proto__ === Object.prototype) {
        e = Object.assign({}, e);
        Object.keys(e).forEach(k => {
            e[k] = parseParam(e[k], i);
        });
    }
    return e;
}
class Collection {
    constructor(type) {
        this.type = type;
        this.methods = [];
        this._items = [];
        Object.getOwnPropertyNames(type.prototype).forEach(k => {
            if (k === 'constructor')
                return;
            if (typeof type.prototype[k] === 'function')
                this.methods.push(k);
        });
    }
    add(item) {
        if (!(item instanceof this.type))
            throw new Error(`Collection expects ${this.type.prototype.constructor.name}; got ${item.constructor.name}`);
        this._items.push(item);
    }
    each(callback) {
        if (callback) {
            this._items.forEach(callback);
        }
        else {
            return this.methods.reduce((obj, e) => {
                obj[e] = () => {
                    this._items.forEach((item) => {
                        item[e]();
                    });
                    return obj;
                };
                return obj;
            }, {});
        }
    }
    generate(count, params) {
        for (let i = 0; i < count; i++) {
            const passed = params ? params.map(e => parseParam(e, i)) : [];
            this.add(new this.type(...passed));
        }
    }
    query(key) {
        return this.items.map(i => i[key]);
    }
    remove(condition) {
        this._items = this._items.filter(function (item) {
            if (typeof condition === 'function') {
                return !condition(item);
            }
            else {
                return condition !== item;
            }
        });
    }
    get(i) {
        return this._items[i];
    }
    test(item) {
        return (item instanceof this.type);
    }
    [Symbol.iterator]() {
        let index = -1;
        return {
            next: () => {
                index++;
                return {
                    done: index === this._items.length,
                    value: this._items[index]
                };
            }
        };
    }
    get items() {
        return this._items;
    }
    get length() {
        return this._items.length;
    }
    static eval(func) {
        func[shouldEvaluate] = true;
        return func;
    }
    static cycle(array) {
        array[shouldCycle] = true;
        return array;
    }
    static get index() {
        return this.eval((i) => i);
    }
}

export default Collection;
