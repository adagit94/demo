import { PrimitiveValue } from "types/CommonTypes";

export enum ValueType {
  // primitives
  Any = "any",
  Unknown = "unknown",
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Object = "object",
  NonNullObject = "nonNullObject",
  Record = "record",
  Array = "array",
  // nullable
  StringOrNull = "stringOrNull",
  NumberOrNull = "numberOrNull",
  BooleanOrNull = "booleanOrNull",
  // optional
  OptionalString = "optionalString",
  OptionalNumber = "optionalNumber",
  OptionalBoolean = "optionalBoolean",
}

export type ValueTypeToType<T extends ValueType> = T extends ValueType.Any
  ? any
  : T extends ValueType.Unknown
    ? unknown
    : T extends ValueType.String
      ? string
      : T extends ValueType.Number
        ? number
        : T extends ValueType.Boolean
          ? boolean
          : T extends ValueType.Object
            ? object
            : T extends ValueType.Record
              ? Record<string, unknown>
              : T extends ValueType.Array
                ? Array<unknown>
                : T extends ValueType.StringOrNull
                  ? string | null
                  : T extends ValueType.NumberOrNull
                    ? number | null
                    : T extends ValueType.BooleanOrNull
                      ? boolean | null
                      : T extends ValueType.OptionalString
                        ? string | undefined
                        : T extends ValueType.OptionalNumber
                          ? number | undefined
                          : T extends ValueType.OptionalBoolean
                            ? boolean | undefined
                            : never;

