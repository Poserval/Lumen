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
    const btnRewindSpeed = document.getElementById('btnRewindSpeed');
    const btnForwardSpeed = document.getElementById('btnForwardSpeed');
    const progressSlider = document.getElementById('progressSlider');
    const progressValue = document.getElementById('progressValue');
    const downloadBtn = document.getElementById('downloadBtn');

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let fonts = {};
    let currentFont = null;
    let textPaths = [];
    let currentAnimation = null;
    let isPlaying = false;
    let currentPathIndex = 0;
    let totalDuration = 0;
    let currentSpeed = 1;
    let forwardSpeed = 1;
    let rewindSpeed = 1;
    let baseSpeed = 200;
    let isReverse = false;
    let currentFontName = '';

    // ========== ЗАГРУЗКА ШРИФТОВ ==========
    async function loadFonts() {
        console.log('Загрузка шрифтов...');
        fonts = {};

        const fontFiles = [
            { name: 'AlayaRoza', path: 'fonts/AlayaRozaDemo.otf' },
            { name: 'Antarctic', path: 'fonts/Antarctic.otf' },
            { name: 'Caveat-Bold', path: 'fonts/Caveat-Bolt.ttf' },
            { name: 'RozoviiChulok', path: 'fonts/rozoviichulok_regular.ttf' },
            { name: 'Caveat', path: 'fonts/Caveat-Regular.ttf' }
        ];

        const loadPromises = fontFiles.map(async (font) => {
            try {
                fonts[font.name] = await opentype.load(font.path);
                console.log(`✓ Шрифт "${font.name}" загружен`);
                return { name: font.name, success: true };
            } catch (error) {
                console.warn(`✗ Не удалось загрузить "${font.name}":`, error.message);
                fonts[font.name] = null;
                return { name: font.name, success: false };
            }
        });

        await Promise.allSettled(loadPromises);
        
        fontSelect.innerHTML = '';
        for (const fontName in fonts) {
            if (fonts[fontName] !== null) {
                const option = document.createElement('option');
                option.value = fontName;
                
                let displayName = fontName;
                if (fontName === 'AlayaRoza') displayName = 'AlayaRoza (каллиграфия)';
                if (fontName === 'Antarctic') displayName = 'Antarctic (печатный)';
                if (fontName === 'Caveat-Bold') displayName = 'Caveat Bold (жирный)';
                if (fontName === 'RozoviiChulok') displayName = 'Rozovii Chulok (детский)';
                if (fontName === 'Caveat') displayName = 'Caveat (стандартный)';
                
                option.textContent = displayName;
                fontSelect.appendChild(option);
            }
        }
        
        const firstLoaded = Object.keys(fonts).find(name => fonts[name] !== null);
        if (firstLoaded) {
            fontSelect.value = firstLoaded;
            currentFont = fonts[firstLoaded];
            currentFontName = firstLoaded;
        }
        
        fallbackText.textContent = 'Шрифты загружены. Введите текст.';
        console.log('Загрузка шрифтов завершена.');
    }

    // ========== ПРЕОБРАЗОВАНИЕ ТЕКСТА В ПУТИ ==========
    function textToPaths(text, fontSize = 100) {
        svgContainer.innerHTML = '';
        textPaths = [];
        currentPathIndex = 0;
        totalDuration = 0;
        
        if (!text.trim()) {
            fallbackText.textContent = 'Введите текст для рисования';
            fallbackText.style.display = 'block';
            updateProgress(0);
            return;
        }
        
        if (!currentFont) {
            fallbackText.textContent = 'Шрифт не загружен. Выберите другой.';
            fallbackText.style.display = 'block';
            return;
        }
        
        fallbackText.style.display = 'none';
        
        try {
            let x = 80;
            const y = 180;
            const letterSpacing = 15;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
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
                    
                    const length = pathElement.getTotalLength();
                    pathElement.style.strokeDasharray = length;
                    pathElement.style.strokeDashoffset = length;
                    
                    svgContainer.appendChild(pathElement);
                    textPaths.push({
                        element: pathElement,
                        length: length,
                        char: char,
                        index: i
                    });
                    
                    totalDuration += baseSpeed;
                    x += glyph.advanceWidth * (fontSize / currentFont.unitsPerEm) + letterSpacing;
                }
            }
            
            svgContainer.setAttribute('viewBox', `0 0 ${x + 100} 300`);
            updateProgress(0);
            
        } catch (error) {
            console.error('Ошибка создания путей:', error);
            fallbackText.style.display = 'block';
            fallbackText.textContent = 'Ошибка создания контуров. Попробуйте другой шрифт.';
        }
    }

    // ========== УПРАВЛЕНИЕ СКОРОСТЬЮ ==========
    function updateSpeedDisplay() {
        // Обновляем индикаторы на кнопках
        const forwardIndicator = btnForwardSpeed.querySelector('.speed-indicator');
        const rewindIndicator = btnRewindSpeed.querySelector('.speed-indicator');
        
        forwardIndicator.textContent = forwardSpeed + 'x';
        rewindIndicator.textContent = rewindSpeed + 'x';
        
        // Обновляем классы для стилизации
        btnForwardSpeed.className = 'control-btn speed-btn';
        btnRewindSpeed.className = 'control-btn speed-btn';
        
        btnForwardSpeed.classList.add(`speed-${forwardSpeed}x`);
        btnRewindSpeed.classList.add(`speed-${rewindSpeed}x`);
        
        if (isReverse) {
            btnRewindSpeed.classList.add('active');
            btnRewindSpeed.classList.add('reverse');
            // Для кнопки "назад" используем обратное значение (1/2, 1/4, 1/8)
            currentSpeed = 1 / rewindSpeed;
        } else {
            btnForwardSpeed.classList.add('active');
            currentSpeed = forwardSpeed; // 1, 2, 4, 8
        }
        
        console.log(`Текущая скорость: ${currentSpeed}x, Направление: вперед`);
    }

    function changeSpeed(forward = true) {
        if (forward) {
            // Сбрасываем скорость назад к 1x
            rewindSpeed = 1;
            
            // Меняем скорость вперед по циклу
            const speeds = [1, 2, 4, 8];
            const currentIndex = speeds.indexOf(forwardSpeed);
            forwardSpeed = speeds[(currentIndex + 1) % speeds.length];
            
            isReverse = false;
        } else {
            // Сбрасываем скорость вперед к 1x
            forwardSpeed = 1;
            
            // Меняем скорость назад по циклу (для замедления)
            const speeds = [1, 2, 4, 8];
            const currentIndex = speeds.indexOf(rewindSpeed);
            rewindSpeed = speeds[(currentIndex + 1) % speeds.length];
            
            isReverse = true;
        }
        
        updateSpeedDisplay();
        
        if (isPlaying) {
            pauseAnimation();
            setTimeout(startAnimation, 50);
        }
    }

    function resetAllSpeeds() {
        forwardSpeed = 1;
        rewindSpeed = 1;
        isReverse = false;
        updateSpeedDisplay();
    }

    // ========== ПРОГРЕСС И ПЕРЕМОТКА ==========
    function calculateCurrentProgress() {
        if (textPaths.length === 0) return 0;
        return (currentPathIndex / textPaths.length) * 1000;
    }

    function updateProgress(value) {
        progressSlider.value = value;
        progressValue.textContent = Math.round((value / 10)) + '%';
    }

    function seekToProgress(value) {
        const progress = value / 1000;
        currentPathIndex = Math.floor(progress * textPaths.length);
        
        currentPathIndex = Math.max(0, Math.min(currentPathIndex, textPaths.length));
        
        textPaths.forEach(path => {
            const length = path.length;
            path.element.style.strokeDasharray = length;
            path.element.style.strokeDashoffset = length;
        });
        
        for (let i = 0; i < currentPathIndex; i++) {
            textPaths[i].element.style.strokeDashoffset = 0;
        }
        
        if (currentPathIndex < textPaths.length && !isPlaying) {
            const currentPath = textPaths[currentPathIndex];
            const partialProgress = (progress * textPaths.length) - currentPathIndex;
            currentPath.element.style.strokeDashoffset = currentPath.length * (1 - partialProgress);
        }
        
        updateProgress(value);
    }

    // ========== АНИМАЦИЯ (ВСЕГДА СЛЕВА НАПРАВО) ==========
    function drawNextPath() {
        if (currentPathIndex >= textPaths.length || currentPathIndex < 0) {
            pauseAnimation();
            btnPlayPause.innerHTML = '<i class="fas fa-redo"></i>';
            btnPlayPause.title = 'Начать заново';
            return;
        }
        
        const path = textPaths[currentPathIndex];
        
        // Вычисляем фактическую скорость анимации
        let actualSpeed;
        if (isReverse) {
            // Для кнопки "назад" - замедление (большее время)
            actualSpeed = baseSpeed * rewindSpeed; // 200 * 2 = 400ms, 200 * 4 = 800ms и т.д.
        } else {
            // Для кнопки "вперед" - ускорение (меньшее время)
            actualSpeed = baseSpeed / forwardSpeed; // 200 / 2 = 100ms, 200 / 4 = 50ms и т.д.
        }
        
        // Ограничиваем минимальную и максимальную скорость
        actualSpeed = Math.max(50, Math.min(2000, actualSpeed));
        
        console.log(`Анимация буквы ${currentPathIndex}, скорость: ${actualSpeed}ms`);
        
        currentAnimation = anime({
            targets: path.element,
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: actualSpeed,
            easing: 'easeInOutSine',
            begin: function() {
                path.element.style.stroke = colorPicker.value;
                path.element.style.strokeWidth = widthSlider.value + 'px';
            },
            complete: function() {
                currentPathIndex++; // Всегда увеличиваем индекс - всегда слева направо
                
                updateProgress(calculateCurrentProgress());
                
                if (isPlaying) {
                    setTimeout(drawNextPath, 50);
                }
            }
        });
    }

    function startAnimation() {
        if (textPaths.length === 0) {
            textToPaths(textInput.value.trim() || 'Привет');
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
        resetAllSpeeds();
        resetPaths();
        updateProgress(0);
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

    // ========== НАСТРОЙКА СОБЫТИЙ ==========
    function setupEventListeners() {
        textInput.addEventListener('input', function() {
            if (isPlaying) pauseAnimation();
            textToPaths(this.value.trim());
        });

        fontSelect.addEventListener('change', function() {
            currentFont = fonts[this.value];
            currentFontName = this.value;
            if (isPlaying) pauseAnimation();
            textToPaths(textInput.value.trim());
            currentPathIndex = 0;
        });

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

        btnPlayPause.addEventListener('click', function() {
            if (currentPathIndex >= textPaths.length && textPaths.length > 0) {
                currentPathIndex = 0;
                resetPaths();
                setTimeout(startAnimation, 100);
            } else {
                isPlaying ? pauseAnimation() : startAnimation();
            }
        });

        btnStop.addEventListener('click', stopAnimation);
        
        btnRewindSpeed.addEventListener('click', function() {
            changeSpeed(false);
        });
        
        btnForwardSpeed.addEventListener('click', function() {
            changeSpeed(true);
        });

        progressSlider.addEventListener('input', function() {
            if (isPlaying) pauseAnimation();
            seekToProgress(parseInt(this.value));
        });

        progressSlider.addEventListener('change', function() {
            seekToProgress(parseInt(this.value));
        });

        downloadBtn.addEventListener('click', function() {
            alert('Экспорт в видео будет добавлен в следующем обновлении.');
        });
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    await loadFonts();
    setupEventListeners();
    updateSpeedDisplay();
    textToPaths(textInput.value.trim());
    
    console.log('Lumen: Система готова с исправленным проигрывателем!');
});
