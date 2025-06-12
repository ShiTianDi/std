// 俄罗斯方块游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 创建游戏元素装饰
    createGamePieces(5);
    
    // 初始化游戏
    const tetrisGame = new TetrisGame();
    tetrisGame.init();
    
    // 新游戏按钮
    document.getElementById('newGame').addEventListener('click', function() {
        tetrisGame.startNewGame();
    });
    
    // 帮助弹窗
    const helpModal = document.getElementById('helpModal');
    document.getElementById('toggleHelp').addEventListener('click', function() {
        helpModal.classList.remove('hidden');
    });
    
    document.getElementById('closeHelp').addEventListener('click', function() {
        helpModal.classList.add('hidden');
    });
    
    // 点击弹窗外部关闭
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });
});

class TetrisGame {
    constructor() {
        // 游戏元素
        this.board = document.getElementById('tetris-board');
        this.nextPiecePreview = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.bestScoreElement = document.getElementById('bestScore');
        this.currentGameStatusElement = document.getElementById('currentGameStatus');
        
        // 游戏配置
        this.rows = 20;
        this.cols = 10;
        this.cellSize = 30;
        
        // 游戏状态
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.gameActive = false;
        this.dropInterval = 1000; // 初始下落速度（毫秒）
        this.dropCounter = 0;
        this.lastTime = 0;
        
        // 方块形状定义
        this.pieces = {
            'I': [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            'J': [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'L': [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'O': [
                [1, 1],
                [1, 1]
            ],
            'S': [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            'T': [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'Z': [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        };
        
        // 方块颜色
        this.pieceColors = {
            'I': 'piece-i',
            'J': 'piece-j',
            'L': 'piece-l',
            'O': 'piece-o',
            'S': 'piece-s',
            'T': 'piece-t',
            'Z': 'piece-z'
        };
        
        // 绑定键盘事件
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    
    init() {
        // 创建游戏网格
        this.createGrid();
        
        // 显示最高分
        const bestScore = localStorage.getItem('tetris_bestScore') || 0;
        this.bestScoreElement.textContent = bestScore;
        
        // 开始新游戏
        this.startNewGame();
    }
    
    createGrid() {
        // 设置棋盘大小
        this.board.style.width = `${this.cols * this.cellSize}px`;
        this.board.style.height = `${this.rows * this.cellSize}px`;
        
        // 清空棋盘
        this.board.innerHTML = '';
        
        // 创建网格单元格
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'tetris-cell';
                this.board.appendChild(cell);
                this.grid[y][x] = null;
            }
        }
        
        // 设置下一个方块预览区域
        this.nextPiecePreview.innerHTML = '';
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'tetris-cell';
                this.nextPiecePreview.appendChild(cell);
            }
        }
    }
    
    startNewGame() {
        // 重置游戏状态
        this.grid = Array.from({length: this.rows}, () => Array(this.cols).fill(null));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.gameActive = true;
        this.dropInterval = 1000;
        
        // 更新UI
        this.scoreElement.textContent = '0';
        this.linesElement.textContent = '0';
        this.levelElement.textContent = '1';
        this.currentGameStatusElement.textContent = '进行中';
        
        // 移除游戏结束覆盖层
        const overlay = document.querySelector('.game-over-overlay');
        if (overlay) overlay.remove();
        
        // 清空棋盘
        this.clearBoard();
        
        // 生成第一个方块和下一个方块
        this.nextPiece = this.createRandomPiece();
        this.getNewPiece();
        
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeyPress);
        
        // 开始游戏循环
        this.lastTime = 0;
        requestAnimationFrame(this.update.bind(this));
    }
    
    update(time = 0) {
        if (!this.gameActive) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.moveDown();
            this.dropCounter = 0;
        }
        
        this.draw();
        
        if (!this.gameOver) {
            requestAnimationFrame(this.update.bind(this));
        }
    }
    
    draw() {
        // 清空棋盘
        this.clearBoard();
        
        // 绘制已固定的方块
        this.drawGrid();
        
        // 绘制当前方块
        this.drawPiece();
        
        // 绘制下一个方块预览
        this.drawNextPiece();
    }
    
    clearBoard() {
        // 清空所有单元格的样式
        const cells = this.board.querySelectorAll('.tetris-cell');
        cells.forEach(cell => {
            cell.className = 'tetris-cell';
        });
    }
    
    drawGrid() {
        // 绘制已固定的方块
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    const index = y * this.cols + x;
                    const cell = this.board.children[index];
                    cell.classList.add('tetris-piece', this.grid[y][x]);
                }
            }
        }
    }
    
    drawPiece() {
        // 绘制当前方块
        if (!this.currentPiece) return;
        
        const { shape, pos, type } = this.currentPiece;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardX = pos.x + x;
                    const boardY = pos.y + y;
                    
                    if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
                        const index = boardY * this.cols + boardX;
                        const cell = this.board.children[index];
                        cell.classList.add('tetris-piece', this.pieceColors[type]);
                    }
                }
            });
        });
    }
    
    drawNextPiece() {
        // 清空预览区域
        const cells = this.nextPiecePreview.querySelectorAll('.tetris-cell');
        cells.forEach(cell => {
            cell.className = 'tetris-cell';
        });
        
        // 绘制下一个方块
        if (!this.nextPiece) return;
        
        const { shape, type } = this.nextPiece;
        
        // 计算居中偏移
        const offsetX = Math.floor((4 - shape[0].length) / 2);
        const offsetY = Math.floor((4 - shape.length) / 2);
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const previewX = offsetX + x;
                    const previewY = offsetY + y;
                    const index = previewY * 4 + previewX;
                    const cell = this.nextPiecePreview.children[index];
                    cell.classList.add('tetris-piece', this.pieceColors[type]);
                }
            });
        });
    }
    
    createRandomPiece() {
        // 随机选择一个方块类型
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            type,
            shape: this.pieces[type],
            pos: {x: Math.floor(this.cols / 2) - Math.floor(this.pieces[type][0].length / 2), y: 0}
        };
    }
    
    getNewPiece() {
        // 设置当前方块为下一个方块
        this.currentPiece = this.nextPiece;
        
        // 生成新的下一个方块
        this.nextPiece = this.createRandomPiece();
        
        // 检查游戏是否结束
        if (this.checkCollision()) {
            this.gameOver = true;
            this.gameActive = false;
            this.showGameOver();
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }
    
    moveDown() {
        this.currentPiece.pos.y++;
        
        if (this.checkCollision()) {
            // 回退移动
            this.currentPiece.pos.y--;
            
            // 固定方块
            this.lockPiece();
            
            // 检查并清除完整的行
            const linesCleared = this.clearLines();
            
            // 更新分数
            if (linesCleared > 0) {
                this.updateScore(linesCleared);
            }
            
            // 获取新方块
            this.getNewPiece();
        }
    }
    
    moveLeft() {
        this.currentPiece.pos.x--;
        
        if (this.checkCollision()) {
            this.currentPiece.pos.x++;
        }
    }
    
    moveRight() {
        this.currentPiece.pos.x++;
        
        if (this.checkCollision()) {
            this.currentPiece.pos.x--;
        }
    }
    
    rotate() {
        // 保存原始形状
        const originalShape = this.currentPiece.shape;
        
        // 旋转方块
        const rows = this.currentPiece.shape.length;
        const cols = this.currentPiece.shape[0].length;
        const newShape = Array.from({length: cols}, () => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newShape[x][rows - 1 - y] = this.currentPiece.shape[y][x];
            }
        }
        
        this.currentPiece.shape = newShape;
        
        // 检查碰撞，如果碰撞则恢复原始形状
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.pos.y++;
        }
        
        // 回退最后一次移动
        this.currentPiece.pos.y--;
        
        // 固定方块
        this.lockPiece();
        
        // 检查并清除完整的行
        const linesCleared = this.clearLines();
        
        // 更新分数
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
        
        // 获取新方块
        this.getNewPiece();
    }
    
    checkCollision() {
        // 检查当前方块是否与网格或边界碰撞
        const { shape, pos } = this.currentPiece;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = pos.x + x;
                    const boardY = pos.y + y;
                    
                    // 检查边界
                    if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) {
                        return true;
                    }
                    
                    // 检查与其他方块碰撞
                    if (boardY >= 0 && this.grid[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    lockPiece() {
        // 将当前方块固定到网格中
        const { shape, pos, type } = this.currentPiece;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = pos.y + y;
                    const boardX = pos.x + x;
                    
                    if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
                        this.grid[boardY][boardX] = this.pieceColors[type];
                    }
                }
            });
        });
    }
    
    clearLines() {
        let linesCleared = 0;
        
        // 从底部向上检查每一行
        for (let y = this.rows - 1; y >= 0; y--) {
            // 检查当前行是否已满
            const isRowFull = this.grid[y].every(cell => cell !== null);
            
            if (isRowFull) {
                // 移除当前行
                this.grid.splice(y, 1);
                
                // 在顶部添加新行
                this.grid.unshift(Array(this.cols).fill(null));
                
                // 增加已清除行数
                linesCleared++;
                
                // 由于行已被移除，需要重新检查当前位置
                y++;
            }
        }
        
        return linesCleared;
    }
    
    updateScore(linesCleared) {
        // 更新分数和行数
        const points = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的分数
        this.score += points[linesCleared] * this.level;
        this.lines += linesCleared;
        
        // 更新等级
        this.level = Math.floor(this.lines / 10) + 1;
        
        // 更新下落速度
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        
        // 更新UI
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
        this.levelElement.textContent = this.level;
        
        // 更新最高分
        const bestScore = localStorage.getItem('tetris_bestScore') || 0;
        if (this.score > bestScore) {
            localStorage.setItem('tetris_bestScore', this.score);
            this.bestScoreElement.textContent = this.score;
        }
    }
    
    showGameOver() {
        // 显示游戏结束覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div>游戏结束</div>
            <div class="text-lg mt-2">得分: ${this.score}</div>
            <button id="restartGame" class="glass-button rounded-lg px-4 py-2 text-white hover:bg-primary transition-colors mt-4">
                再来一局
            </button>
        `;
        
        this.board.appendChild(overlay);
        
        // 更新游戏状态
        this.currentGameStatusElement.textContent = '游戏结束';
        
        // 添加重新开始按钮事件
        document.getElementById('restartGame').addEventListener('click', () => {
            this.startNewGame();
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        switch (e.keyCode) {
            case 37: // 左箭头
                this.moveLeft();
                break;
            case 39: // 右箭头
                this.moveRight();
                break;
            case 40: // 下箭头
                this.moveDown();
                break;
            case 38: // 上箭头
                this.rotate();
                break;
            case 32: // 空格
                this.hardDrop();
                break;
        }
    }
}