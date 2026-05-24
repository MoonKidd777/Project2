// Словарь для проверки (как в Python)
const WORDS = {
    "Яблоко": "apple",
    "Банан": "banana",
    "Кот": "cat",
    "Собака": "dog",
    "Дом": "house",
    "Машина": "car",
    "Книга": "book",
};

// --- Элементы DOM ---
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

// --- Состояние приложения (как в классе Python) ---
let originalWords = [];
let words = [];
let currentIndex = 0;
let stats = { correct: 0, mistakes: 0 };
let mistakesList = [];
let alreadyMistaked = false; // Флаг "уже ошиблись на этом слове"
let correctAnswer = ''; // Правильный ответ для текущего слова
let wordForLog = ''; // Слово для логирования ошибки

// --- Инициализация ---
window.onload = function() {
   originalWords = Object.entries(WORDS);
   resetAndUpdate();
};

// --- Основные функции ---
function resetAndUpdate() {
   // Копируем и перемешиваем массив (как .copy() + random.shuffle)
   words = [...originalWords].sort(() => Math.random() - 0.5);
   currentIndex = 0;
   stats = { correct: 0, mistakes: 0 };
   mistakesList = [];
   alreadyMistaked = false; // Сброс флага

   updateWordDisplay();
   updateProgressBar();
   
   statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length}`;
   
   // Сброс интерфейса
   resultScreen.classList.add('hidden');
   checkBtn.disabled = false; // Включаем кнопку "Проверить"
   answerInput.disabled = false; // Включаем ввод
};

function updateWordDisplay() {
   if (currentIndex < words.length) {
      const [ruWord, enWord] = words[currentIndex];
      const direction = getSelectedDirection();
      
      if (direction === 'ru_to_en') {
         wordDisplay.innerHTML = `Введите перевод (RU → EN): ${ruWord}`;
         correctAnswer = enWord.toLowerCase();
         wordForLog = ruWord; // Для записи в список ошибок
      } else {
         wordDisplay.innerHTML = `Введите перевод (EN → RU): ${enWord}`;
         correctAnswer = ruWord.toLowerCase();
         wordForLog = enWord; // Для записи в список ошибок
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
   const percent = (currentIndex / words.length) * 100 || 0; // Защита от деления на ноль
   progressFill.style.width = `${percent}%`;
}

// --- Обработчики событий ---
checkBtn.addEventListener('click', checkAnswer);
resetBtn.addEventListener('click', resetAndUpdate);
playAgainBtn.addEventListener('click', resetAndUpdate);
directionRadios.forEach(radio => radio.addEventListener('change', resetAndUpdate));
answerInput.addEventListener('keydown', function(e) {
   if (e.key === 'Enter') checkAnswer();
});

// --- Логика проверки (копия метода check_answer из Python) ---
function checkAnswer() {
   const userAnswer = answerInput.value.trim().toLowerCase();
   
   if (userAnswer === correctAnswer) {
      // Если ответили верно и это НЕ повторная попытка после ошибки
      if (!alreadyMistaked) {
         stats.correct++;
      }
      
      currentIndex++;
      alreadyMistaked = false; // Сбрасываем флаг для следующего слова

      updateProgressBar();
      statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length - currentIndex}`;
      
      if (currentIndex < words.length) {
         updateWordDisplay();
      } else {
         showResults();
      }
      return; // Выход из функции после верного ответа или перехода к следующему слову
   }
   
   // --- Блок обработки ошибки ---
   
   // Если это первая ошибка на текущее слово в этой попытке
   if (!alreadyMistaked) {
      stats.mistakes++;
      
      // Добавляем слово в список ошибок только один раз за игру
      if (!mistakesList.includes(wordForLog)) {
         mistakesList.push(wordForLog);
      }
      
      alert(`❌ Ошибка! Правильный ответ был:\n${correctAnswer.charAt(0).toUpperCase() + correctAnswer.slice(1)}`);
      
      alreadyMistaked = true; // Устанавливаем флаг, чтобы не считать повторные ошибки на это же слово
      
      statsDisplay.textContent = `Верных ответов: ${stats.correct} | Ошибок: ${stats.mistakes} | Осталось: ${words.length - currentIndex}`;
      
      answerInput.value = ''; // Очищаем поле для новой попытки того же слова
      answerInput.focus();
   }
}

function showResults() {
   wordDisplay.innerHTML = '';
   
   let resultText = `🎉 Тест завершён!\n\n`;
   resultText += `✅ Правильных ответов (с первой попытки): ${stats.correct}\n`;
   resultText += `❌ Ошибок (уникальных слов): ${stats.mistakes}\n\n`;
   
   resultText += `Слова с ошибками:\n`;
   resultText += mistakesList.length > 0 ? mistakesList.join(', ') : '—';
   
   finalResultText.textContent = resultText.replaceAll('\n', '<br><br>'); // Для переноса строк в HTML

   resultScreen.classList.remove('hidden');
   
   // Блокируем ввод после завершения теста
   checkBtn.disabled = true; 
   answerInput.disabled = true; 
}
