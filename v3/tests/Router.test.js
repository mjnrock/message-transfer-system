import Node from "./../Node";
import Router from "./../Router";
import Condition from "./../Condition";


const n1 = new Node({
    receive: (signal, feed) => console.log(signal)
});
const n2 = new Node();
const router = new Router();

console.log(`N1`, n1.id);
console.log(`N2`, n2.id);
console.log(`Router`, router.id);

router.register(n1,
    Condition.Build()
        .type("test", "test2", ...Node.AllSignalTypes())
        .payload()
            .gt(16000)
);


router.listen(n2);
n2.emit("test", 12345);
n2.emit("test2", 96574);
n2.emit(Node.SignalTypes.STATE_CHANGE, 90123);