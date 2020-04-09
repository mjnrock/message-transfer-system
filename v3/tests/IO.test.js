import IO from "./../io/IO";

let i1 = new IO([
    () => true,
    () => false,
    () => 2,
], {
    0: [ 0, 1, 2 ]
});

console.log(i1.run(0));