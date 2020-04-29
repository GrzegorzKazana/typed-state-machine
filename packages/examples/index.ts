import { stateless } from '@/index';

type States = {
    idle: { a: number };
    pending: { b: number };
    fetched: { c: number };
    failed: { d: number };
};

const transitions = {
    idle: ['pending'],
    pending: ['fetched', 'failed'],
    fetched: ['idle', 'fetched'],
    failed: ['pending'],
} as const;

const initMachine = stateless<keyof States, States, typeof transitions>(transitions);

const idleMachine = initMachine('idle', { a: 0 });
// idleMachine.value.a === 0
const pendingMachine = idleMachine.pending({ b: 1 });
// pendingMachine.value.b === 1
const _fetchedMachine = pendingMachine.fetched({ c: 2 });
// _fetchedMachine.value.c === 2
