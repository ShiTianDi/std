// 共享JavaScript功能

// 优化的游戏元素创建函数
function createGamePieces(count = 10) {
    const gamePiecesContainer = document.getElementById('game-pieces');
    if (!gamePiecesContainer) return;
    
    // 减少装饰元素数量以提升性能
    const pieces = [
        '<i class="fa fa-chess-king text-2xl text-primary"></i>',
        '<i class="fa fa-chess-queen text-2xl text-secondary"></i>',
        '<i class="fa fa-chess-rook text-2xl text-accent"></i>',
        '<div class="w-8 h-8 bg-primary/60 rounded-full border border-white"></div>',
        '<div class="w-8 h-8 bg-accent/60 rounded-full border border-white"></div>',
    ];
    
    // 使用文档片段提升性能
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'game-piece';
        piece.innerHTML = pieces[Math.floor(Math.random() * pieces.length)];
        
        // 随机位置
        piece.style.left = `${Math.random() * 90 + 5}vw`;
        piece.style.top = `${Math.random() * 90 + 5}vh`;
        piece.style.animationDelay = `${Math.random() * 2}s`;
        
        fragment.appendChild(piece);
    }
    
    gamePiecesContainer.appendChild(fragment);
}

// 通知系统
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-appear`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500', 
        info: 'bg-blue-500'
    };
    
    notification.classList.add(colors[type] || colors.info, 'text-white');
    notification.innerHTML = `<i class="fa ${icons[type] || icons.info} mr-2"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 用户菜单功能
document.addEventListener('DOMContentLoaded', function () {
    // 用户菜单点击事件
    const userMenuBtn = document.getElementById('userMenu');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplayName = document.getElementById('userDisplayName');
    const userEmail = document.getElementById('userEmail');
    
    // 检查用户登录状态
    function checkLoginStatus() {
        // 从localStorage获取用户信息
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('username');
        
        if (isLoggedIn === 'true' && username) {
            // 用户已登录，显示用户信息
            userDisplayName.textContent = username || '用户';
            userEmail.textContent = username; // 可以根据需要修改或移除
            return true;
        } else {
            // 用户未登录
            userDisplayName.textContent = '未登录';
            userEmail.textContent = '';
            return false;
        }
    }
    
    // 初始检查登录状态
    checkLoginStatus();
    
    // 用户菜单点击事件
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        
        // 如果用户未登录，跳转到登录页面
        if (!checkLoginStatus()) {
            window.location.href = 'login.html';
            return;
        }
        
        // 切换菜单显示/隐藏
        userMenuDropdown.classList.toggle('hidden');
    });
    
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
            userMenuDropdown.classList.add('hidden');
        }
    });
    
    // 退出登录按钮点击事件
    logoutBtn.addEventListener('click', function() {
        // 清除用户信息
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // 更新显示
        checkLoginStatus();
        
        // 隐藏菜单
        userMenuDropdown.classList.add('hidden');
        
        // 显示退出成功提示
        showNotification('退出登录成功', 'success');
        
        // 可选：跳转到首页
        // window.location.href = 'index.html';
    });
});