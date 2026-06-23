// src/controllers/subscription.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';

const RZP_KEY  = process.env.RAZORPAY_KEY_ID ?? '';
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';

// Safe wrapper — returns fallback if table doesn't exist yet (pre-migration)
async function sq<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

// ─── GET /subscription/config (public) ───────────────────────────────────────
export const getConfig = async (_req: Request, res: Response) => {
  const cfg = await sq(() => (prisma as any).appConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', subscriptionEnabled: false },
    update: {},
  }), { subscriptionEnabled: false });
  res.json({ success: true, data: { subscriptionEnabled: !!(cfg as any).subscriptionEnabled } });
};

// ─── PUT /subscription/admin/config (super admin) ────────────────────────────
export const adminSetConfig = async (req: Request, res: Response) => {
  const adminId = (req as any).adminId;
  const { subscriptionEnabled } = req.body as { subscriptionEnabled: boolean };
  await sq(() => (prisma as any).appConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', subscriptionEnabled, updatedBy: adminId },
    update: { subscriptionEnabled, updatedBy: adminId },
  }), null);
  res.json({ success: true, data: { subscriptionEnabled } });
};

// ─── GET /subscription/pricing (public) ──────────────────────────────────────
export const getPricing = async (_req: Request, res: Response) => {
  const [domainPrices, rawBundles] = await Promise.all([
    sq(() => (prisma as any).domainPricing.findMany({ where: { isActive: true } }), [] as any[]),
    sq(() => (prisma as any).bundlePricing.findMany({ where: { isActive: true }, orderBy: { domainCount: 'asc' } }), [] as any[]),
  ]);
  const bundles = (rawBundles as any[]).length ? rawBundles : [
    { domainCount: 3, discount: 15, label: 'Trio Pack'   },
    { domainCount: 5, discount: 25, label: 'Elite Pack'  },
    { domainCount: 8, discount: 40, label: 'Master Pack' },
  ];
  res.json({ success: true, data: { domainPrices, bundles } });
};

// ─── GET /subscription/my ────────────────────────────────────────────────────
export const getMySubscriptions = async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const subs = await sq(() => (prisma as any).subscription.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { domainId: true, expiresAt: true, startedAt: true },
  }), [] as any[]);
  res.json({ success: true, data: subs });
};

// ─── GET /subscription/check/:domainId ───────────────────────────────────────
export const checkSubscription = async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const { domainId } = req.params;
  const sub: any = await sq(() => (prisma as any).subscription.findUnique({
    where: { userId_domainId: { userId, domainId } },
  }), null);
  const isActive = sub?.status === 'ACTIVE' && (!sub.expiresAt || new Date(sub.expiresAt) > new Date());
  res.json({ success: true, data: { isActive: !!isActive } });
};

// ─── POST /subscription/create-order ─────────────────────────────────────────
export const createOrder = async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const { domainIds } = req.body as { domainIds: string[] };
  if (!domainIds?.length) return res.status(400).json({ message: 'domainIds required' });
  if (!RZP_KEY || !RZP_SECRET) return res.status(503).json({ message: 'Payment not configured yet.' });

  const prices: any[] = await sq(() => (prisma as any).domainPricing.findMany({ where: { domainId: { in: domainIds }, isActive: true } }), []);
  if (!prices.length) return res.status(400).json({ message: 'Prices not set yet. Contact admin.' });

  const bundles: any[] = await sq(() => (prisma as any).bundlePricing.findMany({ where: { isActive: true } }), []);
  const bundle = bundles.filter(b => b.domainCount <= domainIds.length).sort((a, b) => b.domainCount - a.domainCount)[0];
  const baseTotal = prices.reduce((s, p) => s + p.price, 0);
  const discount  = bundle?.discount ?? 0;
  const total     = Math.round(baseTotal * (1 - discount / 100));

  const auth = Buffer.from(`${RZP_KEY}:${RZP_SECRET}`).toString('base64');
  const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: total * 100, currency: 'INR', receipt: `cv_${userId.slice(0,8)}_${Date.now()}` }),
  });
  if (!rpRes.ok) return res.status(502).json({ message: 'Payment gateway error' });
  const rpOrder: any = await rpRes.json();

  await sq(() => (prisma as any).payment.create({
    data: { userId, orderId: rpOrder.id, amount: total, currency: 'INR', status: 'PENDING', domains: domainIds, razorpayOrderId: rpOrder.id },
  }), null);

  res.json({ success: true, data: { orderId: rpOrder.id, amount: total, currency: 'INR', keyId: RZP_KEY, discount, baseTotal } });
};

