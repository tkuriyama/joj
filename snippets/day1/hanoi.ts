
type Peg = string

type Move = [Peg, Peg]

function hanoi(n: number, p1: Peg, p2: Peg, p3: Peg): Move[] {
    if (n === 0) {
        return []
    }
    else {
        return hanoi(n - 1, p1, p3, p2).concat(
            [[p1, p2]],
            hanoi(n - 1, p3, p2, p1)
        )
    }
}
