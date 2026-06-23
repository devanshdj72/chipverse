// src/routes/subscription.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireSuperAdmin, requireAdmin } from '../middleware/admin.middleware';
import {
  getPricing, getMySubscriptions, createOrder,
  verifyPayment, checkSubscription,
  adminGetPricing, adminSetDomainPrice, adminSetBundleDiscount, adminGetPayments,
} from '../controllers/subscription.controller';

const router = Router();

// ── Public / User ─────────────────────────────────────────────────────────────
router.get('/pricing',              getPricing);
router.get('/my',                   requireAuth, getMySubscriptions);
router.post('/create-order',        requireAuth, createOrder);
router.post('/verify',              requireAuth, verifyPayment);
router.get('/check/:domainId',      requireAuth, checkSubscription);

// ── Super Admin only ──────────────────────────────────────────────────────────
router.get('/admin/pricing',        requireAdmin, adminGetPricing);
router.put('/admin/pricing/domain', requireSuperAdmin, adminSetDomainPrice);
router.put('/admin/pricing/bundle', requireSuperAdmin, adminSetBundleDiscount);
router.get('/admin/payments',       requireAdmin, adminGetPayments);

export default router;
