"use strict";
// Constructors
function cons(head, tail) {
    return [head, tail];
}
function fromArray(arr) {
    let xs = null;
    for (let i = arr.length - 1; i >= 0; i--) {
        xs = cons(arr[i], xs);
    }
    return xs;
}
// Map
function map(f, xs) {
    if (xs === null) {
        return null;
    }
    else {
        let [h, t] = xs;
        return cons(f(h), map(f, t));
    }
}
// Fold
function foldR(f, acc, xs) {
    if (xs === null) {
        return acc;
    }
    else {
        let [h, t] = xs;
        return f(h, foldR(f, acc, t));
    }
}
function mapFoldR(f, xs) {
    let empty = null;
    return foldR((a, b) => cons(f(a), b), empty, xs);
}
// tests
const xs = fromArray([1, 2, 3]);
console.log(map(x => x + 1, xs));
let empty = null;
console.log(foldR((a, b) => cons(a, b), empty, xs));
console.log(mapFoldR(x => x + 1, xs));
module.exports = {};
