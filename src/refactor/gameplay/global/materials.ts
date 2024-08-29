export enum MaterialTags {
  Lumber,
  Stone,
  Metal,
  Thread,
  Cloth,
  Ingredient,
  Sharp,
}

// prettier-ignore
export enum MaterialRank { S, A, B, C, D, }

export type Material = {
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
