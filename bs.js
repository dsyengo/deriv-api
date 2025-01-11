// Get elements
const realTab = document.getElementById("real-tab");
const demoTab = document.getElementById("demo-tab");
const accountTitle = document.getElementById("account-title");
const accountBalance = document.getElementById("account-balance");
const accountCurrency = document.getElementById("account-currency");

const app_id = '67110'; // Replace with your app ID
let ws;
let heartbeatInterval;
const HEARTBEAT_INTERVAL = 30000;

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
            console.log("Heartbeat ping sent.");
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
        console.log("Authorization request sent.");
    }
};

// Handle WebSocket Responses
const handleApiResponse = (response) => {
    console.log("Response received:", response);

    if (response.msg_type === "authorize") {
        console.log("Authorization successful.");
    } else if (response.msg_type === "balance") {
        if (response.balance) {
            const { balance, currency } = response.balance;
            const accountType = response.echo_req.account_type || "real";

            // Update UI
            accountTitle.textContent = `${capitalizeFirstLetter(accountType)} Account`;
            accountBalance.textContent = `Balance: ${balance}`;
            accountCurrency.textContent = `Currency: ${currency}`;

            const colorClass = accountType === "real" ? "real-text" : "demo-text";
            accountBalance.className = colorClass;
            accountCurrency.className = colorClass;
        } else if (response.error) {
            console.error("Error:", response.error.message);
            alert(`Error: ${response.error.message}`);
        }
    }
};

// Fetch Real Account Balance
const fetchRealAccountBalance = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                balance: 1, 
            })
        );
        console.log("Real account balance request sent.");
    }
};

// Fetch Demo Account Balance
const fetchDemoAccountBalance = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                balance: 1, // Demo account balance request
                account_type: "virtual",
            })
        );
        console.log("Demo account balance request sent.");
    }
};

// Capitalize First Letter
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Handle Tab Switching
realTab.addEventListener("click", () => {
    switchAccount("real");
    fetchRealAccountBalance(); // Call real account balance function
});

demoTab.addEventListener("click", () => {
    switchAccount("virtual");
    fetchDemoAccountBalance(); // Call demo account balance function
});

// Switch Account Based on Tab Click
const switchAccount = (accountType) => {
    // Set active tab
    if (accountType === "real") {
        realTab.classList.add("active-tab", "real-tab");
        demoTab.classList.remove("active-tab", "demo-tab");
        realTab.setAttribute("aria-selected", "true");
        demoTab.setAttribute("aria-selected", "false");
    } else if (accountType === "virtual") {
        demoTab.classList.add("active-tab", "demo-tab");
        realTab.classList.remove("active-tab", "real-tab");
        demoTab.setAttribute("aria-selected", "true");
        realTab.setAttribute("aria-selected", "false");
    }
};

// Initialize on window load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token1");
    const redirect_uri = encodeURIComponent(window.location.origin + "/dashboard.html");

    if (token) {
        // Store the token in localStorage
        localStorage.setItem("deriv_token", token);

        // Redirect the user to the dashboard (without the token in the URL)
        window.history.replaceState({}, document.title, window.location.pathname);

        // Authorize the user using the token
        authorize(token);
    } else {
        // Check if the token is already stored
        const storedToken = localStorage.getItem("deriv_token");
        if (storedToken) {
            authorize(storedToken);
        } else {
            console.error("Token is missing. Please log in.");
            window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
        }
    }
};

// Establish WebSocket connection
connectWebSocket();
