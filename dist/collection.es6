const shouldEvaluate = Symbol('evaluate');
const shouldCycle = Symbol('cycle');
class Collection {
    constructor(instance) {
        this.instance = instance;
        this.methods = [];
        this._items = [];
        Object.getOwnPropertyNames(instance.prototype).forEach(k => {
            if (k === 'constructor')
                return;
            if (typeof instance.prototype[k] === 'function')
                this.methods.push(k);
        });
    }
    add(item) {
        if (!(item instanceof this.instance))
            throw new Error(`Collection expects ${this.instance.prototype.constructor.name}; got ${item.constructor.name}`);
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
            this.add(new this.instance(...passed));
        }
    }
    query(key) {
        return this.items.map(i => i[key]);
    }
    get items() {
        return this._items;
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

export default Collection;
