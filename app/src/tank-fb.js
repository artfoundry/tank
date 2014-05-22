function connect() {
    var fbTankRef = new Firebase("https://famous-tank.firebaseio.com/");
//    var auth = new FirebaseSimpleLogin(fbTankRef, function(error, user){
//        if (error) {
//            // an error occurred while attempting login
//            console.log(error);
//        } else if (user) {
//            // user authenticated with Firebase
//            console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
//        } else {
//            // user is logged out
//        };
//    });
//    auth.login('anonymous');
    fbTankRef.set("room");
    var room = fbTankRef.child("room");
    room.once("value", function(roomList){
        if (roomList.hasChildren()) {
            console.log("blue")
            room.push("blue");
            return "blue";
        } else {
            console.log("red")
            room.push("red");
            return "red";
        };
    });
    room.on("child_removed", function(roomList){
        if (roomList.hasChildren() === false) {
            room.remove();
        };
    });
}