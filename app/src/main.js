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
    var tank1 = new Tank(0, [window.innerWidth/4+25, window.innerHeight/2 + 25, 0], 'red');
    var tank2 = new Tank(0, [3*window.innerWidth/4+25, window.innerHeight/2 + 25, 0], 'blue');

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
            radius: 25,
            mass : Infinity,
            position: [(blockPos[0] * window.innerWidth), (blockPos[1] * window.innerHeight)]
        });

        blockBoundaries.push(blockBoundary);

        physicsEngine.addBody(blockBoundary);

        var block = new Surface({
            size: [50, 50],
            properties: {
                backgroundColor: 'black',
                borderRadius: '50px'
            }
        });
        mainContext.add(blockBoundary).add(block);
    }
    
    var tankBoundaries = [tank1.tankMotion, tank2.tankMotion];

    var collision = new Collision({restitution :.3});
    physicsEngine.attach(collision, blockBoundaries, bulletMotion);
    physicsEngine.attach(collision, blockBoundaries, bullet2);
    
    physicsEngine.attach(collision, blockBoundaries, tank1.tankMotion);
    physicsEngine.attach(collision, blockBoundaries, tank2.tankMotion);

    physicsEngine.attach(collision, [tank2.tankMotion], bulletMotion);
    physicsEngine.attach(collision, [tank1.tankMotion], bullet2);


    Engine.on('keydown', function(e) {
        if (e.keyCode == 40) {
        	tank1.moveRelative(-10, -10);
        } else if (e.keyCode == 38) {
        	tank1.moveRelative(10, 10);
        } else if (e.keyCode == 39) {
        	tank1.rotateRelative(Math.PI/16);
        } else if (e.keyCode == 37) {
        	tank1.rotateRelative(-Math.PI/16);
        } else if (e.keyCode == 83) {
        	tank2.moveRelative(-10, -10);
        } else if (e.keyCode == 87) {
        	tank2.moveRelative(10, 10);
        } else if (e.keyCode == 68) {
        	tank2.rotateRelative(Math.PI/16);
        } else if (e.keyCode == 65) {
        	tank2.rotateRelative(-Math.PI/16);
	    } else if (e.keyCode == 32) {
	    	tank1.shoot();
	    } else if (e.keyCode == 81) {
	    	tank2.shoot();
	    }
        else {
            console.log(e.keyCode);
        };
    });
    
    
});
