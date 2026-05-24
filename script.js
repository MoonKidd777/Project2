const WORDS = {
    "Яблоко": "apple",
    "Банан": "banana",
    "Кот": "cat",
    "Собака": "dog",
    "Дом": "house",
    "Машина": "car",
    "Книга": "book",
};

// Получаем элементы DOM
const wordDisplay = document.getElementById('word-display');
const answerInput = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const progressFill = document.getElementById('progress-fill');
const statsDisplay = document.getElementById('stats');
const resultScreen = document.getElementById('result-screen');
const finalResultText = document.getElementById('final-result');
const playAgainBtn = document.getElementById('play-again-btn');
const directionRadios = document.querySelectorAll('input[name="direction"]');

let originalWords = [];
let words = [];
let currentIndex = 0;
let stats = { correct: 0, mistakes: 0 };
let mistakesList = [];
let alreadyMistaked = false; // Флаг для подсчета ошибок на одно слово

// Инициализация при загрузке страницы
window.onload = function() {
   originalWords = Object.entries(WORDS);
   resetAndUpdate();
};

function resetAndUpdate() {
   words = [...originalWords].sort(() => Math.random() - 0.5); // Перемешивание
   currentIndex = 0;
   stats = { correct: 0, mistakes: 0 };
   mistakesList = [];
   alreadyMistaked = false;
   updateWordDisplay();
   updateProgressBar();
   statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length}`;
   resultScreen.classList.add('hidden');
}

function updateWordDisplay() {
   if (currentIndex < words.length) {
      const [ruWord, enWord] = words[currentIndex];
      const direction = getSelectedDirection();
      
      if (direction === 'ru_to_en') {
         wordDisplay.innerHTML = `<p>Введите перевод (RU → EN): <span class="word-highlight">${ruWord}</span></p>`;
         window.correctAnswer = enWord.toLowerCase();
         window.wordForLog = ruWord; // Для логирования ошибки
      } else {
         wordDisplay.innerHTML = `<p>Введите перевод (EN → RU): <span class="word-highlight">${enWord}</span></p>`;
         window.correctAnswer = ruWord.toLowerCase();
         window.wordForLog = enWord; // Для логирования ошибки
      }
      answerInput.value = '';
      answerInput.focus();
   } else {
      showResults();
   }
}

function getSelectedDirection() {
   return document.querySelector('input[name="direction"]:checked').value;
}

function updateProgressBar() {
   const percent = (currentIndex / words.length) * 100 || 0; // Если массив пуст, будет NaN, поэтому || 0
   progressFill.style.width = `${percent}%`;
}

checkBtn.addEventListener('click', checkAnswer);
resetBtn.addEventListener('click', resetAndUpdate);
playAgainBtn.addEventListener('click', resetAndUpdate);
directionRadios.forEach(radio => radio.addEventListener('change', resetAndUpdate));
answerInput.addEventListener('keydown', function(e) {
   if (e.key === 'Enter') checkAnswer();
});

function checkAnswer() {
   const userAnswer = answerInput.value.trim().toLowerCase();
   
   if (userAnswer === window.correctAnswer) {
      if (!alreadyMistaked) stats.correct++;
      currentIndex++;
      alreadyMistaked = false; // Сбрасываем флаг для следующего слова

      updateProgressBar();
      statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length - currentIndex}`;
      
      if (currentIndex < words.length) {
         updateWordDisplay();
      } else {
         showResults();
      }
      return true; // Ответ верный, выходим
   }
   
   // Если ответ неверный и это первая ошибка на это слово в текущей попытке
   if (!alreadyMistaked) {
      stats.mistakes++;
      if (!mistakesList.includes(window.wordForLog)) {
         mistakesList.push(window.wordForLog);
      }
      
      alert(`❌ Ошибка! Правильный ответ был:\n${window.correctAnswer.charAt(0).toUpperCase() + window.correctAnswer.slice(1)}`);
      alreadyMistaked = true; // Больше не считаем ошибки для этого слова до следующего хода
      
      statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length - currentIndex}`;
      
      answerInput.value = ''; // Очищаем поле для новой попытки того же слова
      answerInput.focus();
   }
   
   return false; // Ответ неверный или повторная ошибка на то же слово
}

function showResults() {
   wordDisplay.innerHTML = '';
   
   let resultText = `🎉 Тест завершён!\n\n`;
   resultText += `✅ Правильных ответов (с первой попытки): ${stats.correct}\n`;
   resultText += `❌ Ошибок (уникальных слов): ${stats.mistakes}\n\n`;
   
   resultText += `Слова с ошибками:\n`;
   resultText += mistakesList.length > 0 ? mistakesList.join(', ') : '—';
   
   finalResultText.textContent = resultText.replaceAll('\n', '\n\n'); // Добавляем пустые строки для красоты в HTML

   resultScreen.classList.remove('hidden');
}
