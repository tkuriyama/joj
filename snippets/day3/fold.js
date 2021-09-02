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
function toArray(xs) {
    return toArrayHelper(xs, []);
}
function toArrayHelper(xs, arr) {
    if (xs === null) {
        return arr;
    }
    else {
        let [h, t] = xs;
        arr.push(h);
        return toArrayHelper(t, arr);
    }
}
/*----------------------------------------------------------------------------*/
// Fold++
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
function concat(xs, ys) {
    if (xs === null) {
        return ys;
    }
    else {
        let [h, t] = xs;
        return cons(h, concat(t, ys));
    }
}
function flatten(xss) {
    return foldR((a, b) => concat(a, b), empty, xss);
}
/*----------------------------------------------------------------------------*/
// Tests
const xs = fromArray([1, 2, 3]);
const ys = fromArray([4, 5, 6]);
const zs = fromArray([7, 8, 9]);
let empty = null;
console.log('Foldr cons', foldR((a, b) => cons(a, b), empty, xs));
console.log('MapFoldR (+1)', mapFoldR(x => x + 1, xs));
console.log('Concat |> toArray', toArray(concat(xs, ys)));
const nested = fromArray([xs, ys, zs]);
console.log('Flatten |> toArray', toArray(flatten(nested)));
module.exports = {};
