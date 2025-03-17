export type PrimitiveValue = string | number | boolean;
export type RecordValue<T extends PropertyKey = PropertyKey> = Record<T, unknown>;