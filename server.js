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
                // Додаємо порожній масив, якщо парсинг не вдався.
                scores = [];
            }
        } else {
            // Якщо файл не існує, створюємо порожній масив.
            console.error('Помилка читання файлу:', err);
            scores = [];
        }
        scores.push(newScore);
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