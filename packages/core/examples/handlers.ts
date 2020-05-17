import { stateful, TransitionHandlers } from '@/index';
import mockApi from './mockApi';

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

const handlers: TransitionHandlers<keyof States, States, typeof transitions> = {
    pending: to =>
        mockApi
            .fetchTodos()
            .then(data => to.fetched({ data }))
            .catch(error => to.failed({ error })),
};

const initMachine = stateful<keyof States, States, typeof transitions>(transitions, handlers);
const machine = initMachine('idle', { message: 'hello' });

machine.transition({
    // will change state to 'pending' and trigger hendlers['pending']
    // which in turn will asynchronously trigger change to 'fetched' or 'failed'
    idle: to => to.pending({ requestTime: new Date() }),
});
