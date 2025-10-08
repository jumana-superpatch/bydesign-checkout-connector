import {
  extension,
  Banner,
  BlockStack,
  Text,
  Button,
} from '@shopify/ui-extensions/checkout';

export default extension('purchase.checkout.block.render', (root, api) => {
  const { buyerIdentity, attributes, applyAttributeChange, applyMetafieldChange, i18n } = api;
  const REP_ATTRIBUTE = 'isrep';

  // --- Cart Attribute Helpers ---
  const updateCartAttribute = async (key, value) => {
    if (!applyAttributeChange) return;

    const exists = attributes.current?.some(attr => attr.key === key);

    if (!value && !exists) return;

    return applyAttributeChange(
      value
        ? { type: 'updateAttribute', key, value: String(value) }
        : { type: 'removeAttribute', key }
    );
  };

  // --- Metafield Helpers ---
  const updateCartMetafield = async ({ namespace, key, value }) => {
    if (!applyMetafieldChange) return;

    return applyMetafieldChange(
      value
        ? { type: 'updateMetafield', namespace, key, valueType: 'string', value }
        : { type: 'removeMetafield', namespace, key }
    );
  };

  // --- UI Helpers ---
  const showBanner = (message, status) => {
    root.replaceChildren(
      root.createComponent(BlockStack, {}, [
        root.createComponent(Banner, { status, title: message }),
      ])
    );
  };

  const repOverlay = root.createComponent(BlockStack, { padding: 'base' }, [
    root.createComponent(Banner, { status: 'critical', title: i18n.translate("disabledCheckout") }),
    root.createComponent(Text, {}, 'All checkout fields are disabled. Please shop through your Rep.'),
    root.createComponent(
      Button,
      { to: 'https://shop.superpatch.com/#/login', external: true, primary: true },
      'Shop with Rep'
    ),
  ]);

  // --- Worker Response Handler ---
  const handleWorkerResponse = async ({ isCustomer, isRep }) => {
    if (isRep) {
      await updateCartAttribute(REP_ATTRIBUTE, 'true');
      return root.replaceChildren(repOverlay);
    }

    await updateCartAttribute(REP_ATTRIBUTE, null);

    if (!isCustomer) {
      let rsuValue = attributes.current?.find(attr => attr.key === '__rsu')?.value;

      // RSU fallback
      if (rsuValue) {
        await updateCartMetafield({ namespace: 'bdt', key: 'rsu', value: rsuValue });
      }
    }
    return showBanner('Email validated. Please add your shipping address for tax and shipping charges calculations', 'success');
  };

  // --- Worker Call ---
  const runByDesignValidation = async (email) => {
    showBanner('Validating email...', 'info');

    const shopDomain = api.shop.myshopifyDomain;
    console.log(shopDomain);

    try {
      const response = await fetch(
        'https://shopify-bydesign-integrator.cloudflare-superpatch.workers.dev/',
        {
          method: 'POST',
          headers: { 'x-shop-domain': shopDomain, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'validate-customer',
            data: { email: email },
          }),
        }
      );

      if (!response.ok) throw new Error(`Worker returned ${response.status}`);
      await handleWorkerResponse(await response.json());
    } catch (error) {
      showBanner(`Error: ${error.message}`, 'critical');
    }
  };

  // --- Init ---
  const currentEmail = buyerIdentity?.email?.current;
  currentEmail ? runByDesignValidation(currentEmail) : showBanner('Waiting for email...', 'info');

  buyerIdentity?.email.subscribe((newEmail) => {
    if (newEmail) {
      runByDesignValidation(newEmail);
    } else {
      updateCartAttribute(REP_ATTRIBUTE, null);
      updateCartMetafield({ namespace: 'bdt', key: 'rsu', value: null });
    }
  });
});
