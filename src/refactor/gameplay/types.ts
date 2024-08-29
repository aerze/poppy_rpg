export type Ranged<T> = { [P in keyof T]?: [T[P], T[P]] | undefined };

export type Range<T> = [T, T];
