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


// OAuth Login


document.getElementById('login-btn').addEventListener('click', () => {
    const redirect_uri = encodeURIComponent(window.location.href);
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
});

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



//Fetch and Display Account Balances


const authorize = (token) => {
    const authRequest = {
        authorize: token,
    };
    ws.send(JSON.stringify(authRequest));
};

const getBalance = () => {
    const balanceRequest = {
        balance: 1,
    };
    ws.send(JSON.stringify(balanceRequest));
};

const handleApiResponse = (response) => {
    if (response.msg_type === 'authorize') {
        document.getElementById('login-btn').classList.add('hidden');
        const balanceSection = document.getElementById('balance-section');
        if (balanceSection) {
            balanceSection.classList.remove('hidden');
        }
        getBalance();
    } else if (response.msg_type === 'balance') {
        const balance = response.balance.balance;
        const currency = response.balance.currency;
        const accountType = response.echo_req.account_type || 'real';
        if (accountType === 'real') {
            document.getElementById('real-balance').textContent = `Balance: ${balance} ${currency}`;
        } else {
            document.getElementById('demo-balance').textContent = `Balance: ${balance} ${currency}`;
        }
    }
};



// Handle Account Switching

document.getElementById('account-type').addEventListener('change', (event) => {
    const selectedAccount = event.target.value === 'real' ? 'real' : 'virtual';
    getBalanceForAccount(selectedAccount);
});

const getBalanceForAccount = (accountType) => {
    const balanceRequest = {
        balance: 1,
        account_type: accountType,
    };
    ws.send(JSON.stringify(balanceRequest));
};

