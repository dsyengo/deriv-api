// // WebSocket Connection
// const app_id = '67110';
// const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

// ws.onopen = () => {
//     console.log('Connected to Deriv API');
//     const storedToken = localStorage.getItem('deriv_token');
//     if (storedToken) {
//         authorize(storedToken);
//     }
// };

// ws.onclose = () => {
//     console.log('Disconnected from Deriv API');
// };

// ws.onerror = (error) => {
//     console.error('WebSocket Error:', error);
// };

// ws.onmessage = (message) => {
//     const response = JSON.parse(message.data);
//     handleApiResponse(response);
// };

// // Check for token in URL after redirection
// window.onload = () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get('token');

//     if (token) {
//         localStorage.setItem('deriv_token', token); // Store token locally
//         authorize(token); // Authorize user
//         window.history.replaceState({}, document.title, window.location.pathname); // Remove token from URL
//     } else {
//         // Check if token is already stored
//         const storedToken = localStorage.getItem('deriv_token');
//         if (storedToken) {
//             authorize(storedToken);
//         }
//     }
// };

// // Fetch and Display Account Balances
// const authorize = (token) => {
//     const authRequest = {
//         authorize: token,
//     };
//     ws.send(JSON.stringify(authRequest));
// };

// const getBalanceForAccount = (accountType) => {
//     const balanceRequest = {
//         balance: 1,
//         account_type: accountType,
//     };
//     ws.send(JSON.stringify(balanceRequest));
// };

// const handleApiResponse = (response) => {
//     if (response.msg_type === 'authorize') {
//         getBalanceForAccount('real'); // Fetch real account balance
//         getBalanceForAccount('virtual'); // Fetch virtual account balance
//     } else if (response.msg_type === 'balance') {
//         const { balance, currency } = response.balance;
//         const accountType = response.echo_req.account_type;

//         // Update the balance card
//         document.getElementById('account-title').textContent = accountType.charAt(0).toUpperCase() + accountType.slice(1) + ' Account';
//         document.getElementById('account-balance').textContent = `Balance: ${balance}`;
//         document.getElementById('account-currency').textContent = `Currency: ${currency}`;

//         // Add transaction history
//         const transactionList = document.getElementById('transaction-list');
//         const transactionItem = document.createElement('li');
//         transactionItem.textContent = `Fetched ${accountType} balance: ${balance} ${currency} on ${new Date().toLocaleString()}`;
//         transactionList.appendChild(transactionItem);
//     }
// };

// // Handle Account Switching
// document.getElementById('account-type').addEventListener('change', (event) => {
//     const selectedAccount = event.target.value === 'real' ? 'real' : 'virtual';
//     getBalanceForAccount(selectedAccount);
// });

// WebSocket Connection
const app_id = '67110';
const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

// WebSocket Event Handlers
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

// Fetch and Display Account Balances
const authorize = (token) => {
    const authRequest = {
        authorize: token,
    };
    ws.send(JSON.stringify(authRequest));
};

const getBalanceForAccount = (accountType) => {
    const balanceRequest = {
        balance: 1,
        account_type: accountType,
    };
    ws.send(JSON.stringify(balanceRequest));
};

const handleApiResponse = (response) => {
    if (response.msg_type === 'authorize') {
        getBalanceForAccount('real'); // Fetch real account balance
        getBalanceForAccount('virtual'); // Fetch virtual account balance
    } else if (response.msg_type === 'balance') {
        const { balance, currency } = response.balance;
        const accountType = response.echo_req.account_type;

        // Update the balance card
        document.getElementById('account-title').textContent = `${capitalizeFirstLetter(accountType)} Account`;
        document.getElementById('account-balance').textContent = `Balance: ${balance}`;
        document.getElementById('account-currency').textContent = `Currency: ${currency}`;

        // Add transaction history
        const transactionList = document.getElementById('transaction-list');
        const transactionItem = document.createElement('li');
        transactionItem.textContent = `Fetched ${accountType} balance: ${balance} ${currency} on ${new Date().toLocaleString()}`;
        transactionList.appendChild(transactionItem);
    }
};

// Capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Handle Account Switching
document.getElementById('account-type').addEventListener('change', (event) => {
    const selectedAccount = event.target.value; // 'real' or 'demo'
    getBalanceForAccount(selectedAccount);
});