export = {};


type ConsList<T> =
    null |
    [T, ConsList<T>]


// Constructors

function cons<T>(head: T, tail: ConsList<T>): ConsList<T> {
    return [head, tail];
}


function fromArray<T>(arr: Array<T>): ConsList<T> {
    let xs: ConsList<T> = null;
    for (let i = arr.length - 1; i >= 0; i--) {
        xs = cons(arr[i], xs)
    }
    return xs;
}


// Map


function map<T, U>(f: (x: T) => U, xs: ConsList<T>): ConsList<U> {
    if (xs === null) {
        return null;
    }
    else {
        let [h, t] = xs;
        return cons(f(h), map(f, t));
    }
}


// Fold


function foldR<T, U>(
    f: ((x: T, acc: U) => U),
    acc: U,
    xs: ConsList<T>): U {

    if (xs === null) {
        return acc;
    }
    else {
        let [h, t] = xs
        return f(h, foldR(f, acc, t));
    }
}


function mapFoldR<T, U>(f: (x: T) => U, xs: ConsList<T>): ConsList<U> {
    let empty = null as ConsList<U>;
    return foldR((a, b) => cons(f(a), b), empty, xs);
}


// tests


const xs = fromArray([1, 2, 3]);

console.log(map(x => x + 1, xs));

let empty = null as ConsList<number>;
console.log(foldR((a, b) => cons(a, b), empty, xs));

console.log(mapFoldR(x => x + 1, xs));
