# Validator Checks — Implementation Plan

## Overview

Create a comprehensive validation layer for the M-Pro POS application.  
Validators serve three purposes:

1. **localStorage data integrity** — corrupted/missing data from localStorage won't crash the app
2. **Shared form validation** — centralized, reusable validation logic (currently duplicated inline)
3. **Development-time sanity checks** — catch malformed seed data and configuration errors

## Files to Create

### `src/validators/helpers.ts`
Low-level validation primitives used by all other validators:
- `isNonEmptyString(value: unknown): value is string`
- `isPositiveNumber(value: unknown): value is number`
- `isValidEmail(value: unknown): value is string`
- `isValidDateString(value: unknown): value is string`
- `isIn<T>(value: unknown, allowed: readonly T[]): value is T`
- `hasShape<T>(value: unknown, shape: Record<string, (v: unknown) => boolean>): value is T`

### `src/validators/products.ts`
- `validateProduct(p: unknown): Product | null` — checks id (non-empty string), name (non-empty string), price (positive number), category (one of 4 valid), emoji (non-empty string)
- `validateCartItem(item: unknown): CartItem | null` — checks product (valid Product), quantity (positive integer)
- `validateOrder(o: unknown): Order | null` — full shape validation including items array, subtotal/tax/total (positive numbers), paymentMethod (non-empty string), createdAt (valid ISO date), optional customer fields
- `validateProductsArray(data: unknown): Product[]` — returns only valid products, logs warnings for invalid entries
- `validateOrdersArray(data: unknown): Order[]` — returns only valid orders
- `validateManualOrderInput(input: ManualOrderInput): string[]` — returns array of error messages (empty = valid). Checks: customerName required, at least one item, each item qty >= 1 and price > 0, time required and valid HH:MM format

### `src/validators/customers.ts`
- `validateCustomer(c: unknown): Customer | null` — checks id, name (non-empty), demographic (valid enum), visits (non-negative integer), totalSpent (non-negative number), lastVisit (valid date string), favoriteItem (non-empty string), emoji (non-empty string)
- `validateCustomersArray(data: unknown): Customer[]` — returns only valid customers

### `src/validators/staff.ts`
- `validateStaffMember(s: unknown): StaffMember | null` — checks id, name, role (valid enum), shift (valid enum), email (valid format), phone (non-empty), status (valid enum), hireDate (valid date), emoji, ordersHandled (non-negative integer), notes (string)
- `validateStaffArray(data: unknown): StaffMember[]` — returns only valid staff

### `src/validators/settings.ts`
- `validateTheme(value: unknown): value is ThemeMode` — extracted from SettingsContext
- `validateFontSize(value: unknown): value is FontSize` — extracted from SettingsContext
- `validatePaymentMethods(value: unknown): value is PaymentMethods` — structured validation
- `validateSettings(value: unknown): Settings | null` — full settings shape validation

### `src/validators/forms.ts`
- `validateEmail(value: string): string | null` — returns error message or null
- `validatePassword(value: string): string | null` — checks min length 6
- `validateLoginForm(data: { email: string; password: string }): Record<string, string>` — returns field→error map (empty = valid)

### `src/validators/index.ts`
Barrel re-export of all validators.

## Files to Modify

### `src/data/products.ts`
- `loadOrders()`: pipe JSON.parse result through `validateOrdersArray` instead of returning raw parse

### `src/data/customers.ts`  
- `loadCustomers()`: pipe JSON.parse result through `validateCustomersArray` instead of returning raw parse

### `src/data/staff.ts`
- `loadStaff()`: pipe JSON.parse result through `validateStaffArray` instead of returning raw parse

### `src/contexts/SettingsContext.tsx`
- Replace local `validateTheme`/`validateFontSize` with imports from `../validators/settings`
- Add `validatePaymentMethods` call in `loadSettings()`
- Add full `validateSettings` check

### `src/components/LoginForm.tsx`
- Replace inline email/password validation with imported `validateLoginForm` / `validateEmail` / `validatePassword`

### `src/components/OrdersPanel.tsx`
- Replace inline `handleSubmit` validation logic with `validateManualOrderInput` from validators

## Design Principles

- **Return `null` for invalid** — single-entity validators return the typed object or `null`, never throw
- **Filter silently with warnings** — array validators filter out invalid entries and `console.warn` what was dropped
- **No breaking changes** — all existing behavior preserved; validators tighten safety without changing UX
- **Pure functions** — no side effects, no localStorage access, easily testable
- **Type narrowing** — validators narrow `unknown` → specific types so TypeScript catches misuse
