document.addEventListener('DOMContentLoaded', async function() {
    console.log('Lumen: Загрузка системы рисования текста...');

    // ========== ОСНОВНЫЕ ЭЛЕМЕНТЫ ==========
    const textInput = document.getElementById('textInput');
    const fontSelect = document.getElementById('fontSelect');
    const colorPicker = document.getElementById('colorPicker');
    const widthSlider = document.getElementById('widthSlider');
    const widthValue = document.getElementById('widthValue');
    const svgContainer = document.getElementById('textSvg');
    const fallbackText = document.getElementById('fallbackText');
    
    // Элементы управления
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnStop = document.getElementById('btnStop');
    const btnRewind = document.getElementById('btnRewind');
    const btnBack = document.getElementById('btnBack');
    const btnForward = document.getElementById('btnForward');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const downloadBtn = document.getElementById('downloadBtn');

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let fonts = {};
    let currentFont = null;
    let textPaths = []; // Массив SVG-путей для текущего текста
    let currentAnimation = null;
    let isPlaying = false;
    let currentPathIndex = 0;
    let animationSpeed = parseInt(speedSlider.value);

    // ========== ЗАГРУЗКА ШРИФТОВ ==========
    async function loadFonts() {
        try {
            console.log('Загрузка шрифтов...');
            
            // Основной рукописный шрифт (убедись, что файл fonts/Caveat-Regular.ttf существует в репозитории)
            fonts['Caveat'] = await opentype.load('fonts/Caveat-Regular.ttf');
            
            // Добавляем системные шрифты как запасные
            fonts['Arial'] = null; // Браузер сам подгрузит
            fonts['Georgia'] = null;
            
            // Заполняем выпадающий список
            fontSelect.innerHTML = '';
            for (const fontName in fonts) {
                const option = document.createElement('option');
                option.value = fontName;
                option.textContent = fontName + (fonts[fontName] ? ' (рукописный)' : ' (системный)');
                fontSelect.appendChild(option);
            }
            
            currentFont = fonts['Caveat'];
            fallbackText.textContent = 'Введите текст выше и нажмите "Начать рисование"';
            console.log('Шрифты загружены');
            
        } catch (error) {
            console.error('Ошибка загрузки шрифтов:', error);
            fallbackText.textContent = 'Ошибка загрузки шрифта. Использую системный.';
            currentFont = null;
        }
    }

    // ========== ПРЕОБРАЗОВАНИЕ ТЕКСТА В SVG-ПУТИ ==========
    function textToPaths(text, fontSize = 120) {
        // Очищаем SVG
        svgContainer.innerHTML = '';
        textPaths = [];
        
        if (!text.trim()) {
            fallbackText.textContent = 'Введите текст для рисования';
            return;
        }
        
        fallbackText.style.display = 'none';
        
        try {
            let x = 50;
            const y = 150;
            const letterSpacing = 5;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                // Для рукописного шрифта: получаем путь из файла .ttf
                if (currentFont && currentFont.charToGlyph) {
                    const glyph = currentFont.charToGlyph(char);
                    const path = glyph.getPath(x, y, fontSize);
                    
                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const pathData = path.toPathData(2);
                    
                    pathElement.setAttribute('d', pathData);
                    pathElement.setAttribute('stroke', colorPicker.value);
                    pathElement.setAttribute('stroke-width', widthSlider.value);
                    pathElement.setAttribute('fill', 'none');
                    pathElement.setAttribute('class', 'letter-path');
                    pathElement.setAttribute('data-index', i);
                    pathElement.setAttribute('data-char', char);
                    
                    // Изначально скрываем путь (длина тире = длина всего пути)
                    const length = pathElement.getTotalLength();
                    pathElement.style.strokeDasharray = length;
                    pathElement.style.strokeDashoffset = length;
                    
                    svgContainer.appendChild(pathElement);
                    textPaths.push({
                        element: pathElement,
                        length: length,
                        char: char
                    });
                    
                    x += glyph.advanceWidth * (fontSize / currentFont.unitsPerEm) + letterSpacing;
                    
                } else {
                    // Запасной вариант: создаём текстовый элемент (без анимации рисования)
                    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textElement.setAttribute('x', x);
                    textElement.setAttribute('y', y);
                    textElement.setAttribute('font-size', fontSize);
                    textElement.setAttribute('fill', colorPicker.value);
                    textElement.textContent = char;
                    
                    svgContainer.appendChild(textElement);
                    x += 40;
                }
            }
            
            // Подгоняем viewBox под ширину текста
            svgContainer.setAttribute('viewBox', `0 0 ${x + 100} 250`);
            
        } catch (error) {
            console.error('Ошибка создания путей:', error);
            fallbackText.style.display = 'block';
            fallbackText.textContent = 'Не удалось создать контуры. Используйте латиницу.';
        }
    }

    // ========== АНИМАЦИЯ РИСОВАНИЯ ==========
    function drawNextPath() {
        if (currentPathIndex >= textPaths.length) {
            pauseAnimation();
            btnPlayPause.innerHTML = '<i class="fas fa-redo"></i>';
            btnPlayPause.title = 'Начать заново';
            return;
        }
        
        const path = textPaths[currentPathIndex];
        
        // Анимация одного пути с помощью anime.js
        currentAnimation = anime({
            targets: path.element,
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: animationSpeed,
            easing: 'easeInOutSine',
            begin: function() {
                path.element.style.stroke = colorPicker.value;
                path.element.style.strokeWidth = widthSlider.value + 'px';
            },
            complete: function() {
                currentPathIndex++;
                if (isPlaying) {
                    setTimeout(drawNextPath, 50); // Небольшая пауза между буквами
                }
            }
        });
        
        updatePlayButton();
    }

    // ========== УПРАВЛЕНИЕ АНИМАЦИЕЙ ==========
    function startAnimation() {
        if (textPaths.length === 0) {
            const text = textInput.value.trim() || 'Lumen';
            textToPaths(text);
        }
        
        if (currentPathIndex >= textPaths.length) {
            currentPathIndex = 0;
            resetPaths();
        }
        
        isPlaying = true;
        drawNextPath();
        btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
        btnPlayPause.title = 'Пауза';
    }

    function pauseAnimation() {
        isPlaying = false;
        if (currentAnimation) currentAnimation.pause();
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
        btnPlayPause.title = 'Продолжить';
    }

    function stopAnimation() {
        pauseAnimation();
        currentPathIndex = 0;
        resetPaths();
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
        btnPlayPause.title = 'Начать рисование';
    }

    function resetPaths() {
        textPaths.forEach(path => {
            const length = path.length;
            path.element.style.strokeDasharray = length;
            path.element.style.strokeDashoffset = length;
        });
    }

    function stepBack() {
        if (currentPathIndex > 0) {
            currentPathIndex--;
            resetPaths();
            
            // Прорисовываем все пути до текущего индекса
            for (let i = 0; i < currentPathIndex; i++) {
                textPaths[i].element.style.strokeDashoffset = 0;
            }
            
            // Сбрасываем текущий путь
            textPaths[currentPathIndex].element.style.strokeDashoffset = 
                textPaths[currentPathIndex].length;
                
            if (isPlaying) pauseAnimation();
        }
    }

    function stepForward() {
        if (currentPathIndex < textPaths.length) {
            // Завершаем текущую букву
            textPaths[currentPathIndex].element.style.strokeDashoffset = 0;
            currentPathIndex++;
            
            if (currentPathIndex < textPaths.length) {
                // Начинаем следующую букву
                textPaths[currentPathIndex].element.style.strokeDashoffset = 
                    textPaths[currentPathIndex].length;
            }
            
            if (isPlaying) pauseAnimation();
        }
    }

    function rewindAnimation() {
        currentPathIndex = 0;
        resetPaths();
        if (isPlaying) {
            pauseAnimation();
            setTimeout(startAnimation, 100);
        }
    }

    function updatePlayButton() {
        if (currentPathIndex >= textPaths.length) {
            btnPlayPause.innerHTML = '<i class="fas fa-redo"></i>';
            btnPlayPause.title = 'Начать заново';
        }
    }

    // ========== ОБНОВЛЕНИЕ СКОРОСТИ ==========
    function updateSpeed() {
        animationSpeed = parseInt(speedSlider.value);
        speedValue.textContent = animationSpeed;
        
        if (isPlaying && currentAnimation) {
            currentAnimation.duration = animationSpeed;
        }
    }

    // ========== НАСТРОЙКА СОБЫТИЙ ==========
    function setupEventListeners() {
        // При изменении текста пересоздаём пути
        textInput.addEventListener('input', function() {
            if (isPlaying) pauseAnimation();
            textToPaths(this.value.trim());
            currentPathIndex = 0;
        });

        // Смена шрифта
        fontSelect.addEventListener('change', function() {
            currentFont = fonts[this.value];
            if (isPlaying) pauseAnimation();
            textToPaths(textInput.value.trim());
            currentPathIndex = 0;
        });

        // Смена цвета и толщины
        colorPicker.addEventListener('input', function() {
            textPaths.forEach(path => {
                path.element.style.stroke = this.value;
            });
        });

        widthSlider.addEventListener('input', function() {
            widthValue.textContent = this.value;
            textPaths.forEach(path => {
                path.element.style.strokeWidth = this.value + 'px';
            });
        });

        // Управление анимацией
        btnPlayPause.addEventListener('click', function() {
            if (currentPathIndex >= textPaths.length && textPaths.length > 0) {
                rewindAnimation();
                setTimeout(startAnimation, 100);
            } else {
                isPlaying ? pauseAnimation() : startAnimation();
            }
        });

        btnStop.addEventListener('click', stopAnimation);
        btnRewind.addEventListener('click', rewindAnimation);
        btnBack.addEventListener('click', stepBack);
        btnForward.addEventListener('click', stepForward);
        speedSlider.addEventListener('input', updateSpeed);

        // Кнопка скачивания
        downloadBtn.addEventListener('click', function() {
            alert('Функция экспорта анимации в видео будет добавлена позже.');
        });
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    await loadFonts();
    setupEventListeners();
    updateSpeed();
    
    // Создаём начальный текст
    textToPaths(textInput.value.trim());
    
    console.log('Lumen: Система рисования готова!');
});
