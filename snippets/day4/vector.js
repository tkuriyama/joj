// A vector type
// Write a class Vec that represents a vector in two-dimensional space. It takes x and y parameters (numbers), which it should save to properties of the same name.

// Give the Vec prototype two methods, plus and minus, that take another vector as a parameter and return a new vector that has the sum or difference of the two vectors’ (this and the parameter) x and y values.

// Add a getter property length to the prototype that computes the length of the vector—that is, the distance of the point (x, y) from the origin (0, 0).


// OLOO

const MyVec =  {
    init(x, y) {
        this.x = x,
        this.y = y
        return this;
    },

    plus(v2) {
        return Object.create(MyVec)
            .init(this.x + v2.x, this.y + v2.y);
    },

    minus(v2) {
        return Object.create(MyVec)
            .init(this.x - v2.x, this.y - v2.y);
    },

    get length() {
        return Math.sqrt(this.x**2 + this.y**2);
    }
}

// class

class Vec {

    constructor(x, y) {
        this.x = x,
        this.y = y;
    }

    plus(v2) {
        return new Vec(this.x + v2.x, this.y + v2.y);
    }

    minus(v2) {
        return new Vec(this.x - v2.x, this.y - v2.y);
    }

    get length() {
        return Math.sqrt(this.x**2 + this.y**2);
    }
}


/*----------------------------------------------------------------------------*/


const v1 = Object.create(MyVec).init(1, 2);
const v2 = Object.create(MyVec).init(2, 3);
const v3 = Object.create(MyVec).init(3, 4);
console.log("OLOO v1, v2", v1, v2);

console.log("Class", new Vec(1, 2).plus(new Vec(2, 3)));
console.log("OLOO", v1.plus(v2));
// → Vec{x: 3, y: 5}

console.log("Class", new Vec(1, 2).minus(new Vec(2, 3)));
console.log("OLOO", v1.minus(v2));
// → Vec{x: -1, y: -1}

console.log("Class", new Vec(3, 4).length);
console.log("OLOO", v3.length);
// → 5
