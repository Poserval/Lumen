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
                console.warn(`✗ Не
