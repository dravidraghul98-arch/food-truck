import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TcDG0CSc6a3fcX';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'LyBdSFi6iTIuwCtQx1JYOp0b';

console.log('Testing Razorpay with Key ID:', key_id);

const rzp = new Razorpay({ key_id, key_secret });

rzp.orders.create({
  amount: 18000,
  currency: 'INR',
  receipt: 'rcpt_test_123'
}).then(order => {
  console.log('SUCCESS Order Created:', order);
}).catch(err => {
  console.error('ERROR Creating Order:', err);
});
