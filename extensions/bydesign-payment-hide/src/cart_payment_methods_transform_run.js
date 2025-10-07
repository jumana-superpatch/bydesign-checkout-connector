// @ts-check

/**
 * @typedef {import("../generated/api").CartPaymentMethodsTransformRunInput} CartPaymentMethodsTransformRunInput
 * @typedef {import("../generated/api").CartPaymentMethodsTransformRunResult} CartPaymentMethodsTransformRunResult
 */

/**
 * @type {CartPaymentMethodsTransformRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {CartPaymentMethodsTransformRunInput} input
 * @returns {CartPaymentMethodsTransformRunResult}
 */
export function cartPaymentMethodsTransformRun(input) {
  /* hide payment while validating email */
  
  const buyerEmail = input.cart?.buyerIdentity?.email;
  const isrep = input.cart?.isrep?.value;
  if (!buyerEmail || isrep) {
    // Hide ALL available payment methods
    const hidePaymentMethodOperations = input.paymentMethods.map(pm => ({
      paymentMethodHide: { paymentMethodId: pm.id },
    }));
    return { operations: hidePaymentMethodOperations };

  }
  return NO_CHANGES;
}