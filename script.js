document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы со страницы
    const textInput = document.getElementById('textInput');
    const fontSelect = document.getElementById('fontSelect');
    const colorPicker = document.getElementById('colorPicker');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const applyBtn = document.getElementById('applyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const displayText = document.getElementById('displayText');

    // Функция обновления предпросмотра
    function updatePreview() {
        const text = textInput.value.trim() || 'Ваш текст появится здесь';
        const font = fontSelect.value;
        const color = colorPicker.value;
        const size = sizeSlider.value + 'px';

        displayText.textContent = text;
        displayText.style.fontFamily = font;
        displayText.style.color = color;
        displayText.style.fontSize = size;
    }

    // Связываем события
    textInput.addEventListener('input', updatePreview);
    fontSelect.addEventListener('change', updatePreview);
    colorPicker.addEventListener('input', updatePreview);
    sizeSlider.addEventListener('input', function() {
        sizeValue.textContent = this.value;
        updatePreview();
    });

    // Кнопка "Применить стиль"
    applyBtn.addEventListener('click', updatePreview);

    // Кнопка "Скачать" (заглушка на будущее)
    downloadBtn.addEventListener('click', function() {
        alert('Функция скачивания будет добавлена в следующем обновлении!');
        // Здесь позже будет логика создания и скачивания изображения
    });

    // Инициализация предпросмотра при загрузке
    updatePreview();
});
