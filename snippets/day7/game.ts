

/*----------------------------------------------------------------------------*/
// Type Aliases


type Actor = Player | Coin | Lava


interface Collide {
    collide: ((s: State) => State)
}


interface Update {
    update: ((time: number, state: State, keys: object) => State)
}


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
// Level


class Level {
    width: number;
    height: number;
    rows: Array<Array<string>>;
    startActors: Array<Actor>;
    touches: ((pos: Vec, size: Vec, elem: string) => boolean);

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
                    return "lava";
                } else {
                    const v = new Vec(x, y);
                    if (ch == "@") {
                        this.startActors.push(Player.create(v));
                    } else if (ch == "0") {
                        this.startActors.push(Coin.create(v));
                    } else if (ch == "=" || ch == "|" || ch == "v") {
                        this.startActors.push(Lava.create(v, ch));
                    }
                    return "empty";
                }
            });
        });
    }
}


Level.prototype.touches = function(pos: Vec, size: Vec, elem: string): boolean {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let isOutside = x < 0 || x >= this.width ||
                y < 0 || y >= this.height;
            let here = isOutside ? "wall" : this.rows[y][x];
            if (here == elem) return true;
        }
    }
    return false;
};




/*----------------------------------------------------------------------------*/
// State


class State implements (Update) {
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


State.prototype.update =
    function(time: number, _: string, keys: object): State {
        let actors = this.actors
            .map(actor => actor.update(time, this, keys));
        let newState = new State(this.level, actors, this.status);

        if (newState.status != "playing") return newState;

        let player = newState.player;
        if (this.level.touches(player.pos, player.size, "lava")) {
            return new State(this.level, actors, "lost");
        }

        for (let actor of actors) {
            if (actor != player && overlap(actor, player)) {
                newState = actor.collide(newState);
            }
        }
        return newState;
    };


/*----------------------------------------------------------------------------*/
// Player


class Player {
    size: Vec = new Vec(0.8, 1.5);
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

Player.prototype.size = new Vec(0.8, 1.5);


/*----------------------------------------------------------------------------*/
// Lava

class Lava implements Collide, Update {
    size: Vec = new Vec(1, 1);
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

Lava.prototype.size = new Vec(1, 1);

Lava.prototype.collide = function(state: State): State {
    return new State(state.level, state.actors, "lost");
};

Lava.prototype.update =
    function(time: number, state: State, _: object): Lava {
        let newPos = this.pos.plus(this.speed.times(time));
        if (!state.level.touches(newPos, this.size, "wall")) {
            return new Lava(newPos, this.speed, this.reset);
        } else if (this.reset) {
            return new Lava(this.reset, this.speed, this.reset);
        } else {
            return new Lava(this.pos, this.speed.times(-1));
        }
    };

/*----------------------------------------------------------------------------*/
// Coin


class Coin implements Collide {
    size: Vec = new Vec(0.6, 0.6);
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

Coin.prototype.collide = function(state: State): State {
    let filtered = state.actors.filter(a => a != this);
    let status = state.status;
    if (!filtered.some(a => a.type == "coin")) status = "won";
    return new State(state.level, filtered, status);
};

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


/*----------------------------------------------------------------------------*/
// Display


class DOMDisplay {
    dom: HTMLElement;
    actorLayer: null | HTMLElement;
    syncState: ((s: State) => void);
    scrollPlayerIntoView: ((s: State) => void);

    constructor(parent: HTMLElement, level: Level) {
        this.dom = elt("div", { class: "game" }, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }

    clear() { this.dom.remove(); }
}


DOMDisplay.prototype.syncState = function(state: State) {
    if (this.actorLayer === null) {
        this.actorLayer.remove();
    } else {
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
    }
};


DOMDisplay.prototype.scrollPlayerIntoView = function(state: State) {
    let width = this.dom.clientWidth;
    let height = this.dom.clientHeight;
    let margin = width / 3;

    // The viewport
    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;

    let player = state.player;
    let center = player.pos.plus(player.size.times(0.5))
        .times(scale);

    if (center.x < left + margin) {
        this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
        this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
        this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
        this.dom.scrollTop = center.y + margin - height;
    }
};


/*----------------------------------------------------------------------------*/
// Draw


function elt(name: string,
    attrs: { [key: string]: string },
    ...children: Array<HTMLElement>): HTMLElement {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of children) {
        dom.appendChild(child);
    }
    return dom;
}


const scale: number = 20;

function drawGrid(level: Level): HTMLElement {
    const attrs = {
        class: "background",
        style: `width: ${level.width * scale}px`
    }
    return elt("table",
        attrs,
        ...level.rows.map(row =>
            elt("tr", { style: `height: ${scale}px` },
                ...row.map(type => elt("td", { class: type })))
        ));
}


function drawActors(actors: Array<Actor>): HTMLElement {
    return elt("div",
        {},
        ...actors.map(actor => {
            let rect = elt("div", { class: `actor ${actor.type}` });
            rect.style.width = `${actor.size.x * scale}px`;
            rect.style.height = `${actor.size.y * scale}px`;
            rect.style.left = `${actor.pos.x * scale}px`;
            rect.style.top = `${actor.pos.y * scale}px`;
            return rect;
        }));
}


/*----------------------------------------------------------------------------*/
// Collision

function overlap(actor1: Actor, actor2: Actor): boolean {
    return actor1.pos.x + actor1.size.x > actor2.pos.x &&
        actor1.pos.x < actor2.pos.x + actor2.size.x &&
        actor1.pos.y + actor1.size.y > actor2.pos.y &&
        actor1.pos.y < actor2.pos.y + actor2.size.y;
}
