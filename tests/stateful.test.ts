import { stateful } from '../src/index';
import { States, transitions } from './mocks';

describe('when creating statefull state machine', () => {
    it('is correctly initialized', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        expect(machine.state).toBe('idle');
        expect(machine.value).toEqual({ a: 1 });
    });

    it('correctly identifies its state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        expect(machine.isInState('idle'));
        expect(machine.canTransitionTo('pending'));
        expect(machine.canTransitionTo('fetched')).toBeFalsy();
        expect(machine.canTransitionTo('failed')).toBeFalsy();
    });

    it('allows folding current state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        const result = machine.fold({ idle: x => x.a * 5 });

        expect(result).toBe(5);
    });

    it('handles folding not current state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        const result = machine.fold({ pending: x => x.b * 5 });

        expect(result).toBe(undefined);
    });

    it('handles folding not current state with default', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        const result = machine.fold({ pending: x => x.b * 5 }, 2);

        expect(result).toBe(2);
    });

    it('enables transition to other state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: t => t.pending({ b: 2 }) });

        expect(machine.state).toBe('pending');
        expect(machine.value).toEqual({ b: 2 });
    });

    it('invokes handlers on state change', () => {
        const handlers = { pending: jest.fn() };
        const initMachine = stateful<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: t => t.pending({ b: 2 }) });

        expect(handlers.pending).toBeCalled();
        expect(handlers.pending).toBeCalledWith(
            { b: 2 },
            {
                fetched: expect.any(Function),
                failed: expect.any(Function),
            },
        );
    });

    it('allows for triggering state change in handler', () => {
        const handlers = {
            pending: jest.fn((_, t) => t.fetched({ c: 3 })),
            fetched: jest.fn(),
        };
        const initMachine = stateful<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: t => t.pending({ b: 2 }) });

        expect(handlers.fetched).toBeCalled();
        expect(machine.state).toBe('fetched');
        expect(machine.value).toEqual({ c: 3 });
    });

    it('allows for triggering state change in handler asynchronously', done => {
        const handlers = {
            pending: jest.fn((_, t) => setTimeout(() => t.fetched({ c: 3 }), 50)),
            fetched: jest.fn(s => {
                expect(s).toEqual({ c: 3 });
                done();
            }),
        };
        const initMachine = stateful<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: t => t.pending({ b: 2 }) });
    });
});
