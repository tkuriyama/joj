/*
Groups
The standard JavaScript environment provides another data structure called Set. Like an instance of Map, a set holds a collection of values. Unlike Map, it does not associate other values with those—it just tracks which values are part of the set. A value can be part of a set only once—adding it again doesn’t have any effect.

Write a class called Group (since Set is already taken). Like Set, it has add, delete, and has methods. Its constructor creates an empty group, add adds a value to the group (but only if it isn’t already a member), delete removes its argument from the group (if it was a member), and has returns a Boolean value indicating whether its argument is a member of the group.

Use the === operator, or something equivalent such as indexOf, to determine whether two values are the same.

Give the class a static from method that takes an iterable object as argument and creates a group that contains all the values produced by iterating over it.

Iterable groups
Make the Group class from the previous exercise iterable. Refer to the section about the iterator interface earlier in the chapter if you aren’t clear on the exact form of the interface anymore.

If you used an array to represent the group’s members, don’t just return the iterator created by calling the Symbol.iterator method on the array. That would work, but it defeats the purpose of this exercise.

It is okay if your iterator behaves strangely when the group is modified during iteration.

*/


class Group<T> {
    members: Array<T>;

    constructor(xs: Array<T>) {
        this.members = xs;
    }

    has(x: T): boolean {
        return this.members.indexOf(x) >= 0;
    }

    add(x: T) {
        if (!this.has(x)) {
            this.members.push(x);
        }
    }

    delete(x: T) {
        if (this.has(x)) {
            const i = this.members.indexOf(x);
            this.members.splice(i, 1);
        }
    }

    static from<U>(xs: Array<U>): Group<U> {
        return new Group(xs);
    }

    [Symbol.iterator] = () => new GroupIterator(this.members);
}


class GroupIterator<T> {
    members: Array<T>
    i: number
    end: number

    constructor(members: Array<T>) {
        this.members = members;
        this.i = 0;
        this.end = this.members.length;
    }

    next() {
        if (this.i == this.end) {
            return { done: true }
        }
        else {
            this.i += 1;
            return {
                value: this.members[this.i - 1],
                done: false
            };
        }
    }

}


/*----------------------------------------------------------------------------*/


let group = Group.from([10, 20]);
console.log(group.has(10));
// → true

console.log(group.has(30));
// → false

group.add(10);
group.delete(10);
console.log(group.has(10));
// → false


for (let value of group) {
    console.log(value);
}


for (let value of Group.from(["a", "b", "c"])) {
    console.log(value);
}

// → a
// → b
// → c
