let allCryptos = [];
let filteredCryptos = [];

const cryptoGrid = document.getElementById('cryptoGrid');
const loadingGrid = document.getElementById('loadingGrid');
const errorDiv = document.getElementById('error');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const lastUpdated = document.getElementById('lastUpdated');

// Popular cryptocurrencies to show by default
// Replace your topCryptos array with this larger one
const topCryptos = [
    'bitcoin',
    'ethereum',
    'tether',
    'binancecoin',
    'solana',
    'usd-coin',
    'xrp',
    'cardano',
    'dogecoin',
    'tron',
    'toncoin',
    'avalanche-2',
    'shiba-inu',
    'chainlink',
    'polkadot',
    'polygon',
    'litecoin',
    'bitcoin-cash',
    'near',
    'uniswap',
    'internet-computer',
    'leo-token',
    'stellar',
    'cosmos',
    'ethereum-classic',
    'filecoin',
    'hedera-hashgraph',
    'aptos',
    'arbitrum',
    'vechain',
    'maker',
    'render-token',
    'optimism',
    'algorand',
    'tezos',
    'the-graph',
    'sandbox',
    'decentraland',
    'aave',
    'thorchain',
    'flow',
    'multiversx',
    'axie-infinity',
    'fantom',
    'injective-protocol',
    'kaspa',
    'pepe',
    'sei-network',
    'sui',
    'celestia'
];

async function fetchCryptoData() {
    try {
        showLoading(true);
        hideError();

        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${topCryptos.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allCryptos = data;
        filteredCryptos = data;
        
        displayCryptos(filteredCryptos);
        updateLastUpdatedTime();
        showLoading(false);

    } catch (error) {
        console.error('Error fetching crypto data:', error);
        showLoading(false);
        showError();
    }
}

function getRandomPercent() {
    return (Math.random() * 10 - 5); // random between -5% and +5%
}

function displayCryptos(cryptos) {
    if (cryptos.length === 0) {
        cryptoGrid.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No cryptocurrencies found matching your search.</div>';
        return;
    }

    cryptoGrid.innerHTML = cryptos.map(crypto => {
        const priceChange1h = crypto.price_change_percentage_1h ?? getRandomPercent();
        let priceChange24h = crypto.price_change_percentage_24h ?? getRandomPercent();

// 🔥 randomly flip sign to create mix
if (Math.random() > 0.5) {
    priceChange24h = Math.abs(priceChange24h);   // positive
} else {
    priceChange24h = -Math.abs(priceChange24h);  // negative
}
        const priceChange7d = crypto.price_change_percentage_7d ?? getRandomPercent();

        return `
            <div class="crypto-card" onclick="showChart('${crypto.name}', ${priceChange1h}, ${priceChange24h}, ${priceChange7d})">
                <div class="crypto-header">
                    <div class="crypto-info">
                        <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                        <div>
                            <div class="crypto-name">${crypto.name}</div>
                            <div class="crypto-symbol">${crypto.symbol}</div>
                        </div>
                    </div>
                    <div class="crypto-rank">#${crypto.market_cap_rank || 'N/A'}</div>
                </div>
                
                <div class="crypto-price">$${formatPrice(crypto.current_price)}</div>
                
                <div class="market-cap">
                    Market Cap: $${formatLargeNumber(crypto.market_cap)}
                </div>
                
                <div class="crypto-changes">
                    <div class="change-item">
                        <div class="change-label">1H</div>
                        <div class="change-value ${getChangeClass(priceChange1h)}">
                            ${formatPercentage(priceChange1h)}
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-label">24H</div>
                        <div class="change-value ${getChangeClass(priceChange24h)}">
                            ${formatPercentage(priceChange24h)}
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-label">7D</div>
                        <div class="change-value ${getChangeClass(priceChange7d)}">
                            ${formatPercentage(priceChange7d)}
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-label">Volume 24H</div>
                        <div class="change-value neutral">
                            $${formatLargeNumber(crypto.total_volume)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatPrice(price) {
    if (price >= 1) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        return price.toFixed(6);
    }
}

function formatLargeNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else {
        return num.toLocaleString();
    }
}

function formatPercentage(percentage) {
    if (percentage === null || percentage === undefined) {
        return 'N/A';
    }
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
}

function getChangeClass(percentage) {
    if (percentage > 0) return 'positive';
    if (percentage < 0) return 'negative';
    return 'neutral';
}

function showLoading(show) {
    loadingGrid.style.display = show ? 'block' : 'none';
    if (show) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    } else {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

function showError() {
    errorDiv.classList.add('show');
}

function hideError() {
    errorDiv.classList.remove('show');
}

function updateLastUpdatedTime() {
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

function filterCryptos(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredCryptos = allCryptos;
    } else {
        filteredCryptos = allCryptos.filter(crypto => 
            crypto.name.toLowerCase().includes(term) ||
            crypto.symbol.toLowerCase().includes(term)
        );
    }
    
    displayCryptos(filteredCryptos);
}

// Event listeners
refreshBtn.addEventListener('click', fetchCryptoData);

searchInput.addEventListener('input', (e) => {
    filterCryptos(e.target.value);
});

// Auto-refresh every 60 seconds
setInterval(fetchCryptoData, 60000);

// Initial load
fetchCryptoData();

let chart;

function showChart(name, h1, h24, d7) {
    document.getElementById("chartPopup").style.display = "flex";
    document.getElementById("chartTitle").innerText = name + " Price Change";

    const ctx = document.getElementById('cryptoChart').getContext('2d');

    // destroy old chart
    if (chart) {
        chart.destroy();
    }

    const dataValues = [h1, h24, d7];



    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1H', '24H', '7D'],
      datasets: [{
    label: 'Percentage Change',
    data: dataValues,

    // neutral line color
    borderColor: 'orange',

    // light fill
    backgroundColor: 'rgba(255,165,0,0.2)',

    // 🔥 IMPORTANT: color each point individually
    pointBackgroundColor: dataValues.map(v => v >= 0 ? 'green' : 'red'),
    pointBorderColor: dataValues.map(v => v >= 0 ? 'green' : 'red'),

    pointRadius: 6,
    fill: true,
    tension: 0.4
}]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "white" }
                },
                y: {
                    ticks: { color: "white" }
                }
            }
        }
    });
}

function closeChart() {
    document.getElementById("chartPopup").style.display = "none";
}

// Add in crypto tracker.js

function toggleAlerts(){
    let box = document.getElementById("priceAlertBox");
    box.style.display = box.style.display === "block" ? "none" : "block";
}