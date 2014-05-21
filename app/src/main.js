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

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    var tankView = new View();

    tankView.rotation = new Transitionable(0);
    tankView.translation = new Transitionable([0, 0, 0])

    var centerModifier = new Modifier({origin: [0.5, 0.5]});
    var tankModifier = new Modifier({
        origin: [0.5, 0.5],
        transform: function() {
            return Transform.thenMove(Transform.rotateZ(tankView.rotation.get()),
                tankView.translation.get());
        }
    });
    var tankBoundary = new Circle({
        radius: 50,
        mass : Infinity,
        position: [0,0]
    });

    var node = tankView.add(tankModifier);

    var s1 = new Surface({
        size: [50, 100],
        properties: {
            backgroundColor: 'red'
        }
    });
    node.add(s1);
    s1.pipe(tankView);


    var s2 = new Surface({
        size: [50, 50],
        properties: {
            backgroundColor: 'red'
        }
    });

    mainContext.add(centerModifier).add(tankView);
    var gunPos = new StateModifier({
        transform: Transform.translate(50, 0, 0)
    });
    node.add(gunPos).add(s2).add(tankBoundary);
    s2.pipe(tankView);


// normally inside view module's code
    tankView._eventInput.on('click', function() {
        s2.setContent('hello');
        //tankView._eventOutput.emit('hello');
    });

    Engine.on('keydown', function(e) {
        // alert(e.keyCode);

        if (e.keyCode == 40) {
            var a = tankView.translation.get();
            var angle = tankView.rotation.get();
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            a[0] -= 10 * Math.cos(angle);
            a[1] -= 10 * Math.sin(angle);
            tankView.translation.set(a)
        } else if (e.keyCode == 38) {
            a = tankView.translation.get();
            var angle = tankView.rotation.get();
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            a[0] += 10 * Math.cos(angle);
            a[1] += 10 * Math.sin(angle);
            tankView.translation.set(a);
        } else if (e.keyCode == 39) {
            var angle = tankView.rotation.get() + Math.PI/16;
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            tankView.rotation.set(angle);
        } else if (e.keyCode == 37) {
            var angle = tankView.rotation.get() - Math.PI/16;
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            tankView.rotation.set(angle);
        } else if (e.keyCode == 32) {

        } else {
            console.log(e.keyCode);
        };
    });

    var physicsEngine = new PhysicsEngine();

    var bulletMotion = new Circle({
        radius : 1,
        position: [window.innerWidth/2 - 100,window.innerHeight/2 - 100,0],
        velocity: [.5,.5,0]
    });

    var bulletSurface = new Surface({
        size: [10,10],
        properties : {
            backgroundColor: 'red',
            borderRadius: '10px'
        }
    });

    physicsEngine.addBody(bulletMotion);
    mainContext.add(bulletMotion).add(bulletSurface);


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
            position: [blockPos[0] * window.innerWidth, blockPos[1] * window.innerHeight]
        });

        blockBoundaries.push(blockBoundary);

        physicsEngine.addBody(blockBoundary);

        var block = new Surface({
            size: [50, 50],
            properties: {
                backgroundColor: 'black',
                borderRadius: '5px'
            }
        });
        var position = new StateModifier({
            origin: blocksPos[i]
        });
        blockBoundaries.push(tankBoundary);
        mainContext.add(blockBoundary).add(block);
    }

    var collision = new Collision({restitution :.3});
    physicsEngine.attach(collision, blockBoundaries, bulletMotion);

});
