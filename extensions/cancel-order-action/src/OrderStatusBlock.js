import { Button, extension } from '@shopify/ui-extensions/customer-account';

export default extension('customer-account.order.action.menu-item.render', async (root, api) => {
  const orderGid = api.orderId;
  console.log(JSON.stringify(api));
  if (!orderGid) return;
  const orderId = orderGid.split('/').pop();

  // Check if order has unfulfilled items
  // const res = await fetch(`https://shopify-bydesign-integrator.cloudflare-superpatch.workers.dev`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ operation: 'get-order-status', data: { order_id: orderGid } }),
  // });
  // const orderData = await res.json();

  const response = await fetch(
        'https://shopify-bydesign-integrator.cloudflare-superpatch.workers.dev/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', x },
          body: JSON.stringify({
            operation: 'get-order-status',
            data: { order_id: orderGid },
          }),
        }
      );
  console.log(response);

  // if (orderData.allFulfilled) return; // don’t show button if all fulfilled

  // const cancelOrder = async () => {
  //   const resp = await fetch(`https://shopify-bydesign-integrator.cloudflare-superpatch.workers.dev`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ operation: 'cancel-order', data: { order_id: orderGid } }),
  //   });
  //   const data = await resp.json();
  //   if (!resp.ok || data.error) {
  //     console.error('Cancel failed:', data.error || resp.statusText);
  //     return;
  //   }
  //   console.log('Order canceled successfully');
  // };

  root.appendChild(
    root.createComponent(Button, 'Cancel Order'),
  );
});
