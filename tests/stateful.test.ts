import { stateful } from '../src/index';
import { States, transitions } from './mocks';

describe('when creating statefull state machine', () => {
    it('is correctly initialized', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        const result = machine.fold({
            idle: state => state.a + 1,
            pending: state => `${state.b}`,
            fetched: () => 0,
            failed: () => 'a',
        });

        machine.transition({
            idle: ({ pending }) => pending({ b: 2 }),
            pending: ({ failed }) => failed({ d: 3 }),
        });
    });
});
