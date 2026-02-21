import * as crypto from 'crypto';

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not set');
  }

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(body);
  const expectedSignature = hmac.digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
