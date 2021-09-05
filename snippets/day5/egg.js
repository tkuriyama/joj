/*----------------------------------------------------------------------------*/
// Types
/*----------------------------------------------------------------------------*/
// Parser
function parse(program) {
    var _a = parseExpression(program), expr = _a.expr, rest = _a.rest;
    if (skipSpace(rest).length > 0) {
        throw new SyntaxError("Unexpected text " + rest + " after program");
    }
    return expr;
}
function parseExpression(program) {
    program = skipSpace(program);
    var match, expr;
    if ((match = /^"([^"]*)"/.exec(program))) {
        expr = { type: "value", value: match[1] };
    }
    else if ((match = /^\d+\b/.exec(program))) {
        expr = { type: "value", value: Number(match[0]) };
    }
    else if ((match = /^[^\s(),#"]+/.exec(program))) {
        expr = { type: "word", name: match[0] };
    }
    else {
        throw new SyntaxError("Unexpected syntax: " + program);
    }
    return parseApply(expr, program.slice(match[0].length));
}
function parseApply(expr, program) {
    program = skipSpace(program);
    if (program[0] != "(") {
        return { expr: expr, rest: program };
    }
    program = skipSpace(program.slice(1));
    expr = { type: "apply", operator: expr, args: [] };
    while (program[0] != ")") {
        var arg = parseExpression(program);
        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] == ",") {
            program = skipSpace(program.slice(1));
        }
        else if (program[0] != ")") {
            throw new SyntaxError("Expected ',' or ')'");
        }
    }
    return parseApply(expr, program.slice(1));
}
/*----------------------------------------------------------------------------*/
var specialForms = Object.create(null);
function evaluate(expr, scope) {
    if (expr.type == "value") {
        return expr.value;
    }
    else if (expr.type == "word") {
        if (expr.name in scope) {
            return scope[expr.name];
        }
        else {
            throw new ReferenceError("Undefined binding: " + expr.name);
        }
    }
    else if (expr.type == "apply") {
        var operator = expr.operator, args = expr.args;
        if (operator.type == "word" &&
            operator.name in specialForms) {
            return specialForms[operator.name](expr.args, scope);
        }
        else {
            var op = evaluate(operator, scope);
            if (typeof op == "function") {
                return op.apply(void 0, args.map(function (arg) { return evaluate(arg, scope); }));
            }
            else {
                throw new TypeError("Applying a non-function.");
            }
        }
    }
}
/*----------------------------------------------------------------------------*/
// Specal Forms
specialForms["if"] = function (args, scope) {
    if (args.length != 3) {
        throw new SyntaxError("Wrong number of args to if");
    }
    else if (evaluate(args[0], scope) !== false) {
        return evaluate(args[1], scope);
    }
    else {
        return evaluate(args[2], scope);
    }
};
specialForms["while"] = function (args, scope) {
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
specialForms["do"] = function (args, scope) {
    var value = false;
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        value = evaluate(arg, scope);
    }
    return value;
};
specialForms.define = function (args, scope) {
    if (args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Incorrect use of define");
    }
    var value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
};
specialForms.fun = function (args, scope) {
    if (!args.length) {
        throw new SyntaxError("Functions need a body");
    }
    var body = args[args.length - 1];
    var params = args.slice(0, args.length - 1).map(function (expr) {
        if (expr.type != "word") {
            throw new SyntaxError("Parameter names must be words");
        }
        return expr.name;
    });
    return function () {
        if (arguments.length != params.length) {
            throw new TypeError("Wrong number of arguments");
        }
        var localScope = Object.create(scope);
        for (var i = 0; i < arguments.length; i++) {
            localScope[params[i]] = arguments[i];
        }
        return evaluate(body, localScope);
    };
};
/*----------------------------------------------------------------------------*/
// Helpers
function skipSpace(s) {
    var firstChar = s.search(/\S/);
    if (firstChar == -1) {
        return "";
    }
    else {
        var s_ = s.slice(firstChar);
        if (s_[0] == '#') {
            return skipSpace(s_.slice(s_.search(/\n/) + 1));
        }
        else {
            return s_;
        }
    }
}
/*----------------------------------------------------------------------------*/
// Global Scope
var topScope = Object.create(null);
topScope["true"] = true;
topScope["false"] = false;
for (var _i = 0, _a = ["+", "-", "*", "/", "==", "<", ">"]; _i < _a.length; _i++) {
    var op = _a[_i];
    topScope[op] = Function("a, b", "return a " + op + " b;");
}
topScope.print = function (value) {
    console.log(value);
    return value;
};
// Arrays
topScope.array = function () {
    var vals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        vals[_i] = arguments[_i];
    }
    return vals;
};
topScope.length = function (arr) {
    return arr.length;
};
topScope.element = function (arr, i) {
    var val = arr[i];
    if (val === undefined) {
        throw new RangeError(i + " is out of range of array " + arr);
    }
    return val;
};
/*----------------------------------------------------------------------------*/
// Test
// Parse simple expr
console.log("Parse: +(a, 10)");
console.log("Parse +(a, 10): ", parse("+(a, 10)"));
// Parse conditional bool
var prog = parse("if(true, false, true)");
console.log("Parse cond, expect false: ", evaluate(prog, topScope));
/*----------------------------------------------------------------------------*/
function run(program) {
    return evaluate(parse(program), Object.create(topScope));
}
console.log("Run sample problem, expected output 55:");
run("\ndo(define(total, 0),\n   define(count, 1),\n   while(<(count, 11),\n         do(define(total, +(total, count)),\n            define(count, +(count, 1)))),\n   print(total))\n");
console.log("Run function, expected output 11");
run("\ndo(define(plusOne, fun(a, +(a, 1))),\n   print(plusOne(10)))\n");
console.log("Run function, expected output 1024");
run("\ndo(define(pow, fun(base, exp,\n     if(==(exp, 0),\n        1,\n        *(base, pow(base, -(exp, 1)))))),\n   print(pow(2, 10)))\n");
console.log("Test array, expected output 6:");
run("\ndo(define(sum, fun(array,\n     do(define(i, 0),\n        define(sum, 0),\n        while(<(i, length(array)),\n          do(define(sum, +(sum, element(array, i))),\n             define(i, +(i, 1)))),\n        sum))),\n   print(sum(array(1, 2, 3))))\n");
// comments
console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}
console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}
