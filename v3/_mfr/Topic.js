export default class Topic {
    constructor(types = true, { isInclusive = true, shapes = true } = {}) {
        this.op = isInclusive;
        this.types = types;
        this.shapes = shapes;
    }

    isInclusive() {
        return this.op;
    }
    isExclusive() {
        return !this.op;
    }

    isOnTopic(msg) {
        if(this.op === true) {
            return (this.types === true || this.types.includes(msg.type))
                && (this.shapes === true || this.shapes.includes(msg.shape));
        } else if(this.op === false) {
            return !(
                (this.types === true || this.types.includes(msg.type))
                && (this.shapes === true || this.shapes.includes(msg.shape))
            );
        }
    }

    static Create(types = true, { isInclusive = true, shapes = true } = {}) {
        return new Topic(types, {
            isInclusive,
            shapes
        });
    }
    static CreateAllowAll() {
        return new Topic(true, {
            isInclusive: true,
            shapes: true
        });
    }
    static CreateDisallowAll() {
        return new Topic(true, {
            isInclusive: false,
            shapes: true
        });
    }
}