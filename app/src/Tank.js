define(function(require, exports, module) {
    'use strict';

    // import dependencies
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var View = require('famous/core/View');

    function Tank(initialRotation, initialPosition, color) {
        this.tankView = new View();

        this.tankView.rotation = new Transitionable(initialRotation);
        this.tankView.translation = new Transitionable(initialPosition)

        var me = this;
        var tankModifier = new Modifier({
            origin: [0.5, 0.5],
            transform: function() {
                return Transform.thenMove(Transform.rotateZ(me.tankView.rotation.get()),
                    me.tankView.translation.get());
            }
        });

        var node = this.tankView.add(tankModifier);

        var s1 = new Surface({
            size: [50, 100],
            properties: {
                backgroundColor: color
            }
        });
        node.add(s1);
        s1.pipe(this.tankView);

        var s2 = new Surface({
            size: [50, 50],
            properties: {
                backgroundColor: color
            }
        });

        var gunPos = new StateModifier({
            transform: Transform.translate(50, 0, 0)
        });
        node.add(gunPos).add(s2);
        s2.pipe(this.tankView);
    }

    Tank.prototype.moveRelative = function(x, y) {
        var a = this.tankView.translation.get();
        var angle = this.tankView.rotation.get();
        if(angle > (Math.PI * 2)) angle = 0;
        else if(angle < 0) angle = (Math.PI * 2);
        a[0] += x * Math.cos(angle);
        a[1] += y * Math.sin(angle);
        this.tankView.translation.set(a);    	
    }

    Tank.prototype.rotateRelative = function(angle) {
        var angle = this.tankView.rotation.get() + angle;
        if(angle > (Math.PI * 2)) angle = 0;
        else if(angle < 0) angle = (Math.PI * 2);
        this.tankView.rotation.set(angle);    	
    }
    
    Tank.prototype.getView = function() {
    	return this.tankView;
    }
    module.exports = Tank;
});
