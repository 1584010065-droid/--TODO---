// 待办清单应用
class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.initElements();
        this.bindEvents();
        this.render();
    }

    // 初始化 DOM 元素
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
    }

    // 绑定事件
    bindEvents() {
        // 添加按钮点击事件
        this.addBtn.addEventListener('click', () => this.addTodo());

        // 输入框回车事件
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 清除已完成任务
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    // 添加新任务
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            this.todoInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                this.todoInput.style.animation = '';
            }, 500);
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.todoInput.value = '';
        this.render();
    }

    // 切换任务完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 删除任务
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToLocalStorage();
                this.render();
            }, 300);
        }
    }

    // 清除已完成的任务
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) return;

        if (confirm(`确定要清除 ${completedCount} 个已完成的任务吗？`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 渲染任务列表
    render() {
        if (this.todos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">暂无任务，添加一个吧！</div>
                </div>
            `;
        } else {
            this.todoList.innerHTML = this.todos.map(todo => this.createTodoHTML(todo)).join('');
            
            // 绑定复选框和删除按钮事件
            this.todoList.querySelectorAll('.checkbox').forEach(checkbox => {
                checkbox.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.todo-item').dataset.id);
                    this.toggleTodo(id);
                });
            });

            this.todoList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.todo-item').dataset.id);
                    this.deleteTodo(id);
                });
            });
        }

        this.updateFooter();
    }

    // 创建任务 HTML
    createTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" title="删除">×</button>
            </li>
        `;
    }

    // 更新底部信息
    updateFooter() {
        const totalCount = this.todos.length;
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = totalCount - activeCount;

        this.taskCount.textContent = `${activeCount} 个待办 / ${totalCount} 个总计`;
        
        this.clearCompletedBtn.disabled = completedCount === 0;
        this.clearCompletedBtn.style.opacity = completedCount === 0 ? '0.5' : '1';
    }

    // 转义 HTML 防止 XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 从 LocalStorage 加载数据
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('todos');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('无法从 LocalStorage 加载数据:', e);
            return [];
        }
    }

    // 保存到 LocalStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (e) {
            console.error('无法保存到 LocalStorage:', e);
        }
    }
}

// 添加摇晃动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
