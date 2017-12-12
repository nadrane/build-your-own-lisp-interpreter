const { expect } = require("chai");
const mocha = require("mocha");
const { tokenize, parse } = require("./solution");

describe("interpreter", () => {

  // Parsing is the process of taking a program and transforming it into a usable data structure
  describe("parsing", () => {
    /* The first step to parsing is tokenization. At the end of the day, your program is just a text string. We want to identify each significant component in that text string and extract them into an array. */
    describe("tokenize", () => {
      /* Scheme used a syntax known as prefix notation. Here are some examples
      (* 5 6)    -> 30   The operator comes before the operands!
      (+ 3 5 3)  -> 11   The calculator operatiors (+, -, *, /) can all take as many operands as we like
      (* 4 (+ 4 1)) -> (* 4 5) -> 20

      Scheme denotes expressions with groups of parenthesis. An expression essentially evaluates to something. Each item inside an expression is referred to as a token. Essentially, this is a maximimally reduced piece of syntax. In a language like javascript, 'function', 'const', and variables names are all examples of tokens. */

      // note: do not assume tokens will always be 1 character in length! We will add more and longer tokens later
      it("should return an array whose elements are each a significant characters", () => {
        expect(tokenize("(* 5 5)")).to.deep.equal(["(", "*", "5", "5", ")"]);
        expect(tokenize("(* 2 (+ 8 1 3))")).to.deep.equal(["(","*","2","(","+","8","1","3",")",")"]);
        expect(tokenize("(/ (- 10 5) (* 2 (+ 8 1 )))")).to.deep.equal(["(","/","(","-","10","5",")","(","*","2","(","+","8","1",")",")",")"]);
      });
      it("appropriately tokenizes tokens longer than length 1", () => {
        expect(tokenize("(* -5 -5)")).to.deep.equal(["(", "*", "-5", "-5", ")"]);
      })
    });

    /* The second step to parsing is taking the output of tokenize and transforming it into a data structure that is easier to work with, namely an a tree. This tree is referred to as an Abstract Syntax Tree, or AST for short. */
    describe('parse', () => {

      // Your parse implementation should be recursive. This should be your base case
      it('parses an atomic unit', () => {
        expect(parse("5")).to.equal(5)
        expect(parse("-10")).to.equal(-10)
        expect(parse("+")).to.equal('+')
        expect(parse("-")).to.equal('-')
      })

      it('parses a single, unnested expression', () => {
        expect(parse("(+ 3 5)")).to.deep.equal(['+', 3, 5]);
      })
      it('transforms a single, unnested expressions with a variable number of operands', () => {
        expect(parse("(+ 3 5 2 8)")).to.deep.equal(['+', 3, 5, 2, 8]);
        expect(parse("(- 2 5 0 2 4 2)")).to.deep.equal(['-', 2, 5, 0, 2, 4, 2]);
      })
      it('transforms nested expressions', () => {
        expect(parse("(- 3 (+ 3 5))")).to.deep.equal(['-', 3, ['+', 3, 5]]);
        expect(parse("(- 3 5 3(+ 8 0))")).to.deep.equal(['-', 3, 5, 3, ['+', 8, 0]]);
      })
    })
  })
});
