const app_id = '67110';
let ws; // Declare ws variable in a broader scope
let heartbeatInterval; // Variable to hold the heartbeat interval
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// WebSocket Connection
const connectWebSocket = () => {
    ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

    // WebSocket Event Handlers
    ws.onopen = () => {
        console.log('Connected to Deriv API');
        const storedToken = localStorage.getItem('deriv_token');
        console.log('Stored token:', storedToken); // Log the stored token
        if (storedToken) {
            authorize(storedToken);
        }
        startHeartbeat(); // Start sending heartbeat messages
    };

    ws.onmessage = (message) => {
        const response = JSON.parse(message.data);
        handleApiResponse(response);
    };

    ws.onclose = () => {
        console.log('WebSocket closed. Attempting to reconnect...');
        stopHeartbeat(); // Stop sending heartbeat messages
        setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
};

// Start sending heartbeat messages
const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: 1 })); // Send a ping message
            console.log('Sent heartbeat ping');
        }
    }, HEARTBEAT_INTERVAL);
};

// Stop sending heartbeat messages
const stopHeartbeat = () => {
    clearInterval(heartbeatInterval);
};

// Authorize the user
const authorize = (token) => {
    if (ws.readyState === WebSocket.OPEN) {
        const authRequest = {
            authorize: token,
        };
        ws.send(JSON.stringify(authRequest));
        console.log('Sent authorization request');
    } else {
        console.log('WebSocket not open yet');
    }
};

// Handle WebSocket response messages
const handleApiResponse = (response) => {
    console.log('Handling response:', response); // Log the response being handled

    if (response.msg_type === 'authorize') {
        console.log('Authorization successful:', response);
        getBalanceForAccount('real'); // Fetch balance for the default account type
    } else if (response.msg_type === 'balance') {
        // Check if response.balance is defined
        if (!response.balance) {
            console.error('Balance response is undefined:', response);
            return; // Exit the function if balance is not available
        }

        const { balance, currency } = response.balance;
        const accountType = response.echo_req.account_type || 'real'; // Default to 'real' if not set

        // Update the balance card
        document.getElementById('account-title').textContent = `${capitalizeFirstLetter(accountType)} Account`;
        document.getElementById('account-balance').textContent = `Balance: ${balance}`;
        document.getElementById('account-currency').textContent = `Currency: ${currency}`;

        // Add transaction history
        const transactionList = document.getElementById('transaction-list');
        const transactionItem = document.createElement('li');
        transactionItem.textContent = `Fetched ${accountType} balance: ${balance} ${currency} on ${new Date().toLocaleString()}`;
        transactionList.appendChild(transactionItem);
    } else if (response.error) {
        // Handle any errors returned in the response
        console.error('Error fetching balance:', response.error);
        if (response.error.code === "AuthorizationRequired") {
            console.warn('User is not authorized. Please log in.');
            // Optionally, you can redirect the user to the login page or show a message
        }
    } else {
        console.warn('Unexpected message type:', response.msg_type);
    }
};

// Fetch and Display Account Balances
const getBalanceForAccount = (accountType) => {
    if (ws.readyState === WebSocket.OPEN) {
        const balanceRequest = {
            balance: 1,
        };
        console.log('Sending balance request for:', accountType); // Log the request
        ws.send(JSON.stringify(balanceRequest));
    } else {
        console.log('WebSocket not open yet');
    }
};

// Call connectWebSocket to initiate the connection
connectWebSocket();

// Check for token in URL after redirection
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        localStorage.setItem('deriv_token', token); // Store token locally
        authorize(token); // Authorize user
        //  window.history.replaceState({}, document.title, window.location.pathname); // Remove token from URL
    } else {
        // Check if token is already stored
        const storedToken = localStorage.getItem('deriv_token');
        if (storedToken) {
            authorize(storedToken);
        } else {
            console.error('Token is missing. Please log in.');
            // Optionally redirect to login page if no token
            window.location.href = '/login.html'; // Redirect to login page
        }
    }
};

// Capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Handle Account Switching
document.getElementById('account-type').addEventListener('change', (event) => {
    const selectedAccount = event.target.value; // 'real' or 'demo'
    console.log('Account type changed to:', selectedAccount); // Log the selected account type
    getBalanceForAccount(selectedAccount); // Call the function to fetch the balance
});
