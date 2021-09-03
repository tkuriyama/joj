
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const Pair = (left, right) => 
  compose(Object.seal, Object.freeze)({
    left,
    right,
    toString: () => `Pair [${left}, ${right}]`
  });

console.log(Pair(0, 1).toString());
