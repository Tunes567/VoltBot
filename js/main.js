// Constants
const MERCHANT_WALLET = '3P7SfiZJHJRRoduexPZgvZHVoZWMZLXKmh3Rk9VzgaST';
const TELEGRAM_BOT = '@VoltBotVolume';
const TELEGRAM_ADMIN = 'https://t.me/VoltBotVolume'; // Direct admin link
const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
let userWallet = null;
let selectedPrice = 0;
let paymentTimeout = null;

// Generate QR code
function generateQRCode(address) {
    const qr = qrcode(0, 'M');
    qr.addData(address);
    qr.make();
    document.getElementById('qrCode').innerHTML = qr.createImgTag(6);
}

// Show payment form
function showPaymentForm(plan, price) {
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('plan').value = plan;
    document.getElementById('price').value = price + ' SOL';
    document.getElementById('paymentAddress').textContent = MERCHANT_WALLET;
    document.getElementById('txVerification').classList.remove('show');
    selectedPrice = price;
    
    // Generate QR code
    generateQRCode(MERCHANT_WALLET);
    
    // Set payment timeout (15 minutes)
    if (paymentTimeout) clearTimeout(paymentTimeout);
    paymentTimeout = setTimeout(() => {
        if (document.getElementById('paymentForm').style.display !== 'none') {
            alert('Payment timeout. Please try again.');
            resetPaymentForm();
        }
    }, 15 * 60 * 1000);

    window.scrollTo({ top: document.getElementById('paymentForm').offsetTop - 100, behavior: 'smooth' });
}

// Verify transaction
async function verifyTransaction() {
    const txId = document.getElementById('txId').value;
    if (!txId) {
        alert('Please enter a transaction ID');
        return;
    }

    try {
        // Show loading state
        document.querySelector('.loading').style.display = 'block';
        
        // Get transaction details
        const tx = await connection.getTransaction(txId, {
            maxSupportedTransactionVersion: 0
        });

        if (tx) {
            // Check if the transaction is confirmed
            if (tx.meta && tx.meta.confirmations > 0) {
                // Check if the transaction amount matches
                const postBalances = tx.meta.postBalances;
                const preBalances = tx.meta.preBalances;
                
                // Calculate the actual amount transferred
                const amountTransferred = Math.abs(postBalances[0] - preBalances[0]) / 1e9; // Convert lamports to SOL
                
                if (Math.abs(amountTransferred - selectedPrice) < 0.01) { // Allow small difference for fees
                    // Show success message
                    document.querySelector('.success-message').style.display = 'block';
                    
                    // Show Telegram instructions
                    alert(`✅ Payment Verified!

Welcome to VoltBot! You will receive your bot files and setup instructions shortly.

📝 What you'll receive:
• Bot Files & Setup Guide
• Support & Updates
• Access to Wallet Configuration

⚡ Need immediate help? Just ask!`);
                    
                    // Reset form after 3 seconds
                    setTimeout(resetPaymentForm, 3000);
                } else {
                    alert(`Payment amount mismatch. Expected ${selectedPrice} SOL, received ${amountTransferred} SOL`);
                }
            } else {
                alert('Transaction is not confirmed yet. Please wait a few minutes and try again.');
            }
        } else {
            alert('Transaction not found. Please check the ID and try again.');
        }
    } catch (error) {
        console.error('Error verifying transaction:', error);
        alert('Error verifying transaction. Please try again.');
    } finally {
        // Hide loading state
        document.querySelector('.loading').style.display = 'none';
    }
}

function resetPaymentForm() {
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('txId').value = '';
    document.querySelector('.success-message').style.display = 'none';
    document.getElementById('txVerification').classList.remove('show');
    if (paymentTimeout) clearTimeout(paymentTimeout);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Copy payment address to clipboard
    document.getElementById('paymentAddress').addEventListener('click', function() {
        navigator.clipboard.writeText(MERCHANT_WALLET).then(() => {
            alert('Payment address copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });

    // Update all Telegram links to use admin link
    const telegramLinks = document.querySelectorAll('a[href*="t.me/VoltBotVolume"]');
    telegramLinks.forEach(link => {
        link.href = TELEGRAM_ADMIN;
        link.target = '_blank';
    });

    // Telegram support button
    document.querySelector('.chat-button').addEventListener('click', function() {
        window.open(TELEGRAM_ADMIN, '_blank');
    });
}); 