
// SImple Recursive Fib

function fib_rec(n: number): number {
    if (n <= 0) {
        return 0
    }
    else if (n === 1) {
        return 1
    }
    else {
        return fib_rec(n - 1) + fib_rec(n - 2)
    }
}


// Efficient Recursive Fib


function fib_helper(a: number, b: number, i: number, n: number): number {
    if (i >= n) {
        return b
    }
    else {
        return fib_helper(b, a + b, i + 1, n)
    }

}


function fib(n: number): number {
    if (n <= 0) {
        return n
    }
    else {
        return fib_helper(0, 1, 1, n)
    }
}


// Equality Test


function testFib(n: number): boolean {
    return fib(n) === fib_rec(n)
}
