import { stateful } from '@/index';

type States = {
    idle: { message: string };
    pending: { requestTime: Date };
    fetched: { data: string[] };
    failed: { error: Error };
};

const transitions = {
    idle: ['pending'],
    pending: ['fetched', 'failed'],
    fetched: [],
    failed: ['pending'],
} as const;

const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
const machine = initMachine('idle', { message: 'hello' });

// reading current state
machine.isInState('idle'); // true
machine.getOr('idle'); // { message: 'hello' }
machine.getOr('pending', null); // null

// triggering transition
machine.transition({
    // if current state is idle, transition to 'pending'
    idle: to => to.pending({ requestTime: new Date() }),
    // if current state is pending, transtion to failed,
    // and set state based on previous
    pending: (to, state) =>
        to.failed({ error: new Error(`Request started at ${state.requestTime} failed.`) }),
});

// matching and mapping current state (does not need to be exhaustive)
machine.fold({
    idle: ({ message }) => message,
    pending: ({ requestTime }) => `Request started at ${requestTime}.`,
    fetched: ({ data }) => `Fetched ${data.length} element(s)`,
    failed: ({ error }) => error.message,
});
