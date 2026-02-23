// 待办清单应用
class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.filter = 'all'; // 筛选状态: all, active, completed
        this.initElements();
        this.bindEvents();
        this.render();
    }

    // 初始化 DOM 元素
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmOk = document.getElementById('confirmOk');
        this.confirmCancel = document.getElementById('confirmCancel');
        this.filterTabs = document.querySelectorAll('.filter-tab');
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

        // 全部删除任务
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // 筛选选项卡事件
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // 设置筛选条件
    setFilter(filter) {
        this.filter = filter;

        // 更新选项卡样式
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        this.render();
    }

    // 根据筛选条件获取任务
    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
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
            priority: this.prioritySelect.value,
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

    // 显示确认弹窗
    showConfirm(message, onConfirm) {
        this.confirmMessage.textContent = message;
        this.confirmModal.classList.add('show');

        // 清除之前的事件监听器
        const newOkBtn = this.confirmOk.cloneNode(true);
        const newCancelBtn = this.confirmCancel.cloneNode(true);
        this.confirmOk.parentNode.replaceChild(newOkBtn, this.confirmOk);
        this.confirmCancel.parentNode.replaceChild(newCancelBtn, this.confirmCancel);
        this.confirmOk = newOkBtn;
        this.confirmCancel = newCancelBtn;

        // 绑定新的事件
        this.confirmOk.addEventListener('click', () => {
            this.confirmModal.classList.remove('show');
            onConfirm();
        });

        this.confirmCancel.addEventListener('click', () => {
            this.confirmModal.classList.remove('show');
        });

        // 点击遮罩层关闭
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.confirmModal.classList.remove('show');
            }
        });

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.confirmModal.classList.remove('show');
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 清除已完成的任务
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) return;

        this.showConfirm(`确定要清除 ${completedCount} 个已完成的任务吗？`, () => {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
        });
    }

    // 全部删除任务
    clearAll() {
        if (this.todos.length === 0) return;

        this.showConfirm(`确定要删除所有 ${this.todos.length} 个任务吗？`, () => {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
        });
    }

    // 渲染任务列表
    render() {
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const emptyMessages = {
                all: '暂无任务，添加一个吧！',
                active: '没有进行中的任务',
                completed: '没有已完成的任务'
            };
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">${emptyMessages[this.filter]}</div>
                </div>
            `;
        } else {
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');

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

            // 编辑按钮事件
            this.todoList.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.todo-item').dataset.id);
                    this.editTodo(id);
                });
            });
        }

        this.updateFooter();
    }

    // 格式化创建时间
    formatCreatedTime(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `[${year}-${month}-${day} ${hours}:${minutes}]`;
    }

    // 创建任务 HTML
    createTodoHTML(todo) {
        const priorityClass = todo.priority === 'important' ? 'priority-important' : 'priority-normal';
        const priorityText = todo.priority === 'important' ? '重要' : '';

        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''} ${priorityClass}" data-id="${todo.id}">
                <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    ${priorityText ? `<span class="priority-tag">${priorityText}</span>` : ''}
                    <div class="todo-time">${this.formatCreatedTime(todo.createdAt)}</div>
                </div>
                <button class="edit-btn" title="编辑">✎</button>
                <button class="delete-btn" title="删除">×</button>
            </li>
        `;
    }

    // 编辑任务
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const textElement = todoElement.querySelector('.todo-text');

        // 保存原文本
        const originalText = todo.text;

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = originalText;
        input.maxLength = 100;

        // 替换文本为输入框
        textElement.replaceWith(input);
        input.focus();
        input.select();

        // 保存编辑
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                todo.text = newText;
                this.saveToLocalStorage();
            }
            this.render();
        };

        // 取消编辑
        const cancelEdit = () => {
            this.render();
        };

        // 事件监听
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                input.removeEventListener('blur', saveEdit);
                cancelEdit();
            }
        });
    }

    // 更新底部信息
    updateFooter() {
        const totalCount = this.todos.length;
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = totalCount - activeCount;
        const filteredTodos = this.getFilteredTodos();

        // 根据筛选状态显示不同的统计
        let countText = '';
        switch (this.filter) {
            case 'active':
                countText = `${activeCount} 个待办`;
                break;
            case 'completed':
                countText = `${completedCount} 个已完成`;
                break;
            default:
                countText = `${activeCount} 个待办 / ${totalCount} 个总计`;
        }

        this.taskCount.textContent = countText;

        // 清除已完成按钮：有已完成任务时可用
        this.clearCompletedBtn.disabled = completedCount === 0;
        this.clearCompletedBtn.style.opacity = completedCount === 0 ? '0.5' : '1';

        // 全部删除按钮：有任务时可用
        this.clearAllBtn.disabled = totalCount === 0;
        this.clearAllBtn.style.opacity = totalCount === 0 ? '0.5' : '1';
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
