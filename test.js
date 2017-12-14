const mocha = require("mocha");
const chai = require("chai");
const { expect } = chai;
chai.use(require("./looseEqual"));
let { tokenize, parse, evaluate, parseExpression, Symbol } = require("./solution");

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
        expect(tokenize("(* 5 5)")).to.deep.loose.equal(["(", "*", "5", "5", ")"]);
        expect(tokenize("(* 2 (+ 8 1 3))")).to.deep.equal(["(", "*", "2", "(", "+", "8", "1", "3", ")", ")"]);
        expect(tokenize("(/ (- 10 5) (* 2 (+ 8 1 )))")).to.deep.equal([
          "(",
          "/",
          "(",
          "-",
          "10",
          "5",
          ")",
          "(",
          "*",
          "2",
          "(",
          "+",
          "8",
          "1",
          ")",
          ")",
          ")"
        ]);
      });
      it("appropriately tokenizes tokens longer than length 1", () => {
        expect(tokenize("(* -5 -5)")).to.deep.equal(["(", "*", "-5", "-5", ")"]);
      });
    });

    /* The second step to parsing is taking the output of tokenize and transforming it into a data structure that is easier to work with, namely an a tree. This tree is referred to as an Abstract Syntax Tree, or AST for short. */
    describe("parsing", () => {
      describe("parseExpression", () => {
        // I'm attempting to guide your implementation here.
        // Our parse function later will take care of the tokenization
        let originalParseExpression = parseExpression;

        beforeEach(() => {
          parseExpression = expression => originalParseExpression(tokenize(expression));
        });
        afterEach(() => {
          parseExpression = originalParseExpression;
        });

        describe("atomic units", () => {
          it("parses numbers", () => {
            expect(parseExpression("5")).to.be.a("number");
            expect(parseExpression("-10")).to.be.a("number");

            expect(parseExpression("5")).to.equal(5);
            expect(parseExpression("-10")).to.equal(-10);
          });

          it("parses symbols", () => {
            // Note that we are shadowing the builtin symbol with the require above
            // You will need to represent symbols as a special class

            expect(parseExpression("+")).to.be.an.instanceof(Symbol);
            expect(parseExpression("-")).to.be.an.instanceof(Symbol);

            // The loose modifer will use a '==' comparison, so you will need to define the valueOf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
            // method on your Symbols so that they evaluate to the symbols they represent
            expect(parseExpression("+")).to.loose.equal("+");
            expect(parseExpression("-")).to.loose.equal("-");
          });
        });
        describe("larger expressions", () => {
          // Your parseExpression implementation should be recursive. This should be your base case
          it("parses a single, unnested expression", () => {
            expect(parseExpression("(+ 3 5)")).to.loose.equal(["+", 3, 5]);
          });
          it("parses a single, unnested expressions with a variable number of operands", () => {
            expect(parseExpression("(+ 3 5 2 8)")).to.loose.equal(["+", 3, 5, 2, 8]);
            expect(parseExpression("(- 2 5 0 2 4 2)")).to.loose.equal(["-", 2, 5, 0, 2, 4, 2]);
          });
          it("parses nested expressions", () => {
            expect(parseExpression("(- 3 (+ 3 5))")).to.loose.equal(["-", 3, ["+", 3, 5]]);
            expect(parseExpression("(- 3 5 3(+ 8 0))")).to.loose.equal(["-", 3, 5, 3, ["+", 8, 0]]);
          });
        });
      });

      // Your parse function should actually perform the tokenization, along with
      // allowing sequential, unnested expressions.
      it("parses sequential unnested expressions", () => {
        expect(parse("(- 3 6) (+ 2 3)")).to.loose.equal([["-", 3, 6], ["+", 2, 3]]);
        expect(parse("(- 1 0) (/ 8 0)")).to.loose.equal([["-", 1, 0], ["/", 8, 0]]);
      });
    });
  });

  describe("calculator", () => {
    it("Supports basic mathmatical operations", () => {
      expect(evaluate("(+ 3 4)")).to.equal(7);
    });
    it("Supports mathmatical operations with nesting", () => {
      expect(evaluate("(+ 3 4 (+ 3 2))")).to.equal(12);
    });
    it("If multiple sequential expressions are defined, the value of the last is returned", () => {
      expect(evaluate("(+ 3 4)(+ 3 2)")).to.equal(5);
    });
  });

  // TODO
  describe("comparators", () => {

  });

  /* Variables are set in lisp using the `define` keyword.
     For example,the following expression sets x equal to 10:

     (define x 10)

     We are not required to make the x equal to a constant. In fact,
     in fact, we can make it equal to any expression as well:

     (define x (+ 3 2))
  */
  describe("define", () => {
    /* Any define expression will not have a meaningful return value. Instead, it modifies the global environment
       We're going to have evaluate take in an environment, and if it sees the define keyword, it will modify that environment.

    */

    it("can define a variable to equal a constant", () => {
      const env = {};
      evaluate("(define x 10)", env);
      expect(env).to.have.property("x", 10);
    });

    it("can define multiple unnested expressions", () => {
      const env = {};
      expect(evaluate("(define x 2)(define y 5)", env));
      expect(env).to.have.property("x", 2);
      expect(env).to.have.property("y", 5);
    });

    it("symbol definitions can be used later in the program", () => {
      const env = {};
      expect(evaluate("(define x 2)(+ x 3)", env)).to.equal(5)
      expect(env).to.have.property("x", 2);
    });

    it("symbol definitions will be recursively followed", () => {
      let env = {};
      expect(evaluate("(define x 2)(define y x)(+ y 5)", env)).to.equal(7);
      expect(env).to.have.property("x", 2);
      expect(env).to.have.property("y", 2);

      env = {};
      expect(evaluate("(define x 4)(define y x)(define z y)(+ z 5)", env)).to.equal(9);
      expect(env).to.have.property("x", 4);
      expect(env).to.have.property("y", 4);
      expect(env).to.have.property("z", 4);
    });
  });

  describe("if conditions", () => {
    it('executes the consequent if the predicate is true', ()=> {
      expect(evaluate("(if (> 1 0) 1 0)")).to.equal(1)
    })
    it('executes the alternative if the predicate is false', ()=> {
      expect(evaluate("(if (< 1 0) 1 0)")).to.equal(0)
    })
    it('allows for the consequent and the alternative to be complicated expressions', () => {
      expect(evaluate("(if (> 1 0) (+ 4 6) 0)")).to.equal(10)
      expect(evaluate("(if (< 1 0) 1 (+ 9 9))")).to.equal(18)
    })
  })

  describe.only("lambda functions", () => {
    it('it should save defined lambda functions to the environment', () => {
      const env = {}
      evaluate("(define square (lambda (x) (* x x)))", env)
      expect(env).to.haveOwnProperty('square')
    })

    it('Allows previously saved functions to be invoked with constants', () => {
      expect(evaluate("(define square (lambda (x) (* x x))) (square 5)")).to.equal(25)
    })

    it('Allows previously saved functions to be invoked with variables', () => {
      expect(evaluate("(define x 5) (define square (lambda (x) (* x x))) (square x)")).to.equal(25)
    })

    it('Distinguishes correctly between different parameters', () => {
      const env = {}
      evaluate("(define mult (lambda (x y) (* x y)))", env)
      evaluate("(define x 5)(define y 9)", env)
      expect(evaluate("(mult x y)", env)).to.equal(45)
    })

    it('Exercises scoping rules, taking the value in the most specific scope', () => {
      const env = {}
      evaluate("(define mult (lambda (x) (* x x)))", env)
      evaluate("(define x 5)", env)
      expect(evaluate("(mult 2)", env)).to.equal(4)
    })

    it('Properly exercises the closure property', () => {

    })
  })
});
