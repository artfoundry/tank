var playerRef = "";
var oppData = []; // position is index 0, rotation is index 1, shot data is index 2

function connect() {
    var fbTankRef = new Firebase("https://famous-tank.firebaseio.com/");
    fbTankRef.set("room");
    fbTankRef.once("value", function(roomList){
        if (roomList.hasChildren()) {
            console.log("blue")
            playerRef = fbTankRef.child("room").push("blue");
        } else {
            console.log("red")
            fbTankRef.set("room");
            playerRef = fbTankRef.child("room").push("red");
        };
    });
//    fbTankRef.child("room").on("child_removed", function(roomList){
//        if (roomList.hasChildren() === false) {
//            room.remove();
//        };
//    });
}

function send(data) {
    playerRef.set("data", data);
}

function retrieve() {
    if (playerRef.name === "blue") {
        var oppRef = playerRef.parent().child("red");
    }
    else {
        var oppRef = playerRef.parent().child("blue");
    };
    oppRef.on("value", function(oppRefData) {
        oppData = oppRefData.child("data");
    });
}