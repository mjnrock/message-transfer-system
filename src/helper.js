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

/**
 * Primarily used for JSON.stringify(obj) in cases where the `prototype` holds all the meaningful data (e.g. Geolocation)
 * @param {Object} obj 
 */
export function CloneAsObject(obj) {
    if(obj === null || !(obj instanceof Object)) {
        return obj;
    }

    let temp = (obj instanceof Array) ? [] : {};

    for(let key in obj) {
        temp[key] = CloneAsObject(obj[key]);
    }

    return temp;
}

export function GenerateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        // eslint-disable-next-line
        let r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        
        return v.toString(16);
    });
}

export default {
    CloneAsObject,
    GenerateUUID,
    Bitwise
};