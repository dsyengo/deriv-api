const realTab = document.getElementById('real-tab');
const demoTab = document.getElementById('demo-tab');
const balanceCard = document.getElementById('balance-card');
const accountTitle = document.getElementById('account-title');
const accountBalance = document.getElementById('account-balance');
const accountCurrency = document.getElementById('account-currency');
const transactionList = document.getElementById('transaction-list');

const app_id = '67110';
let ws;
let heartbeatInterval;
const HEARTBEAT_INTERVAL = 30000;

// Initialize WebSocket connection
const connectWebSocket = () => {
    ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

    ws.onopen = () => {
        console.log('WebSocket connected.');
        startHeartbeat();
        const token = localStorage.getItem('deriv_token');
        if (token) {
            authorize(token);
        }
    };

    ws.onmessage = (message) => {
        const response = JSON.parse(message.data);
        handleApiResponse(response);
    };

    ws.onclose = () => {
        console.warn('WebSocket closed. Reconnecting...');
        stopHeartbeat();
        setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
};

// Start Heartbeat
const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: 1 }));
            console.log('Heartbeat ping sent.');
        }
    }, HEARTBEAT_INTERVAL);
};

const stopHeartbeat = () => {
    clearInterval(heartbeatInterval);
};

// Authorize the user
const authorize = (token) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ authorize: token }));
        console.log('Authorization request sent.');
    }
};

// Handle WebSocket Responses
const handleApiResponse = (response) => {
    console.log('Response received:', response);

    if (response.msg_type === 'authorize') {
        console.log('Authorization successful.');
        const accountType = document.getElementById('account-type').value;
        getBalanceForAccount(accountType);
    } else if (response.msg_type === 'balance') {
        if (response.balance) {
            const { balance, currency } = response.balance;
            const accountType = response.echo_req.account_type || 'real';

            // Update UI with fetched data
            accountTitle.textContent = `${capitalizeFirstLetter(accountType)} Account`;
            accountBalance.textContent = `Balance: ${balance}`;
            accountCurrency.textContent = `Currency: ${currency}`;

            const colorClass = accountType === 'real' ? 'real-text' : 'demo-text';
            accountBalance.className = colorClass;
            accountCurrency.className = colorClass;

            // Update tab styles
            if (accountType === 'real') {
                realTab.classList.add('active-tab', 'real-tab');
                demoTab.classList.remove('active-tab', 'demo-tab');
            } else {
                demoTab.classList.add('active-tab', 'demo-tab');
                realTab.classList.remove('active-tab', 'real-tab');
            }

            // Log transaction
            const transactionItem = document.createElement('li');
            transactionItem.textContent = `Fetched ${accountType} balance: ${balance} ${currency} on ${new Date().toLocaleString()}`;
            transactionList.appendChild(transactionItem);
        }
    } else if (response.error) {
        console.error('Error:', response.error.message);
        alert(`Error: ${response.error.message}`);
    }
};

// Fetch Account Balance
const getBalanceForAccount = (accountType) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ balance: 1, account_type: accountType }));
        console.log(`Balance request sent for ${accountType} account.`);
    }
};

// Capitalize First Letter
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Handle Account Switching
document.getElementById('account-type').addEventListener('change', (event) => {
    const selectedAccount = event.target.value;
    console.log('Account type switched to:', selectedAccount);
    getBalanceForAccount(selectedAccount);
});

// Handle Tab Click for Real Account
realTab.addEventListener('click', () => {
    getBalanceForAccount('real');
});

// Handle Tab Click for Demo Account
demoTab.addEventListener('click', () => {
    getBalanceForAccount('demo');
});

// Handle Token Retrieval on Page Load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token1');
    const redirect_uri = encodeURIComponent(window.location.origin + '/dashboard.html');

    if (token) {
        localStorage.setItem('deriv_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        authorize(token);
    } else {
        const storedToken = localStorage.getItem('deriv_token');
        if (!storedToken) {
            console.error('No token found. Redirecting to login.');
            window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
        }
    }
};

connectWebSocket();
