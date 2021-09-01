"use strict";
// SImple Recursive Fib
function fib_rec(n) {
    if (n <= 0) {
        return 0;
    }
    else if (n === 1) {
        return 1;
    }
    else {
        return fib_rec(n - 1) + fib_rec(n - 2);
    }
}
// Efficient Recursive Fib
function fib_helper(a, b, i, n) {
    return (i >= n ? b : fib_helper(b, a + b, i + 1, n));
}
function fib(n) {
    return (n <= 0 ? n : fib_helper(0, 1, 1, n));
}
// Memoization
function fibMemo(n) {
    const memo = [0, 1];
    function f(n) {
        const result = memo[n];
        if (typeof result !== 'number') {
            const sum = f(n - 1) + f(n - 2);
            memo[n] = sum;
            return sum;
        }
        else {
            return result;
        }
    }
    return f(n);
}
// Equality Test
function fibTest(n) {
    return fib(n) === fib_rec(n) && fib(n) === fibMemo(n);
}
