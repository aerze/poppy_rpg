import { Range } from "../refactor/gameplay/types";

export function sleep(time = 250) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), time);
  });
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFromRange(range: Range<number>) {
  return getRandomInt(range[0], range[1]);
}

/**
 * @param {Array} arr
 * @returns
 */
export function getRandomFromArray<T>(arr: T[]): T | undefined {
  if (!arr.length) return;
  return arr[getRandomInt(0, arr.length - 1)];
}
