/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var View = require('famous/core/View');

    var Particle = require('famous/physics/bodies/Particle');
    var Circle = require('famous/physics/bodies/Circle');
    var Collision = require('famous/physics/constraints/Collision');
    
    var PhysicsEngine = require('famous/physics/PhysicsEngine');

    var Tank = require('Tank');

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    var tank1 = new Tank(0, [window.innerWidth/4+50, window.innerHeight/2, 0], 'red');
    var tank2 = new Tank(0, [3*window.innerWidth/4-50, window.innerHeight/2 , 0], 'blue');

    var physicsEngine = new PhysicsEngine();

    mainContext.add(tank1.createBoundary(physicsEngine)).add(tank1.getView());
    mainContext.add(tank2.createBoundary(physicsEngine)).add(tank2.getView());
    
    tank2.rotateRelative(Math.PI);

    var bulletMotion = tank1.createBullet(mainContext, physicsEngine);
    var bullet2 =  tank2.createBullet(mainContext, physicsEngine);

    var blocksPos = [
        [0.1,0.1],
        [0.1,0.5],
        [0.1,0.9],
        [0.5,0.1],
        [0.5,0.5],
        [0.5,0.9],
        [0.9,0.1],
        [0.9,0.5],
        [0.9,0.9],
    ];

    var blockBoundaries = [];

    for (var i = 0; i < blocksPos.length; i++) {
        var blockPos = blocksPos[i];
        var blockBoundary = new Circle({
            radius: 50,
            mass : Infinity,
            position: [(blockPos[0] * window.innerWidth), (blockPos[1] * window.innerHeight)]
        });

        blockBoundaries.push(blockBoundary);

        physicsEngine.addBody(blockBoundary);

        var block = new Surface({
            size: [(blockBoundary.radius * 2), (blockBoundary.radius * 2)],
            properties: {
                backgroundColor: 'black',
                borderRadius: (blockBoundary.radius * 2) + 'px'
            }
        });
        mainContext.add(blockBoundary).add(new StateModifier({transform: Transform.translate(-blockBoundary.radius, -blockBoundary.radius, 0)})).add(block);
    }
    
    var tankBoundaries = [tank1.tankMotion, tank2.tankMotion];

    var collision = new Collision({restitution :.3});
    physicsEngine.attach(collision, blockBoundaries, bulletMotion);
    physicsEngine.attach(collision, blockBoundaries, bullet2);
    
    physicsEngine.attach(collision, blockBoundaries, tank1.tankMotion);
    physicsEngine.attach(collision, blockBoundaries, tank2.tankMotion);

    physicsEngine.attach(collision, [tank2.tankMotion], bulletMotion);
    physicsEngine.attach(collision, [tank1.tankMotion], bullet2);

    physicsEngine.attach(collision, [tank2.tankMotion], tank1.tankMotion);
    physicsEngine.attach(collision, [tank1.tankMotion], tank2.tankMotion);
    
    collision.on('collision', function(data) {
    	if(data.source === bullet2 || data.source === bulletMotion) {
    		if(data.target === tank1.tankMotion) {
    			bullet2.reset([-10,-10], [0,0,0]);
    			tank1.hide();
    		} else if(data.target === tank2.tankMotion) {
    			bulletMotion.reset([-10,-10], [0,0,0]);
    			tank2.hide();
    		}
    	}
    });

    if(window.location.search.indexOf("checkPhysics") != -1) {
    	checkPhysics(physicsEngine);
    }

    Engine.on('keydown', function(e) {
        if (e.keyCode == 40) {
        	tank1.moveRelative(-15, -15);
        } else if (e.keyCode == 38) {
        	tank1.moveRelative(15, 15);
        } else if (e.keyCode == 39) {
        	tank1.rotateRelative(Math.PI/8);
        } else if (e.keyCode == 37) {
        	tank1.rotateRelative(-Math.PI/8);
        } else if (e.keyCode == 83) {
        	tank2.moveRelative(-15, -15);
        } else if (e.keyCode == 87) {
        	tank2.moveRelative(15, 15);
        } else if (e.keyCode == 68) {
        	tank2.rotateRelative(Math.PI/8);
        } else if (e.keyCode == 65) {
        	tank2.rotateRelative(-Math.PI/8);
	    } else if (e.keyCode == 32) {
	    	tank1.shoot();
	    } else if (e.keyCode == 81) {
	    	tank2.shoot();
	    }
        else {
            console.log(e.keyCode);
        };
    });
    
    function checkPhysics(physicsEngine) {
    	var physicsOverlay = document.getElementById("famousPhysicsOverlay");
    	if(!physicsOverlay) {
    		physicsOverlay = document.createElement("canvas");
    		document.body.appendChild(physicsOverlay);
    		physicsOverlay.setAttribute("id", "famousPhysicsOverlay");
    		physicsOverlay.setAttribute("width", window.innerWidth);
    		physicsOverlay.setAttribute("height", window.innerHeight);
    	}
    	var ctx = physicsOverlay.getContext("2d");
    	var btn2 = document.createElement("button");
    	btn2.style.position = "absolute";
    	btn2.style.right = "0px";
    	btn2.style.top = "20px";
    	document.body.appendChild(btn2);
    	btn2.innerText = "Refresh";
    	btn2.onclick = function() {
    		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    		for(var i=0; i < physicsEngine._bodies.length; i++)
    		{
    			var pos = physicsEngine._bodies[i].position;
    			var rds = physicsEngine._bodies[i].radius;
    			ctx.strokeStyle = '#ff0000';
    			ctx.beginPath();
    			ctx.arc(pos.x,pos.y,rds,0,2*Math.PI);
    			ctx.stroke();
    		}
    	}
    	var btn = document.createElement("button");
    	btn.style.position = "absolute";
    	btn.style.right = btn.style.top = "0px";
    	document.body.appendChild(btn);
    	btn.innerText = "Remove Physics Checker";
    	btn.onclick = function() {
    		document.body.removeChild(physicsOverlay);
    		document.body.removeChild(btn);
    		document.body.removeChild(btn2);
    	}
    	btn2.onclick();
    }

    
});
