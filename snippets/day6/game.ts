
/*----------------------------------------------------------------------------*/
// Vectors


class Vec {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }

    plus(other: Vec) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor: number) {
        return new Vec(this.x * factor, this.y * factor);
    }
}


/*----------------------------------------------------------------------------*/
// Game Classes


class Level {
    width: number;
    height: number;
    rows: Array<Array<string>>;
    startActors: Array<Actor>;

    constructor(plan: string) {
        let rows = plan.trim().split("\n").map((l: string) => l.split(''))
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];

        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                if (ch == ".") {
                    return "empty";
                } else if (ch == "#") {
                    return "wall";
                } else if (ch == "+") {
                    return "lava"
                } else if (ch == "@") {
                    this.startActors.push(Player.create(new Vec(x, y)));
                } else if (ch == "0") {
                    this.startActors.push(Coin.create(new Vec(x, y)));
                } else if (ch == "=" || ch == "|" || ch == "v") {
                    this.startActors.push(Lava.create(new Vec(x, y), ch));
                }
                return "empty";
            });
        });
    }
}


class State {
    level: Level
    actors: Array<Actor>;
    status: string;

    constructor(level: Level, actors: Array<Actor>, status: string) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }

    static start(level: Level) {
        return new State(level, level.startActors, "playing");
    }

    get player() {
        return this.actors.find((a: Actor) => a.type == "player");
    }
}


class Player {
    pos: Vec;
    speed: Vec;

    constructor(pos: Vec, speed: Vec) {
        this.pos = pos;
        this.speed = speed;
    }

    get type() { return "player"; }

    static create(pos: Vec) {
        return new Player(
            pos.plus(new Vec(0, -0.5)),
            new Vec(0, 0)
        );
    }
}


class Lava {
    pos: Vec;
    speed: Vec;
    reset: boolean;

    constructor(pos: Vec, speed: Vec, reset: boolean = false) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }

    get type() { return "lava"; }

    static create(pos: Vec, ch: string) {
        if (ch == "=") {
            return new Lava(pos, new Vec(2, 0));
        } else if (ch == "|") {
            return new Lava(pos, new Vec(0, 2));
        } else {
            return new Lava(pos, new Vec(0, 3), true);
        }
    }
}


class Coin {
    size: Vec = new Vec(0.6, 0.0);
    pos: Vec;
    basePos: Vec;
    wobble: number;

    constructor(pos: Vec, basePos: Vec, wobble: number) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
    }

    get type() { return "coin"; }

    static create(pos: Vec) {
        let basePos = pos.plus(new Vec(0.2, 0.1));
        return new Coin(basePos, basePos,
            Math.random() * Math.PI * 2);
    }
}

Coin.prototype.size = new Vec(0.6, 0.6);



/*----------------------------------------------------------------------------*/
// Type Aliases


type Actor = Player | Coin | Lava


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
