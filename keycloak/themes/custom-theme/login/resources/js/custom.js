document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = document.querySelectorAll('.kc-tab-link');
    const tabContents = document.querySelectorAll('.kc-tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Удаляем активный класс со всех ссылок и контента
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Добавляем активный класс на текущую вкладку
            e.target.classList.add('active');

            // Показываем соответствующий контент
            const targetId = e.target.getAttribute('href').substring(1);
            document.getElementById(targetId + '-form-container').classList.add('active');
        });
    });
});