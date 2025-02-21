const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startGameButton = document.getElementById('startGame');
const endGameButton = document.getElementById('endGame');
const moveUpButton = document.getElementById('moveUp');
const moveDownButton = document.getElementById('moveDown');
const moveLeftButton = document.getElementById('moveLeft');
const moveRightButton = document.getElementById('moveRight');
const clearScoresButton = document.getElementById('clearScores');
const previousScoreDisplay = document.getElementById('previousScoreDisplay');
const reloadPageButton = document.getElementById('reloadPage');

let player = { x: 50, y: 50, size: 50, image: new Image() };
player.image.src = 'images/player.png';

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
        case 'up': if (player.y - 10 >= 0) player.y -= 10; break;
        case 'down': if (player.y + 10 + player.size <= canvas.height) player.y += 10; break;
        case 'left': if (player.x - 10 >= 0) player.x -= 10; break;
        case 'right': if (player.x + 10 + player.size <= canvas.width) player.x += 10; break;
    }
}

function generateObstacles() {
    if (Math.random() < 0.02) {
        let obstacle = {
            x: canvas.width,
            y: Math.random() * (canvas.height - 30),
            size: 30,
            image: new Image()
        };
        obstacle.image.src = 'images/obstacle.png';
        obstacles.push(obstacle);
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.size < 0) {
            obstacles.splice(index, 1);
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
    let playerName = prompt("Введіть ваше ім'я:", "Гравець");
    if (!playerName) return;

    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    // Оновлення передостаннього рахунку
    if (scores.length > 0) {
        localStorage.setItem('previousScore', JSON.stringify(scores[scores.length - 1]));
    }

    let date = new Date().toLocaleDateString();
    const newScore = { name: playerName, score: score, date: date };

    // Збереження нового рахунку в LocalStorage
    scores.push(newScore);
    localStorage.setItem('scores', JSON.stringify(scores));

    // Оновлення JSON-файлу на сервері
    fetch('/saveScore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newScore)
    })
    .then(response => response.text())
    .then(data => {
        console.log('Збережено:', data);
    })
    .catch(error => {
        console.error('Помилка збереження:', error);
    });

    // Відображення передостаннього рахунку
    displayPreviousScore();
}

// Функція для відображення передостаннього рахунку (Одна версія!)
function displayPreviousScore() {
    let previousScore = JSON.parse(localStorage.getItem('previousScore'));
    if (previousScore) {
        previousScoreDisplay.innerHTML = `Передостанній результат: <b>${previousScore.name}</b> - ${previousScore.score} (${previousScore.date})`;
    } else {
        previousScoreDisplay.innerHTML = 'Передостанній результат відсутній';
    }
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
    alert('Гра завершена! Рахунок збережено.');
    obstacles = [];
    score = 0;
    scoreDisplay.textContent = score;
    displayPreviousScore();
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
moveLeftButton.addEventListener('click', () => movePlayer('left'));
moveRightButton.addEventListener('click', () => movePlayer('right'));

function displayScores() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    let scoresTable = "<table><tr><th>Ім'я</th><th>Рахунок</th><th>Дата</th></tr>";
    scores.forEach(scoreEntry => {
        scoresTable += `<tr><td>${scoreEntry.name}</td><td>${scoreEntry.score}</td><td>${scoreEntry.date}</td></tr>`;
    });
    scoresTable += "</table>";
    document.body.innerHTML += scoresTable;
}

reloadPageButton.addEventListener('click', () => location.reload());

document.getElementById('displayScores').addEventListener('click', displayScores);

// Викликаємо `displayPreviousScore` лише ОДИН раз при завантаженні сторінки
window.onload = displayPreviousScore;
