module.exports = function(chai, utils) {
  chai.Assertion.addProperty("loose", function() {
    utils.flag(this, "loose", true);
  });

  function compare(expected, actual) {
    if (Array.isArray(expected) &&  Array.isArray(actual)) {
      if (actual.length !== expected.length) return false
      else return expected.every((val, idx) => compare(val, actual[idx]))
    } else {
      return actual == expected
    }
  }
  // BigNumber.equals
  var equals = function(_super) {
      return function(value) {
        if (utils.flag(this, "loose")) {
          this.assert(compare(this._obj, value))
        } else {
          _super.apply(this, arguments);
        }
      };
    };

  chai.Assertion.overwriteMethod("equal", equals);
  chai.Assertion.overwriteMethod("equals", equals);
  chai.Assertion.overwriteMethod("eq", equals);
};
