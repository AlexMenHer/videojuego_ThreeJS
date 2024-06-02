var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;

var movingCube;
var collideMeshList = [];
var cubes = [];
var message = document.getElementById("message");
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";
var isJumping = false;
var jumpPhase = 'up';
var ascentSpeed = 190; // Velocidad de ascenso del salto (píxeles por segundo)
var descentSpeed = 140; // Velocidad de descenso del salto (píxeles por segundo)
var initialJumpHeight = 25; // Altura inicial del salto (posición y del cubo)
var maxJumpHeight = 150;
var gameSpeed = 250; // Velocidad inicial del juego (píxeles por segundo)
var speedIncreaseRate = 0.4; // Tasa de aumento de velocidad (píxeles por segundo por segundo)
var fastslow = 5;
var isPaused = false;

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(0, 170, 400);

    // Renderer
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    material = new THREE.LineBasicMaterial({
        color: 0x0000FF, linewidth: 6, fog: true
    });
    var line1 = new THREE.Line(geometry, material);
    scene.add(line1);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    var line2 = new THREE.Line(geometry, material);
    scene.add(line2);


    var cubeGeometry = new THREE.CubeGeometry(50, 25, 60, 5, 5, 5);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    });


    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    //            movingCube = new THREE.Mesh(cubeGeometry, material);
    //            movingCube = new THREE.BoxHelper(movingCube);
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);


}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);

}

var collisionCount = 0;

function checkCollision() {
    // Lógica para detectar colisiones aquí

    // Si hay una colisión, incrementar el contador
    if (crash) {
        collisionCount++;
        //movingCube.position.set(0, initialJumpHeight, 0);
        movingCube.material.color.setHex(0xFFFF00);

        // Verificar si se alcanzó el límite de colisiones
        if (collisionCount >= 3) {
            // Redireccionar a la página de reinicio después de 2 segundos
            setTimeout(function() {
                window.location.href = "restart.html";
            }, 0.2); // 100 milisegundos = 2 segundos
        }
    }
}

function update() {
    document.getElementById('global_sound').play();
    var delta = clock.getDelta();
    var moveDistance = gameSpeed * delta;
    //console.log(moveDistance);
    var rotateAngle = Math.PI / 2 * delta;

    /*
    if (isPaused) {
        // Detener la lógica de juego y mostrar el mensaje "PAUSADO" en pantalla
        document.getElementById('global_sound').pause();
        // Mostrar el mensaje "PAUSADO" en pantalla
        document.getElementById('pausado_message').style.display = 'block';
        return; // Salir de la función update
    }
    */

    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        if (movingCube.position.x > -270)
            movingCube.position.x -= moveDistance;
        if (camera.position.x > -150) {
            camera.position.x -= moveDistance * 0.6;
            if (camera.rotation.z > -5 * Math.PI / 180) {
                camera.rotation.z -= 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        if (movingCube.position.x < 270)
            movingCube.position.x += moveDistance;
        if (camera.position.x < 150) {
            camera.position.x += moveDistance * 0.6;
            if (camera.rotation.z < 5 * Math.PI / 180) {
                camera.rotation.z += 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        movingCube.position.z -= moveDistance;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        movingCube.position.z += moveDistance;
    }

    if (!(keyboard.pressed("left") || keyboard.pressed("right") ||
        keyboard.pressed("A") || keyboard.pressed("D"))) {
        delta = camera.rotation.z;
        camera.rotation.z -= delta / 10;
    }

    if (keyboard.pressed("space")) {
        if (!isJumping) {
            isJumping = true;
            jumpPhase = 'up';
            jumpStartTime = clock.elapsedTime;
        }
    }
    
    if (isJumping) {
        // Aplicar la lógica de salto
        if (jumpPhase === 'up') {
            var jumpTime = clock.elapsedTime - jumpStartTime;
            var ascentDistance = ascentSpeed * jumpTime;
            movingCube.position.y = initialJumpHeight + ascentDistance;
    
            // Cambiar a la fase de bajada cuando se alcanza la altura máxima
            if (ascentDistance >= maxJumpHeight) {
                jumpPhase = 'down';
                jumpStartTime = clock.elapsedTime;
            }
        } else if (jumpPhase === 'down') {
            var jumpTime = clock.elapsedTime - jumpStartTime;
            var descentDistance = descentSpeed * jumpTime;
            movingCube.position.y = initialJumpHeight + maxJumpHeight - descentDistance;
    
            // Restablecer el salto cuando se alcanza la altura inicial
            if (descentDistance >= maxJumpHeight) {
                isJumping = false;
                movingCube.position.y = initialJumpHeight;
            }
        }
    }


    var originPoint = movingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {

        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();

        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }

    if (crash) {
        movingCube.material.color.setHex(0x346386);
        console.log("Crash");
        checkCollision();
        if (crashId !== lastCrashId) {
            if (score >= 20) {
                score -= 20;
            } else {
                score = 0;
            }
            lastCrashId = crashId;
        }
    
        document.getElementById('explode_sound').play();
    } else {
        //            message.innerText = "Safe";
        movingCube.material.color.setHex(0xFFFF00);
    }

    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += fastslow;
        }
        //                renderer.render(scene, camera);
    }

    fastslow += speedIncreaseRate * delta;

    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);

    //controls.update();
}

/*
window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        isPaused = !isPaused; // Cambiar el estado de pausa del juego
        if (!isPaused) {
            // Reanudar el juego y ocultar el mensaje "PAUSADO" en pantalla
            document.getElementById('global_sound').play();
            // Ocultar el mensaje "PAUSADO" en pantalla
            document.getElementById('pausado_message').style.display = 'none';
        }
    }
});
*/


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function makeRandomCube() {
    var a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    var geometry = new THREE.CubeGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        size: 3
    });


    var object = new THREE.Mesh(geometry, material);
    var box = new THREE.BoxHelper(object);
    var randomColor = Math.random() * 0xffffff;
    box.material.color.setHex(randomColor);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
