document.addEventListener('DOMContentLoaded', () => {
    const realTab = document.getElementById('real-tab');
    const demoTab = document.getElementById('demo-tab');
    const balanceCard = document.getElementById('balance-card');
    const accountTitle = document.getElementById('account-title');
    const accountBalance = document.getElementById('account-balance');
    const accountCurrency = document.getElementById('account-currency');
    const transactionList = document.getElementById('transaction-list');

    // Function to fetch and display balance
    const getBalanceForAccount = (accountType) => {
        console.log(`Fetching ${accountType} account balance...`);
        // Mock balance response
        const balanceData = {
            real: { balance: '1000.00', currency: 'USD' },
            demo: { balance: '50000.00', currency: 'USD' },
        };

        // Update UI with mock data
        const { balance, currency } = balanceData[accountType];
        accountTitle.textContent = `${accountType === 'real' ? 'Real' : 'Demo'} Account`;
        accountBalance.textContent = `Balance: ${balance}`;
        accountCurrency.textContent = `Currency: ${currency}`;

        // Update colors
        const colorClass = accountType === 'real' ? 'real-text' : 'demo-text';
        accountBalance.className = colorClass;
        accountCurrency.className = colorClass;

        // Update tab colors
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
    };

    // Tab click event listeners
    realTab.addEventListener('click', () => {
        getBalanceForAccount('real');
    });

    demoTab.addEventListener('click', () => {
        getBalanceForAccount('demo');
    });

    // Initialize with Real Account
    getBalanceForAccount('real');
});
