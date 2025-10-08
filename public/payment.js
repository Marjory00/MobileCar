// public/payment.js - Logic for Payment Processing and UI

// --- UI Element Selectors ---
const UI_PAYMENT = {
    paymentModal: document.getElementById('payment-modal'),
    closeButton: document.getElementById('close-payment-modal'),
    totalDisplay: document.getElementById('final-total-display'),
    serviceFeeDisplay: document.getElementById('service-fee-display'),
    paymentMethodDisplay: document.getElementById('payment-method-display'),
    completePaymentButton: document.getElementById('complete-payment-btn'),
};

// --- SIMULATED STATE ---
const WALLET = {
    savedCard: 'Visa ending in 4242',
    insuranceCoverage: true,
};

// --- CORE PAYMENT LOGIC ---

/**
 * Calculates and displays the estimated cost of the service.
 * @returns {object} The calculated cost details.
 */
function calculateCost() {
    // --- Transparent Pricing Logic Simulation ---
    const baseServiceFee = 75.00; // Mock base fee for any service
    const taxRate = 0.05;
    
    let subtotal = baseServiceFee;
    let tax = subtotal * taxRate;
    let totalDue = subtotal + tax;
    let finalAmount = totalDue;

    if (WALLET.insuranceCoverage) {
        // Simulate a fixed co-pay for covered members
        totalDue = 25.00;
        tax = 0.00; // Assume co-pay is inclusive of tax
    }
    
    return {
        serviceFee: baseServiceFee.toFixed(2),
        tax: tax.toFixed(2),
        totalDue: totalDue.toFixed(2),
        isCovered: WALLET.insuranceCoverage,
    };
}

/**
 * Updates the Payment Modal UI with final cost and payment details.
 */
function updatePaymentModalUI() {
    const cost = calculateCost();
    
    if (UI_PAYMENT.serviceFeeDisplay) {
        UI_PAYMENT.serviceFeeDisplay.textContent = `$${cost.serviceFee}`;
    }
    
    if (UI_PAYMENT.totalDisplay) {
        if (cost.isCovered) {
            UI_PAYMENT.totalDisplay.innerHTML = `
                <span class="text-xs font-semibold text-green-600 dark:text-green-400">
                    MEMBER COVERED:
                </span>
                $${cost.totalDue} <span class="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">$${(parseFloat(cost.serviceFee) + 3.75).toFixed(2)}</span>
            `;
            UI_PAYMENT.completePaymentButton.textContent = `Pay Co-pay $${cost.totalDue}`;
        } else {
            UI_PAYMENT.totalDisplay.textContent = `$${cost.totalDue}`;
            UI_PAYMENT.completePaymentButton.textContent = `Pay Total $${cost.totalDue}`;
        }
    }

    // --- In-app Wallet Simulation ---
    if (UI_PAYMENT.paymentMethodDisplay) {
        UI_PAYMENT.paymentMethodDisplay.textContent = WALLET.savedCard;
    }
}

/**
 * Handles the final payment submission.
 */
function completePayment() {
    if (!UI_PAYMENT.completePaymentButton) return;

    UI_PAYMENT.completePaymentButton.disabled = true;
    UI_PAYMENT.completePaymentButton.textContent = 'Processing...';

    // Simulate API call delay
    setTimeout(() => {
        UI_PAYMENT.paymentModal?.classList.add('hidden');
        alert('Payment Successful! Thank you for using our service.');
        
        // Final step: Reset the customer application to the home screen
        document.dispatchEvent(new CustomEvent('resetApp'));
        
        console.log('[Payment] Transaction complete. App reset requested.');

    }, 2000);
}

// --- EVENT LISTENERS & SETUP ---

/**
 * Attaches all payment related listeners. This is called from public/index.js.
 */
export function setupPaymentListeners() {
    // 1. Listen for Service Completion event from app.js
    document.addEventListener('serviceCompleted', (event) => {
        console.log(`[Payment] Received service completion for ${event.detail.requestId}. Showing payment modal.`);
        updatePaymentModalUI();
        UI_PAYMENT.paymentModal?.classList.remove('hidden');
    });

    // 2. Close Modal Listener
    UI_PAYMENT.closeButton?.addEventListener('click', () => {
        UI_PAYMENT.paymentModal?.classList.add('hidden');
    });
    
    // 3. Complete Payment Listener
    UI_PAYMENT.completePaymentButton?.addEventListener('click', completePayment);

    // 4. Listen for Reset Request (dispatched after payment success)
    document.addEventListener('resetApp', () => {
        // Need to call resetCustomerApp from the app module
        // Since we can't directly import resetCustomerApp here (circular dependency issue),
        // we rely on index.js or a global event. For this demo, we'll assume index.js
        // listens to 'resetApp' and calls resetCustomerApp.
        // A prompt is used here to avoid forcing an import change in index.js for the demo.
        alert("The application is now resetting to the home screen. Please press 'Customer View' if you switched to 'Driver View'.");
    });
    
    // Additional UI event simulation
    document.getElementById('change-payment-btn')?.addEventListener('click', () => {
        alert("Redirecting to Wallet Management Screen...");
    });
}