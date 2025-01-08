const app_id = '67110';
const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

// OAuth Login


document.getElementById('login-btn').addEventListener('click', () => {
    //const redirect_uri = encodeURIComponent(window.location.href);
    const redirect_uri = encodeURIComponent(window.location.href);
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&scope=read&redirect_uri=${redirect_uri}`;
});

