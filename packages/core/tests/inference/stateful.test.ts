import { assert, IsExact } from 'conditional-type-checks';

import { stateful, ArrayUnion } from '@/index';
import { States, transitions } from '../mocks';
import { HasProperties } from './utils';

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

    it('correctly infers state for transition handler', () => {
        const _ = stateful<keyof States, States, typeof transitions>(transitions, {
            idle: state => assert<IsExact<typeof state, States['idle']>>(true),
            pending: state => assert<IsExact<typeof state, States['pending']>>(true),
            fetched: state => assert<IsExact<typeof state, States['fetched']>>(true),
            failed: state => assert<IsExact<typeof state, States['failed']>>(true),
        });
    });

    it('correctly infers possible transitions in transition handlers', () => {
        const _ = stateful<keyof States, States, typeof transitions>(transitions, {
            idle: (_, t) =>
                assert<HasProperties<typeof t, ArrayUnion<typeof transitions['idle']>>>(true),
            pending: (_, t) =>
                assert<HasProperties<typeof t, ArrayUnion<typeof transitions['pending']>>>(true),
            fetched: (_, t) =>
                assert<HasProperties<typeof t, ArrayUnion<typeof transitions['fetched']>>>(true),
            failed: (_, t) =>
                assert<HasProperties<typeof t, ArrayUnion<typeof transitions['failed']>>>(true),
        });
    });

    it('correctly infers statetype in transition handlers', () => {
        const _ = stateful<keyof States, States, typeof transitions>(transitions, {
            idle: (_, t) =>
                assert<IsExact<Parameters<typeof t['pending']>[0], States['pending']>>(true),
            pending: (_, t) => {
                assert<IsExact<Parameters<typeof t['fetched']>[0], States['fetched']>>(true);
                assert<IsExact<Parameters<typeof t['failed']>[0], States['failed']>>(true);
            },
            fetched: (_, t) => {
                assert<IsExact<Parameters<typeof t['idle']>[0], States['idle']>>(true);
                assert<IsExact<Parameters<typeof t['fetched']>[0], States['fetched']>>(true);
            },
            failed: (_, t) =>
                assert<IsExact<Parameters<typeof t['pending']>[0], States['pending']>>(true),
        });
    });
});
