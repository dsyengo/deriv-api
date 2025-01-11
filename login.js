const app_id = '67110';
const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

// OAuth Login


document.getElementById('login-butto').addEventListener('click', () => {
    console.log('clicked')
    const redirect_uri = encodeURIComponent(window.location.origin + '/dashboard.html');
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
});