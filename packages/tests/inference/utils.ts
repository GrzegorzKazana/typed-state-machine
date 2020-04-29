export type IsAssignable<T, U> = [T] extends [U] ? true : false;
export type IsNotAssignable<T, U> = [T] extends [U] ? false : true;
export type HasProperties<T, Props> = IsAssignable<Props, keyof T>;
export type NotHasProperties<T, Props> = IsNotAssignable<Props, keyof T>;
export type HasOnlyProperties<T, Props> = [Props] extends [keyof T]
    ? [keyof T] extends [Props]
        ? true
        : false
    : false;
