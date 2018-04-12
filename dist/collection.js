(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Collection = factory());
}(this, (function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var shouldEvaluate = Symbol('evaluate');
  var shouldCycle = Symbol('cycle');

  var Collection = function () {
      function Collection(instance) {
          var _this = this;

          classCallCheck(this, Collection);

          this.instance = instance;
          this.methods = [];
          this._items = [];
          Object.getOwnPropertyNames(instance.prototype).forEach(function (k) {
              if (k === 'constructor') return;
              if (typeof instance.prototype[k] === 'function') _this.methods.push(k);
          });
      }

      createClass(Collection, [{
          key: 'add',
          value: function add(item) {
              if (!(item instanceof this.instance)) throw new Error('Collection expects ' + this.instance.prototype.constructor.name + '; got ' + item.constructor.name);
              this._items.push(item);
          }
      }, {
          key: 'each',
          value: function each(callback) {
              var _this2 = this;

              if (callback) {
                  this._items.forEach(callback);
              } else {
                  return this.methods.reduce(function (obj, e) {
                      obj[e] = function () {
                          _this2._items.forEach(function (item) {
                              item[e]();
                          });
                          return obj;
                      };
                      return obj;
                  }, {});
              }
          }
      }, {
          key: 'generate',
          value: function generate(count, params) {
              var _this3 = this;

              var _loop = function _loop(i) {
                  var passed = params ? params.map(function (e) {
                      return parseParam(e, i);
                  }) : [];
                  _this3.add(new (Function.prototype.bind.apply(_this3.instance, [null].concat(toConsumableArray(passed))))());
              };

              for (var i = 0; i < count; i++) {
                  _loop(i);
              }
          }
      }, {
          key: 'query',
          value: function query(key) {
              return this.items.map(function (i) {
                  return i[key];
              });
          }
      }, {
          key: 'items',
          get: function get$$1() {
              return this._items;
          }
      }], [{
          key: 'eval',
          value: function _eval(func) {
              func[shouldEvaluate] = true;
              return func;
          }
      }, {
          key: 'cycle',
          value: function cycle(array) {
              array[shouldCycle] = true;
              return array;
          }
      }, {
          key: 'index',
          get: function get$$1() {
              return this.eval(function (i) {
                  return i;
              });
          }
      }]);
      return Collection;
  }();

  function parseParam(e, i) {
      if (e[shouldEvaluate]) {
          return e(i);
      }
      if (e[shouldCycle]) {
          return e[i % e.length];
      }
      if (e instanceof Array || e.__proto__ === Object.prototype) {
          e = Object.assign({}, e);
          Object.keys(e).forEach(function (k) {
              e[k] = parseParam(e[k], i);
          });
      }
      return e;
  }

  return Collection;

})));
