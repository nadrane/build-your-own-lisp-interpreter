function tokenize(str) {
  return str
    .replace(/\)/g, " ) ")
    .replace(/\(/g, " ( ")
    .split(" ")
    .filter(token => token !== "");
}

const apply = (fn, ...args) => args.reduce((accum, next) => fn(accum, next));

const globalEnv = {
  "+": (...args) => apply((a, b) => a + b, ...args),
  "-": (...args) => apply((a, b) => a - b, ...args),
  "*": (...args) => apply((a, b) => a * b, ...args),
  "/": (...args) => apply((a, b) => a / b, ...args),
  ">": (...args) => args.slice(1).every(val => args[0] > val),
  "<": (...args) => args.slice(1).every(val => args[0] < val),
  "=": (...args) => apply((a, b) => a === b, ...args)
};

const keywords = ["define", "if"];

function evaluate(program, env = {}) {
  const ast = parse(program);
  env = Object.assign(env, globalEnv);
  // Evaluate every expression and return the value of the final one
  return ast.map(expression => evaluateExpression(expression, env))[ast.length - 1];
}

function evaluateExpression(expression, env) {
  if (expression[0] === "define") {
    const [_, symbol, subExpression] = expression;
    env[symbol.value] = evaluateExpression(subExpression, env);
  } else if (expression[0] === "if") {
    const [_, condition, truthy, falsy] = expression;
    return evaluateExpression(condition, env) ? evaluateExpression(truthy, env) : evaluateExpression(falsy, env);
  } else if (expression[0] === "lambda") {
    const [_, arguments, body] = expression;
  } else if (typeof expression === "number") {
    return expression;
  } else if (expression instanceof Symbol) {
    return env[expression.value] instanceof Symbol ? parseExpression(env[expression.value]) : env[expression.value];
  } else {
    const [symbol, ...subExpresions] = expression;
    const operands = subExpresions.map(subExpression => evaluateExpression(subExpression, env));
    return env[symbol.value](...operands);
  }
}

function parse(str) {
  const tokens = tokenize(str);
  return makeAst(tokens);
}

function makeAst(tokens) {
  const expressions = [];
  while (tokens[0] === "(") {
    expressions.push(parseExpression(tokens));
  }
  return expressions;
}

function parseExpression(tokens) {
  const ast = [];
  let token = tokens.shift();
  if (token === "(") {
    while (tokens[0] !== ")") {
      ast.push(parseExpression(tokens));
    }
    tokens.shift(); // Discard trailing )
    return ast;
  } else if (keywords.includes(token)) {
    return token;
  } else {
    return atom(token);
  }
}

function atom(token) {
  if (!isNaN(parseInt(token))) {
    return parseInt(token);
  } else {
    return new Symbol(token);
  }
}

// Note that we are shadowing the builtin symbol
function Symbol(value) {
  this.value = value;
}

// Only needed for the tests to pass
Symbol.prototype.valueOf = function() {
  return this.value;
};

module.exports = {
  tokenize,
  parse,
  evaluate,
  parseExpression,
  Symbol
};
