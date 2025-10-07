// public/payment.js - Payment Processing and Digital Receipt

const paymentModal = document.getElementById('payment-modal');
const totalAmountSpan = document.getElementById('total-amount');
const processPaymentButton = document.getElementById('process-payment');

/**
 * Displays the payment modal with the final cost.
 * @param {number} amount - The final service cost.
 */
export function showPaymentModal(amount) {
    totalAmountSpan.textContent = `$${amount.toFixed(2)}`;
    paymentModal.classList.remove('hidden');
    paymentModal.classList.add('flex'); // Uses flex to center the modal content
}

/**
 * Hides the payment modal and resets the UI.
 */
function hidePaymentModal() {
    paymentModal.classList.add('hidden');
    paymentModal.classList.remove('flex');

    // Reset customer view after service completion and payment
    document.getElementById('tracking-section').classList.add('hidden');
    document.getElementById('service-request-section').classList.remove('hidden');
}

/**
 * Handles the payment button click, simulating processing and receipt generation.
 */
function handlePaymentProcess() {
    const method = document.getElementById('payment-method').value;
    console.log(`Processing payment via: ${method}`);

    // Disable button and show processing status
    processPaymentButton.textContent = 'Processing...';
    processPaymentButton.disabled = true;

    // 1. Simulate payment API call
    setTimeout(() => {
        
        // 2. Simulate success
        console.log('Payment Successful.');
        processPaymentButton.textContent = 'Payment Complete!';
        
        // 3. Simulate Digital Receipt Generation and Confirmation
        simulateReceipt(method, totalAmountSpan.textContent);

        // 4. Close modal and reset UI
        setTimeout(hidePaymentModal, 2000);

    }, 1500);
}

/**
 * Simulates generating and sending a digital receipt.
 */
function simulateReceipt(method, amount) {
    alert(`✅ Success! Payment of ${amount} via ${method} processed. A digital receipt has been sent.`);
    
    // Reset button state for next use
    processPaymentButton.textContent = 'Process Payment & Get Receipt';
    processPaymentButton.disabled = false;
}

// Export a listener setup function to be used in init.js
export function setupPaymentListeners() {
    processPaymentButton.addEventListener('click', handlePaymentProcess);
}