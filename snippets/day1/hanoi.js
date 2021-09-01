"use strict";
function hanoi(n, p1, p2, p3) {
    if (n === 0) {
        return [];
    }
    else {
        return hanoi(n - 1, p1, p3, p2).concat([[p1, p2]], hanoi(n - 1, p3, p2, p1));
    }
}
