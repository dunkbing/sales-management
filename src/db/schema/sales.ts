import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { stores } from "./stores";
import { registerSessions } from "./register";
import { users } from "./users";
import { customers } from "./customers";
import { productVariants } from "./catalog";

export const sales = pgTable("sales", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  registerSessionId: integer("register_session_id")
    .notNull()
    .references(() => registerSessions.id, { onDelete: "restrict" }),
  cashierId: integer("cashier_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  status: varchar({ length: 50 }).notNull().default("PAID"), // PAID, REFUNDED, PARTIAL_REFUND
  subtotal: numeric({ precision: 12, scale: 2 }).notNull(),
  taxTotal: numeric("tax_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const salesRelations = relations(sales, ({ one, many }) => ({
  store: one(stores, {
    fields: [sales.storeId],
    references: [stores.id],
  }),
  registerSession: one(registerSessions, {
    fields: [sales.registerSessionId],
    references: [registerSessions.id],
  }),
  cashier: one(users, {
    fields: [sales.cashierId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(saleItems),
  payments: many(payments),
  returns: many(returns),
}));

export const saleItems = pgTable("sale_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  qty: integer().notNull(),
  price: numeric({ precision: 12, scale: 2 }).notNull(),
  discount: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  tax: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(), // (qty * price) - discount + tax
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  variant: one(productVariants, {
    fields: [saleItems.variantId],
    references: [productVariants.id],
  }),
}));

export const payments = pgTable("payments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  method: varchar({ length: 50 }).notNull(), // CASH, CARD, QR, VOUCHER, BANK_TRANSFER
  amount: numeric({ precision: 12, scale: 2 }).notNull(),
  externalRef: varchar("external_ref", { length: 255 }), // Transaction ID from payment provider
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  sale: one(sales, {
    fields: [payments.saleId],
    references: [sales.id],
  }),
}));

export const returns = pgTable("returns", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "restrict" }),
  processedByUserId: integer("processed_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  reason: text().notNull(),
  refundMethod: varchar("refund_method", { length: 50 }).notNull(), // Same as payment methods
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const returnsRelations = relations(returns, ({ one }) => ({
  sale: one(sales, {
    fields: [returns.saleId],
    references: [sales.id],
  }),
  processedBy: one(users, {
    fields: [returns.processedByUserId],
    references: [users.id],
  }),
}));

// Insert schemas with validation
export const insertSaleSchema = createInsertSchema(sales, {
  subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  taxTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  discountTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  grandTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems, {
  qty: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  discount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid discount format"),
  tax: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid tax format"),
  lineTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
}).omit({
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments, {
  method: z.enum(["CASH", "CARD", "QR", "VOUCHER", "BANK_TRANSFER"]),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
}).omit({
  createdAt: true,
});

export const insertReturnSchema = createInsertSchema(returns, {
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["CASH", "CARD", "QR", "VOUCHER", "BANK_TRANSFER"]),
  refundAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
}).omit({
  id: true,
  createdAt: true,
});

export type SelectSale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SelectSaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type SelectPayment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type SelectReturn = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;
