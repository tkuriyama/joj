export = {};


/*----------------------------------------------------------------------------*/
// ConsList


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


function toArray<T>(xs: ConsList<T>): Array<T> {
    return toArrayHelper(xs, []);
}

function toArrayHelper<T>(xs: ConsList<T>, arr: Array<T>): Array<T> {
    if (xs === null) {
        return arr;
    }
    else {
        let [h, t] = xs
        arr.push(h);
        return toArrayHelper(t, arr);
    }
}

/*----------------------------------------------------------------------------*/
// Fold++


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


function concat<T>(xs: ConsList<T>, ys: ConsList<T>): ConsList<T> {
    if (xs === null) {
        return ys;
    }
    else {
        let [h, t] = xs
        return cons(h, concat(t, ys));
    }
}


function flatten<T>(xss: ConsList<ConsList<T>>): ConsList<T> {
    return foldR((a, b) => concat(a, b), empty as ConsList<T>, xss);
}

/*----------------------------------------------------------------------------*/
// Tests


const xs = fromArray([1, 2, 3]);
const ys = fromArray([4, 5, 6]);
const zs = fromArray([7, 8, 9]);


let empty = null as ConsList<number>;
console.log('Foldr cons', foldR((a, b) => cons(a, b), empty, xs));

console.log('MapFoldR (+1)', mapFoldR(x => x + 1, xs));

console.log('Concat |> toArray', toArray(concat(xs, ys)));

const nested = fromArray([xs, ys, zs]) as ConsList<ConsList<number>>;
console.log('Flatten |> toArray', toArray(flatten(nested)));

