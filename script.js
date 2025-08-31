// App State
let appState = {
    currentAsset: 'BTCUSD',
    balance: 15642.78,
    openOrders: [],
    currentOrderType: 'BUY',
    tradingViewWidget: null,
    isLoggedIn: false,
    userData: null
};

// Simulate loading
setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
    showLogin();
}, 1000);

function initializeApp() {
    initializeTradingView();
    setupEventListeners();
    updateUI();

    function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Simula login bem-sucedido
    appState.isLoggedIn = true;
    appState.userData = { name: 'João Silva', email: email };
    
    closeModal('loginModal');
    document.getElementById('app').classList.remove('hidden');
    initializeApp();
    
    // Atualiza dados do perfil
    document.getElementById('profileName').textContent = appState.userData.name;
    document.getElementById('profileEmail').textContent = appState.userData.email;
}
}

function initializeTradingView() {
    if (typeof TradingView !== 'undefined') {
        appState.tradingViewWidget = new TradingView.widget({
            container_id: "tradingview-chart",
            symbol: "BINANCE:BTCUSDT",
            interval: "15",
            timezone: "America/Sao_Paulo",
            theme: "dark",
            style: "1",
            locale: "pt",
            toolbar_bg: "#1e293b",
            enable_publishing: false,
            allow_symbol_change: true,
            hideideas: true,
            withdateranges: true,
            details: true,
            hotlist: true,
            calendar: true,
            news: ["headlines"],
            studies: [
                "MACD@tv-basicstudies",
                "RSI@tv-basicstudies",
                "Volume@tv-basicstudies"
            ],
            overrides: {
                "paneProperties.background": "#1e293b",
                "paneProperties.vertGridProperties.color": "#334155",
                "paneProperties.horzGridProperties.color": "#334155"
            }
        });
    }
}

function changeTradingViewSymbol(symbol) {
    const tradingViewSymbols = {
        'BTCUSD': 'BINANCE:BTCUSDT',
        'ETHUSD': 'BINANCE:ETHUSDT',
        'ADAUSD': 'BINANCE:ADAUSDT',
        'SOLUSD': 'BINANCE:SOLUSDT'
    };
    
    if (appState.tradingViewWidget && tradingViewSymbols[symbol]) {
        appState.tradingViewWidget.chart().setSymbol(tradingViewSymbols[symbol]);
    }
}

function setupEventListeners() {
    // Asset selection
    document.querySelectorAll('.asset-item').forEach(item => {
        item.addEventListener('click', function() {
            const asset = this.getAttribute('data-asset');
            appState.currentAsset = asset;
            updateAssetDisplay(asset);
            changeTradingViewSymbol(asset);
        });
    });

    // Buy/Sell buttons
    document.getElementById('buyBtn').addEventListener('click', () => {
        appState.currentOrderType = 'BUY';
        prepareOrder('COMPRA');
    });

    document.getElementById('sellBtn').addEventListener('click', () => {
        appState.currentOrderType = 'SELL';
        prepareOrder('VENDA');
    });

    // Confirm order button
    document.getElementById('confirmOrderBtn').addEventListener('click', () => {
        prepareOrder(appState.currentOrderType === 'BUY' ? 'COMPRA' : 'VENDA');
    });

    // Calculate total when inputs change
    document.getElementById('quantityInput').addEventListener('input', calculateTotal);
    document.getElementById('priceInput').addEventListener('input', calculateTotal);
}

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('quantityInput').value) || 0;
    const price = parseFloat(document.getElementById('priceInput').value) || 0;
    const total = quantity * price;
    
    if (total > 0) {
        document.getElementById('confirmOrderBtn').disabled = false;
        document.getElementById('confirmOrderBtn').classList.remove('opacity-50');
    } else {
        document.getElementById('confirmOrderBtn').disabled = true;
        document.getElementById('confirmOrderBtn').classList.add('opacity-50');
    }
}

