export interface Tile {
  x: number;
  y: number;
}

export interface Grid {
  width: number;
  height: number;
  walkable(x: number, y: number): boolean;
}

/** Up, right, down, left. No diagonals: it's a tile game. */
export const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

export interface Search {
  /** Every reachable tile, nearest first. */
  order: Tile[];
  /** Steps from the start to `to` (start excluded), or null if unreachable. */
  pathTo(to: Tile): Tile[] | null;
}

/** Breadth-first search over walkable tiles. The start tile is always allowed. */
export function search(grid: Grid, start: Tile): Search {
  const w = grid.width;
  const key = (t: Tile) => t.y * w + t.x;
  const prev = new Map<number, number>([[key(start), -1]]);
  const order: Tile[] = [start];

  for (let i = 0; i < order.length; i++) {
    const t = order[i];
    for (const [dx, dy] of DIRS) {
      const n = { x: t.x + dx, y: t.y + dy };
      if (n.x < 0 || n.y < 0 || n.x >= w || n.y >= grid.height) continue;
      if (prev.has(key(n)) || !grid.walkable(n.x, n.y)) continue;
      prev.set(key(n), key(t));
      order.push(n);
    }
  }

  return {
    order,
    pathTo(to) {
      let k = key(to);
      if (!prev.has(k)) return null;
      const steps: Tile[] = [];
      while (k !== key(start)) {
        steps.push({ x: k % w, y: Math.floor(k / w) });
        k = prev.get(k)!;
      }
      return steps.reverse();
    },
  };
}
