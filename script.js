// --- Данные ---
const WORDS = {
    "Яблоко": "apple",
    "Банан": "banana",
    "Кот": "cat",
    "Собака": "dog",
    "Дом": "house",
    "Машина": "car",
    "Книга": "book",
    "horse": "лошадь",
    "frog": "лягушка",
    "bear": "медведь",
    "mouse": "мышь",
    "mice": "мыши",
    "monkey": "обезьяна",
    "pig": "свинья",
    "elephant": "слон",
    "duck": "утка"
};

// --- Состояние приложения ---
let wordsList = [];
let currentIndex = 0;
let stats = { correct: 0, mistakes: 0 };
let mistakesList = [];
let alreadyMistaked = false;
let correctAnswer = '';
let wordForLog = '';

// --- Элементы DOM ---
const wordDisplay = document.getElementById('word-display');
const answerInput = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const startBtn = document.getElementById('start-btn');
const progressBarFill = document.getElementById('progress-bar-fill');
const statsInfo = document.getElementById('stats-info');
const resultMessage = document.getElementById('result-message');
const mistakesListElem = document.getElementById('mistakes-list');

// --- Функции ---

function resetAndUpdate() {
    // Создаем копию массива слов и перемешиваем его
    wordsList = Object.entries(WORDS);
    wordsList.sort(() => Math.random() - 0.5);
    
    currentIndex = 0;
    stats = { correct: 0, mistakes: 0 };
    mistakesList = [];
    alreadyMistaked = false;
    
    updateWordDisplay();
    updateProgress();
}

function updateWordDisplay() {
    if (currentIndex < wordsList.length) {
        const [ruWord, enWord] = wordsList[currentIndex];
        
        const direction = document.querySelector('input[name="direction"]:checked').value;
        
        if (direction === 'ru_to_en') {
            wordDisplay.textContent = `Введите перевод (RU → EN): ${ruWord}`;
            correctAnswer = enWord.toLowerCase();
            wordForLog = ruWord;
        } else {
            wordDisplay.textContent = `Введите перевод (EN → RU): ${enWord}`;
            correctAnswer = ruWord.toLowerCase();
            wordForLog = enWord;
        }
        
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;
        
        resultMessage.textContent = '';
        mistakesListElem.textContent = '';
    } else {
        showResults();
    }
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
        if (!alreadyMistaked) {
            stats.correct++;
        }
        
        currentIndex++;
        alreadyMistaked = false;
        
        if (currentIndex < wordsList.length) {
            updateWordDisplay();
        } else {
            showResults();
        }
    } else {
        if (!alreadyMistaked) {
            stats.mistakes++;
            
            if (!mistakesList.includes(wordForLog)) {
                mistakesList.push(wordForLog);
                mistakesListElem.textContent += `❌ ${wordForLog}\n`;
                
                resultMessage.textContent = `Ошибка! Правильный ответ: ${correctAnswer.charAt(0).toUpperCase() + correctAnswer.slice(1)}`;
                resultMessage.style.color = '#c62828';
                
                setTimeout(() => {
                    resultMessage.textContent = '';
                }, 2000);
                
                alreadyMistaked = true;
                answerInput.value = ''; // Очищаем поле для новой попытки
                answerInput.focus();
                return; // Не обновляем слово, даем шанс исправить ошибку
            }
        }
        
        // Если слово уже в списке ошибок, просто очищаем поле
        answerInput.value = '';
        answerInput.focus();
    }
    
    updateProgress();
}

function updateProgress() {
    const total = wordsList.length;
    const remaining = total - currentIndex;
    
    // Обновляем текст статистики
    statsInfo.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${remaining}`;
    
    // Обновляем прогресс-бар (от 0 до 100%)
    const percentComplete = (currentIndex / total) * 100;
    progressBarFill.style.width = `${percentComplete}%`;
}

function showResults() {
    // Скрываем элементы ввода
    answerInput.disabled = true;
    checkBtn.disabled = true;
    
    // Показываем финальный результат
    resultMessage.innerHTML = `
        🎉 Тест завершён!<br><br>
        ✅ Правильных ответов: ${stats.correct}<br>
        ❌ Ошибок: ${stats.mistakes}<br><br>
    `;
    
    mistakesListElem.textContent = mistakesList.length > 0 ? `Слова с ошибками:\n${mistakesList.join(', ')}` : 'Ошибок не было! Отличная работа!';
}

// --- События ---
startBtn.addEventListener('click', resetAndUpdate);
checkBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});
