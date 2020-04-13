import Node from "./../Node";

let N1 = new Node({
    receive: (msg, feed) => console.log(`[1]:`, msg, feed.signet)
});
let N2 = new Node({
    receive: (msg, feed) => console.log(`[2]:`, msg, feed.signet)
});
let N3 = new Node({
    receive: (msg, feed) => console.log(`[3]:`, msg, feed.signet)
});

N1.addListener(N2, N3);
// N1.couple(N2, N3);

N1.emit("test", "YES!");
// N2.emit("yush", "turst!");