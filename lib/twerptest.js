var EE, assert, desc, func, func_list, path, _fn, _i, _len, _ref;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
EE = require("events").EventEmitter;
assert = require("../vendor/assert-extras");
path = require("path");
exports.TwerpTest = (function() {
  TwerpTest.isTwerpTest = true;
  function TwerpTest(options) {
    this.options = options;
    this.queue = this.gatherRunnables();
    this._tests = {};
    this.ee = new EE();
    this.on = this.ee.on;
    this.emit = this.ee.emit;
  }
  TwerpTest.prototype.start = function(callback) {
    return callback();
  };
  TwerpTest.prototype.setup = function(callback) {
    return callback();
  };
  TwerpTest.prototype.teardown = function(callback) {
    return callback();
  };
  TwerpTest.prototype.done = function() {};
  TwerpTest.prototype.getNext = function() {
    return this.queue.shift();
  };
  TwerpTest.prototype.run = function(finished_callback) {
    var current;
    this.finished_callback = finished_callback;
    if (current = this.getNext()) {
      return this.runTest(current);
    }
  };
  TwerpTest.prototype.runTest = function(_arg) {
    var capture, name, next_test;
    name = _arg[0], capture = _arg[1];
    next_test = this.getNext() || ["done", false];
    return __bind(function(next_test, capture) {
      var previous_name, _base;
      if (previous_name = this.current) {
        this.emit("endTest", previous_name, this._tests[previous_name]);
        this.current = null;
      }
      if (capture) {
        (_base = this._tests)[name] || (_base[name] = {});
        this.current = name;
        this.emit("startTest", name);
      }
      try {
        return this[name](__bind(function(expected) {
          var _ref;
          if ((_ref = this._tests[name]) != null) {
            _ref.expected = expected;
          }
          return this.runTest(next_test);
        }, this));
      } catch (error) {
        this.emit("fail", error);
        return process.exit(1);
      }
    }, this)(next_test, capture);
  };
  TwerpTest.prototype.finish = function() {
    return this.finished_callback(this._tests);
  };
  TwerpTest.prototype.gatherRunnables = function() {
    var func, prop, re, runnables, setup, setups, teardown, teardowns, _i, _j, _len, _len2, _ref, _ref2;
    runnables = [["start", false]];
    setups = [];
    teardowns = [];
    for (prop in this) {
      func = this[prop];
      if (/^setup./.exec(prop)) {
        setups.push(prop);
      }
      if (/^teardown./.exec(prop)) {
        teardowns.push(prop);
      }
    }
    for (prop in this) {
      func = this[prop];
      if (!/^test/.exec(prop)) {
        continue;
      }
      if (this.options.matchFunction) {
        re = new RegExp(this.options.matchFunction);
        if (!re.exec(prop)) {
          continue;
        }
      }
      runnables.push(["setup", false]);
      _ref = setups.sort();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        setup = _ref[_i];
        runnables.push([setup, false]);
      }
      runnables.push([prop, true]);
      _ref2 = teardowns.sort();
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        teardown = _ref2[_j];
        runnables.push([teardown, false]);
      }
      runnables.push(["teardown", false]);
    }
    runnables.push(["finish", false]);
    return runnables;
  };
  TwerpTest.prototype.log = function(args) {
    return console.log(args);
  };
  return TwerpTest;
})();
exports.assert_functions = {
  "From assert.js": ["fail", "ok", "equal", "notEqual", "deepEqual", "notDeepEqual", "strictEqual", "notStrictEqual", "throws", "doesNotThrow", "ifError"],
  "From assert-extras.js": ["isNull", "isNotNull", "isTypeOf", "isNotTypeOf", "isObject", "isFunction", "isString", "isBoolean", "isNumber", "isUndefined", "isNotUndefined", "isArray", "isNaN", "isNotNaN", "match", "noMatch", "isPrototypeOf", "isNotPrototypeOf", "isWritable", "isNotWritable", "isConfigurable", "isNotConfigurable", "isEnumerable", "isNotEnumerable"],
  "From twerp itself": ["isEmptyArray"]
};
_ref = exports.assert_functions;
for (desc in _ref) {
  func_list = _ref[desc];
  _fn = function(func) {
    return exports.TwerpTest.prototype[func] = function() {
      var args, cur, errored;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      errored = false;
      try {
        assert[func].apply(this, args);
        if (cur = this._tests[this.current]) {
          cur.passed || (cur.passed = 0);
          cur.passed++;
        }
        return this.emit("pass");
      } catch (e) {
        if (cur = this._tests[this.current]) {
          cur.failed = (cur.errors || (cur.errors = [])).push(e);
        }
        this.emit("fail", e);
        return errored = true;
      } finally {
        if (cur = this._tests[this.current]) {
          cur.count || (cur.count = 0);
          cur.count++;
        }
        if (errored && this.options["exitOnFailure"]) {
          this.emit("endTest", this.current, cur);
          process.exit(1);
        }
      }
    };
  };
  for (_i = 0, _len = func_list.length; _i < _len; _i++) {
    func = func_list[_i];
    _fn(func);
  }
}
assert.isEmptyArray = function(array, message) {
  if (!array instanceof Array || array.length !== 0) {
    return this.fail(array, [], message, "!=");
  }
};