// Get elements
const realTab = document.getElementById("real-tab");
const demoTab = document.getElementById("demo-tab");
const accountTitle = document.getElementById("account-title");
const accountBalance = document.getElementById("account-balance");
const accountCurrency = document.getElementById("account-currency");

// Set initial account data
let realAccount = { balance: "$1000.00", currency: "USD" };
let demoAccount = { balance: "$10,000.00", currency: "USD" };

// Event Listeners
realTab.addEventListener("click", () => {
    // Set active tab
    realTab.classList.add("active-tab", "real-tab");
    demoTab.classList.remove("active-tab", "demo-tab");

    // Update account details
    accountTitle.textContent = "Real Account";
    accountBalance.textContent = `Balance: ${realAccount.balance}`;
    accountCurrency.textContent = `Currency: ${realAccount.currency}`;
});

demoTab.addEventListener("click", () => {
    // Set active tab
    demoTab.classList.add("active-tab", "demo-tab");
    realTab.classList.remove("active-tab", "real-tab");

    // Update account details
    accountTitle.textContent = "Demo Account";
    accountBalance.textContent = `Balance: ${demoAccount.balance}`;
    accountCurrency.textContent = `Currency: ${demoAccount.currency}`;
});
