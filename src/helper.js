export const Bitwise = {
    add(base, ...flags) {
        flags.forEach(flag => {
            base |= flag;
        });

        return base;
    },    
    remove(base, ...flags) {
        flags.forEach(flag => {
            base &= ~flag;
        });

        return base;
    },    
    has(base, flag) {
        return !!(base & flag);
    }
};

export function GenerateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        // eslint-disable-next-line
        let r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        
        return v.toString(16);
    });
}

export default {
    GenerateUUID,
    Bitwise
};