const realTab = document.getElementById('real-tab');
const demoTab = document.getElementById('demo-tab');
const balanceCard = document.getElementById('balance-card');
const accountTitle = document.getElementById('account-title');
const accountBalance = document.getElementById('account-balance');
const accountCurrency = document.getElementById('account-currency');
const transactionList = document.getElementById('transaction-list');
const logoutBtn = document.getElementById('logout-btn');
const tradeBtn = document.getElementById('trade-btn');

const app_id = '67110';
let ws;
let heartbeatInterval;
const HEARTBEAT_INTERVAL = 30000;

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token1');
    const redirect_uri = encodeURIComponent(window.location.origin + '/dashboard.html');

    if (token) {
        // Store the token in localStorage
        localStorage.setItem('deriv_token', token);

        // Redirect the user to the dashboard (without the token in the URL)
        window.history.replaceState({}, document.title, window.location.pathname);

        // Authorize the user using the token
        authorize(token);
    } else {
        // Check if the token is already stored
        const storedToken = localStorage.getItem('deriv_token');
        if (storedToken) {
            // If the token is stored, use it to authorize the user
            authorize(storedToken);
        } else {
            console.error('Token is missing. Please log in.');
            // Redirect the user to the login page if no token is available
            window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
        }
    }
};

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
        const accountType = response.echo_req.account_type || 'real';
        getBalanceForAccount(accountType);
    } else if (response.msg_type === 'balance') {
        if (response.balance) {
            const { balance, currency } = response.balance;
            const accountType = response.echo_req.account_type || 'real';

            // Update UI
            accountTitle.textContent = `${capitalizeFirstLetter(accountType)} Account`;
            accountBalance.textContent = `Balance: ${balance}`;
            accountCurrency.textContent = `Currency: ${currency}`;

            const colorClass = accountType === 'real' ? 'real-text' : 'demo-text';
            accountBalance.className = colorClass;
            accountCurrency.className = colorClass;

            // // Log transaction
            // const transactionItem = document.createElement('li');
            // transactionItem.textContent = `Fetched ${accountType} balance: ${balance} ${currency} on ${new Date().toLocaleString()}`;
            // transactionList.appendChild(transactionItem);
        } else if (response.error) {
            console.error('Error:', response.error.message);
            alert(`Error: ${response.error.message}`);
        }
    };
}

// Fetch Account Balance
const getBalanceForAccount = (accountType) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ balance: 1, }));
        console.log(`Balance request sent for ${accountType} account.`);
    }
};

// Capitalize First Letter
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Handle Tab Switching
realTab.addEventListener('click', () => {
    switchAccount('real');
});

demoTab.addEventListener('click', () => {
    switchAccount('demo');
});

// Switch Account Based on Tab Click
const switchAccount = (accountType) => {
    // Set active tab
    if (accountType === 'real') {
        realTab.classList.add('active-tab', 'real-tab');
        demoTab.classList.remove('active-tab', 'demo-tab');
        realTab.setAttribute('aria-selected', 'true');
        demoTab.setAttribute('aria-selected', 'false');
    } else if (accountType === 'demo') {
        demoTab.classList.add('active-tab', 'demo-tab');
        realTab.classList.remove('active-tab', 'real-tab');
        demoTab.setAttribute('aria-selected', 'true');
        realTab.setAttribute('aria-selected', 'false');
    }

    // Fetch the balance for the selected account type
    getBalanceForAccount(accountType);
};

// Log Out Functionality
logoutBtn.addEventListener('click', () => {
    // Clear token and redirect to login page
    localStorage.removeItem('deriv_token');
    window.location.href = 'https://oauth.deriv.com/oauth2/authorize?app_id=67110&scope=read&redirect_uri=' + encodeURIComponent(window.location.origin + '/dashboard.html');
});

// Redirect to Trading Site
tradeBtn.addEventListener('click', () => {
    const token = localStorage.getItem('deriv_token'); // Retrieve token from localStorage

    if (!token) {
        alert('You are not logged in. Please log in first.');
        return;
    }

    // Function to authorize and redirect
    const authorizeAndRedirect = (token) => {
        // Ensure the WebSocket connection is open before sending the request
        if (ws.readyState === WebSocket.OPEN) {
            // Send the authorize request
            ws.send(JSON.stringify({ authorize: token }));

            // Handle the WebSocket response
            ws.onmessage = (message) => {
                const response = JSON.parse(message.data);

                if (response.msg_type === 'authorize') {
                    console.log('Authorization successful. Redirecting...');
                    // Redirect to the trading site with the token
                    window.location.href = `https://app.deriv.com/dtrader?token=${token}`;
                } else if (response.error) {
                    console.error('Authorization error:', response.error.message);
                    alert('Authorization failed. Please log in again.');
                }
            };
        } else {
            alert('WebSocket connection is not ready. Please try again.');
            // Optionally, attempt to reconnect WebSocket
            reconnectWebSocket(token);
        }
    };

    // Call the function with the retrieved token
    authorizeAndRedirect(token);
});

// Optional: Function to reconnect WebSocket if it's not ready
const reconnectWebSocket = (token) => {
    if (ws.readyState !== WebSocket.OPEN) {
        console.log('Reconnecting WebSocket...');
        ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

        ws.onopen = () => {
            console.log('WebSocket reconnected.');
            authorizeAndRedirect(token); // Retry authorization after reconnection
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            alert('Unable to reconnect to WebSocket. Please refresh the page.');
        };
    }
};

connectWebSocket();
