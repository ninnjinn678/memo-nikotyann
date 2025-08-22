// DOMの要素を取得
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const colorInput = document.getElementById('color-input');
const calendar = document.getElementById('calendar');
const clearAllTasksButton = document.getElementById('clear-all-tasks');

// LocalStorageからタスクを取得
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// ページロード時にタスクを表示
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
});

// フォームの送信イベントを監視
todoForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newTask = todoInput.value;
    const taskDate = dateInput.value;
    const taskTime = timeInput.value;
    const taskColor = colorInput.value;

    if (newTask && taskDate && taskTime && taskColor) {
        const task = {
            text: newTask,
            date: taskDate,
            time: taskTime,
            color: taskColor,
            completed: false // チェックマークの状態を保持
        };

        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();

        todoInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
        colorInput.value = '';
    }
});

// タスクをカレンダー形式で表示する関数
function renderCalendar() {
    calendar.innerHTML = ''; // カレンダーを初期化

    const tasksByDate = tasks.reduce((acc, task) => {
        if (!acc[task.date]) {
            acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
    }, {});

    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>完了</th>
            <th>日付</th>
            <th>タスク</th>
        </tr>
    `;

    // ソートした日付でループ
    sortedDates.forEach(date => {
        const taskList = tasksByDate[date];

        taskList.forEach((task, taskIndex) => {
            const row = document.createElement('tr');

            // チェックボックスを含むセル
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;

            checkbox.addEventListener('change', function() {
                task.completed = checkbox.checked;
                localStorage.setItem('tasks', JSON.stringify(tasks));
            });

            checkboxCell.appendChild(checkbox);

            // 日付を含むセル
            const dateCell = document.createElement('td');
            dateCell.textContent = date;

            // タスク内容を含むセル
            const taskCell = document.createElement('td');
            const taskItem = document.createElement('div');
            taskItem.textContent = `${task.time}: ${task.text}`;
            taskItem.style.backgroundColor = task.color;

            // 編集モードに切り替え
            taskItem.addEventListener('click', function() {
                enterEditMode(taskItem, task, taskIndex);
            });

            taskCell.appendChild(taskItem);

            // 行にセルを追加
            row.appendChild(checkboxCell);
            row.appendChild(dateCell);
            row.appendChild(taskCell);

            table.appendChild(row);
        });
    });

    calendar.appendChild(table);
}

// ドラッグ開始時に実行される関数
function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

// ドラッグ中に実行される関数
function dragOver(event) {
    event.preventDefault();
}

// ドロップ時に実行される関数
function dropTask(event) {
    event.preventDefault();
    const draggedIndex = event.dataTransfer.getData('text/plain');
    const targetIndex = event.target.dataset.index;

    if (draggedIndex !== targetIndex) {
        const draggedTask = tasks.splice(draggedIndex, 1)[0];
        tasks.splice(targetIndex, 0, draggedTask);

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
    }
}

// 全タスク削除ボタンのイベントリスナー
clearAllTasksButton.addEventListener('click', function() {
    if (confirm('すべてのタスクを削除しますか？')) {
        tasks = [];
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
    }
});

// 編集モードに切り替える関数
function enterEditMode(taskItem, task, taskIndex) {
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = task.text;

    const timeField = document.createElement('input');
    timeField.type = 'time';
    timeField.value = task.time;

    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';

    saveButton.addEventListener('click', function() {
        task.text = inputField.value;
        task.time = timeField.value;

        tasks[taskIndex] = task;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
    });

    taskItem.innerHTML = '';
    taskItem.appendChild(inputField);
    taskItem.appendChild(timeField);
    taskItem.appendChild(saveButton);
}
