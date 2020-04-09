import Node from "../Node";

let N1 = new Node({
    receive: (msg, signature) => console.log(`[1]:`, msg, signature)
});
let N2 = new Node({
    receive: (msg, signature) => console.log(`[2]:`, msg, signature)
});
let N3 = new Node({
    receive: (msg, signature) => console.log(`[3]:`, msg, signature)
});

N1.listen(N2, N3);

N1.emit("test", "YES!");