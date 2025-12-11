document.addEventListener('DOMContentLoaded', function() {
    // ========== НАСТРОЙКА И ПЕРЕМЕННЫЕ ==========
    console.log('Lumen: Инициализация анимации письма...');
    
    // Основные элементы
    const textInput = document.getElementById('textInput');
    const fontSelect = document.getElementById('fontSelect');
    const colorPicker = document.getElementById('colorPicker');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const displayText = document.getElementById('displayText');
    
    // Элементы управления анимацией
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnStop = document.getElementById('btnStop');
    const btnRewind = document.getElementById('btnRewind');
    const btnBack = document.getElementById('btnBack');
    const btnForward = document.getElementById('btnForward');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Переменные состояния анимации
    let animationInterval;
    let currentIndex = 0;
    let isPlaying = false;
    let animationSpeed = 200; // начальная скорость (мс на букву)
    let fullText = '';
    
    // ========== ИНИЦИАЛИЗАЦИЯ ШРИФТОВ ==========
    // Очищаем старые опции и добавляем новые
    fontSelect.innerHTML = '';
    const fonts = [
        { name: 'Рукописный (Caveat)', value: "'Caveat', cursive" },
        { name: 'Аккуратный (Roboto)', value: "'Roboto', sans-serif" },
        { name: 'Классический (Playfair)', value: "'Playfair Display', serif" },
        { name: 'Моноширинный', value: "'Courier New', monospace" }
    ];
    
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.value;
        option.textContent = font.name;
        fontSelect.appendChild(option);
    });
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========
    
    // Функция обновления предпросмотра (статичный текст)
    function updateStaticPreview() {
        const text = textInput.value.trim() || 'Ваш текст появится здесь';
        const font = fontSelect.value;
        const color = colorPicker.value;
        const size = sizeSlider.value + 'px';
        
        displayText.textContent = text;
        displayText.style.fontFamily = font;
        displayText.style.color = color;
        displayText.style.fontSize = size;
    }
    
    // Функция обновления анимированного текста (показывает текст до currentIndex)
    function updateAnimatedText() {
        const font = fontSelect.value;
        const color = colorPicker.value;
        const size = sizeSlider.value + 'px';
        
        // Показываем только часть текста (от начала до currentIndex)
        const visibleText = fullText.substring(0, currentIndex);
        displayText.textContent = visibleText;
        displayText.style.fontFamily = font;
        displayText.style.color = color;
        displayText.style.fontSize = size;
    }
    
    // Функция начала/паузы анимации
    function toggleAnimation() {
        if (!fullText) {
            alert('Сначала введите текст для анимации!');
            textInput.focus();
            return;
        }
        
        if (isPlaying) {
            // Если анимация играет - ставим на паузу
            pauseAnimation();
            btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
            btnPlayPause.title = 'Воспроизвести';
        } else {
            // Если анимация на паузе - запускаем
            startAnimation();
            btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
            btnPlayPause.title = 'Пауза';
        }
        isPlaying = !isPlaying;
    }
    
    // Функция запуска анимации
    function startAnimation() {
        // Если текст закончился - начинаем сначала
        if (currentIndex >= fullText.length) {
            currentIndex = 0;
        }
        
        clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            currentIndex++;
            updateAnimatedText();
            
            // Если дошли до конца текста
            if (currentIndex > fullText.length) {
                pauseAnimation();
                isPlaying = false;
                btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
                btnPlayPause.title = 'Воспроизвести';
            }
        }, animationSpeed);
    }
    
    // Функция паузы анимации
    function pauseAnimation() {
        clearInterval(animationInterval);
    }
    
    // Функция остановки анимации (сброс в начало)
    function stopAnimation() {
        clearInterval(animationInterval);
        isPlaying = false;
        currentIndex = 0;
        updateAnimatedText();
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
        btnPlayPause.title = 'Воспроизвести';
    }
    
    // Функция перемотки в начало
    function rewindAnimation() {
        currentIndex = 0;
        updateAnimatedText();
        if (isPlaying) {
            // Если анимация играла - продолжаем с начала
            startAnimation();
        }
    }
    
    // Функция шага назад
    function stepBack() {
        if (currentIndex > 0) {
            currentIndex--;
            updateAnimatedText();
        }
    }
    
    // Функция шага вперёд
    function stepForward() {
        if (currentIndex < fullText.length) {
            currentIndex++;
            updateAnimatedText();
        }
    }
    
    // Функция обновления скорости
    function updateSpeed() {
        const speed = parseInt(speedSlider.value);
        speedValue.textContent = speed;
        // Преобразуем шкалу 1-10 в интервал 400-50 мс (чем больше скорость, тем меньше интервал)
        animationSpeed = 450 - (speed * 40);
        
        // Если анимация сейчас играет, перезапускаем с новой скоростью
        if (isPlaying) {
            pauseAnimation();
            startAnimation();
        }
    }
    
    // ========== НАСТРОЙКА СОБЫТИЙ ==========
    
    // Событие при изменении текста - обновляем fullText и ставим на паузу
    textInput.addEventListener('input', function() {
        fullText = this.value.trim();
        if (fullText) {
            // Автоматически ставим на паузу при изменении текста
            if (isPlaying) {
                pauseAnimation();
                isPlaying = false;
                btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
            }
            currentIndex = Math.min(currentIndex, fullText.length);
            updateAnimatedText();
        } else {
            updateStaticPreview();
        }
    });
    
    // События для элементов управления
    btnPlayPause.addEventListener('click', toggleAnimation);
    btnStop.addEventListener('click', stopAnimation);
    btnRewind.addEventListener('click', rewindAnimation);
    btnBack.addEventListener('click', stepBack);
    btnForward.addEventListener('click', stepForward);
    speedSlider.addEventListener('input', updateSpeed);
    
    // События для стилей (меняются в реальном времени)
    fontSelect.addEventListener('change', function() {
        if (fullText && currentIndex > 0) {
            updateAnimatedText();
        } else {
            updateStaticPreview();
        }
    });
    
    colorPicker.addEventListener('input', function() {
        if (fullText && currentIndex > 0) {
            updateAnimatedText();
        } else {
            updateStaticPreview();
        }
    });
    
    sizeSlider.addEventListener('input', function() {
        sizeValue.textContent = this.value;
        if (fullText && currentIndex > 0) {
            updateAnimatedText();
        } else {
            updateStaticPreview();
        }
    });
    
    // Кнопка скачивания (заглушка на будущее)
    downloadBtn.addEventListener('click', function() {
        if (!fullText) {
            alert('Введите текст для создания анимации!');
            return;
        }
        alert('Функция скачивания видео-анимации будет добавлена в следующем обновлении!\n\nТекущий текст: "' + fullText + '"');
    });
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    
    // Устанавливаем начальную скорость
    updateSpeed();
    
    // Показываем начальный текст
    updateStaticPreview();
    
    console.log('Lumen: Анимация письма готова к работе!');
});
