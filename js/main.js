const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


renderer.setClearColor(0xb7c3f3, 1);
const light = new THREE.AmbientLight(0xffffff)
scene.add(light)
camera.position.z = 5;

// Global Variables

STARTING_POS = 3
ENDING_POS = -STARTING_POS
let isLookingBackWard = true
let timeLimit = 10
let gamestart = "Loading"
let text = document.querySelector(".loadingBar")

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial({color: color});
    const cube = new THREE.Mesh(geometry, material)
    cube.position.x = positionX
    cube.rotation.y = rotY
    scene.add(cube)
    return cube
}

const loader = new THREE.GLTFLoader();


function Delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class Doll {
    constructor() {
        loader.load("../models/scene.gltf", (gltf) => {
                scene.add(gltf.scene);
                gltf.scene.scale.set(.4, .4, .4);
                gltf.scene.position.set(0, -1, 0);
                this.doll = gltf.scene
            }
        );
    }

    lookBack() {
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
        setTimeout(() => isLookingBackWard = true, 150)
    }

    lookForward() {
        gsap.to(this.doll.rotation, {y: 0, duration: .45})
        setTimeout(() => isLookingBackWard = false, 500)
    }

    async start() {
        this.lookBack()
        await Delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await Delay((Math.random() * 750) + 750)
        this.start()
    }
}


class Player {
    constructor() {
        const geometry = new THREE.SphereGeometry(.3, 32, 16);
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.z = 1
        sphere.position.x = STARTING_POS
        scene.add(sphere);
        this.player = sphere
        this.playerInfo = {
            positionX: STARTING_POS,
            velocity: 0
        }
    }

    run() {
        this.playerInfo.velocity = 0.03
    }

    stop() {
        gsap.to(this.playerInfo, {velocity: 0, duration: 0.5})
    }

    check() {
        if (player.playerInfo.velocity > 0 && !isLookingBackWard) {
            alert("You have Lost")
            text.innerHTML = "You Lost"
            gamestart = "GameOver"
        }
        if (player.playerInfo.positionX <= ENDING_POS) {
            alert("You Have Won")
            text.innerHTML = "You Won"
            gamestart = "GameOver"
        }
    }

    update() {
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

let doll = new Doll()
let player = new Player()

function createTrack() {
    createCube({w: .2, h: 1.5, d: 1}, STARTING_POS, -35)
    createCube({w: .2, h: 1.5, d: 1}, ENDING_POS, .35)
    createCube({w: STARTING_POS * 2 + .2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1
}

createTrack()



async function init() {
    await Delay(500)
    text.innerHTML = "Starting in 3"
    await Delay(500)
    text.innerHTML = "Starting in 2"
    await Delay(500)
    text.innerHTML = "Starting in 1"
    await Delay(500)
    text.innerHTML = "GO!!!!"
    startGame()
}



function startGame() {
    gamestart = "start"
    let progressBar = createCube({w: 5, h: .1, d: 1}, 0)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {x: 0, duration: timeLimit, ease: "none"})
    doll.start()
    setTimeout(() => {
        if (gamestart !== "GameOver"){
            text.innerHTML = "You Ran Out Of Time"
            gamestart = "GameOver"
        }
    }, timeLimit * 1000)

}

init()

function animate() {
    if (gamestart === "GameOver") return
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update()
}

animate();


window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    console.log("resizing")
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener("keydown", (e) => {
    if (gamestart !== "start") return
    if (e.key == "ArrowUp") {
        player.run()
    }
})
window.addEventListener("keyup", (e) => {
    if (e.key == "ArrowUp") {
        player.stop()
    }
})
