export type States = {
    idle: { a: number };
    pending: { b: number };
    fetched: { c: number };
    failed: { d: number };
};

export const transitions = {
    idle: ['pending'],
    pending: ['fetched', 'failed'],
    fetched: ['idle', 'fetched'],
    failed: ['pending'],
} as const;
