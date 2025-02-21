const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startGameButton = document.getElementById('startGame');
const endGameButton = document.getElementById('endGame');
const moveUpButton = document.getElementById('moveUp');
const moveDownButton = document.getElementById('moveDown');

let player = { x: 50, y: 50, size: 50, image: new Image() };
player.image.src = 'images/player.png';
player.image.onload = () => {
    console.log('Гравець завантажено!');
};
player.image.onerror = () => {
    console.error('Помилка завантаження гравця!');
};

let obstacles = [];
let score = 0;
let gameInterval;

function drawPlayer() {
    if (player.image.complete && player.image.naturalHeight !== 0) {
        ctx.drawImage(player.image, player.x, player.y, player.size, player.size);
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.image.complete && obstacle.image.naturalHeight !== 0) {
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.size, obstacle.size);
        }
    });
}

function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    scoreDisplay.textContent = score;
}

function movePlayer(direction) {
    switch (direction) {
        case 'up':
            if (player.y - 10 >= 0) player.y -= 10;
            break;
        case 'down':
            if (player.y + 10 + player.size <= canvas.height) player.y += 10;
            break;
        case 'left':
            if (player.x - 10 >= 0) player.x -= 10;
            break;
        case 'right':
            if (player.x + 10 + player.size <= canvas.width) player.x += 10;
            break;
    }
}

function generateObstacles() {
    if (Math.random() < 0.02) {
        let obstacle = {
            x: canvas.width,
            y: Math.random() * (canvas.height - 30), // Щоб перешкода не виходила за межі
            size: 30,
            image: new Image()
        };
        obstacle.image.src = 'images/obstacle.png';
        obstacle.image.onload = () => {
            console.log('Перешкода завантажена!');
        };
        obstacle.image.onerror = () => {
            console.error('Помилка завантаження перешкоди!');
        };
        obstacles.push(obstacle);
    }
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.size < 0) {
            obstacles.splice(index, 1); // Видалення перешкод, які вийшли за межі
        }
    });
}

function checkCollisions() {
    obstacles.forEach((obstacle, index) => {
        if (player.x < obstacle.x + obstacle.size &&
            player.x + player.size > obstacle.x &&
            player.y < obstacle.y + obstacle.size &&
            player.y + player.size > obstacle.y) {
            obstacles.splice(index, 1);
            score++;
        }
    });
}

function saveScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    if(scores.length > 0){
        localStorage.setItem('previousScore', JSON.stringify(scores[scores.length - 1]));
    }
    scores.push({ name: 'Гравець', score: score, date: new Date().toLocaleDateString() });
    localStorage.setItem('scores', JSON.stringify(scores));
}

function saveScoreToFile() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const dataStr = JSON.stringify(scores);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'scores.json');
    linkElement.click();
}

startGameButton.addEventListener('click', () => {
    gameInterval = setInterval(() => {
        generateObstacles();
        checkCollisions();
        updateGameArea();
    }, 100);
});

endGameButton.addEventListener('click', () => {
    clearInterval(gameInterval);
    saveScore();
    saveScoreToFile();
    alert('Гра завершена! Рахунок збережено.');
    obstacles = [];
    let previousScore = JSON.parse(localStorage.getItem('previousScore'));
    if(previousScore){
        alert('Передостанній результат: ' + previousScore.score);
    }
});

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': movePlayer('up'); break;
        case 'ArrowDown': movePlayer('down'); break;
        case 'ArrowLeft': movePlayer('left'); break;
        case 'ArrowRight': movePlayer('right'); break;
    }
});

moveUpButton.addEventListener('click', () => movePlayer('up'));
moveDownButton.addEventListener('click', () => movePlayer('down'));

function displayScores() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    let scoresTable = "<table><tr><th>Ім'я</th><th>Рахунок</th><th>Дата</th></tr>";
    scores.forEach(scoreEntry => {
        scoresTable += `<tr><td>${scoreEntry.name}</td><td>${scoreEntry.score}</td><td>${scoreEntry.date}</td></tr>`;
    });
    scoresTable += "</table>";
    document.body.innerHTML += scoresTable;
}

function clearScores() {
    localStorage.removeItem('scores');
    alert('Результати очищено.');
}

document.getElementById('displayScores').addEventListener('click', displayScores);
document.getElementById('clearScores').addEventListener('click', clearScores);