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
    var RenderController = require('famous/views/RenderController');

    var Tank = require('Tank');

    // create the main context
    var mainContext = Engine.createContext();
   
    
    var playButton = new Surface({
        size: [100,50],
        content: "Play",
        properties: {
            backgroundColor: "yellow",
            color: "black",
            textAlign: "center",
            fontSize: "35px",
            cursor: "pointer",
            paddingTop: "5px"
        }
    });

    var playButtonMod = new StateModifier({
        origin: [0.5,0.5]
    });

    var playButtonView = new View();
    playButtonView.add(playButtonMod).add(playButton);

    var buttonVisibility = new RenderController({
        inTransition: false,
        outTransition: false
    })
    mainContext.add(buttonVisibility);
    buttonVisibility.show(playButtonView);
    playButton.on('click', function() {
        var player = connect();
        buttonVisibility.hide({}, drawBoard);
    });

    function drawBoard(){
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
            
            
            var block = new Surface({
                size: [(blockBoundary.radius * 2), (blockBoundary.radius * 2)],
                properties: {
                    backgroundColor: 'black',
                    borderRadius: (blockBoundary.radius * 2) + 'px'
                }
            });
            physicsEngine.addBody(blockBoundary);
            mainContext.add(blockBoundary).add(new StateModifier({transform: Transform.translate(-blockBoundary.radius, -blockBoundary.radius, 0)})).add(block);
            blockBoundaries.push(blockBoundary);
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
 
    }    

    function checkPhysics(physicsEngine) {
    	// Create a Canvas element positioned over the entire window.
    	var physicsOverlay = document.getElementById("famousPhysicsOverlay");
    	if(!physicsOverlay) {
    		physicsOverlay = document.createElement("canvas");
    		document.body.appendChild(physicsOverlay);
    		physicsOverlay.setAttribute("id", "famousPhysicsOverlay");
    		physicsOverlay.setAttribute("width", window.innerWidth);
    		physicsOverlay.setAttribute("height", window.innerHeight);
    	}
    	var canvasContext = physicsOverlay.getContext("2d");
    	// Make a "Refresh" button.
    	var refreshButton = document.createElement("button");
    	refreshButton.style.position = "absolute";
    	refreshButton.style.right = "0px";
    	refreshButton.style.top = "20px";
    	document.body.appendChild(refreshButton);
    	refreshButton.innerText = "Refresh";
    	var autoRefresh = true;
    	refreshButton.onclick = function() {
    		// Draw the physics bodies outlines into the canvas.
    		canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    		for(var i=0; i < physicsEngine._bodies.length; i++)
    		{
    			var position = physicsEngine._bodies[i].position;
    			var radius = physicsEngine._bodies[i].radius;
    			canvasContext.strokeStyle = '#ff0000';
    			canvasContext.beginPath();
    			canvasContext.arc(position.x,position.y,radius,0,2*Math.PI);
    			canvasContext.stroke();
    		}
        	if(autoRefresh) setTimeout(refreshButton.onclick, 100);
    	}
    	// Make an  "Auto-refresh" checkbox.
    	var autoRefreshCheckbox = document.createElement("input");
    	autoRefreshCheckbox.setAttribute("type", "checkbox");
    	autoRefreshCheckbox.style.position = "absolute";
    	autoRefreshCheckbox.style.right = "60px";
    	autoRefreshCheckbox.style.top = "25px";
    	autoRefreshCheckbox.checked = autoRefresh;
    	autoRefreshCheckbox.onchange = function() {
    		autoRefresh = autoRefreshCheckbox.checked;
    		if(autoRefresh) {
    	    	refreshButton.onclick();
    		}
    	}
    	document.body.appendChild(autoRefreshCheckbox);
    	// Make a "Remove" button.
    	var removeButton = document.createElement("button");
    	removeButton.style.position = "absolute";
    	removeButton.style.right = removeButton.style.top = "0px";
    	document.body.appendChild(removeButton);
    	removeButton.innerText = "Remove Physics Checker";
    	removeButton.onclick = function() {
    		// Clean up when removed.
    		document.body.removeChild(physicsOverlay);
    		document.body.removeChild(removeButton);
    		autoRefresh = false ;
    		document.body.removeChild(autoRefreshCheckbox);
    		document.body.removeChild(refreshButton);
    	}
    	refreshButton.onclick();
    }
});
