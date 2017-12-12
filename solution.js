function tokenize(str) {
  return str
    .replace(/\)/g, " ) ")
    .replace(/\(/g, " ( ")
    .split(" ")
    .filter(token => token !== "");
}

const apply = (fn, ...args) => args.reduce((accum, next) => fn(accum, next))

const env = {
  "+": (...args) => apply((a,b) => a + b, ...args),
  "-": (...args) => apply((a,b) => a - b, ...args),
  "*": (...args) => apply((a,b) => a * b, ...args),
  "/": (...args) => apply((a,b) => a / b, ...args)
}

function evaluate(program) {
  const ast = parse(program)
  return evaluateExpression(ast)
}

function evaluateExpression(expression) {
  if (!expression.length) {
    throw new Error()
  }
  const operator = expression.shift()
  const operands = []
  while(expression.length) {
    const operand = expression.shift()
    if (Array.isArray(operand)) {
      operands.push(evaluateExpression(operand))
    } else {
      operands.push(operand)
    }
  }
  console.log(operator, '|', operands)
  return env[operator](...operands)
}

function parse(str) {
  const tokens = tokenize(str);
  return makeAst(tokens);
}

function makeAst(tokens) {
  const ast = [];
  let token = tokens.shift();
  if (token === "(") {
    while (tokens[0] !== ")") {
      ast.push(makeAst(tokens));
    }
    tokens.shift(); // Discard trailing )
    return ast
  } else {
    return atom(token);
  }
}

function atom(token) {
  if (!isNaN(parseInt(token))) {
    return parseInt(token)
  } else {
    return symbol(token)
  }
}

function symbol(token) {
  return token
}

module.exports = {
  tokenize,
  parse,
  evaluate
};
