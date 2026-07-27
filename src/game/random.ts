const MODULUS = 2 ** 32;
const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;

export interface SeedStep {
  seed: number;
  value: number;
}

export const stepSeed = (seed: number): SeedStep => {
  const nextSeed = (Math.imul(seed, MULTIPLIER) + INCREMENT) >>> 0;
  return {
    seed: nextSeed,
    value: nextSeed / MODULUS
  };
};

export const uniformIntFromSeed = (
  seed: number,
  min: number,
  max: number
): { seed: number; value: number } => {
  const { seed: nextSeed, value } = stepSeed(seed);
  const scaled = min + Math.floor(value * (max - min + 1));
  return {
    seed: nextSeed,
    value: Math.min(max, scaled)
  };
};

export const createSeed = () => {
  const randomBits = Math.floor(Math.random() * MODULUS);
  return (Date.now() ^ randomBits) >>> 0;
};
