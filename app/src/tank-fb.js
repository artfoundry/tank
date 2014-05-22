function connect() {
    var fbTankRef = new Firebase("https://famous-tank.firebaseio.com/");

    fbTankRef.once("value", function(roomList){
        if (roomList.hasChildren()) {
            console.log("blue")
            fbTankRef.child("room").push("blue");
            return "blue";
        } else {
            console.log("red")
            fbTankRef.set("room");
            fbTankRef.child("room").push("red");
            return "red";
        };
    });
}