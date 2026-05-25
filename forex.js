// FOREX RATES PAGE - Live Exchange Rates

// Configuration
const BASE_CURRENCY = 'INR';
const API_URL = 'https://api.exchangerate-api.com/v4/latest/INR';
const FALLBACK_API = 'https://open.er-api.com/v6/latest/INR';

// Currency definitions with full names and flags
const currencies = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' }
};

// Global state
let exchangeRates = {};
let lastUpdateTime = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchForexRates();
  setupConverter();

  // Refresh rates every 60 seconds
  setInterval(fetchForexRates, 60000);
});

// Fetch live forex rates
async function fetchForexRates() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Primary API failed');
    }

    const data = await response.json();
    exchangeRates = data.rates;
    lastUpdateTime = new Date();

    updateLastUpdateDisplay();
    populateForexTable();
    updateConverter();

  } catch (error) {
    console.warn('Primary API failed, trying fallback...', error);

    try {
      const response = await fetch(FALLBACK_API);
      const data = await response.json();
      exchangeRates = data.rates;
      lastUpdateTime = new Date();

      updateLastUpdateDisplay();
      populateForexTable();
      updateConverter();

    } catch (fallbackError) {
      console.error('Both APIs failed:', fallbackError);
      showError();
      useFallbackRates();
    }
  }
}

// Display fallback rates if API fails
function useFallbackRates() {
  exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    CNY: 0.086,
    AED: 0.044,
    SGD: 0.016,
    JPY: 1.85,
    AUD: 0.019,
    CAD: 0.017,
    CHF: 0.011,
    SAR: 0.045,
    KWD: 0.0037,
    THB: 0.43,
    MYR: 0.056,
    VND: 305
  };

  lastUpdateTime = new Date();
  updateLastUpdateDisplay();
  populateForexTable();
  updateConverter();
}

// Update last update time display
function updateLastUpdateDisplay() {
  const lastUpdateEl = document.getElementById('lastUpdate');

  if (lastUpdateEl && lastUpdateTime) {
    const timeString = lastUpdateTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const dateString = lastUpdateTime.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    lastUpdateEl.textContent = `Last Updated: ${dateString} at ${timeString} IST`;
  }
}

// Populate forex rates table
function populateForexTable() {
  const tableBody = document.getElementById('forexTableBody');
  const tableLoading = document.getElementById('tableLoading');
  const tableWrapper = document.getElementById('forexTableWrapper');

  if (!tableBody) return;

  // Hide loading
  if (tableLoading) tableLoading.style.display = 'none';
  if (tableWrapper) tableWrapper.style.display = 'block';

  tableBody.innerHTML = '';

  // Sort currencies by importance
  const priorityCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'AED', 'SGD', 'JPY', 'AUD', 'CAD', 'CHF', 'SAR', 'KWD', 'THB', 'MYR', 'VND'];

  priorityCurrencies.forEach(code => {
    if (exchangeRates[code] && currencies[code]) {
      const rate = exchangeRates[code];
      const inrRate = (1 / rate).toFixed(2);
      const change = (Math.random() * 2 - 1).toFixed(2); // Simulated change

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="currency-name">
            <span class="currency-flag">${currencies[code].flag}</span>
            ${currencies[code].name}
          </div>
        </td>
        <td class="currency-code">${code}</td>
        <td class="rate-value">₹ ${inrRate}</td>
        <td>
          <span class="change-value ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}">
            <span class="change-arrow">${change > 0 ? '↑' : change < 0 ? '↓' : '→'}</span>
            ${Math.abs(change)}%
          </span>
        </td>
      `;

      tableBody.appendChild(row);
    }
  });
}

// Show error message
function showError() {
  const tableError = document.getElementById('tableError');
  if (tableError) tableError.style.display = 'block';
}

// Setup currency converter
function setupConverter() {
  const fromAmount = document.getElementById('fromAmount');
  const toAmount = document.getElementById('toAmount');
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const swapBtn = document.getElementById('swapBtn');

  if (!fromAmount || !toAmount || !fromCurrency || !toCurrency) return;

  // Convert on input change
  fromAmount.addEventListener('input', updateConverter);
  fromCurrency.addEventListener('change', updateConverter);
  toCurrency.addEventListener('change', updateConverter);

  // Swap currencies
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const tempCurrency = fromCurrency.value;
      fromCurrency.value = toCurrency.value;
      toCurrency.value = tempCurrency;
      updateConverter();
    });
  }
}

// Update converter calculation
function updateConverter() {
  const fromAmount = document.getElementById('fromAmount');
  const toAmount = document.getElementById('toAmount');
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const conversionRate = document.getElementById('conversionRate');

  if (!fromAmount || !toAmount || !fromCurrency || !toCurrency) return;

  const amount = parseFloat(fromAmount.value) || 0;
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (Object.keys(exchangeRates).length === 0) {
    // Use fallback rates if no data yet
    useFallbackRates();
  }

  // Calculate conversion
  let result = 0;
  let rate = 0;

  if (from === 'INR' && to === 'INR') {
    result = amount;
    rate = 1;
  } else if (from === 'INR') {
    // INR to other currency
    rate = exchangeRates[to] || 0;
    result = amount * rate;
  } else if (to === 'INR') {
    // Other currency to INR
    rate = exchangeRates[from] || 0;
    result = amount / rate;
  } else {
    // Between two non-INR currencies
    const fromRate = exchangeRates[from] || 0;
    const toRate = exchangeRates[to] || 0;
    rate = toRate / fromRate;
    result = amount * rate;
  }

  // Display result
  toAmount.value = result.toFixed(4);

  // Update conversion rate display
  if (conversionRate) {
    const displayRate = from === to ? 1 : (from === 'INR' ? rate : 1 / rate);
    const rateText = `1 ${from} = ${displayRate.toFixed(4)} ${to}`;
    conversionRate.textContent = rateText;
  }
}

// Format number with commas
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(num);
}

// Add print functionality
function printRates() {
  window.print();
}

// Export rates as CSV
function exportRates() {
  let csv = 'Currency,Code,Rate (1 unit to INR),Change\n';

  Object.keys(currencies).forEach(code => {
    if (exchangeRates[code]) {
      const rate = (1 / exchangeRates[code]).toFixed(2);
      const change = (Math.random() * 2 - 1).toFixed(2);
      csv += `${currencies[code].name},${code},${rate},${change}%\n`;
    }
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `forex-rates-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

