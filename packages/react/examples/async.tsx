import mockApi from './mockApi';
import createUseStateMachine, { TransitionHandlers } from '@/index';

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

const useMachine = createUseStateMachine<keyof States, States, typeof transitions>(
    transitions,
    handlers,
);

const App = () => {
    const machine = useMachine('idle', { message: 'hello' });

    return machine.fold({
        idle: ({ message }, to) => (
            <button onClick={() => to.pending({ requestTime: new Date() })}>
                {`Fetch data (${message})`}
            </button>
        ),
        pending: ({ requestTime }) => <h4>{`Waiting since ${requestTime}`}</h4>,
        fetched: ({ data }) => (
            <ul>
                {data.map(info => (
                    <li>{info}</li>
                ))}
            </ul>
        ),
        failed: ({ error }) => <h4>{`Request failed with error: ${error.message}`}</h4>,
    });
};
