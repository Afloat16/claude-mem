type Handler = (value: number) => number;
export const angleAsserted = <Handler>((value: number) => value + 1);
export class AngleStore {
  angleAsserted = <Handler>((value: number) => value + 2);
}
