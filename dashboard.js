// WebSocket Connection
const app_id = '67110';
const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

ws.onopen = () => {
    console.log('Connected to Deriv API');
    const storedToken = localStorage.getItem('deriv_token');
    if (storedToken) {
        authorize(storedToken);
    }
};

ws.onclose = () => {
    console.log('Disconnected from Deriv API');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    handleApiResponse(response);
};

// Check for token in URL after redirection
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        localStorage.setItem('deriv_token', token); // Store token locally
        authorize(token); // Authorize user
        window.history.replaceState({}, document.title, window.location.pathname); // Remove token from URL
    } else {
        // Check if token is already stored
        const storedToken = localStorage.getItem('deriv_token');
        if (storedToken) {
            authorize(storedToken);
        }
    }
};

// Function to authorize the user
const authorize = (token) => {
    const authRequest = {
        authorize: token,
    };
    ws.send(JSON.stringify(authRequest));
};

// Fetch and Display Account Balances
const getBalance = (accountType) => {
    const balanceRequest = {
        balance: 1,
        account_type: accountType, // Specify the account type (real or virtual)
    };
    ws.send(JSON.stringify(balanceRequest));
};

// Handle the API response and update the balances
const handleApiResponse = (response) => {
    if (response.msg_type === 'authorize') {
        // Once authorized, fetch balance for both real and demo accounts
        getBalance('real');
        getBalance('virtual');
    } else if (response.msg_type === 'balance') {
        const { balance, currency } = response.balance;
        const accountType = response.echo_req.account_type;

        // Update the corresponding balance based on account type
        if (accountType === 'real') {
            document.getElementById('real-balance').textContent = `Balance: ${balance} ${currency}`;
        } else if (accountType === 'virtual') {
            document.getElementById('demo-balance').textContent = `Balance: ${balance} ${currency}`;
        }
    }
};

// Handle Account Switching
document.getElementById('account-type').addEventListener('change', (event) => {
    const selectedAccount = event.target.value === 'real' ? 'real' : 'virtual';
    getBalance(selectedAccount);
});
