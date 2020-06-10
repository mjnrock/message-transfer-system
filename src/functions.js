export function freeze(obj) {
    var propNames = Object.getOwnPropertyNames(obj);

    for (let name of propNames) {
        let value = obj[ name ];

        if (value && typeof value === "object") {
            freeze(value);
        }
    }

    return Object.freeze(obj);
};

export function freezeCopy(obj) {
    return freeze(Object.assign({}, obj));
};

export default {
    freeze,
    freezeCopy,
};