"use strict";
/*----------------------------------------------------------------------------*/
// Vectors
class Vec {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}
/*----------------------------------------------------------------------------*/
// Game Classes
class Level {
    width;
    height;
    rows;
    startActors;
    constructor(plan) {
        let rows = plan.trim().split("\n").map((l) => l.split(''));
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                if (ch == ".") {
                    return "empty";
                }
                else if (ch == "#") {
                    return "wall";
                }
                else if (ch == "+") {
                    return "lava";
                }
                else if (ch == "@") {
                    this.startActors.push(Player.create(new Vec(x, y)));
                }
                else if (ch == "0") {
                    this.startActors.push(Coin.create(new Vec(x, y)));
                }
                else if (ch == "=" || ch == "|" || ch == "v") {
                    this.startActors.push(Lava.create(new Vec(x, y), ch));
                }
                return "empty";
            });
        });
    }
}
class State {
    level;
    actors;
    status;
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }
    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    get player() {
        return this.actors.find((a) => a.type == "player");
    }
}
class Player {
    pos;
    speed;
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    get type() { return "player"; }
    static create(pos) {
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
    }
}
class Lava {
    pos;
    speed;
    reset;
    constructor(pos, speed, reset = false) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }
    get type() { return "lava"; }
    static create(pos, ch) {
        if (ch == "=") {
            return new Lava(pos, new Vec(2, 0));
        }
        else if (ch == "|") {
            return new Lava(pos, new Vec(0, 2));
        }
        else {
            return new Lava(pos, new Vec(0, 3), true);
        }
    }
}
class Coin {
    size = new Vec(0.6, 0.0);
    pos;
    basePos;
    wobble;
    constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
    }
    get type() { return "coin"; }
    static create(pos) {
        let basePos = pos.plus(new Vec(0.2, 0.1));
        return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
    }
}
Coin.prototype.size = new Vec(0.6, 0.6);
/*----------------------------------------------------------------------------*/
// Test
let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;
let simpleLevel = new Level(simpleLevelPlan);
console.log(`${simpleLevel.width} by ${simpleLevel.height} `);
// → 22 by 9
