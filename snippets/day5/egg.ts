

/*----------------------------------------------------------------------------*/
// Types

type ParseResult =
    {
        expr: EggExpr,
        rest: string
    }

type EggExpr
    = ValueToken
    | WordToken
    | ApplyExpr


type ValueToken
    = { type: ValueType, value: Value }

type WordToken
    = { type: WordType, name: string }

type ApplyExpr
    = { type: ApplyType, operator: WordToken, args: Array<EggExpr> }


type ApplyType = "apply";
type ValueType = "value";
type WordType = "word";

type Value = number | string


/*----------------------------------------------------------------------------*/
// Parser


function parse(program: string): EggExpr {
    let { expr, rest } = parseExpression(program);
    if (skipSpace(rest).length > 0) {
        throw new SyntaxError(`Unexpected text ${rest} after program`);
    }
    return expr;
}

function parseExpression(program: string): ParseResult {
    program = skipSpace(program);
    let match: Array<string>, expr: EggExpr;

    if ((match = /^"([^"]*)"/.exec(program))) {
        expr = { type: "value", value: match[1] };
    } else if ((match = /^\d+\b/.exec(program))) {
        expr = { type: "value", value: Number(match[0]) };
    } else if ((match = /^[^\s(),#"]+/.exec(program))) {
        expr = { type: "word", name: match[0] };
    } else {
        throw new SyntaxError("Unexpected syntax: " + program);
    }
    return parseApply(expr, program.slice(match[0].length));
}


function parseApply(expr: EggExpr, program: string): ParseResult {
    program = skipSpace(program);
    if (program[0] != "(") {
        return { expr: expr, rest: program };
    }

    program = skipSpace(program.slice(1));
    expr = { type: "apply", operator: expr, args: [] } as ApplyExpr;
    while (program[0] != ")") {
        let arg = parseExpression(program);
        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] == ",") {
            program = skipSpace(program.slice(1));
        } else if (program[0] != ")") {
            throw new SyntaxError("Expected ',' or ')'");
        }
    }
    return parseApply(expr, program.slice(1));
}



/*----------------------------------------------------------------------------*/


const specialForms = Object.create(null);


function evaluate(expr: EggExpr, scope: object) {
    if (expr.type == "value") {
        return expr.value;
    } else if (expr.type == "word") {
        if (expr.name in scope) {
            return scope[expr.name];
        } else {
            throw new ReferenceError(
                `Undefined binding: ${expr.name}`);
        }
    } else if (expr.type == "apply") {
        let { operator, args } = expr;
        if (operator.type == "word" &&
            operator.name in specialForms) {
            return specialForms[operator.name](expr.args, scope);
        } else {
            let op = evaluate(operator, scope);
            if (typeof op == "function") {
                return op(...args.map(arg => evaluate(arg, scope)));
            } else {
                throw new TypeError("Applying a non-function.");
            }
        }
    }
}

/*----------------------------------------------------------------------------*/
// Specal Forms


specialForms.if = (args: Array<EggExpr>, scope: object) => {
    if (args.length != 3) {
        throw new SyntaxError("Wrong number of args to if");
    } else if (evaluate(args[0], scope) !== false) {
        return evaluate(args[1], scope);
    } else {
        return evaluate(args[2], scope);
    }
};


specialForms.while = (args: Array<EggExpr>, scope: object) => {
    if (args.length != 2) {
        throw new SyntaxError("Wrong number of args to while");
    }
    while (evaluate(args[0], scope) !== false) {
        evaluate(args[1], scope);
    }

    // Since undefined does not exist in Egg, we return false,
    // for lack of a meaningful result.
    return false;
};


specialForms.do = (args: Array<EggExpr>, scope: object) => {
    let value = false;
    for (let arg of args) {
        value = evaluate(arg, scope);
    }
    return value;
};


specialForms.define = (args: Array<EggExpr>, scope: object) => {
    if (args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Incorrect use of define");
    }
    let value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
};


specialForms.fun = (args: Array<EggExpr>, scope: object) => {
    if (!args.length) {
        throw new SyntaxError("Functions need a body");
    }
    let body = args[args.length - 1];
    let params = args.slice(0, args.length - 1).map(expr => {
        if (expr.type != "word") {
            throw new SyntaxError("Parameter names must be words");
        }
        return expr.name;
    });

    return function() {
        if (arguments.length != params.length) {
            throw new TypeError("Wrong number of arguments");
        }
        let localScope = Object.create(scope);
        for (let i = 0; i < arguments.length; i++) {
            localScope[params[i]] = arguments[i];
        }
        return evaluate(body, localScope);
    };
};

specialForms.set = (args: Array<EggExpr>, scope: object) => {
    if (args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Incorrect use of set");
    } else {
        const name = args[0].name;
        const val = evaluate(args[1], scope);

        while (!Object.prototype.hasOwnProperty.call(scope, name)) {
            if (Object.getPrototypeOf(scope) === null) {
                throw new ReferenceError(`Could not find property ${name} to set with ${val}`);
            } else {
                scope = Object.getPrototypeOf(scope);
            }
        }
        scope[name] = val;
    }
};

/*----------------------------------------------------------------------------*/
// Helpers


function skipSpace(s: string): string {
    const firstChar = s.search(/\S/);
    if (firstChar == -1) {
        return "";
    } else {
        const s_ = s.slice(firstChar)
        if (s_[0] == '#') {
            return skipSpace(s_.slice(s_.search(/\n/) + 1));
        } else {
            return s_;
        }
    }
}


/*----------------------------------------------------------------------------*/
// Global Scope


const topScope = Object.create(null);

topScope.true = true;
topScope.false = false;


for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
    topScope[op] = Function("a, b", `return a ${op} b;`);
}


topScope.print = (value: Value) => {
    console.log(value);
    return value;
};


// Arrays

topScope.array = (...vals: Array<Value>): Array<Value> => {
    return vals;
}

topScope.length = (arr: Array<Value>): number => {
    return arr.length;
}

topScope.element = (arr: Array<Value>, i: number): Value => {
    const val = arr[i];
    if (val === undefined) {
        throw new RangeError(`${i} is out of range of array ${arr}`);
    }
    return val;
};


/*----------------------------------------------------------------------------*/
// Test


// Parse simple expr
console.log("Parse: +(a, 10)");
console.log("Parse +(a, 10): ", parse("+(a, 10)"));

// Parse conditional bool
let prog = parse(`if(true, false, true)`);
console.log("Parse cond, expect false: ", evaluate(prog, topScope));



/*----------------------------------------------------------------------------*/

function run(program: string) {
    return evaluate(parse(program), Object.create(topScope));
}


console.log("Run sample problem, expected output 55:");
run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);


console.log("Run function, expected output 11");
run(`
do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(10)))
`);


console.log("Run function, expected output 1024");
run(`
do(define(pow, fun(base, exp,
     if(==(exp, 0),
        1,
        *(base, pow(base, -(exp, 1)))))),
   print(pow(2, 10)))
`);


console.log("Test array, expected output 6:");
run(`
do(define(sum, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(define(sum, +(sum, element(array, i))),
             define(i, +(i, 1)))),
        sum))),
   print(sum(array(1, 2, 3))))
`);


// comments
console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}

// `set` and scope

console.log("Expected output 50:");
run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);


try {
    run(`set(quux, true)`);
}
catch (err) {
    console.log(`Expected ReferenceError, observed: ${err}`);
}

