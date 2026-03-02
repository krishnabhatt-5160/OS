// Helper functions for generating scrambles and parsing Singmaster notation

const FACES = ['U', 'D', 'F', 'B', 'L', 'R'];
const MODIFIERS = ['', "'", '2'];

export function generateScramble(length: number = 20): string[] {
  const scramble: string[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    let randomFace = FACES[Math.floor(Math.random() * FACES.length)];
    // Prevent same face twice in a row
    while (randomFace === lastFace) {
      randomFace = FACES[Math.floor(Math.random() * FACES.length)];
    }
    const randomModifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    scramble.push(`${randomFace}${randomModifier}`);
    lastFace = randomFace;
  }

  return scramble;
}

export function getInverseSequence(sequence: string[]): string[] {
  return [...sequence].reverse().map(move => {
    if (move.endsWith("'")) return move[0];
    if (move.endsWith("2")) return move; // 2 is its own inverse
    return move + "'";
  });
}

// Axis definition for the 3D engine
export type Axis = 'x' | 'y' | 'z';
export interface ParsedMove {
  axis: Axis;
  layerFilter: (pos: number) => boolean;
  angle: number;
}

export function parseMoveFor3D(moveStr: string): ParsedMove {
  const face = moveStr[0];
  const mod = moveStr.length > 1 ? moveStr[1] : '';
  
  let multiplier = 1;
  if (mod === "'") multiplier = -1;
  if (mod === "2") multiplier = 2;

  const HALF_PI = Math.PI / 2;

  switch (face) {
    case 'R': return { axis: 'x', layerFilter: (x) => x > 0.5, angle: -HALF_PI * multiplier };
    case 'L': return { axis: 'x', layerFilter: (x) => x < -0.5, angle: HALF_PI * multiplier };
    case 'U': return { axis: 'y', layerFilter: (y) => y > 0.5, angle: -HALF_PI * multiplier };
    case 'D': return { axis: 'y', layerFilter: (y) => y < -0.5, angle: HALF_PI * multiplier };
    case 'F': return { axis: 'z', layerFilter: (z) => z > 0.5, angle: -HALF_PI * multiplier };
    case 'B': return { axis: 'z', layerFilter: (z) => z < -0.5, angle: HALF_PI * multiplier };
    default: return { axis: 'x', layerFilter: () => false, angle: 0 };
  }
}
