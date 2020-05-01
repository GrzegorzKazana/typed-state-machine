import { renderHook, act } from '@testing-library/react-hooks';

import createUseStateMachine from '@/index';

import { transitions, States } from './mocks';

describe('when using useStateMachine hook', () => {
    const useStateMachine = createUseStateMachine<keyof States, States, typeof transitions>(
        transitions,
    );

    it('correctly initializes', () => {
        const { state, value } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;

        expect(state).toBe('idle');
        expect(value).toEqual({ a: 1 });
    });

    it('correctly identifies its state', () => {
        const { isInState } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;

        expect(isInState('idle'));
    });

    it('gets current state', () => {
        const { getOr } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;

        expect(getOr('idle')).toEqual({ a: 1 });
    });

    it('gets default value if not in current state', () => {
        const { getOr } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;

        expect(getOr('pending', null)).toEqual(null);
    });

    it('allows folding current state', () => {
        const { fold } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;
        const result = fold({ idle: x => x.a * 5 });

        expect(result).toBe(5);
    });

    it('handles folding not current state', () => {
        const { fold } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;
        const result = fold({ pending: x => x.b * 5 });

        expect(result).toBe(undefined);
    });

    it('handles folding not current state with default', () => {
        const { fold } = renderHook(() => useStateMachine('idle', { a: 1 })).result.current;
        const result = fold({ pending: x => x.b * 5 }, 2);

        expect(result).toBe(2);
    });

    it('allows for transitioning to another state', () => {
        const { result } = renderHook(() => useStateMachine('idle', { a: 1 }));
        const { transition } = result.current;

        act(() => {
            transition({
                idle: (to, { a }) => to.pending({ b: a + 1 }),
            });
        });

        expect(result.current.state).toBe('pending');
        expect(result.current.value).toEqual({ b: 2 });
    });

    it('invokes handlers on state change', () => {
        const handlers = { pending: jest.fn() };
        const hook = createUseStateMachine<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const { result } = renderHook(() => hook('idle', { a: 1 }));
        const { transition } = result.current;

        act(() => {
            transition({ idle: to => to.pending({ b: 2 }) });
        });

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
        const hook = createUseStateMachine<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const { result } = renderHook(() => hook('idle', { a: 1 }));
        const { transition } = result.current;

        act(() => {
            transition({ idle: to => to.pending({ b: 2 }) });
        });

        expect(handlers.fetched).toBeCalled();
        expect(result.current.state).toBe('fetched');
        expect(result.current.value).toEqual({ c: 3 });
    });

    it('allows for triggering state change in handler asynchronously', done => {
        const handlers = {
            pending: jest.fn(to =>
                setTimeout(() => {
                    act(() => {
                        to.fetched({ c: 3 });
                    });
                }, 50),
            ),
            fetched: jest.fn((_, s) => {
                expect(s).toEqual({ c: 3 });
                done();
            }),
        };
        const hook = createUseStateMachine<keyof States, States, typeof transitions>(
            transitions,
            handlers,
        );
        const { result } = renderHook(() => hook('idle', { a: 1 }));
        const { transition } = result.current;

        act(() => {
            transition({ idle: to => to.pending({ b: 2 }) });
        });
    });
});
