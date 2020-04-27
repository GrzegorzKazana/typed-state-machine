import { assert, IsExact } from 'conditional-type-checks';

import { stateful } from '@/index';
import { States, transitions } from '../mocks';
import { HasProperties, NotHasProperties, IsAssignable } from './utils';

describe('type inference of stateless state machine', () => {
    it('has propper props', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        assert<HasProperties<typeof machine, 'value' | 'state' | 'transition'>>(true);
    });

    it('infers folded type if exhaustive', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });
        const result = machine.fold({
            idle: () => 1,
            pending: () => 'a',
            fetched: () => 2,
            failed: () => 'b',
        });

        assert<IsExact<typeof result, number | string>>(true);
    });

    it('infers folded type if not exhaustive', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });
        const result = machine.fold({
            idle: () => 1,
            pending: () => 'a',
        });

        assert<IsExact<typeof result, number | string | null>>(true);
    });
});
