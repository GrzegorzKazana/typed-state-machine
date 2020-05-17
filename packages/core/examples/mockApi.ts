export default {
    fetchTodos: () =>
        new Promise<string[]>(resolve =>
            setTimeout(() => resolve(['1. Thing A', '2. Thing B']), 100),
        ),
};
