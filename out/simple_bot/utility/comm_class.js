export function CommandConstructor(f, _description, _params) {
    const func = Object.assign(f, {
        description: _description,
        params: _params
    });
    return func;
}
