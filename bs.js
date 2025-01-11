// Get elements
const accountBalance = document.getElementById("account-balance");
const accountCurrency = document.getElementById("account-currency");

const app_id = '67110'; // Replace with your app ID
let ws;
const HEARTBEAT_INTERVAL = 30000;
let heartbeatInterval;

// Initialize WebSocket connection
const connectWebSocket = () => {
    ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

    ws.onopen = () => {
        console.log("WebSocket connected.");
        startHeartbeat();
        const token = localStorage.getItem("deriv_token");
        if (token) authorize(token);
    };

    ws.onmessage = (message) => {
        const response = JSON.parse(message.data);
        handleApiResponse(response);
    };

    ws.onclose = () => {
        console.warn("WebSocket closed. Reconnecting...");
        stopHeartbeat();
        setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
};

// Start Heartbeat
const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: 1 }));
        }
    }, HEARTBEAT_INTERVAL);
};

const stopHeartbeat = () => {
    clearInterval(heartbeatInterval);
};


window.onload = () => {
    const loginContainer = document.getElementById("login-container");
    const loginButton = document.getElementById("login-button");

    const token = new URLSearchParams(window.location.search).get("token1");
    const redirect_uri = encodeURIComponent(window.location.origin + "/dashboard.html");

    if (token) {
        localStorage.setItem("deriv_token", token);
        window.history.replaceState({}, document.title, window.location.pathname);
        authorize(token);
    } else {
        const storedToken = localStorage.getItem("deriv_token");
        if (storedToken) {
            authorize(storedToken);
        } else {
            console.error("Token is missing. Showing login button...");
            loginContainer.style.display = "block";

            // Add click event to redirect to login
            loginButton.addEventListener("click", () => {
                window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
            });
        }
    }
};


// Authorize the user
const authorize = (token) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ authorize: token }));
    }
};

// Handle WebSocket Responses
const handleApiResponse = (response) => {
    if (response.msg_type === "balance" && response.balance) {
        const { balance, currency } = response.balance;
        accountBalance.textContent = `Balance: ${balance}`;
        accountCurrency.textContent = currency;
    } else if (response.error) {
        console.error("Error:", response.error.message);
    }
};

// Fetch Account Balance
const fetchAccountBalance = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ balance: 1 }));
    }
};

// Initialize on window load
window.onload = () => {
    const token = new URLSearchParams(window.location.search).get("token1");
    const redirect_uri = encodeURIComponent(window.location.origin + "/dashboard.html");

    if (token) {
        localStorage.setItem("deriv_token", token);
        window.history.replaceState({}, document.title, window.location.pathname);
        authorize(token);
    } else {
        const storedToken = localStorage.getItem("deriv_token");
        if (storedToken) {
            authorize(storedToken);
        } else {
            console.error("Token is missing. Redirecting to login...");
            window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
        }
    }
};

// Establish WebSocket connection
connectWebSocket();
