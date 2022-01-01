const canvas = document.querySelector('canvas') //selects canvas element that was created in index.html
const c = canvas.getContext('2d') //allows us to draw on canvas
canvas.width = window.innerWidth //sets window width to the actual canvas
canvas.height = innerHeight //you don't need to use window all the time
const scoreEl = document.querySelector('#scoreEl')
const startGameButton = document.querySelector('#startGameButton')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const x = canvas.width / 2
const y = canvas.height / 2

class Player{
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath() //want to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
    }

    draw(){
        c.beginPath() //want to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
    }

    draw(){
        c.beginPath() //want to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
const friction = 0.99
class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        c.save() //allows us to change
        c.globalAlpha = this.alpha
        c.beginPath() //want to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore() //stops changes
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

let player 
let projectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = 0
    bigScoreEl.innerHTML = 0
}

function spawnEnemies(){
    setInterval(()=>{
        const radius = (Math.random() * 36)+6
        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        
        const color = `hsl(${Math.random() * 360},50%, 50%)`//hue saturation lightness
        //template literal allows us to do it before in the string
        const angle = Math.atan2(canvas.height/2-y, canvas.width/2-x) //gets distance from the center
        const speed = Math.random()+3

        //THIS IS THE SPEEEEEEEED
        const velocity = {
            x: Math.cos(angle)*speed,
            y: Math.sin(angle)*speed
        }
        
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000) //every second
}

let animationId
let score = 0
function animate(){ //loops infinitely
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)' //creates fade
    c.fillRect(0,0,canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index)=>{
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        } else {
            particle.update()
        }
        
    })
    projectiles.forEach((projectile, projectileIndex)=> {
        projectile.update()
        if(projectile.x-projectile.radius <0 ||projectile.y+projectile.radius < 0 || projectile.y-projectile.radius > canvas.height||projectile.x + projectile.radius > canvas.width){
            setTimeout(()=> {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index)=>{
        enemy.update()
        const distplayer = Math.hypot(player.x - enemy.x, player.y-enemy.y)
        //ends game
        if(distplayer - enemy.radius - player.radius < 0.1){
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }
        projectiles.forEach((projectile, projectileIndex)=>{
            const dist = Math.hypot(projectile.x-enemy.x, projectile.y-enemy.y) //distance between 0
            //when projectiles hit enemy
            if(dist- enemy.radius- projectile.radius < 0.1){
                //explosions
                for(let i = 0; i < enemy.radius *2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {
                        x: (Math.random()-0.5)*(Math.random()*5),
                        y: (Math.random()-0.5)*(Math.random()*5)
                    }))
                }
                //shrinking enemy
                if(enemy.radius -10 > 15){
                    gsap.to(enemy, {
                        radius: enemy.radius-20
                    })
                    setTimeout(()=>{
                        projectiles.splice(projectileIndex, 1) // 1 makes sure only 1 is removed
                    },1)
                } else {
                    score += Math.round(Math.random() *10)
                    scoreEl.innerHTML = score
                    setTimeout(()=>{
                        enemies.splice(index, 1) // just removes from array
                        projectiles.splice(projectileIndex, 1) // 1 makes sure only 1 is removed
                    },1)
                }
                
            }
        })
    })
}
window.addEventListener('click', (event)=> {
    const angle = Math.atan2(event.clientY-y,event.clientX-x) //gets distance from the center
    const velocity = {
        x: Math.cos(angle)*5,
        y: Math.sin(angle)*5
    }
    projectiles.push(new Projectile(x,y,5,'white',velocity))
})

startGameButton.addEventListener('click', ()=>{
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})
