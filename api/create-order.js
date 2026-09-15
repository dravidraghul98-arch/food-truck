import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safely parse request body if stringified
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TcDG0CSc6a3fcX').trim().replace(/^["']|["']$/g, '');
  const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || 'LyBdSFi6iTIuwCtQx1JYOp0b').trim().replace(/^["']|["']$/g, '');

  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.status(500).json({ error: 'Razorpay configuration is missing on server.' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const { amount, currency = 'INR', receipt } = body || {};

    const amountInPaise = Math.round(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ error: 'Minimum order amount must be at least ₹1 (100 paise).' });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40),
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    });
  } catch (err) {
    console.error('Vercel Razorpay Order Creation Error:', err);
    return res.status(500).json({
      error: 'Razorpay Order Creation Failed',
      details: err.message || String(err),
    });
  }
}
