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
    let textPaths = [];
    let currentAnimation = null;
    let isPlaying = false;
    let currentPathIndex = 0;
    let animationSpeed = parseInt(speedSlider.value);
    let currentFontName = '';

    // ========== ЗАГРУЗКА ШРИФТОВ (ТВОИ ФАЙЛЫ) ==========
    async function loadFonts() {
        console.log('Загрузка шрифтов...');
        fonts = {};

        // ВСЕ ТВОИ ШРИФТЫ
        const fontFiles = [
            { name: 'AlayaRoza', path: 'fonts/AlayaRozaDemo.otf' },
            { name: 'Antarctic', path: 'fonts/Antarctic.otf' },
            { name: 'Caveat-Bold', path: 'fonts/Caveat-Bolt.ttf' },
            { name: 'RozoviiChulok', path: 'fonts/rozoviichulok_regular.ttf' },
            { name: 'Caveat', path: 'fonts/Caveat-Regular.ttf' }
        ];

        // Пробуем загрузить каждый
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
        
        // Заполняем выпадающий список ТОЛЬКО загруженными шрифтами
        fontSelect.innerHTML = '';
        for (const fontName in fonts) {
            if (fonts[fontName] !== null) {
                const option = document.createElement('option');
                option.value = fontName;
                
                // Красивые названия для списка
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
        
        // Выбираем первый загруженный шрифт по умолчанию
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
        
        if (!text.trim()) {
            fallbackText.textContent = 'Введите текст для рисования';
            fallbackText.style.display = 'block';
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
                        char: char
                    });
                    
                    x += glyph.advanceWidth * (fontSize / currentFont.unitsPerEm) + letterSpacing;
                }
            }
            
            svgContainer.setAttribute('viewBox', `0 0 ${x + 100} 300`);
            
        } catch (error) {
            console.error('Ошибка создания путей:', error);
            fallbackText.style.display = 'block';
            fallbackText.textContent = 'Ошибка создания контуров. Попробуйте другой шрифт.';
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
                    setTimeout(drawNextPath, 50);
                }
            }
        });
    }

    // ========== УПРАВЛЕНИЕ АНИМАЦИЕЙ ==========
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
            
            for (let i = 0; i < currentPathIndex; i++) {
                textPaths[i].element.style.strokeDashoffset = 0;
            }
            
            textPaths[currentPathIndex].element.style.strokeDashoffset = 
                textPaths[currentPathIndex].length;
                
            if (isPlaying) pauseAnimation();
        }
    }

    function stepForward() {
        if (currentPathIndex < textPaths.length) {
            textPaths[currentPathIndex].element.style.strokeDashoffset = 0;
            currentPathIndex++;
            
            if (currentPathIndex < textPaths.length) {
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

    function updateSpeed() {
        animationSpeed = parseInt(speedSlider.value);
        speedValue.textContent = animationSpeed;
        
        if (isPlaying && currentAnimation) {
            currentAnimation.duration = animationSpeed;
        }
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
        downloadBtn.addEventListener('click', function() {
            alert('Экспорт в видео будет добавлен в следующем обновлении.');
        });
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    await loadFonts();
    setupEventListeners();
    updateSpeed();
    textToPaths(textInput.value.trim());
    
    console.log('Lumen: Система готова с новыми шрифтами!');
});
