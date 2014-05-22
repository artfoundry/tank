define(function(require, exports, module) {
    'use strict';

    // import dependencies
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var View = require('famous/core/View');

    var Particle = require('famous/physics/bodies/Particle');
    var Circle = require('famous/physics/bodies/Circle');
    var Collision = require('famous/physics/constraints/Collision');

    function Tank(initialRotation, initialPosition, color) {
        this.tankView = new View();
        this.tankColor = color;

        this.initialRotation = initialRotation;
        this.tankView.rotation = new Transitionable(initialRotation);
        this.tankView.translation = new Transitionable(initialPosition)

        var me = this;
        var tankModifier = new Modifier({
            transform: function() {
                return Transform.rotateZ(me.tankView.rotation.get())
            }
        });

        var node = this.tankView.add(tankModifier);

        var s1 = new Surface({
            size: [50, 100],
            properties: {
                backgroundColor: this.tankColor
            }
        });
        var bodyPos = new StateModifier({
            transform: Transform.translate(-50, -50, 0)
        });

        node.add(bodyPos).add(s1);
        s1.pipe(this.tankView);

        var s2 = new Surface({
            size: [50, 50],
            properties: {
                backgroundColor: this.tankColor
            }
        });

        var gunPos = new StateModifier({
            transform: Transform.translate(0, -25, 0)
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

    	this.tankMotion.reset();
    	var pos = this.tankView.translation.get();
    	this.tankMotion.setPosition([pos[0], pos[1], 0]);
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

    Tank.prototype.getCircle = function() {
        return new Circle({
            radius: 50,
            mass : Infinity,
            position: this.tankView.translation.get()
        });
    }
    
    Tank.prototype.createBullet = function(mainContext, physicsEngine) {
        this.bulletMotion = new Circle({
            radius : 5,
            position: [-10, -10] // Hide it initially.
        });

        var bulletSurface = new Surface({
            size: [10,10],
            properties : {
                backgroundColor: this.tankColor,
                borderRadius: '10px'
            }
        });

        physicsEngine.addBody(this.bulletMotion);
        mainContext.add(this.bulletMotion).add(bulletSurface);
        
        return this.bulletMotion;
    }

    Tank.prototype.createBoundary = function(physicsEngine) {
    	var pos = this.tankView.translation.get();

    	this.tankMotion = new Circle({
            radius : 50,
            mass: Infinity,
            position: [pos[0], pos[1], 0]
        });

        physicsEngine.addBody(this.tankMotion);
        return this.tankMotion;
    }

    Tank.prototype.shoot = function() {
    	this.bulletMotion.reset();
    	
    	var pos = this.tankView.translation.get();
    	this.bulletMotion.setPosition(pos);
    	
    	var angle = this.tankView.rotation.get();
    	this.bulletMotion.setVelocity([0.5*Math.cos(angle), 0.5*Math.sin(angle), 0]);
    }
    
    module.exports = Tank;
});