function prepareOrder(type) {
    const quantity = parseFloat(document.getElementById('quantityInput').value);
    const price = parseFloat(document.getElementById('priceInput').value);
    const orderType = document.getElementById('orderTypeSelect').value;

    if (quantity <= 0 || price <= 0) {
        alert('Por favor, insira valores válidos para quantidade e preço.');
        return;
    }

    const total = quantity * price;

    // Update modal content
    document.getElementById('orderTitle').textContent = `Confirmar ${type}`;
    document.getElementById('orderAsset').textContent = appState.currentAsset;
    document.getElementById('orderType').textContent = type;
    document.getElementById('orderQuantity').textContent = quantity;
    document.getElementById('orderPrice').textContent = `$${price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('orderTotal').textContent = `$${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    openModal('orderModal');
}

function confirmOrder() {
    const quantity = parseFloat(document.getElementById('quantityInput').value);
    const price = parseFloat(document.getElementById('priceInput').value);
    const total = quantity * price;

    // Add to open orders
    const newOrder = {
        id: Date.now(),
        asset: appState.currentAsset,
        type: appState.currentOrderType,
        quantity: quantity,
        price: price,
        total: total,
        status: 'EXECUTANDO',
        timestamp: new Date().toLocaleString()
    };

    appState.openOrders.push(newOrder);
    updateOpenOrders();
    closeModal('orderModal');
    
    // Show success message
    alert(`Ordem de ${appState.currentOrderType === 'BUY' ? 'COMPRA' : 'VENDA'} executada com sucesso!`);
}

function closeOrder(orderId) {
    appState.openOrders = appState.openOrders.filter(order => order.id !== orderId);
    updateOpenOrders();
    alert('Ordem cancelada com sucesso!');
}

function processWithdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (amount < 10) {
        alert('Valor mínimo para saque é R$ 10,00');
        return;
    }

    if (amount > appState.balance) {
        alert('Saldo insuficiente para realizar o saque');
        return;
    }

    appState.balance -= amount;
    updateUI();
    closeModal('pixWithdrawModal');
    
    alert(`Saque de R$ ${amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} processado com sucesso!`);
}

function updateAssetDisplay(asset) {
    document.querySelector('h2').textContent = `${asset} - ${asset.split('/')[0]}`;
}

function updateOpenOrders() {
    const ordersList = document.getElementById('openOrdersList');
    ordersList.innerHTML = '';
    
    appState.openOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'p-3 rounded-lg bg-gray-700/50';
        orderElement.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-sm">${order.asset} ${order.type === 'BUY' ? 'Buy' : 'Sell'}</span>
                <span class="${order.type === 'BUY' ? 'text-green-400' : 'text-red-400'} text-sm">$${order.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400">
                <span>${order.quantity} ${order.asset.split('/')[0]}</span>
                <span>${order.status}</span>
            </div>
            <button onclick="closeOrder(${order.id})" class="w-full mt-2 bg-red-600 hover:bg-red-700 py-1 rounded text-xs">
                Cancelar
            </button>
        `;
        ordersList.appendChild(orderElement);
    });
}

function updateUI() {
    document.querySelector('.text-green-400.font-semibold').textContent = `R$ ${appState.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Texto copiado para a área de transferência!');
    });
}

function showLogin() {
    openModal('loginModal');
}

function showRegister() {
    closeModal('loginModal');
    openModal('registerModal');
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Simulate login
    appState.isLoggedIn = true;
    appState.userData = {
        name: 'João Silva',
        email: email,
        cpf: '123.456.789-00'
    };
    
    closeModal('loginModal');
    document.getElementById('app').classList.remove('hidden');
    initializeApp();
    
    // Update profile info
    document.getElementById('profileName').textContent = appState.userData.name;
    document.getElementById('profileEmail').textContent = appState.userData.email;
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const cpf = document.getElementById('registerCpf').value;
    
    if (!name || !email || !password || !cpf) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
    }
    
    // Simulate registration
    alert('Conta criada com sucesso! Faça login para continuar.');
    closeModal('registerModal');
    showLogin();
}

function handleLogout() {
    appState.isLoggedIn = false;
    appState.userData = null;
    document.getElementById('app').classList.add('hidden');
    showLogin();
    alert('Você saiu da sua conta.');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// Handle TradingView script loading
if (typeof TradingView === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.onload = initializeTradingView;
    document.head.appendChild(script);
}