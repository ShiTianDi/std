// 象棋游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 创建游戏元素装饰
    createGamePieces(5);
    
    // 初始化游戏
    const chessGame = new ChessGame();
    chessGame.init();
    
    // 重置游戏按钮
    document.getElementById('resetGame').addEventListener('click', function() {
        chessGame.reset();
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

class ChessGame {
    constructor() {
        this.board = document.getElementById('chessboard');
        this.currentPlayer = 'red'; // 红方先行
        this.selectedPiece = null;
        this.gameOver = false;
        this.pieces = [];
        this.possibleMoves = [];
        
        // 棋盘尺寸
        this.boardSize = {
            width: 9, // 9列
            height: 10, // 10行
            gridSize: 45 // 每格大小
        };
        
        // 初始棋子布局
        this.initialLayout = [
            // 红方（下方）
            {type: 'ju', name: '车', color: 'red', x: 0, y: 9},
            {type: 'ma', name: '马', color: 'red', x: 1, y: 9},
            {type: 'xiang', name: '相', color: 'red', x: 2, y: 9},
            {type: 'shi', name: '仕', color: 'red', x: 3, y: 9},
            {type: 'shuai', name: '帅', color: 'red', x: 4, y: 9},
            {type: 'shi', name: '仕', color: 'red', x: 5, y: 9},
            {type: 'xiang', name: '相', color: 'red', x: 6, y: 9},
            {type: 'ma', name: '马', color: 'red', x: 7, y: 9},
            {type: 'ju', name: '车', color: 'red', x: 8, y: 9},
            {type: 'pao', name: '炮', color: 'red', x: 1, y: 7},
            {type: 'pao', name: '炮', color: 'red', x: 7, y: 7},
            {type: 'bing', name: '兵', color: 'red', x: 0, y: 6},
            {type: 'bing', name: '兵', color: 'red', x: 2, y: 6},
            {type: 'bing', name: '兵', color: 'red', x: 4, y: 6},
            {type: 'bing', name: '兵', color: 'red', x: 6, y: 6},
            {type: 'bing', name: '兵', color: 'red', x: 8, y: 6},
            
            // 黑方（上方）
            {type: 'ju', name: '车', color: 'black', x: 0, y: 0},
            {type: 'ma', name: '马', color: 'black', x: 1, y: 0},
            {type: 'xiang', name: '象', color: 'black', x: 2, y: 0},
            {type: 'shi', name: '士', color: 'black', x: 3, y: 0},
            {type: 'jiang', name: '将', color: 'black', x: 4, y: 0},
            {type: 'shi', name: '士', color: 'black', x: 5, y: 0},
            {type: 'xiang', name: '象', color: 'black', x: 6, y: 0},
            {type: 'ma', name: '马', color: 'black', x: 7, y: 0},
            {type: 'ju', name: '车', color: 'black', x: 8, y: 0},
            {type: 'pao', name: '炮', color: 'black', x: 1, y: 2},
            {type: 'pao', name: '炮', color: 'black', x: 7, y: 2},
            {type: 'zu', name: '卒', color: 'black', x: 0, y: 3},
            {type: 'zu', name: '卒', color: 'black', x: 2, y: 3},
            {type: 'zu', name: '卒', color: 'black', x: 4, y: 3},
            {type: 'zu', name: '卒', color: 'black', x: 6, y: 3},
            {type: 'zu', name: '卒', color: 'black', x: 8, y: 3}
        ];
    }
    
    init() {
        // 设置棋盘尺寸
        this.board.style.width = `${this.boardSize.width * this.boardSize.gridSize}px`;
        this.board.style.height = `${this.boardSize.height * this.boardSize.gridSize}px`;
        
        // 创建棋子
        this.createPieces();
        
        // 更新游戏状态
        this.updateGameStatus();
    }
    
    createPieces() {
        // 清空棋盘
        this.board.innerHTML = '';
        this.pieces = [];
        
        // 创建棋盘背景和点击事件
        for (let y = 0; y < this.boardSize.height; y++) {
            for (let x = 0; x < this.boardSize.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.style.position = 'absolute';
                cell.style.width = `${this.boardSize.gridSize}px`;
                cell.style.height = `${this.boardSize.gridSize}px`;
                cell.style.left = `${x * this.boardSize.gridSize}px`;
                cell.style.top = `${y * this.boardSize.gridSize}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 添加点击事件处理空白位置的点击
                cell.addEventListener('click', (e) => {
                    // 阻止事件冒泡，避免触发棋盘的点击事件
                    e.stopPropagation();
                    
                    // 如果点击的是空白位置
                    if (e.target === cell) {
                        this.handleBoardClick(x, y);
                    }
                });
                
                this.board.appendChild(cell);
            }
        }
        
        // 创建棋子
        this.initialLayout.forEach(pieceData => {
            const piece = document.createElement('div');
            piece.className = `chess-piece ${pieceData.color}`;
            piece.textContent = pieceData.name;
            piece.dataset.type = pieceData.type;
            piece.dataset.color = pieceData.color;
            piece.dataset.x = pieceData.x;
            piece.dataset.y = pieceData.y;
            
            // 设置位置
            this.positionPiece(piece, pieceData.x, pieceData.y);
            
            // 添加点击事件
            piece.addEventListener('click', (e) => {
                // 阻止事件冒泡，避免触发棋盘的点击事件
                e.stopPropagation();
                this.handlePieceClick(piece);
            });
            
            // 添加到棋盘和数组
            this.board.appendChild(piece);
            this.pieces.push(piece);
        });
    }
    
    positionPiece(piece, x, y) {
        // 计算棋子在棋盘上的位置
        const left = x * this.boardSize.gridSize + this.boardSize.gridSize / 2 - 20;
        const top = y * this.boardSize.gridSize + this.boardSize.gridSize / 2 - 20;
        
        piece.style.left = `${left}px`;
        piece.style.top = `${top}px`;
        piece.dataset.x = x;
        piece.dataset.y = y;
    }
    
    handlePieceClick(piece) {
        if (this.gameOver) return;
        
        const pieceColor = piece.dataset.color;
        
        // 如果点击的是当前玩家的棋子
        if (pieceColor === this.currentPlayer) {
            // 取消之前的选择
            if (this.selectedPiece) {
                this.selectedPiece.classList.remove('selected');
            }
            
            // 选择新棋子
            piece.classList.add('selected');
            this.selectedPiece = piece;
            
            // 显示可能的移动位置
            this.showPossibleMoves(piece);
        }
        // 如果已经选择了棋子，并且点击的是对方棋子（吃子）
        else if (this.selectedPiece && piece.classList.contains('chess-piece')) {
            // 检查是否是有效移动
            const targetX = parseInt(piece.dataset.x);
            const targetY = parseInt(piece.dataset.y);
            
            if (this.isValidMove(this.selectedPiece, targetX, targetY)) {
                // 吃子
                this.capturePiece(piece);
                
                // 移动棋子
                this.movePiece(this.selectedPiece, targetX, targetY);
                
                // 切换玩家
                this.switchPlayer();
            }
        }
    }
    
    showPossibleMoves(piece) {
        // 清除之前的可能移动标记
        this.clearPossibleMoves();
        
        const pieceType = piece.dataset.type;
        const x = parseInt(piece.dataset.x);
        const y = parseInt(piece.dataset.y);
        
        // 根据棋子类型计算可能的移动位置
        // 这里简化处理，实际象棋规则更复杂
        let moves = [];
        
        switch (pieceType) {
            case 'ju': // 车
                moves = this.getRookMoves(x, y);
                break;
            case 'ma': // 马
                moves = this.getKnightMoves(x, y);
                break;
            case 'xiang': // 相/象
                moves = this.getElephantMoves(x, y, piece.dataset.color);
                break;
            case 'shi': // 仕/士
                moves = this.getAdvisorMoves(x, y, piece.dataset.color);
                break;
            case 'shuai': // 帅
            case 'jiang': // 将
                moves = this.getKingMoves(x, y, piece.dataset.color);
                break;
            case 'pao': // 炮
                moves = this.getCannonMoves(x, y);
                break;
            case 'bing': // 兵
            case 'zu': // 卒
                moves = this.getPawnMoves(x, y, piece.dataset.color);
                break;
        }
        
        // 显示可能的移动位置
        moves.forEach(move => {
            const marker = document.createElement('div');
            marker.className = 'possible-move';
            
            // 设置位置
            const left = move.x * this.boardSize.gridSize + this.boardSize.gridSize / 2 - 10;
            const top = move.y * this.boardSize.gridSize + this.boardSize.gridSize / 2 - 10;
            
            marker.style.left = `${left}px`;
            marker.style.top = `${top}px`;
            marker.dataset.x = move.x;
            marker.dataset.y = move.y;
            
            // 添加点击事件
            marker.addEventListener('click', () => {
                // 移动棋子
                this.movePiece(this.selectedPiece, move.x, move.y);
                
                // 切换玩家
                this.switchPlayer();
            });
            
            this.board.appendChild(marker);
            this.possibleMoves.push(marker);
        });
    }
    
    clearPossibleMoves() {
        this.possibleMoves.forEach(marker => marker.remove());
        this.possibleMoves = [];
    }
    
    movePiece(piece, x, y) {
        // 移动棋子
        this.positionPiece(piece, x, y);
        
        // 取消选择
        piece.classList.remove('selected');
        this.selectedPiece = null;
        
        // 清除可能的移动标记
        this.clearPossibleMoves();
        
        // 检查游戏是否结束
        this.checkGameOver();
    }
    
    capturePiece(piece) {
        // 如果目标位置有对方的棋子，则吃掉
        if (piece.classList.contains('chess-piece')) {
            // 检查是否吃掉了将/帅
            if (piece.dataset.type === 'jiang' || piece.dataset.type === 'shuai') {
                this.gameOver = true;
                this.updateGameStatus(`${this.currentPlayer === 'red' ? '红方' : '黑方'}胜利！`);
            }
            
            // 从棋盘和数组中移除
            piece.remove();
            this.pieces = this.pieces.filter(p => p !== piece);
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.updateGameStatus();
    }
    
    updateGameStatus(message) {
        const currentPlayerElem = document.getElementById('currentPlayer');
        const gameStatusElem = document.getElementById('gameStatus');
        
        currentPlayerElem.textContent = this.currentPlayer === 'red' ? '红方' : '黑方';
        currentPlayerElem.className = `font-bold ${this.currentPlayer === 'red' ? 'text-red-500' : 'text-gray-800'}`;
        
        if (message) {
            gameStatusElem.textContent = message;
        } else {
            gameStatusElem.textContent = this.gameOver ? '游戏结束' : '进行中';
        }
    }
    
    checkGameOver() {
        // 检查是否有将/帅
        const redKing = this.pieces.find(p => p.dataset.type === 'shuai');
        const blackKing = this.pieces.find(p => p.dataset.type === 'jiang');
        
        if (!redKing) {
            this.gameOver = true;
            this.updateGameStatus('黑方胜利！');
        } else if (!blackKing) {
            this.gameOver = true;
            this.updateGameStatus('红方胜利！');
        }
    }
    
    reset() {
        // 重置游戏
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gameOver = false;
        
        // 清除可能的移动标记
        this.clearPossibleMoves();
        
        // 重新创建棋子
        this.createPieces();
        
        // 更新游戏状态
        this.updateGameStatus();
        
        // 显示通知
        showNotification('游戏已重置', 'info');
    }
    
    // 以下是各种棋子的移动规则
    // 注意：这些是简化的规则，实际象棋规则更复杂
    
    getRookMoves(x, y) {
        const moves = [];
        
        // 横向移动
        for (let i = 0; i < this.boardSize.width; i++) {
            if (i !== x) moves.push({x: i, y});
        }
        
        // 纵向移动
        for (let i = 0; i < this.boardSize.height; i++) {
            if (i !== y) moves.push({x, y: i});
        }
        
        return this.filterValidMoves(moves);
    }
    
    getKnightMoves(x, y) {
        // 马的所有可能移动位置
        const possibleMoves = [
            {x: x-2, y: y-1, legX: x-1, legY: y}, // 左上
            {x: x-2, y: y+1, legX: x-1, legY: y}, // 左下
            {x: x-1, y: y-2, legX: x, legY: y-1}, // 上左
            {x: x-1, y: y+2, legX: x, legY: y+1}, // 下左
            {x: x+1, y: y-2, legX: x, legY: y-1}, // 上右
            {x: x+1, y: y+2, legX: x, legY: y+1}, // 下右
            {x: x+2, y: y-1, legX: x+1, legY: y}, // 右上
            {x: x+2, y: y+1, legX: x+1, legY: y}  // 右下
        ];
        
        // 过滤掉被别住马腿的移动
        const validMoves = possibleMoves.filter(move => {
            // 检查马腿位置是否有棋子
            const legPiece = this.getPieceAt(move.legX, move.legY);
            return !legPiece; // 如果马腿位置没有棋子，则可以移动
        });
        
        // 提取有效的移动坐标
        const moves = validMoves.map(move => ({x: move.x, y: move.y}));
        
        return this.filterValidMoves(moves);
    }
    
    getElephantMoves(x, y, color) {
        // 象的所有可能移动位置
        const possibleMoves = [
            {x: x-2, y: y-2, eyeX: x-1, eyeY: y-1}, // 左上
            {x: x-2, y: y+2, eyeX: x-1, eyeY: y+1}, // 左下
            {x: x+2, y: y-2, eyeX: x+1, eyeY: y-1}, // 右上
            {x: x+2, y: y+2, eyeX: x+1, eyeY: y+1}  // 右下
        ];
        
        // 过滤掉被别住象眼的移动
        const validMoves = possibleMoves.filter(move => {
            // 检查象眼位置是否有棋子
            const eyePiece = this.getPieceAt(move.eyeX, move.eyeY);
            return !eyePiece; // 如果象眼位置没有棋子，则可以移动
        });
        
        // 提取有效的移动坐标
        const moves = validMoves.map(move => ({x: move.x, y: move.y}));
        
        // 相/象不能过河
        return this.filterValidMoves(moves).filter(move => {
            if (color === 'red' && move.y < 5) return false;
            if (color === 'black' && move.y > 4) return false;
            return true;
        });
    }
    
    getAdvisorMoves(x, y, color) {
        const moves = [
            {x: x-1, y: y-1}, {x: x-1, y: y+1},
            {x: x+1, y: y-1}, {x: x+1, y: y+1}
        ];
        
        // 仕/士只能在九宫格内移动
        return this.filterValidMoves(moves).filter(move => {
            // 九宫格范围
            if (move.x < 3 || move.x > 5) return false;
            if (color === 'red' && (move.y < 7 || move.y > 9)) return false;
            if (color === 'black' && (move.y < 0 || move.y > 2)) return false;
            return true;
        });
    }
    
    getKingMoves(x, y, color) {
        const moves = [
            {x: x-1, y}, {x: x+1, y},
            {x, y: y-1}, {x, y: y+1}
        ];
        
        // 将/帅只能在九宫格内移动
        return this.filterValidMoves(moves).filter(move => {
            // 九宫格范围
            if (move.x < 3 || move.x > 5) return false;
            if (color === 'red' && (move.y < 7 || move.y > 9)) return false;
            if (color === 'black' && (move.y < 0 || move.y > 2)) return false;
            return true;
        });
    }
    
    getCannonMoves(x, y) {
        const moves = [];
        const directions = [
            {dx: 1, dy: 0},  // 右
            {dx: -1, dy: 0}, // 左
            {dx: 0, dy: 1},  // 下
            {dx: 0, dy: -1}  // 上
        ];
        
        // 检查每个方向
        for (const dir of directions) {
            let nx = x;
            let ny = y;
            let foundPiece = false;
            let pieceCount = 0;
            
            // 沿着方向移动
            while (true) {
                nx += dir.dx;
                ny += dir.dy;
                
                // 检查是否超出棋盘
                if (nx < 0 || nx >= this.boardSize.width || ny < 0 || ny >= this.boardSize.height) {
                    break;
                }
                
                // 获取该位置的棋子
                const pieceAtPosition = this.getPieceAt(nx, ny);
                
                if (!pieceAtPosition) {
                    // 如果没有找到炮架，可以移动到空位置
                    if (!foundPiece) {
                        moves.push({x: nx, y: ny});
                    }
                } else {
                    pieceCount++;
                    
                    // 第一个棋子是炮架
                    if (pieceCount === 1) {
                        foundPiece = true;
                    }
                    // 第二个棋子是可以吃的子
                    else if (pieceCount === 2) {
                        // 检查是否是对方棋子
                        if (pieceAtPosition.dataset.color !== this.currentPlayer) {
                            moves.push({x: nx, y: ny});
                        }
                        break; // 找到第二个棋子后停止
                    }
                }
            }
        }
        
        return moves;
    }
    
    // 添加一个辅助函数来获取指定位置的棋子
    getPieceAt(x, y) {
        return this.pieces.find(piece => 
            parseInt(piece.dataset.x) === x && 
            parseInt(piece.dataset.y) === y
        );
    }
    
    getPawnMoves(x, y, color) {
        const moves = [];
        
        if (color === 'red') {
            // 红方兵向上移动
            moves.push({x, y: y-1});
            
            // 过河后可以左右移动
            if (y <= 4) {
                moves.push({x: x-1, y});
                moves.push({x: x+1, y});
            }
        } else {
            // 黑方卒向下移动
            moves.push({x, y: y+1});
            
            // 过河后可以左右移动
            if (y >= 5) {
                moves.push({x: x-1, y});
                moves.push({x: x+1, y});
            }
        }
        
        return this.filterValidMoves(moves);
    }
    
    filterValidMoves(moves) {
        // 过滤掉棋盘外的移动
        return moves.filter(move => {
            return move.x >= 0 && move.x < this.boardSize.width &&
                   move.y >= 0 && move.y < this.boardSize.height;
        });
    }
    
    isValidMove(piece, targetX, targetY) {
        // 检查目标位置是否在可能的移动位置中
        return this.possibleMoves.some(marker => {
            return parseInt(marker.dataset.x) === targetX &&
                   parseInt(marker.dataset.y) === targetY;
        });
    }
    
    handleBoardClick(x, y) {
        // 如果游戏结束或没有选中棋子，则不处理
        if (this.gameOver || !this.selectedPiece) return;
        
        // 检查是否是有效移动
        if (this.isValidMove(this.selectedPiece, x, y)) {
            // 移动棋子
            this.movePiece(this.selectedPiece, x, y);
            
            // 切换玩家
            this.switchPlayer();
        }
    }
}