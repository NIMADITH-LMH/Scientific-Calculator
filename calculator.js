class Calculator {
    constructor() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
        this.savedFormulas = JSON.parse(localStorage.getItem('calculatorFormulas')) || [];
        this.memory = 0;
        this.isRadianMode = false;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.lastCalculation = null;
        this.parenthesesCount = 0;
    }

    delete() {
        if (this.currentOperand === '') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand || '0');
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            case 'power':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        // Save the calculation before updating
        this.lastCalculation = {
            formula: `${this.previousOperand} ${this.operation} ${this.currentOperand || '0'}`,
            result: computation.toString()
        };

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        
        // Automatically save the formula
        this.saveFormula();
    }

    scientificFunction(func) {
        const current = parseFloat(this.currentOperand || '0');
        if (isNaN(current) && this.currentOperand !== '' && !['pi', 'e', '(', ')', 'MC', 'MR', 'M+', 'M-', 'toggleMode'].includes(func)) return;

        let result;
        let formula = '';
        const angle = this.isRadianMode ? current : current * Math.PI / 180;

        switch (func) {
            case 'sin':
                result = Math.sin(angle).toString();
                formula = `sin(${current})`;
                break;
            case 'cos':
                result = Math.cos(angle).toString();
                formula = `cos(${current})`;
                break;
            case 'tan':
                result = Math.tan(angle).toString();
                formula = `tan(${current})`;
                break;
            case 'asin':
                result = (this.isRadianMode ? Math.asin(current) : Math.asin(current) * 180 / Math.PI).toString();
                formula = `asin(${current})`;
                break;
            case 'acos':
                result = (this.isRadianMode ? Math.acos(current) : Math.acos(current) * 180 / Math.PI).toString();
                formula = `acos(${current})`;
                break;
            case 'atan':
                result = (this.isRadianMode ? Math.atan(current) : Math.atan(current) * 180 / Math.PI).toString();
                formula = `atan(${current})`;
                break;
            case 'sqrt':
                result = Math.sqrt(current).toString();
                formula = `√${current}`;
                break;
            case 'cbrt':
                result = Math.cbrt(current).toString();
                formula = `∛${current}`;
                break;
            case 'log':
                result = Math.log10(current).toString();
                formula = `log(${current})`;
                break;
            case 'ln':
                result = Math.log(current).toString();
                formula = `ln(${current})`;
                break;
            case 'exp':
                result = Math.exp(current).toString();
                formula = `e^${current}`;
                break;
            case 'pi':
                result = Math.PI.toString();
                formula = 'π';
                break;
            case 'e':
                result = Math.E.toString();
                formula = 'e';
                break;
            case 'factorial':
                let factorialResult = 1;
                for (let i = 2; i <= current; i++) {
                    factorialResult *= i;
                }
                result = factorialResult.toString();
                formula = `${current}!`;
                break;
            case '(':
                this.parenthesesCount++;
                this.previousOperand += this.currentOperand + ' (';
                this.currentOperand = '';
                return;
            case ')':
                if (this.parenthesesCount > 0) {
                    this.parenthesesCount--;
                    this.previousOperand += this.currentOperand + ' )';
                    this.currentOperand = '';
                }
                return;
            case 'toggleMode':
                this.isRadianMode = !this.isRadianMode;
                document.getElementById('mode-toggle').textContent = this.isRadianMode ? 'RAD' : 'DEG';
                return;
            case 'M+':
                this.memory += parseFloat(this.currentOperand || '0');
                return;
            case 'M-':
                this.memory -= parseFloat(this.currentOperand || '0');
                return;
            case 'MR':
                this.currentOperand = this.memory.toString();
                return;
            case 'MC':
                this.memory = 0;
                return;
        }

        // Save the calculation
        this.lastCalculation = {
            formula: formula,
            result: result
        };

        this.currentOperand = result;
        this.shouldResetScreen = true;
        
        // Automatically save the formula
        this.saveFormula();
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;
        
        // Add cursor if needed
        this.addCursor();

        if (this.operation != null) {
            this.previousOperandElement.textContent = `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    addCursor() {
        // Remove any existing cursor
        const existingCursor = this.currentOperandElement.querySelector('.cursor');
        if (existingCursor) {
            existingCursor.remove();
        }

        // If not empty, add a cursor at the end
        if (this.currentOperand !== '') {
            const cursor = document.createElement('span');
            cursor.classList.add('cursor');
            this.currentOperandElement.appendChild(cursor);
        }
        // If empty, the CSS will handle showing the cursor via ::after
    }

    saveFormula() {
        if (!this.lastCalculation) return;
        
        // Add current timestamp
        const formulaToSave = {
            ...this.lastCalculation,
            id: Date.now(),
            timestamp: new Date().toLocaleString()
        };
        
        this.savedFormulas.push(formulaToSave);
        
        // Limit to last 50 formulas
        if (this.savedFormulas.length > 50) {
            this.savedFormulas = this.savedFormulas.slice(-50);
        }
        
        // Save to localStorage
        localStorage.setItem('calculatorFormulas', JSON.stringify(this.savedFormulas));
        
        // Update the history UI
        this.updateHistoryList();
    }

    loadFormula(formula) {
        this.currentOperand = formula.result;
        this.updateDisplay();
    }

    clearHistory() {
        this.savedFormulas = [];
        localStorage.removeItem('calculatorFormulas');
        this.updateHistoryList();
    }

    updateHistoryList() {
        const historyList = document.querySelector('.history-list');
        historyList.innerHTML = '';
        
        if (this.savedFormulas.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No saved formulas yet</div>';
            return;
        }
        
        // Sort from newest to oldest
        const formulas = [...this.savedFormulas].reverse();
        
        formulas.forEach(formula => {
            const item = document.createElement('div');
            item.classList.add('history-item');
            item.innerHTML = `
                <div class="history-formula">${formula.formula}</div>
                <div class="history-result">${formula.result}</div>
            `;
            
            // Add click handler to load the formula
            item.addEventListener('click', () => {
                this.loadFormula(formula);
                if (window.innerWidth <= 768) {
                    toggleHistoryPanel(); // Close panel on mobile after selection
                }
            });
            
            historyList.appendChild(item);
        });
    }
}

const calculator = new Calculator();

// Event Listeners for calculator
document.querySelectorAll('.number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        switch(action) {
            case 'add':
                calculator.chooseOperation('+');
                break;
            case 'subtract':
                calculator.chooseOperation('-');
                break;
            case 'multiply':
                calculator.chooseOperation('×');
                break;
            case 'divide':
                calculator.chooseOperation('÷');
                break;
            case 'percent':
                calculator.chooseOperation('%');
                break;
            default:
                calculator.chooseOperation(action);
        }
        calculator.updateDisplay();
    });
});

document.querySelector('.equals').addEventListener('click', () => {
    calculator.calculate();
    calculator.updateDisplay();
});

document.querySelector('.clear').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

document.querySelector('.delete').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

document.querySelectorAll('.function').forEach(button => {
    button.addEventListener('click', () => {
        calculator.scientificFunction(button.dataset.action);
        calculator.updateDisplay();
    });
});

// Keyboard Input Support
document.addEventListener('keydown', (event) => {
    // Numbers
    if (/^[0-9]$/.test(event.key)) {
        calculator.appendNumber(event.key);
        calculator.updateDisplay();
    }
    // Decimal point
    else if (event.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
    }
    // Operators
    else if (['+', '-'].includes(event.key)) {
        calculator.chooseOperation(event.key);
        calculator.updateDisplay();
    }
    else if (event.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }
    else if (event.key === '/') {
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    else if (event.key === '%') {
        calculator.chooseOperation('%');
        calculator.updateDisplay();
    }
    else if (event.key === '^') {
        calculator.chooseOperation('power');
        calculator.updateDisplay();
    }
    // Equal sign or Enter
    else if (event.key === '=' || event.key === 'Enter') {
        calculator.calculate();
        calculator.updateDisplay();
    }
    // Backspace for delete
    else if (event.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    // Escape or Delete for clear
    else if (event.key === 'Escape' || event.key === 'Delete') {
        calculator.clear();
        calculator.updateDisplay();
    }
    // Scientific functions
    else if (event.key === 's') {
        calculator.scientificFunction('sin');
        calculator.updateDisplay();
    }
    else if (event.key === 'c') {
        calculator.scientificFunction('cos');
        calculator.updateDisplay();
    }
    else if (event.key === 't') {
        calculator.scientificFunction('tan');
        calculator.updateDisplay();
    }
    else if (event.key === 'r') {
        calculator.scientificFunction('sqrt');
        calculator.updateDisplay();
    }
    else if (event.key === 'l') {
        calculator.scientificFunction('log');
        calculator.updateDisplay();
    }
    else if (event.key === 'n') {
        calculator.scientificFunction('ln');
        calculator.updateDisplay();
    }
    else if (event.key === 'p') {
        calculator.scientificFunction('pi');
        calculator.updateDisplay();
    }
});

// History panel functionality
const historyPanel = document.querySelector('.history-panel');
const historyBtn = document.getElementById('history-btn');
const closeHistoryBtn = document.getElementById('close-history');
const clearHistoryBtn = document.getElementById('clear-history');
const saveFormulaBtn = document.getElementById('save-formula');

// Toggle history panel
function toggleHistoryPanel() {
    historyPanel.classList.toggle('open');
    if (historyPanel.classList.contains('open')) {
        calculator.updateHistoryList();
    }
}

historyBtn.addEventListener('click', toggleHistoryPanel);
closeHistoryBtn.addEventListener('click', toggleHistoryPanel);

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    calculator.clearHistory();
});

// Fullscreen functionality
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Function to toggle fullscreen
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Safari
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE11
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    }
}

// Add event listener to fullscreen button
fullscreenBtn.addEventListener('click', toggleFullScreen);

// Theme Toggle Functionality
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun');
const moonIcon = document.querySelector('.moon');

// Function to set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// Initialize theme
function initTheme() {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // If there's a saved preference, use it
        setTheme(savedTheme);
    } else {
        // Otherwise, use system preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersDarkScheme.matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
        
        // Listen for changes in system preference
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) { // Only auto-switch if user hasn't manually set a theme
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Toggle theme when button is clicked
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Initialize theme and history when page loads
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    calculator.updateHistoryList();
});

// Keyboard Input Support
document.addEventListener('keydown', (event) => {
    // Numbers
    if (/^[0-9]$/.test(event.key)) {
        calculator.appendNumber(event.key);
        calculator.updateDisplay();
    }
    // Decimal point
    else if (event.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
    }
    // Basic operators
    else if (event.key === '+') {
        calculator.chooseOperation('add');
        calculator.updateDisplay();
    }
    else if (event.key === '-') {
        calculator.chooseOperation('subtract');
        calculator.updateDisplay();
    }
    else if (event.key === '*' || event.key === 'x' || event.key === '×') {
        calculator.chooseOperation('multiply');
        calculator.updateDisplay();
    }
    else if (event.key === '/' || event.key === '÷') {
        calculator.chooseOperation('divide');
        calculator.updateDisplay();
    }
    // Enter or = for equals
    else if (event.key === 'Enter' || event.key === '=') {
        calculator.calculate();
        calculator.updateDisplay();
    }
    // Backspace for delete
    else if (event.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    // Escape or Delete for clear
    else if (event.key === 'Escape' || event.key === 'Delete') {
        calculator.clear();
        calculator.updateDisplay();
    }
    // Scientific functions
    else if (event.key === '(' || event.key === ')') {
        calculator.scientificFunction(event.key);
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 's') {
        calculator.scientificFunction('sin');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'c') {
        calculator.scientificFunction('cos');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 't') {
        calculator.scientificFunction('tan');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'l') {
        calculator.scientificFunction('log');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'n') {
        calculator.scientificFunction('ln');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'p') {
        calculator.scientificFunction('pi');
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'e') {
        calculator.scientificFunction('e');
        calculator.updateDisplay();
    }
    // Memory functions
    else if (event.key.toLowerCase() === 'm') {
        if (event.shiftKey) {
            calculator.scientificFunction('M-');
        } else {
            calculator.scientificFunction('M+');
        }
        calculator.updateDisplay();
    }
    else if (event.key.toLowerCase() === 'r') {
        calculator.scientificFunction('MR');
        calculator.updateDisplay();
    }
}); 