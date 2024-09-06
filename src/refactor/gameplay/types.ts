export type Ranged<T> = { [P in keyof T]?: [T[P], T[P]] | undefined };

export type Range<T> = [T, T];

export type FilterStartsWith<Set, Prefix extends string> = Set extends `${Prefix}${infer _X}` ? Set : never;
