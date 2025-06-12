// 连连看游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 创建游戏元素装饰
    createGamePieces(5);
    
    // 初始化游戏
    const lianliankanGame = new LianliankanGame();
    
    // 新游戏按钮
    document.getElementById('newGame').addEventListener('click', function() {
        lianliankanGame.startNewGame();
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

// 创建游戏元素装饰函数（从common.js中复制）
function createGamePieces(count) {
    const gameContainer = document.getElementById('game-pieces');
    const shapes = ['square', 'circle', 'triangle'];
    const colors = ['primary', 'secondary', 'accent'];
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.floor(Math.random() * 30) + 20;
        
        piece.className = `game-piece ${shape}`;
        piece.style.width = `${size}px`;
        piece.style.height = `${size}px`;
        piece.style.backgroundColor = `var(--${color})`;
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.top = `${Math.random() * 100}vh`;
        piece.style.animationDelay = `${Math.random() * 5}s`;
        
        gameContainer.appendChild(piece);
    }
}

class LianliankanGame {
    constructor() {
        this.board = document.getElementById('game-board');
        this.timeLeftElement = document.getElementById('timeLeft');
        this.pairsLeftElement = document.getElementById('pairsLeft');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        this.cards = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 32; // 8x8 格子，共32对
        this.timeLeft = 120; // 游戏时间120秒
        this.timer = null;
        this.gameActive = false;
        
        // 图案类型（使用emoji作为图案）
        this.patterns = [
            '🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍍', '🥭',
            '🍇', '🍉', '🥝', '🍅', '🥑', '🥦', '🥕', '🌽',
            '🍄', '🌰', '🥜', '🍞', '🧀', '🍖', '🍗', '🥩',
            '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🍣', '🍦'
        ];
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 显示开始游戏提示
        this.updateGameStatus('准备开始');
        this.timeLeftElement.textContent = `${this.timeLeft}秒`;
        this.pairsLeftElement.textContent = this.totalPairs;
        
        // 创建开始游戏按钮
        const startButton = document.createElement('button');
        startButton.className = 'glass-button rounded-lg px-6 py-3 text-lg font-bold text-dark hover:bg-primary hover:text-white transition-colors absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
        startButton.textContent = '开始游戏';
        startButton.addEventListener('click', () => this.startNewGame());
        
        // 清空游戏板并添加开始按钮
        this.board.innerHTML = '';
        this.board.appendChild(startButton);
    }
    
    startNewGame() {
        // 重置游戏状态
        this.cards = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.timeLeft = 120;
        this.gameActive = true;
        
        // 清除之前的定时器
        if (this.timer) clearInterval(this.timer);
        
        // 更新UI
        this.timeLeftElement.textContent = `${this.timeLeft}秒`;
        this.pairsLeftElement.textContent = this.totalPairs;
        this.updateGameStatus('进行中');
        
        // 创建卡片
        this.createCards();
        
        // 开始计时器
        this.startTimer();
    }
    
    createCards() {
        // 清空游戏板
        this.board.innerHTML = '';
        
        // 创建一个包含所有图案的数组，每个图案出现两次
        let cardPatterns = [];
        for (let i = 0; i < this.totalPairs; i++) {
            const patternIndex = i % this.patterns.length;
            cardPatterns.push(this.patterns[patternIndex]);
            cardPatterns.push(this.patterns[patternIndex]);
        }
        
        // 随机打乱卡片顺序
        cardPatterns = this.shuffleArray(cardPatterns);
        
        // 设置游戏板的网格列数
        this.board.className = 'grid grid-cols-8 gap-1 mx-auto';
        
        // 创建卡片元素
        for (let i = 0; i < cardPatterns.length; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = i;
            card.dataset.pattern = cardPatterns[i];
            
            // 创建卡片正面和背面
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = cardPatterns[i];
            
            // 组装卡片
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            
            // 添加点击事件
            card.addEventListener('click', () => this.flipCard(card));
            
            // 添加到游戏板
            this.board.appendChild(card);
            this.cards.push(card);
        }
    }
    
    flipCard(card) {
        // 如果游戏未激活、卡片已匹配或已选中，则不处理
        if (!this.gameActive || card.classList.contains('matched') || card.classList.contains('flipped') || this.selectedCards.length >= 2) {
            return;
        }
        
        // 翻转卡片
        card.classList.add('flipped');
        this.selectedCards.push(card);
        
        // 如果选中了两张卡片，检查是否匹配
        if (this.selectedCards.length === 2) {
            this.checkMatch();
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.selectedCards;
        
        // 检查两张卡片是否可以连接
        if (card1.dataset.pattern === card2.dataset.pattern && this.canConnect(card1, card2)) {
            // 匹配成功
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.selectedCards = [];
                this.matchedPairs++;
                this.pairsLeftElement.textContent = this.totalPairs - this.matchedPairs;
                
                // 检查游戏是否胜利
                if (this.matchedPairs === this.totalPairs) {
                    this.gameWin();
                }
            }, 500);
        } else {
            // 匹配失败，翻回卡片
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.selectedCards = [];
            }, 1000);
        }
    }
    
    canConnect(card1, card2) {
        // 在实际游戏中，这里需要实现复杂的路径查找算法
        // 简化版：检查是否可以通过不超过三条直线连接
        // 这里简化处理，假设所有相同图案都可以连接
        return true;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timeLeftElement.textContent = `${this.timeLeft}秒`;
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    gameOver() {
        clearInterval(this.timer);
        this.gameActive = false;
        this.updateGameStatus('游戏结束');
        
        // 显示所有卡片
        this.cards.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.add('flipped');
            }
        });
        
        // 显示重新开始按钮
        setTimeout(() => {
            const restartButton = document.createElement('button');
            restartButton.className = 'glass-button rounded-lg px-6 py-3 text-lg font-bold text-dark hover:bg-primary hover:text-white transition-colors absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
            restartButton.textContent = '再来一局';
            restartButton.addEventListener('click', () => this.startNewGame());
            this.board.appendChild(restartButton);
        }, 1500);
    }
    
    gameWin() {
        clearInterval(this.timer);
        this.gameActive = false;
        this.updateGameStatus('恭喜胜利！');
        
        // 显示重新开始按钮
        setTimeout(() => {
            const restartButton = document.createElement('button');
            restartButton.className = 'glass-button rounded-lg px-6 py-3 text-lg font-bold text-dark hover:bg-primary hover:text-white transition-colors absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
            restartButton.textContent = '再来一局';
            restartButton.addEventListener('click', () => this.startNewGame());
            this.board.appendChild(restartButton);
        }, 1500);
    }
    
    updateGameStatus(status) {
        this.gameStatusElement.textContent = status;
    }
    
    shuffleArray(array) {
        // Fisher-Yates 洗牌算法
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}