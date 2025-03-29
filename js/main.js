// Constants
const MERCHANT_WALLET = '3P7SfiZJHJRRoduexPZgvZHVoZWMZLXKmh3Rk9VzgaST';
const TELEGRAM_BOT = '@VoltBotVolume';
const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');

// Global variables
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
        const tx = await connection.getTransaction(txId);
        if (tx) {
            // Show Telegram instructions
            alert(`Payment verified! Please join our main channel ${TELEGRAM_BOT} and send your transaction ID to complete the process.`);
            document.querySelector('.success-message').style.display = 'block';
            setTimeout(resetPaymentForm, 3000);
        } else {
            alert('Transaction not found. Please check the ID and try again.');
        }
    } catch (error) {
        console.error('Error verifying transaction:', error);
        alert('Error verifying transaction. Please try again.');
    }
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

    // Telegram support button
    document.querySelector('.chat-button').addEventListener('click', function() {
        window.open(`https://t.me/${TELEGRAM_BOT.replace('@', '')}`, '_blank');
    });
}); 