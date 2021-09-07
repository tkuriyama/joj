/*----------------------------------------------------------------------------*/
// Type Aliases
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
    touches;
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
                else {
                    const v = new Vec(x, y);
                    if (ch == "@") {
                        this.startActors.push(Player.create(v));
                    }
                    else if (ch == "0") {
                        this.startActors.push(Coin.create(v));
                    }
                    else if (ch == "=" || ch == "|" || ch == "v") {
                        this.startActors.push(Lava.create(v, ch));
                    }
                    return "empty";
                }
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
    size = new Vec(0.8, 1.5);
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
Player.prototype.size = new Vec(0.8, 1.5);
class Lava {
    size = new Vec(1, 1);
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
Lava.prototype.size = new Vec(1, 1);
class Coin {
    size = new Vec(0.6, 0.6);
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
/*----------------------------------------------------------------------------*/
// Display
class DOMDisplay {
    dom;
    actorLayer;
    syncState;
    scrollPlayerIntoView;
    constructor(parent, level) {
        this.dom = elt("div", { class: "game" }, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }
    clear() { this.dom.remove(); }
}
DOMDisplay.prototype.syncState = function (state) {
    if (this.actorLayer === null) {
        this.actorLayer.remove();
    }
    else {
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
    }
};
DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
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
    }
    else if (center.x > right - margin) {
        this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
        this.dom.scrollTop = center.y - margin;
    }
    else if (center.y > bottom - margin) {
        this.dom.scrollTop = center.y + margin - height;
    }
};
/*----------------------------------------------------------------------------*/
// Draw
function elt(name, attrs, ...children) {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of children) {
        dom.appendChild(child);
    }
    return dom;
}
const scale = 20;
function drawGrid(level) {
    const attrs = {
        class: "background",
        style: `width: ${level.width * scale}px`
    };
    return elt("table", attrs, ...level.rows.map(row => elt("tr", { style: `height: ${scale}px` }, ...row.map(type => elt("td", { class: type })))));
}
function drawActors(actors) {
    return elt("div", {}, ...actors.map(actor => {
        let rect = elt("div", { class: `actor ${actor.type}` });
        rect.style.width = `${actor.size.x * scale}px`;
        rect.style.height = `${actor.size.y * scale}px`;
        rect.style.left = `${actor.pos.x * scale}px`;
        rect.style.top = `${actor.pos.y * scale}px`;
        return rect;
    }));
}
/*----------------------------------------------------------------------------*/
// Movement and Collision
Level.prototype.touches = function (pos, size, elem) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);
    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let isOutside = x < 0 || x >= this.width ||
                y < 0 || y >= this.height;
            let here = isOutside ? "wall" : this.rows[y][x];
            if (here == elem)
                return true;
        }
    }
    return false;
};
