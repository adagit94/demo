export type PrimitiveValue = string | number | boolean;

export type Variadic<T, U extends unknown[] = []> = (...args: U) => T;
export type ImmutableGetter<T> = () => Readonly<T>;
