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

    it('infers infers getOr return type without default', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });
        const result = machine.getOr('idle');

        assert<IsExact<typeof result, States['idle'] | undefined>>(true);
    });

    it('infers infers getOr return type with default', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });
        const result = machine.getOr('idle', null);

        assert<IsExact<typeof result, States['idle'] | null>>(true);
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
            idle: (_, state) => assert<IsExact<typeof state, States['idle']>>(true),
            pending: (_, state) => assert<IsExact<typeof state, States['pending']>>(true),
            fetched: (_, state) => assert<IsExact<typeof state, States['fetched']>>(true),
            failed: (_, state) => assert<IsExact<typeof state, States['failed']>>(true),
        });
    });

    it('correctly infers possible transitions in transition handlers', () => {
        const _ = stateful<keyof States, States, typeof transitions>(transitions, {
            idle: to =>
                assert<HasProperties<typeof to, ArrayUnion<typeof transitions['idle']>>>(true),
            pending: to =>
                assert<HasProperties<typeof to, ArrayUnion<typeof transitions['pending']>>>(true),
            fetched: to =>
                assert<HasProperties<typeof to, ArrayUnion<typeof transitions['fetched']>>>(true),
            failed: to =>
                assert<HasProperties<typeof to, ArrayUnion<typeof transitions['failed']>>>(true),
        });
    });

    it('correctly infers statetype in transition handlers', () => {
        const _ = stateful<keyof States, States, typeof transitions>(transitions, {
            idle: to =>
                assert<IsExact<Parameters<typeof to['pending']>[0], States['pending']>>(true),
            pending: to => {
                assert<IsExact<Parameters<typeof to['fetched']>[0], States['fetched']>>(true);
                assert<IsExact<Parameters<typeof to['failed']>[0], States['failed']>>(true);
            },
            fetched: to => {
                assert<IsExact<Parameters<typeof to['idle']>[0], States['idle']>>(true);
                assert<IsExact<Parameters<typeof to['fetched']>[0], States['fetched']>>(true);
            },
            failed: to =>
                assert<IsExact<Parameters<typeof to['pending']>[0], States['pending']>>(true),
        });
    });
});