// ─── POST /subscription/verify ───────────────────────────────────────────────
export const verifyPayment = async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const { createHmac } = await import('crypto');
  const expected = createHmac('sha256', RZP_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });

  const payment: any = await sq(() => (prisma as any).payment.findUnique({ where: { orderId: razorpay_order_id } }), null);
  if (!payment || payment.userId !== userId) return res.status(404).json({ message: 'Payment not found' });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  await sq(() => (prisma as any).$transaction([
    (prisma as any).payment.update({ where: { orderId: razorpay_order_id }, data: { status: 'SUCCESS', paymentId: razorpay_payment_id, razorpaySignature: razorpay_signature } }),
    ...payment.domains.map((domainId: string) => (prisma as any).subscription.upsert({
      where: { userId_domainId: { userId, domainId } },
      create: { userId, domainId, status: 'ACTIVE', startedAt: now, expiresAt, paymentId: razorpay_payment_id, orderId: razorpay_order_id, amount: payment.amount / payment.domains.length, currency: 'INR' },
      update: { status: 'ACTIVE', startedAt: now, expiresAt, paymentId: razorpay_payment_id, orderId: razorpay_order_id },
    })),
  ]), null);

  res.json({ success: true, message: 'Subscription activated!', domains: payment.domains });
};

// ─── ADMIN: GET pricing ───────────────────────────────────────────────────────
export const adminGetPricing = async (_req: Request, res: Response) => {
  const [domainPrices, bundles] = await Promise.all([
    sq(() => (prisma as any).domainPricing.findMany({ orderBy: { domainId: 'asc' } }), [] as any[]),
    sq(() => (prisma as any).bundlePricing.findMany({ orderBy: { domainCount: 'asc' } }), [] as any[]),
  ]);
  res.json({ success: true, data: { domainPrices, bundles } });
};

// ─── SUPER ADMIN: SET domain price ───────────────────────────────────────────
export const adminSetDomainPrice = async (req: Request, res: Response) => {
  const adminId = (req as any).adminId;
  const { domainId, price } = req.body;
  if (!domainId || price == null) return res.status(400).json({ message: 'domainId and price required' });
  const record = await sq(() => (prisma as any).domainPricing.upsert({
    where: { domainId },
    create: { domainId, price: Number(price), setBy: adminId },
    update: { price: Number(price), setBy: adminId },
  }), null);
  res.json({ success: true, data: record });
};

// ─── SUPER ADMIN: SET bundle discount ────────────────────────────────────────
export const adminSetBundleDiscount = async (req: Request, res: Response) => {
  const adminId = (req as any).adminId;
  const { domainCount, discount, label } = req.body;
  if (!domainCount || discount == null) return res.status(400).json({ message: 'domainCount and discount required' });
  const record = await sq(() => (prisma as any).bundlePricing.upsert({
    where: { domainCount: Number(domainCount) },
    create: { domainCount: Number(domainCount), discount: Number(discount), label: label ?? `${domainCount} Domain Bundle`, setBy: adminId },
    update: { discount: Number(discount), label: label ?? `${domainCount} Domain Bundle`, setBy: adminId },
  }), null);
  res.json({ success: true, data: record });
};

// ─── ADMIN: GET payments ─────────────────────────────────────────────────────
export const adminGetPayments = async (_req: Request, res: Response) => {
  const payments = await sq(() => (prisma as any).payment.findMany({
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { user: { select: { name: true, email: true } } },
  }), [] as any[]);
  res.json({ success: true, data: payments });
};
