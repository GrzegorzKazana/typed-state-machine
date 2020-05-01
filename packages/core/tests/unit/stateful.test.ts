import { stateful } from '@/index';
import { States, transitions } from '../mocks';

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
    });

    it('gets current state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        expect(machine.getOr('idle')).toEqual({ a: 1 });
    });

    it('gets default value if not in current state', () => {
        const initMachine = stateful<keyof States, States, typeof transitions>(transitions);
        const machine = initMachine('idle', { a: 1 });

        expect(machine.getOr('pending', null)).toEqual(null);
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

        machine.transition({ idle: to => to.pending({ b: 2 }) });

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

        machine.transition({ idle: to => to.pending({ b: 2 }) });

        expect(handlers.pending).toBeCalled();
        expect(handlers.pending).toBeCalledWith(
            {
                fetched: expect.any(Function),
                failed: expect.any(Function),
            },
            { b: 2 },
        );
    });

    it('allows for triggering state change in handler', () => {
        const handlers = {
            pending: jest.fn(to => to.fetched({ c: 3 })),
            fetched: jest.fn(),
        };
        const initMachine = stateful<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: to => to.pending({ b: 2 }) });

        expect(handlers.fetched).toBeCalled();
        expect(machine.state).toBe('fetched');
        expect(machine.value).toEqual({ c: 3 });
    });

    it('allows for triggering state change in handler asynchronously', done => {
        const handlers = {
            pending: jest.fn(to => setTimeout(() => to.fetched({ c: 3 }), 50)),
            fetched: jest.fn((_, s) => {
                expect(s).toEqual({ c: 3 });
                done();
            }),
        };
        const initMachine = stateful<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const machine = initMachine('idle', { a: 1 });

        machine.transition({ idle: to => to.pending({ b: 2 }) });
    });
});
