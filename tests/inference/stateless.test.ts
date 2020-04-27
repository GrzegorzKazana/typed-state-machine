import { assert, IsExact } from 'conditional-type-checks';

import { stateless } from '@/index';
import { States, transitions } from '../mocks';
import { HasProperties, NotHasProperties, IsAssignable } from './utils';

describe('type inference of stateless state machine', () => {
    const initMachine = stateless<keyof States, States, typeof transitions>(transitions);

    it('initialized machine has expected type', () => {
        const idleMachine = initMachine('idle', { a: 1 });
        const { value } = idleMachine;

        assert<IsExact<typeof value, { a: number }>>(true);
        assert<HasProperties<typeof idleMachine, 'value' | 'pending'>>(true);
        assert<NotHasProperties<typeof idleMachine, 'fetched' | 'failed'>>(true);
    });

    it('infers type of argument of transition function', () => {
        const idleMachine = initMachine('idle', { a: 1 });
        const { pending } = idleMachine;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assert<IsAssignable<typeof pending, (a: States['pending']) => any>>(true);
    });
});
