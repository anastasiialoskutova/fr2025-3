const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/saveScore', (req, res) => {
    const newScore = req.body;
    fs.readFile('scores.json', (err, data) => {
        let scores = [];
        if (!err) {
            try {
                scores = JSON.parse(data);
            } catch (e) {
                console.error('Помилка парсингу JSON:', e);
                scores = [];
            }
        } else {
            console.error('Помилка читання файлу:', err);
            scores = [];
        }

        const existingScoreIndex = scores.findIndex(score => score.name === newScore.name && score.date === newScore.date);

        if (existingScoreIndex !== -1) {
            if (Array.isArray(scores[existingScoreIndex].score)) {
                scores[existingScoreIndex].score.push(newScore.score);
            } else {
                scores[existingScoreIndex].score = [scores[existingScoreIndex].score, newScore.score];
            }
        } else {
            scores.push(newScore);
        }

        fs.writeFile('scores.json', JSON.stringify(scores, null, 2), (err) => {
            if (err) {
                console.error('Помилка запису у файл:', err);
                res.status(500).send('Помилка збереження результату.');
            } else {
                res.send('Результат збережено.');
            }
        });
    });
});

app.listen(3000, () => {
    console.log('Сервер запущено на порту 3000');
});