// 五子棋游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 创建游戏元素装饰
    createGamePieces(5);
    
    // 初始化游戏
    const gobangGame = new GobangGame();
    gobangGame.init();
    
    // 重置游戏按钮
    document.getElementById('resetGame').addEventListener('click', function() {
        gobangGame.reset();
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

class GobangGame {
    constructor() {
        this.board = document.getElementById('gobang-board');
        this.currentPlayer = 'black'; // 黑方先行
        this.gameOver = false;
        this.boardSize = 15; // 15x15棋盘
        this.boardState = []; // 存储棋盘状态
        this.winningLine = []; // 存储获胜的连线
    }
    
    init() {
        // 初始化棋盘状态
        this.boardState = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        
        // 创建棋盘网格
        this.createBoard();
        
        // 更新游戏状态
        this.updateGameStatus();
    }
    
    createBoard() {
        // 清空棋盘
        this.board.innerHTML = '';
        
        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'board-grid';
        
        // 创建网格单元格
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 添加点击事件
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                
                gridContainer.appendChild(cell);
            }
        }
        
        this.board.appendChild(gridContainer);
    }
    
    handleCellClick(x, y) {
        // 如果游戏已结束或该位置已有棋子，则不处理
        if (this.gameOver || this.boardState[y][x] !== null) return;
        
        // 放置棋子
        this.placeStone(x, y, this.currentPlayer);
        
        // 检查是否获胜
        if (this.checkWin(x, y, this.currentPlayer)) {
            this.gameOver = true;
            this.highlightWinningLine();
            this.updateGameStatus(`${this.currentPlayer === 'black' ? '黑方' : '白方'}胜利！`);
            return;
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
            this.gameOver = true;
            this.updateGameStatus('平局！');
            return;
        }
        
        // 切换玩家
        this.switchPlayer();
    }
    
    placeStone(x, y, color) {
        // 更新棋盘状态
        this.boardState[y][x] = color;
        
        // 创建棋子元素
        const stone = document.createElement('div');
        stone.className = `stone ${color}`;
        stone.dataset.x = x;
        stone.dataset.y = y;
        
        // 获取对应的单元格
        const cell = this.board.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
        cell.appendChild(stone);
    }
    
    checkWin(x, y, color) {
        // 检查四个方向：水平、垂直、左上到右下、右上到左下
        const directions = [
            [{x: 1, y: 0}, {x: -1, y: 0}],  // 水平
            [{x: 0, y: 1}, {x: 0, y: -1}],  // 垂直
            [{x: 1, y: 1}, {x: -1, y: -1}], // 左上到右下
            [{x: 1, y: -1}, {x: -1, y: 1}]  // 右上到左下
        ];
        
        for (const direction of directions) {
            let count = 1; // 当前位置的棋子
            let line = [{x, y}]; // 记录连线的位置
            
            // 检查两个相反的方向
            for (const {x: dx, y: dy} of direction) {
                let nx = x + dx;
                let ny = y + dy;
                
                // 沿着方向检查连续的同色棋子
                while (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && 
                       this.boardState[ny][nx] === color) {
                    count++;
                    line.push({x: nx, y: ny});
                    nx += dx;
                    ny += dy;
                }
            }
            
            // 如果有5个或更多连续的同色棋子，则获胜
            if (count >= 5) {
                this.winningLine = line;
                return true;
            }
        }
        
        return false;
    }
    
    checkDraw() {
        // 检查棋盘是否已满
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.boardState[y][x] === null) {
                    return false; // 还有空位，不是平局
                }
            }
        }
        return true; // 棋盘已满，平局
    }
    
    highlightWinningLine() {
        // 高亮显示获胜的连线
        for (const {x, y} of this.winningLine) {
            const cell = this.board.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
            const stone = cell.querySelector('.stone');
            if (stone) stone.classList.add('winning-stone');
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateGameStatus();
    }
    
    updateGameStatus(message) {
        const currentPlayerElem = document.getElementById('currentPlayer');
        const gameStatusElem = document.getElementById('gameStatus');
        
        currentPlayerElem.textContent = this.currentPlayer === 'black' ? '黑方' : '白方';
        currentPlayerElem.className = `font-bold ${this.currentPlayer === 'black' ? 'text-black' : 'text-gray-200'}`;
        
        if (message) {
            gameStatusElem.textContent = message;
        } else {
            gameStatusElem.textContent = this.gameOver ? '游戏结束' : '进行中';
        }
    }
    
    reset() {
        // 重置游戏
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.winningLine = [];
        
        // 重新初始化棋盘
        this.init();
        
        // 显示通知
        showNotification('游戏已重置', 'info');
    }
}