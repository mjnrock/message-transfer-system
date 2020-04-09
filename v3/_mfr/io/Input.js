export default class Input {
    constructor(validator, { isRequired = false } = {}) {
        this.validator = validator;
        
        this.config = {
            isRequired
        };
    }

    test(...args) {
        return !!this.validator(...args);
    }
}