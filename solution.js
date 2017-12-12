function tokenize(str) {
  return str
    .replace(/\)/g, " ) ")
    .replace(/\(/g, " ( ")
    .split(" ")
    .filter(token => token !== "");
}

function parse(str) {
  const tokens = tokenize(str);
  return makeAST(tokens);
}

function makeAST(tokens) {
  const AST = [];
  let token = tokens.shift();
  if (token === "(") {
    while (tokens[0] !== ")") {
      AST.push(makeAST(tokens));
    }
    tokens.shift(); // Discard trailing )
    return AST
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
  parse
};
