// public/payment.js - Logic for Payment Processing and UI

// --- UI Element Selectors ---
// Note: These will only work if the corresponding HTML elements are present.
const UI_PAYMENT = {
    paymentModal: document.getElementById('payment-modal'),
    closeButton: document.getElementById('close-payment-modal'),
    totalDisplay: document.getElementById('final-total-display'),
    serviceFeeDisplay: document.getElementById('service-fee-display'),
    paymentMethodDisplay: document.getElementById('payment-method-display'),
    completePaymentButton: document.getElementById('complete-payment-btn'),
    // FIX: Added selector for the change payment method button (used in setupPaymentListeners)
    changePaymentButton: document.getElementById('change-payment-btn'),
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
    
    // Default values
    let finalAmount = totalDue;
    let totalTax = tax;

    if (WALLET.insuranceCoverage) {
        // Simulate a fixed co-pay for covered members
        finalAmount = 25.00; // Fixed Co-pay amount
        totalTax = 0.00; // Assume co-pay is inclusive of tax
        // FIX: The line-through amount calculation was inconsistent, calculating it correctly now:
        totalDue = totalDue; // The full price before coverage
    } else {
        finalAmount = totalDue; // The full price
    }
    
    return {
        baseServiceFee: baseServiceFee.toFixed(2), // FIX: Renamed serviceFee to baseServiceFee for clarity
        tax: totalTax.toFixed(2),
        totalDue: finalAmount.toFixed(2), // This is the amount the customer actually pays
        fullPrice: (subtotal + tax).toFixed(2), // FIX: Added full price for line-through display
        isCovered: WALLET.insuranceCoverage,
    };
}

/**
 * Updates the Payment Modal UI with final cost and payment details.
 */
function updatePaymentModalUI() {
    const cost = calculateCost();
    
    // FIX: Added logic to dynamically update the service fee and tax displays 
    const feeDetails = `Service Fee: $${cost.baseServiceFee} ${cost.isCovered ? '(Covered)' : ''}<br>
                        Tax: $${cost.tax}`;
    
    // We check for existence of the parent container for a more robust check
    if (UI_PAYMENT.paymentModal) {
        
        // Populate Fee Details (Using serviceFeeDisplay for all line items for simplicity)
        if (UI_PAYMENT.serviceFeeDisplay) {
             UI_PAYMENT.serviceFeeDisplay.innerHTML = feeDetails;
        }

        // Populate Total Display
        if (UI_PAYMENT.totalDisplay) {
            if (cost.isCovered) {
                // Display co-pay with line-through full price
                UI_PAYMENT.totalDisplay.innerHTML = `
                    <span class="text-xl font-extrabold text-green-600 dark:text-green-400">
                        $${cost.totalDue}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">$${cost.fullPrice}</span>
                `;
                UI_PAYMENT.completePaymentButton.textContent = `Pay Co-pay $${cost.totalDue}`;
            } else {
                // Display full price
                UI_PAYMENT.totalDisplay.textContent = `$${cost.fullPrice}`;
                UI_PAYMENT.completePaymentButton.textContent = `Pay Total $${cost.fullPrice}`;
            }
        }

        // In-app Wallet Simulation
        if (UI_PAYMENT.paymentMethodDisplay) {
            UI_PAYMENT.paymentMethodDisplay.textContent = WALLET.savedCard;
        }
        
        // Reset button state
        if(UI_PAYMENT.completePaymentButton) {
            UI_PAYMENT.completePaymentButton.disabled = false;
        }
    }
}

/**
 * Handles the final payment submission.
 */
function completePayment() {
    if (!UI_PAYMENT.completePaymentButton) return;

    UI_PAYMENT.completePaymentButton.disabled = true;
    UI_PAYMENT.completePaymentButton.textContent = 'Processing...';
    
    const amountPaid = calculateCost().totalDue;
    console.log(`[Payment] Attempting to process $${amountPaid}...`);

    // Simulate API call delay
    setTimeout(() => {
        // FIX: Use optional chaining or check for existence
        UI_PAYMENT.paymentModal?.classList.add('hidden');
        
        alert(`Payment of $${amountPaid} Successful! Thank you for using our service.`);
        
        // Final step: Reset the customer application to the home screen
        // Dispatching a custom event is the correct modular approach.
        document.dispatchEvent(new CustomEvent('resetApp'));
        
        console.log('[Payment] Transaction complete. App reset requested.');

    }, 2000);
}

// --- EVENT LISTENERS & SETUP ---

/**
 * Attaches all payment related listeners. This function must be exported and called.
 * FIX: Added export keyword to make it available to index.js.
 */
export function setupPaymentListeners() {
    // 1. Listen for Service Completion event from app.js
    document.addEventListener('serviceCompleted', (event) => {
        // Check if the modal exists before trying to interact with it
        if (!UI_PAYMENT.paymentModal) {
            console.error('Payment modal element not found. Cannot show payment screen.');
            return;
        }
        console.log(`[Payment] Received service completion. Showing payment modal.`);
        updatePaymentModalUI();
        UI_PAYMENT.paymentModal.classList.remove('hidden');
    });

    // 2. Close Modal Listener
    // FIX: Using optional chaining (?) for cleaner null checking
    UI_PAYMENT.closeButton?.addEventListener('click', () => {
        UI_PAYMENT.paymentModal?.classList.add('hidden');
    });
    
    // 3. Complete Payment Listener
    UI_PAYMENT.completePaymentButton?.addEventListener('click', completePayment);

    // 4. Additional UI event simulation (Change Payment Button)
    UI_PAYMENT.changePaymentButton?.addEventListener('click', () => {
        alert("Redirecting to Wallet Management Screen...");
    });
    
    // FIX: Removed unnecessary alert listener for 'resetApp' from payment.js 
    // This event is listened to and handled in index.js (by calling resetCustomerApp)
}