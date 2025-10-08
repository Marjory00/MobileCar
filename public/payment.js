// public/payment.js - Handles Payment Gateway Integration (Simulated)

// Assuming resetCustomerApp is defined in app.js and imported
import { resetCustomerApp } from './app.js'; 

let activeRequestId = null;

// UI Element Selectors (Requires these IDs in index.html for a modal/form)
const paymentModal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');
const paymentAmountInput = document.getElementById('payment-amount');

/**
 * Listens for the 'serviceCompleted' event to trigger the payment modal.
 * This event is dispatched by app.js when the status polling returns 'Completed'.
 */
export function setupPaymentListeners() {
    // 1. Listen for the custom event dispatched by app.js 
    document.addEventListener('serviceCompleted', (event) => {
        activeRequestId = event.detail.requestId;
        showPaymentModal();
    });

    // 2. Setup listener for the payment form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
}

/**
 * Displays the simulated payment modal/view.
 */
function showPaymentModal() {
    if (paymentModal) {
        // Pre-fill a simulated service fee for the demo
        // In a real app, this amount would be fetched from the server
        paymentAmountInput.value = '75.00'; 
        paymentModal.classList.remove('hidden');
        console.log('[Payment] Payment modal displayed.');
    }
}

/**
 * Handles payment submission and calls the server API. (Architecture Step 5)
 */
async function handlePaymentSubmission(event) {
    event.preventDefault();
    
    const amount = paymentAmountInput.value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    if (!activeRequestId) {
        alert('Error: No active request ID found for payment.');
        return;
    }

    // Call the server's payment endpoint
    try {
        const response = await fetch(`/api/payment/${activeRequestId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, paymentMethod })
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            // Hide modal and reset
            if (paymentModal) paymentModal.classList.add('hidden');
            activeRequestId = null;
            
            // Reset the main app view after successful payment
            resetCustomerApp(); 
        } else {
            alert(`Payment Failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Payment failed:', error);
        alert('An error occurred during simulated payment processing.');
    }
}