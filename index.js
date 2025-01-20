// Selecting elements from the DOM
const botSelect = document.getElementById("bot-select");
const stakeInput = document.getElementById("stake");
const durationInput = document.getElementById("duration");
const martingaleInput = document.getElementById("martingale");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");
const profitLossElement = document.getElementById("profit-loss");
const tradeStatement = document.getElementById("trade-statement");
const resultsTable = document.getElementById("results-table");
const enableMartingaleCheckbox = document.getElementById("enable-martingale");
const martingaleFactorContainer = document.getElementById("martingale-factor-container");

let isBotRunning = false;
let tradeCount = 0;
let profitLoss = 0;
let botInterval;

// Toggle Martingale input field visibility
enableMartingaleCheckbox.addEventListener("change", () => {
    if (enableMartingaleCheckbox.checked) {
        martingaleFactorContainer.style.display = "block";
    } else {
        martingaleFactorContainer.style.display = "none";
    }
});

// Function to start the bot
function startBot() {
    if (!botSelect.value) {
        alert("Please select a bot before starting.");
        return;
    }
    if (!stakeInput.value || stakeInput.value <= 0) {
        alert("Please enter a valid stake amount.");
        return;
    }
    if (!durationInput.value || durationInput.value <= 0) {
        alert("Please enter a valid duration.");
        return;
    }

    isBotRunning = true;
    tradeStatement.textContent = "Running...";
    tradeStatement.style.color = "#ffb400";
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;

    botInterval = setInterval(executeTrade, 3000); // Simulate trade every 3 seconds
}

// Function to execute a simulated trade
function executeTrade() {
    if (!isBotRunning) return;

    tradeCount++;
    const tradeId = `T-${tradeCount}`;
    const result = Math.random() < 0.5 ? "Win" : "Loss"; // Simulate win/loss
    let stake = parseFloat(stakeInput.value);
    let martingaleFactor = enableMartingaleCheckbox.checked ? parseFloat(martingaleInput.value) : 1;

    let tradeProfitLoss;
    if (result === "Win") {
        tradeProfitLoss = stake;
        profitLoss += stake;
    } else {
        tradeProfitLoss = -stake;
        profitLoss -= stake;
        stakeInput.value = (stake * martingaleFactor).toFixed(2); // Apply martingale strategy
    }

    // Update the profit/loss display
    profitLossElement.textContent = `$${profitLoss.toFixed(2)}`;
    profitLossElement.className = profitLoss >= 0 ? "profit" : "loss";

    // Add trade result to table
    addTradeToTable(tradeId, result, tradeProfitLoss);
}

// Function to add a trade result row in the table
function addTradeToTable(tradeId, result, tradeProfitLoss) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
    <td>${tradeId}</td>
    <td style="color: ${result === "Win" ? "green" : "red"}">${result}</td>
    <td style="color: ${tradeProfitLoss > 0 ? "green" : "red"}">$${tradeProfitLoss.toFixed(2)}</td>
  `;
    if (tradeCount === 1) resultsTable.innerHTML = ""; // Clear initial message
    resultsTable.appendChild(newRow);
}

// Function to pause the bot
function pauseBot() {
    if (isBotRunning) {
        clearInterval(botInterval);
        tradeStatement.textContent = "Paused";
        tradeStatement.style.color = "#ffb400";
        isBotRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

// Function to stop the bot
function stopBot() {
    clearInterval(botInterval);
    isBotRunning = false;
    tradeStatement.textContent = "Stopped";
    tradeStatement.style.color = "red";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;

    // Reset stake to initial value
    stakeInput.value = "";
}

// Event Listeners
startBtn.addEventListener("click", startBot);
pauseBtn.addEventListener("click", pauseBot);
stopBtn.addEventListener("click", stopBot);
