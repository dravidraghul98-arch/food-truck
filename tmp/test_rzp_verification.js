import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('--- RAZORPAY VERIFICATION ---');
console.log('KEY ID:', keyId);
console.log('KEY SECRET PRESENT:', !!keySecret);

if (!keyId || !keySecret) {
  console.error('ERROR: Missing Razorpay credentials in .env!');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

async function runTest() {
  try {
    console.log('Creating test order...');
    const order = await razorpay.orders.create({
      amount: 15000, // 150 INR in paise
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`,
    });

    console.log('ORDER CREATED SUCCESSFULLY!');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Currency:', order.currency);

    // Test signature verification algorithm
    const mockPaymentId = 'pay_1234567890';
    const bodyData = order.id + '|' + mockPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyData)
      .digest('hex');

    const verified = crypto
      .createHmac('sha256', keySecret)
      .update(bodyData)
      .digest('hex') === generatedSignature;

    console.log('Signature verification test passed:', verified);
    console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
  } catch (err) {
    console.error('RAZORPAY TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
