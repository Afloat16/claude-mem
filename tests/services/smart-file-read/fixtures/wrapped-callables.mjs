export const parenthesizedArrow = (((value) => {
  return value + 1;
}));
export let parenthesizedFunction = (((function internalName(value) {
  return value + 2;
})));
export var parenthesizedGenerator = (((function* internalGenerator(value) {
  yield value + 3;
})));
export const parenthesizedAsync = ((async value => value + 4));
export const directControl = value => value + 5;

export class WrappedStore {
  deep = ((( /* grouping comment */ (value) => {
    return value + 6;
  })));
  #hidden = (((() => 7)));
  "quoted" = (((function () { return 8; })));
  [Symbol.iterator] = (((function* () { yield 9; })));
  ordinary() { return 10; }
}
