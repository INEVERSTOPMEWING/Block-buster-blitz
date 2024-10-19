 <script>
        const startScreen = document.getElementById('startScreen');
        const gameCanvas = document.getElementById('gameCanvas');
        const startButton = document.getElementById('startButton');
    
        startScreen.style.display = 'flex';
    
        startButton.addEventListener('click', () => {
            startScreen.style.display = 'none';
            gameCanvas.style.display = 'block';
            document.getElementById('score').style.display = 'block';
            document.getElementById('highScore').style.display = 'block';
            draw();
        });
    
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let ballX = canvas.width / 2;
        let ballY = canvas.height - 30;
        let ballDX = 4;
        let ballDY = -4;
        const ballRadius = 10;
        let paddleHeight = 10;
        let paddleWidth = 100;
        let paddleX = (canvas.width - paddleWidth) / 2;
        let rightPressed = false;
        let leftPressed = false;
        let score = 0;
        let highScore = localStorage.getItem('highScore') || 0;
        document.getElementById('highScore').textContent = `High Score: ${highScore}`;
        const brickRowCount = 5;
        const brickColumnCount = 7;
        const brickWidth = 75;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 30;
        const bricks = [];
        function isOverlapping(newBrick) {
            for (let i = 0; i < bricks.length; i++) {
                const b = bricks[i];
                if (b.status === 1) {
                    if (newBrick.x < b.x + brickWidth && newBrick.x + brickWidth > b.x && newBrick.y < b.y + brickHeight && newBrick.y + brickHeight > b.y) {
                        return true;
                    }
                }
            }
            return false;
        }
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let brickX, brickY;
                do {
                    brickX = Math.random() * (canvas.width - brickWidth);
                    brickY = Math.random() * (canvas.height / 2 - brickHeight) + brickOffsetTop;
                } while (isOverlapping({ x: brickX, y: brickY, status: 1 }));
                const brickColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                bricks.push({ x: brickX, y: brickY, status: 1, color: brickColor });
            }
        }
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        function keyDownHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            }
        }
        function keyUpHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            }
        }
        function drawBall() {
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        }
        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        }
        function drawBricks() {
            for (let i = 0; i < bricks.length; i++) {
                const b = bricks[i];
                if (b.status === 1) {
                    ctx.beginPath();
                    ctx.rect(b.x, b.y, brickWidth, brickHeight);
                    ctx.fillStyle = b.color;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
        function collisionDetection() {
            for (let i = 0; i < bricks.length; i++) {
                const b = bricks[i];
                if (b.status === 1) {
                    if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                        ballDY = -ballDY;
                        b.status = 0;
                        score++;
                        ballDX *= 1.03;
                        ballDY *= 1.03;
                        if (checkVictory()) {
                            victory();
                        }
                    }
                }
            }
        }
        function checkVictory() {
            return bricks.every(b => b.status === 0);
        }
        function victory() {
            document.getElementById('score').textContent = 'Victory';
            setTimeout(() => {
                document.location.reload();
            }, 3000);
        }
        function drawScore() {
            document.getElementById('score').textContent = `Score: ${score}`;
        }
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();
            drawScore();
            collisionDetection();
            if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
                ballDX = -ballDX;
            }
            if (ballY + ballDY < ballRadius) {
                ballDY = -ballDY;
            } else if (ballY + ballDY > canvas.height - ballRadius) {
                if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                    ballDY = -ballDY;
                } else {
                    endGame();
                }
            }
            ballX += ballDX;
            ballY += ballDY;
            if (rightPressed && paddleX < canvas.width - paddleWidth) {
                paddleX += 15;
            } else if (leftPressed && paddleX > 0) {
                paddleX -= 10;
            }
            requestAnimationFrame(draw);
        }
        function endGame() {
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('highScore').textContent = `High Score: ${highScore}`;
            }
            window.location.href = window.location.href;  // Force a full page reload
        }

    </script>
