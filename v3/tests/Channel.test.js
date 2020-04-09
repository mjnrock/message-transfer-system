import Channel from "./../Channel";
import Node from "./../Node";

let N1 = new Node({
    receive: (msg, { signet }) => console.log(`[1]:`, msg, signet)
});
let N2 = new Node({
    receive: (msg, { signet }) => console.log(`[2]:`, msg, signet)
});
let N3 = new Node({
    receive: (msg, { signet }) => console.log(`[3]:`, msg, signet)
});

let Ch1 = new Channel("Main");
Ch1.join(
    N1,
    N2,
);
let Ch2 = new Channel("Second");
Ch2.join(
    N2,
    N3,
);

N1.send("Test1", "Hello!");
N2.send("Test2", "Hi!");