// src/controllers/subscription.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';

// ─── Helper: get Razorpay order ──────────────────────────────────────────────
async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const body = JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt });
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body,
  });
  if (!res.ok) throw new Error('Razorpay order creation failed');
  return res.json();
}

// ─── GET /subscription/pricing ───────────────────────────────────────────────
// Returns all domain prices + bundle discounts (public)
export const getPricing = async (req: Request, res: Response) => {
  const [domainPrices, bundles] = await Promise.all([
    prisma.domainPricing.findMany({ where: { isActive: true } }),
    prisma.bundlePricing.findMany({ where: { isActive: true }, orderBy: { domainCount: 'asc' } }),
  ]);
  res.json({ success: true, data: { domainPrices, bundles } });
};

// ─── GET /subscription/my ────────────────────────────────────────────────────
// Returns current user's active subscriptions
export const getMySubscriptions = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const subs = await prisma.subscription.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { domainId: true, expiresAt: true, startedAt: true },
  });
  res.json({ success: true, data: subs });
};

// ─── POST /subscription/create-order ─────────────────────────────────────────
// Creates a Razorpay order for given domain IDs
export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { domainIds }: { domainIds: string[] } = req.body;

  if (!domainIds?.length) return res.status(400).json({ message: 'domainIds required' });

  // Fetch prices
  const prices = await prisma.domainPricing.findMany({
    where: { domainId: { in: domainIds }, isActive: true },
  });

  if (prices.length !== domainIds.length) {
    return res.status(400).json({ message: 'Some domains have no price set yet' });
  }

  // Calculate total with bundle discount
  const bundles = await prisma.bundlePricing.findMany({ where: { isActive: true } });
  const bundle = bundles
    .filter(b => b.domainCount <= domainIds.length)
    .sort((a, b) => b.domainCount - a.domainCount)[0];

  const baseTotal = prices.reduce((sum, p) => sum + p.price, 0);
  const discountPct = bundle?.discount ?? 0;
  const total = Math.round(baseTotal * (1 - discountPct / 100));

  // Create Razorpay order
  const receipt = `cv_${userId.slice(0, 8)}_${Date.now()}`;
  const razorpayOrder = await createRazorpayOrder(total * 100, receipt);

  // Save pending payment
  const payment = await prisma.payment.create({
    data: {
      userId,
      orderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      status: 'PENDING',
      domains: domainIds,
      razorpayOrderId: razorpayOrder.id,
    },
  });

  res.json({
    success: true,
    data: {
      orderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      discount: discountPct,
      baseTotal,
      paymentDbId: payment.id,
    },
  });
};

// ─── POST /subscription/verify ───────────────────────────────────────────────
// Verifies Razorpay signature and activates subscriptions
export const verifyPayment = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify signature
  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  // Find payment record
  const payment = await prisma.payment.findUnique({ where: { orderId: razorpay_order_id } });
  if (!payment || payment.userId !== userId) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  // Update payment + create subscriptions in a transaction
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  await prisma.$transaction([
    // Mark payment success
    prisma.payment.update({
      where: { orderId: razorpay_order_id },
      data: { status: 'SUCCESS', paymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
    }),
    // Create or activate subscriptions for each domain
    ...payment.domains.map(domainId =>
      prisma.subscription.upsert({
        where: { userId_domainId: { userId, domainId } },
        create: { userId, domainId, status: 'ACTIVE', startedAt: now, expiresAt, paymentId: razorpay_payment_id, orderId: razorpay_order_id, amount: payment.amount / payment.domains.length, currency: 'INR' },
        update: { status: 'ACTIVE', startedAt: now, expiresAt, paymentId: razorpay_payment_id, orderId: razorpay_order_id },
      })
    ),
  ]);

  res.json({ success: true, message: 'Subscription activated!', domains: payment.domains });
};

// ─── GET /subscription/check/:domainId ───────────────────────────────────────
// Quick check if user has active subscription for a domain
export const checkSubscription = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { domainId } = req.params;
  const sub = await prisma.subscription.findUnique({
    where: { userId_domainId: { userId, domainId } },
  });
  const isActive = sub?.status === 'ACTIVE' && (!sub.expiresAt || sub.expiresAt > new Date());
  res.json({ success: true, data: { isActive, subscription: sub } });
};

// ─── SUPER ADMIN: GET /admin/subscription/pricing ────────────────────────────
export const adminGetPricing = async (req: Request, res: Response) => {
  const [domainPrices, bundles] = await Promise.all([
    prisma.domainPricing.findMany({ orderBy: { domainId: 'asc' } }),
    prisma.bundlePricing.findMany({ orderBy: { domainCount: 'asc' } }),
  ]);
  res.json({ success: true, data: { domainPrices, bundles } });
};

// ─── SUPER ADMIN: PUT /admin/subscription/pricing/domain ─────────────────────
export const adminSetDomainPrice = async (req: Request, res: Response) => {
  const adminId = (req as any).adminId;
  const { domainId, price }: { domainId: string; price: number } = req.body;
  if (!domainId || price == null) return res.status(400).json({ message: 'domainId and price required' });

  const record = await prisma.domainPricing.upsert({
    where: { domainId },
    create: { domainId, price, setBy: adminId },
    update: { price, setBy: adminId },
  });
  res.json({ success: true, data: record });
};

// ─── SUPER ADMIN: PUT /admin/subscription/pricing/bundle ─────────────────────
export const adminSetBundleDiscount = async (req: Request, res: Response) => {
  const adminId = (req as any).adminId;
  const { domainCount, discount, label }: { domainCount: number; discount: number; label: string } = req.body;
  if (!domainCount || discount == null) return res.status(400).json({ message: 'domainCount and discount required' });

  const record = await prisma.bundlePricing.upsert({
    where: { domainCount },
    create: { domainCount, discount, label: label ?? `${domainCount} Domain Bundle`, setBy: adminId },
    update: { discount, label: label ?? `${domainCount} Domain Bundle`, setBy: adminId },
  });
  res.json({ success: true, data: record });
};

// ─── SUPER ADMIN: GET /admin/subscription/payments ───────────────────────────
export const adminGetPayments = async (req: Request, res: Response) => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
  res.json({ success: true, data: payments });
};
