// 猜数字游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 创建游戏元素装饰
    createGamePieces(5);
    
    // 初始化游戏
    const numberGuessGame = new NumberGuessGame();
    numberGuessGame.init();
    
    // 新游戏按钮
    document.getElementById('newGame').addEventListener('click', function() {
        numberGuessGame.startNewGame();
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

class NumberGuessGame {
    constructor() {
        // 游戏元素
        this.guessInput = document.getElementById('guess-input');
        this.submitButton = document.getElementById('submit-guess');
        this.feedbackElement = document.getElementById('feedback');
        this.guessHistoryElement = document.getElementById('guess-history');
        this.rangeIndicator = document.getElementById('range-indicator');
        this.currentGameStatusElement = document.getElementById('currentGameStatus');
        this.guessCountElement = document.getElementById('guessCount');
        this.bestRecordElement = document.getElementById('bestRecord');
        
        // 游戏状态
        this.targetNumber = 0;
        this.minRange = 1;
        this.maxRange = 100;
        this.guessCount = 0;
        this.gameActive = false;
        this.bestRecord = localStorage.getItem('numberGuess_bestRecord') || '-';
        
        // 绑定事件
        this.submitButton.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
    }
    
    init() {
        // 显示最佳记录
        this.bestRecordElement.textContent = this.bestRecord;
        
        // 开始新游戏
        this.startNewGame();
    }
    
    startNewGame() {
        // 重置游戏状态
        this.targetNumber = Math.floor(Math.random() * 100) + 1; // 1-100的随机数
        this.minRange = 1;
        this.maxRange = 100;
        this.guessCount = 0;
        this.gameActive = true;
        
        // 重置UI
        this.guessInput.value = '';
        this.guessInput.min = this.minRange;
        this.guessInput.max = this.maxRange;
        this.guessInput.disabled = false;
        this.submitButton.disabled = false;
        this.feedbackElement.textContent = '猜一个1到100之间的数字';
        this.guessHistoryElement.innerHTML = '';
        this.currentGameStatusElement.textContent = '进行中';
        this.guessCountElement.textContent = '0';
        
        // 重置范围指示器
        this.updateRangeIndicator();
        
        // 聚焦输入框
        this.guessInput.focus();
        
        console.log('目标数字：', this.targetNumber); // 调试用，实际游戏中应该注释掉
    }
    
    makeGuess() {
        if (!this.gameActive) return;
        
        // 获取猜测值
        const guess = parseInt(this.guessInput.value);
        
        // 验证输入
        if (isNaN(guess) || guess < this.minRange || guess > this.maxRange) {
            this.feedbackElement.textContent = `请输入${this.minRange}到${this.maxRange}之间的有效数字`;
            return;
        }
        
        // 增加猜测次数
        this.guessCount++;
        this.guessCountElement.textContent = this.guessCount;
        
        // 添加到猜测历史
        this.addToHistory(guess);
        
        // 清空输入框
        this.guessInput.value = '';
        
        // 检查猜测结果
        if (guess === this.targetNumber) {
            // 猜对了
            this.gameWin();
        } else if (guess < this.targetNumber) {
            // 猜小了
            this.minRange = Math.max(this.minRange, guess + 1);
            this.feedbackElement.textContent = `${guess} 太小了，再试一次`;
            this.guessInput.min = this.minRange;
        } else {
            // 猜大了
            this.maxRange = Math.min(this.maxRange, guess - 1);
            this.feedbackElement.textContent = `${guess} 太大了，再试一次`;
            this.guessInput.max = this.maxRange;
        }
        
        // 更新范围指示器
        this.updateRangeIndicator();
        
        // 聚焦输入框
        this.guessInput.focus();
    }
    
    addToHistory(guess) {
        const historyItem = document.createElement('div');
        historyItem.className = 'glass-effect rounded-lg p-2 flex justify-between items-center animate-appear';
        
        let resultIcon, resultText, resultClass;
        
        if (guess === this.targetNumber) {
            resultIcon = 'fa-check-circle';
            resultText = '正确';
            resultClass = 'text-green-500';
        } else if (guess < this.targetNumber) {
            resultIcon = 'fa-arrow-up';
            resultText = '太小';
            resultClass = 'text-blue-500';
        } else {
            resultIcon = 'fa-arrow-down';
            resultText = '太大';
            resultClass = 'text-red-500';
        }
        
        historyItem.innerHTML = `
            <span class="font-medium">猜测 #${this.guessCount}: ${guess}</span>
            <span class="${resultClass}"><i class="fa ${resultIcon} mr-1"></i>${resultText}</span>
        `;
        
        // 将新的猜测历史添加到顶部
        this.guessHistoryElement.insertBefore(historyItem, this.guessHistoryElement.firstChild);
    }
    
    updateRangeIndicator() {
        // 计算范围百分比
        const totalRange = 100; // 总范围是1-100
        const leftPercent = ((this.minRange - 1) / totalRange) * 100;
        const rightPercent = ((100 - this.maxRange) / totalRange) * 100;
        
        // 更新范围指示器
        this.rangeIndicator.style.clipPath = `inset(0 ${rightPercent}% 0 ${leftPercent}%)`;
    }
    
    gameWin() {
        // 更新游戏状态
        this.gameActive = false;
        this.currentGameStatusElement.textContent = '已完成';
        
        // 显示胜利消息
        this.feedbackElement.innerHTML = `<span class="text-green-500"><i class="fa fa-trophy mr-1"></i>恭喜！你猜对了数字 ${this.targetNumber}，用了 ${this.guessCount} 次</span>`;
        
        // 禁用输入
        this.guessInput.disabled = true;
        this.submitButton.disabled = true;
        
        // 更新最佳记录
        if (this.bestRecord === '-' || parseInt(this.bestRecord) > this.guessCount) {
            this.bestRecord = this.guessCount.toString();
            this.bestRecordElement.textContent = this.bestRecord;
            localStorage.setItem('numberGuess_bestRecord', this.bestRecord);
            
            // 显示新纪录消息
            setTimeout(() => {
                showNotification('恭喜！你创造了新的最佳记录！', 'success');
            }, 1000);
        }
    }
}