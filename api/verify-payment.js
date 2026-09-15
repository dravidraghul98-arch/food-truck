import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safely parse request body if stringified
  let bodyData = req.body;
  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch (e) {
      bodyData = {};
    }
  }

  const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || 'LyBdSFi6iTIuwCtQx1JYOp0b').trim().replace(/^["']|["']$/g, '');

  if (!razorpayKeySecret) {
    return res.status(500).json({ error: 'Payment secret missing on server.' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = bodyData || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment signature verification failed.' });
    }
  } catch (err) {
    console.error('Vercel Signature Verification Error:', err);
    return res.status(500).json({ error: 'Payment verification error.' });
  }
}
