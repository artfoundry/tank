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


    var node = tankView.add(tankModifier);

    var s1 = new Surface({
        size: [100, 200],
        properties: {
            backgroundColor: 'red'
        }
    });
    node.add(s1);
    s1.pipe(tankView);

    var s2 = new Surface({
        size: [100, 100],
        properties: {
            backgroundColor: 'red'
        }
    });
    mainContext.add(centerModifier).add(tankView);
    var gunPos = new StateModifier({
        transform: Transform.translate(100, 0, 0)
    });
    node.add(gunPos).add(s2);
    s2.pipe(tankView);


    var pos = 0;
    var rot = 0;

// alternatively, myView.subscribe(surface);

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
            var angle = tankView.rotation.get() + Math.PI/50;
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            console.log(angle);
            tankView.rotation.set(angle);
        } else if (e.keyCode == 37) {
            var angle = tankView.rotation.get() - Math.PI/50;
            if(angle > (Math.PI * 2)) angle = 0;
            else if(angle < 0) angle = (Math.PI * 2);
            console.log(angle);
            tankView.rotation.set(angle);
        }
        else {
            console.log(e.keyCode);
        };
    });
});
