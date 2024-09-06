import { Range } from "../types";

export enum MaterialTags {
  Lumber,
  Stone,
  Metal,
  Thread,
  Cloth,
  Ingredient,
  Sharp,
  Slime,
  Gel,
  Boss,
  Red,
  RedDye,
  CherryFlavor,
}

// prettier-ignore
export enum MaterialRank { S, A, B, C, D, }

export type MaterialDefinition = {
  type: "MD";

  name: string;

  tags: MaterialTags[];
  /** min 1, max 5 */
  rank: MaterialRank;
  /** min 1, max 100 */
  quality: Range<number>;
  /** min 1, max 999 */
  quantity: Range<number>;
  /** min 1, max 100 */
  durability: Range<number>;
};

export type Material = {
  type: "M";

  name: string;

  tags: MaterialTags[];
  /** min 1, max 5 */
  rank: MaterialRank;
  /** min 1, max 100 */
  quality: number;
  /** min 1, max 999 */
  quantity: number;
  /** min 1, max 100 */
  durability: number;
};

export type MaterialRequirement = {
  tags: MaterialTags[];
  /** min 1, max 5 */
  minRank: MaterialRank;
  /** min 1, max 100 */
  minQuality: number;
  /** min 1, max 999 */
  minQuantity: number;
  /** min 1, max 100 */
  minDurability: number;
};
