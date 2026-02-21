const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not set');
  }
  return 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
}

export interface TossConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
  [key: string]: unknown;
}

export async function confirmPayment(
  params: TossConfirmRequest
): Promise<TossConfirmResponse> {
  const response = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment confirmation failed');
  }

  return response.json();
}

export async function getPayment(paymentKey: string): Promise<TossConfirmResponse> {
  const response = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get payment');
  }

  return response.json();
}
