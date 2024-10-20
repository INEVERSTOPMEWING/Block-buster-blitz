<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Space Shooter</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #000;
            flex-direction: column;
        }
        #gameCanvas {
            border: 1px solid #fff;
            background-color: #222;
        }
        #score, #highScore {
            color: #fff;
            position: absolute;
            font-size: 24px;
        }
        #score {
            top: 10px;
            left: 10px;
        }
        #highScore {
            top: 10px;
            right: 10px;
        }
        #endScreen {
            position: absolute;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
        }
        #endScreen button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 20px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id='score'>Score: 0</div>
    <div id='highScore'>High Score: 0</div>
    <div id="endScreen">
        <div id="finalScore">Final Score: 0</div>
        <button onclick="restartGame()">Play Again</button>
    </div>
    <canvas id='gameCanvas' width='800' height='600'></canvas>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let spaceship = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 50 };
        let bullets = [];
        let asteroids = [];
        let explosions = [];
        let rightPressed = false;
        let leftPressed = false;
        let upPressed = false;
        let score = 0;
        let highScore = localStorage.getItem('highScore') || 0;
        let canShoot = true;
        let asteroidSpeed = 1;
        let gameOver = false;
        document.getElementById('highScore').textContent = `High Score: ${highScore}`;
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        function keyDownHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            } else if (e.key === 'Up' || e.key === 'ArrowUp') {
                upPressed = true;
                shoot();
            }
        }

        function keyUpHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            } else if (e.key === 'Up' || e.key === 'ArrowUp') {
                upPressed = false;
            }
        }

        function shoot() {
            if (canShoot) {
                bullets.push({ x: spaceship.x + spaceship.width / 2 - 5, y: spaceship.y, width: 10, height: 20, color: '#F50101' });
                canShoot = false;
                setTimeout(() => canShoot = true, 100);
            }
        }

        function drawSpaceship() {
            const centerX = spaceship.x + spaceship.width / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, spaceship.y);
            ctx.lineTo(centerX + spaceship.width / 2, spaceship.y + spaceship.height);
            ctx.lineTo(centerX - spaceship.width / 2, spaceship.y + spaceship.height);
            ctx.closePath();
            ctx.fillStyle = '#FFFF00'; // Yellow color
            ctx.fill();
        }


        function createAsteroid() {
            asteroids.push({
                x: Math.random() * (canvas.width - 60) + 30,
                y: Math.random() * -100,
                radius: 30,
                color: Math.random() < 0.5 ? '#8B0000' : '#808080',
                status: 1
            });
        }

        function drawAsteroids() {
            asteroids.forEach(asteroid => {
                if (asteroid.status === 1) {
                    ctx.beginPath();
                    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
                    ctx.fillStyle = asteroid.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });
        }

        function updateAsteroids() {
            asteroids.forEach((asteroid, index) => {
                if (asteroid.status === 1) {
                    asteroid.y += asteroidSpeed;
                    if (asteroid.y > canvas.height) {
                        asteroid.y = -asteroid.radius;
                        asteroid.x = Math.random() * (canvas.width - asteroid.radius * 2) + asteroid.radius;
                    }
                    checkSpaceshipCollision(asteroid);
                }
            });
        }

        function drawBullets() {
            bullets.forEach(bullet => {
                ctx.beginPath();
                ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.fillStyle = bullet.color;
                ctx.fill();
                ctx.closePath();
            });
        }

        function updateBullets() {
            bullets.forEach((bullet, index) => {
                bullet.y -= 5;
                if (bullet.y < 0) {
                    bullets.splice(index, 1);
                } else {
                    checkCollision(bullet, index);
                }
            });
        }

        function createExplosion(x, y) {
            for (let i = 0; i < 10; i++) {
                explosions.push({
                    x: x,
                    y: y,
                    radius: Math.random() * 5 + 2,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    alpha: 1
                });
            }
        }

        function drawExplosions() {
            explosions.forEach((explosion, index) => {
                if (explosion.alpha <= 0) {
                    explosions.splice(index, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 0, 0, ${explosion.alpha})`;
                    ctx.fill();
                    ctx.closePath();
                    explosion.x += explosion.dx;
                    explosion.y += explosion.dy;
                    explosion.alpha -= 0.02;
                }
            });
        }

        function checkCollision(bullet, bulletIndex) {
            asteroids.forEach((asteroid, asteroidIndex) => {
                if (asteroid.status === 1 &&
                    bullet.x < asteroid.x + asteroid.radius &&
                    bullet.x + bullet.width > asteroid.x - asteroid.radius &&
                    bullet.y < asteroid.y + asteroid.radius &&
                    bullet.y + bullet.height > asteroid.y - asteroid.radius) {
            
                    bullets.splice(bulletIndex, 1);
                    createExplosion(asteroid.x, asteroid.y);

            // Remove the hit asteroid
                    asteroids.splice(asteroidIndex, 1);

            // Spawn two new asteroids if the total is less than 9
                    if (asteroids.length + 2 <= 9) {
                        for (let i = 0; i < 2; i++) {
                            asteroids.push({
                                x: Math.random() * (canvas.width - 60) + 30,
                                y: Math.random() * -100,
                                radius: 30,
                                color: Math.random() < 0.5 ? '#8B0000' : '#808080',
                                status: 1
                            });
                        }
                    }       

                    asteroidSpeed += 0.2;
                    score++;
                    document.getElementById('score').textContent = `Score: ${score}`;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        document.getElementById('highScore').textContent = `High Score: ${highScore}`;
                    }
                }
            });
        }



        function checkSpaceshipCollision(asteroid) {
            const hitboxWidth = spaceship.width * 0.8;
            const hitboxHeight = spaceship.height * 0.8;
            const hitboxX = spaceship.x + (spaceship.width - hitboxWidth) / 2;
            const hitboxY = spaceship.y + (spaceship.height - hitboxHeight) / 2;
    
            if (
                hitboxX < asteroid.x + asteroid.radius &&
                hitboxX + hitboxWidth > asteroid.x - asteroid.radius &&
                hitboxY < asteroid.y + asteroid.radius &&
                hitboxY + hitboxHeight > asteroid.y - asteroid.radius
            ) {
                gameOver = true;
                showEndScreen();
            }
        }



        function showEndScreen() {
            document.getElementById('finalScore').textContent = `Final Score: ${score}`;
            document.getElementById('endScreen').style.display = 'flex';
        }

        function restartGame() {
            document.location.reload();
        }

        function spawnAsteroids() {
            if (asteroids.length < 9) {
                createAsteroid();
            }
            setTimeout(spawnAsteroids, Math.random() * 1000 + 500); // Random interval between 0.5 to 1.5 seconds
        }

        function draw() {
            if (gameOver) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSpaceship();
            drawAsteroids();
            drawBullets();
            drawExplosions();
            if (rightPressed && spaceship.x < canvas.width - spaceship.width) {
                spaceship.x += 10; // Faster speed
            } else if (leftPressed && spaceship.x > 0) {
                spaceship.x -= 10; // Faster speed
            }
            updateBullets();
            updateAsteroids();
            requestAnimationFrame(draw);
        }

        spawnAsteroids();
        draw();
    </script>
</body>
</html>
