// dashboard.js

async function updateDashboardStats() {
    try {
        // Звертаємось до твого сервера (порт 5000)
        const response = await fetch('http://localhost:5000/stats');
        const stats = await response.json();

        let totalTasks = 0;
        const counts = { todo: 0, process: 0, done: 0 };

        // Збираємо дані і рахуємо загальну кількість
        stats.forEach(item => {
            if (counts.hasOwnProperty(item.status)) {
                counts[item.status] = item.count;
                totalTasks += item.count;
            }
        });

        // Оновлюємо цифри всередині кіл
        document.getElementById('stat-count-todo').innerText = counts.todo;
        document.getElementById('stat-count-process').innerText = counts.process;
        document.getElementById('stat-count-done').innerText = counts.done;

        // Функція для розрахунку відсотків і малювання дуги
        const drawProgress = (containerId, count) => {
            const container = document.querySelector(`.stat-circle-box[data-status="${containerId}"] .circle`);
            // Відсоток від загальної кількості (або 0, якщо тасків нема)
            const percent = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
            // Оновлюємо CSS-змінну --percent
            container.style.setProperty('--percent', percent);
        };

        // Запускаємо малювання для кожного статусу з різними кольорами
        drawProgress('todo', counts.todo);
        drawProgress('process', counts.process);
        drawProgress('done', counts.done);

    } catch (error) {
        console.error("Не вдалося завантажити статистику:", error);
    }
}

// Запускаємо оновлення при кожному завантаженні сторінки
window.onload = updateDashboardStats;