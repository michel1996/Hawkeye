import * as THREE from "/node_modules/three/build/three.module.js";
import { ColladaLoader } from '/node_modules/three/examples/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { AnimationClip, VectorKeyframeTrack } from "three";
import { ModelInteraction } from '/modelInteraction.js';
import { BallCoordinates } from '/ballCoordinates.js';
import 'animate.css';

let mixer;
let modelLoader = new ColladaLoader();
let clock = new THREE.Clock();
let trajectoryClip;
let trajectoryAction;
let trajectoryAnimation;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setAnimationLoop( animate );

const scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);


//const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
                
const ambientLight = new THREE.AmbientLight( 0xffffff );
scene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xffffff, 15 );
//camera.add( pointLight );
camera.position.z = 50;
camera.position.y = -0.7;
camera.position.x = 0;

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;
                
modelLoader.load("public/models/court.dae", function (result) {
    
    result.scene.name="court";
    result.scene.scale.setScalar(0.0255);
    result.scene.position.set(0,0,0);
    scene.add(result.scene);
});

modelLoader.load("public/models/ball.dae", function (result) {
    result.scene.name="ball";
    result.scene.scale.setScalar(0.0013);
    result.scene.position.set(0,1,0);
    //console.log(result.scene)
    mixer = new THREE.AnimationMixer( result.scene );
    scene.add(result.scene);
});
                   
let courtModelInteraction = new ModelInteraction(scene, camera);

function animate() {
    const delta = clock.getDelta();
    controls.update();
    if ( mixer !== undefined ) {
        mixer.update( delta );
    }
	renderer.render( scene, camera );
}

function playAnimation(){
    if (trajectoryAction) {
        if (trajectoryAction.isRunning()) {
            $("#playBtn i").attr("class","fas fa-play");
            trajectoryAction.paused = true;
            //console.log(trajectoryAction.time);
        } else {
            $("#playBtn i").attr("class","fas fa-pause");
            trajectoryAction.paused = false;
            trajectoryAction.play();
        }
    }
}

window.addEventListener('wheel', function(event)
{
     if (event.deltaY < 0)
     {
      courtModelInteraction.zoomIn();
     }
     else if (event.deltaY > 0)
     {
      courtModelInteraction.zoomOut();
     }
});

$(document).keydown(function(e) {
    switch(e.keyCode){
        case 32:
            $("#playBtn").trigger("click");
            break;
    }
});



$(document).ready(function(){
    
    //$("#hawkeyeResult").hide();
    $("#trajectoryBtn").on("click", function(){
         $.ajax({ 
             type: "POST", 
             url: "http://127.0.0.1:5000/points",
             contentType: 'application/json',
             data: JSON.stringify({ 
             initialVelocity : parseFloat($("#initialVelocity").val()),
             initialPositionX : -parseFloat($("#initialPositionX").val()),
             initialPositionY: parseFloat($("#initialPositionY").val()),
             angle: parseFloat($("#angle").val()),
             gravity: 9.8 }),
             success: function(result){
                trajectoryAnimation = new VectorKeyframeTrack(
                  ".position",
                  BallCoordinates.fetchTimeValues(result),
                  BallCoordinates.fetchCoords(result)
                );
                console.log(trajectoryAction);
                trajectoryClip = new AnimationClip("trajectoryClip", -1, [trajectoryAnimation]);
                if (trajectoryAction) {
                    trajectoryAction.stop();
                }
                
                trajectoryAction = mixer.clipAction(trajectoryClip);
                console.log(trajectoryClip);
             },
             error: function (error) {
                console.log(error);
            }
         }); 
    });
    
    $("#playBtn").click(function(){
        playAnimation();
    });

    $("#forwardBtn").click(function(){
        stepAnimation(trajectoryAction._clip.tracks[0].times, trajectoryAction.time,5);
    });
    
    $("#backBtn").click(function(){
        stepAnimation(trajectoryAction._clip.tracks[0].times, trajectoryAction.time,-5);
    });
    
    $("#endBtn").click(function(){
        var court = scene.getObjectByName("court");
        console.log(court);
    court.traverse( function(child) {
        if (child.id == 637 || child.id == 646 || child.id == 638) {

          const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
            // Assign a new material with the random color to the mesh
            child.material = new THREE.MeshStandardMaterial({ color: randomColor });
            console.log(child.id);
            //console.log("id: " + child.id + " color: " + child.material.color.getHexString());
        }
    });
        if (trajectoryAction)
        {
            stepAnimation(trajectoryAction._clip.tracks[0].times, 999999,0);
        }
    });
    
    $("#startBtn").click(function(){
        stepAnimation(trajectoryAction._clip.tracks[0].times, 0,0);
    });
    
    function seekAnimationTime(animMixer, timeInSeconds){
        mixer._actions[0].time=timeInSeconds;
    }
    
    function stepAnimation(actionTimes, realTime, steps)
    {
        var actionTime = actionTimes.reduce(function(prev, curr) {
                              return (Math.abs(curr - realTime) < Math.abs(prev - realTime) ? curr : prev);
                            });
        var actionTimeIndex = actionTimes.findIndex((currentTime) => currentTime == actionTime);
        seekAnimationTime(mixer,actionTimes[actionTimeIndex+steps]);
    }
    
    $("#lineBtn").click(function(){
        var ball = scene.getObjectByName("ball");
        ball.position.set(6.4,0.031,3.95);
    });
    
    $("#outBtn").click(function(){
        var ball = scene.getObjectByName("ball");
        ball.position.set(12,0.031,0);
    });
    
    $("#challengeBtn").click(function(){
        $("#endBtn").trigger("click");
        const raycaster = new THREE.Raycaster();
        const downVector = new THREE.Vector3(0, -1, 0);
        
        var ball = scene.getObjectByName("ball");
        // Set the ray starting point to be the position of the ball
        raycaster.set(ball.position, downVector);

        // Test for intersections with the court
        const intersects = raycaster.intersectObject(scene.getObjectByName("court"));
        console.log(intersects);

        var isServe = $("#serveChallenge").is(":checked");
        if (isServe)
        {
            if (intersects.find((intersection) => intersection.object.id == 645 || intersection.object.id == 649) != null)
            {
                displayIn();
            }
            else
            {
                displayOut();
            }
        }
        else
        {
            if (intersects.find((intersection) => intersection.object.id == 645 || intersection.object.id == 647 || intersection.object.id == 649) != null)
            {
                displayIn();
            }
            else
            {
                displayOut();
            }
        }
    });
    
    function displayIn()
    {
        $("#outResult").hide();
        $("#inResult").show();
        $("#inResult").addClass("animate__animated animate__fadeInDownBig");
    }
    
    function displayOut()
    {
        $("#inResult").hide();
        $("#outResult").show();
        $("#outResult").addClass("animate__animated animate__fadeInDownBig");
    }
});