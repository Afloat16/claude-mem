type Handler = (value: number) => number;
export const asserted = ((value: number) => value + 1) as Handler;
export let satisfied = ((value: number) => value + 2) satisfies Handler;
export var nonnull = (((value: number) => value + 3))!;
export const combined = (((((value: number) => value + 4) satisfies Handler) as Handler)!);
export const specialized = (function identity<T>(value: T) { return value; })<number>;

export class TypedStore {
  asserted = ((value: number) => value + 5) as Handler;
  satisfied = ((value: number) => value + 6) satisfies Handler;
  nonnull = (((value: number) => value + 7))!;
  combined = (((((value: number) => value + 8) satisfies Handler) as Handler)!);
  specialized = (function identity<T>(value: T) { return value; })<number>;
  data = (17 as number)!;
  callbacks = ({ callback: () => 18 } satisfies { callback: () => number });
}