export type StringEnum = Record<string, string>; //TODO: is this the best base type for String Enums?

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export default class TypesUtils {
  public static hasProperty<X, Y extends PropertyKey>(obj: X, propertyName: Y): obj is X & Record<Y, unknown> {
    return obj instanceof Object && Object.prototype.hasOwnProperty.call(obj, propertyName);
  }

  public static hasProperties<X, Y extends PropertyKey>(
    obj: X,
    propertyNames: Array<Y>,
  ): obj is X & Record<Y, unknown> {
    return obj instanceof Object && propertyNames.every((prop) => Object.prototype.hasOwnProperty.call(obj, prop));
  }

  public static haveSameProperty(obj1: unknown, obj2: unknown): boolean {
    if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
    for (const key in obj1) {
      if (TypesUtils.hasProperty(obj2, key)) {
        return true;
      }
    }
    return false;
  }

  public static isRecord(given: unknown): given is Record<string, unknown> {
    // TODO Bylo by asi dobre otestovat nekolik dalsich veci:
    // 1. klice jsou typu string
    // 2. nejedna se napr. o nejakou javascriptovou instanci s metodami a konstruktorem
    return typeof given === "object" && given !== null;
  }

  public static isRecordObject = (arg: unknown): arg is Record<string | number, unknown> =>
    typeof arg === "object" && arg !== null && !Array.isArray(arg);

  public static isRecordsArray = (x: unknown): x is Record<string | number, unknown>[] =>
    Array.isArray(x) && x.every(TypesUtils.isRecordObject);

  public static getKeys<T extends Record<string, unknown>>(object: T): Array<keyof T> {
    return Object.keys(object) as Array<keyof T>;
  }

  public static listStringEnum<T extends StringEnum>(
    stringEnum: T,
  ): {
    keys: Array<keyof T>;
    values: Array<T[keyof T]>;
    entries: Array<[keyof T, T[keyof T]]>;
  } {
    const keys = TypesUtils.getKeys(stringEnum);

    let values = [];
    let entries: Array<[keyof T, T[keyof T]]> = [];

    for (const key of keys) {
      const value = stringEnum[key];

      values.push(value);
      entries.push([key, value]);
    }

    return { keys, values, entries };
  }

  public static isStringEnumValue<T extends StringEnum>(
    value: string | undefined | null,
    stringEnum: T,
  ): value is T[keyof T] {
    return (
      value !== null &&
      value !== undefined &&
      // check if value is in array of all possible values, so casting it to any is OK
      TypesUtils.listStringEnum(stringEnum).values.includes(value as any)
    );
  }

  // shouldnt values inside of the object be assigned in opposite way: display: key and value: obj[key]?
  public static listStringEnumForDxSelectBox(Enum: any): Array<{ display: string; value: string }> {
    return Object.keys(Enum).map((key) => ({
      value: key,
      display: Enum[key as keyof typeof Enum],
    }));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static isFunction(fun: unknown): fun is Function {
    return typeof fun === "function" || fun instanceof Function;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static isString(variable: unknown): variable is string {
    return typeof variable === "string" || variable instanceof String;
  }

  public static isNumber(variable: unknown): variable is number {
    return typeof variable === "number" || variable instanceof Number;
  }

  public static isBoolean(variable: unknown): variable is boolean {
    return typeof variable === "boolean" || variable instanceof Boolean;
  }

  public static isPrimitive(val: unknown): val is PrimitiveValue {
    return TypesUtils.isString(val) || TypesUtils.isNumber(val) || TypesUtils.isBoolean(val);
  }

  public static isAbraId = (variable: unknown): variable is string => {
    return (
      (typeof variable === "string" || variable instanceof String) && variable.match(/^[#~0-9A-Z][0-9A-Z]{9}$/) !== null
    );
  };

  public static deepObjectKeys(obj: { [key: string]: unknown }): Array<string> {
    const getPaths = (obj: { [key: string]: unknown } = {}, path = ""): Array<string> => {
      return Object.entries(obj).reduce((accumulator: Array<string>, [key, value]) => {
        let fullPath = path ? path + "." + key : key;
        return TypesUtils.isRecordObject(value)
          ? accumulator.concat(getPaths(value, fullPath))
          : accumulator.concat(fullPath);
      }, []);
    };

    return getPaths(obj);
  }

  public static isValueType = <T extends ValueType>(value: unknown, typeName: T): value is ValueTypeToType<T> => {
    switch (typeName) {
      case ValueType.Any:
      case ValueType.Unknown:
        return true;
      case ValueType.NonNullObject:
        return TypesUtils.isRecord(value);
      case ValueType.Record:
        return TypesUtils.isRecordObject(value);
      case ValueType.Array:
        return Array.isArray(value);
      case ValueType.OptionalString:
        return TypesUtils.isOptionalPrimitive(value, ValueType.String);
      case ValueType.OptionalNumber:
        return TypesUtils.isOptionalPrimitive(value, ValueType.Number);
      case ValueType.OptionalBoolean:
        return TypesUtils.isOptionalPrimitive(value, ValueType.Boolean);
      case ValueType.StringOrNull:
        return TypesUtils.isPrimitiveOrNull(value, ValueType.String);
      case ValueType.NumberOrNull:
        return TypesUtils.isPrimitiveOrNull(value, ValueType.Number);
      case ValueType.BooleanOrNull:
        return TypesUtils.isPrimitiveOrNull(value, ValueType.Boolean);
      default:
        return typeof value === typeName;
    }
  };

  private static isPrimitiveOrNull(
    value: unknown,
    typeName: ValueType.Boolean | ValueType.Number | ValueType.String,
  ): boolean {
    return value === null || TypesUtils.isValueType(value, typeName);
  }

  private static isOptionalPrimitive(
    value: unknown,
    typeName: ValueType.Boolean | ValueType.Number | ValueType.String,
  ): boolean {
    return value === undefined || TypesUtils.isValueType(value, typeName);
  }

  public static isNotEmptyString(s: string | undefined | null): s is string {
    return s !== undefined && s !== null && TypesUtils.isString(s) && s.length > 0;
  }

  public static hasStringProperty<X, Y extends PropertyKey>(obj: X, propertyName: Y): obj is X & Record<Y, string> {
    return this.hasProperty(obj, propertyName) && this.isString(obj[propertyName]);
  }

  public static isStringArray(arr: unknown): arr is string[] {
    if (!Array.isArray(arr)) return false;
    return arr.every((val) => TypesUtils.isString(val));
  }
}

export type RecursiveConversion<Obj extends object, ValueType> = {
  [k in keyof Obj]: Obj[k] extends object ? RecursiveConversion<Obj[k], ValueType> : ValueType;
};

export type RecursivePartial<Obj extends object> = Partial<{
  [k in keyof Obj]: Obj[k] extends object ? RecursivePartial<Obj[k]> : Obj[k];
}>;
