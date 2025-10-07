import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from '@shopify/ui-extensions-react/admin';

// Target must match the extension.toml
const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data } = useApi(TARGET);

  const orderId = data.selected?.[0]?.id; 
  const sendToByDesign = async () => {
    if (!orderId) {
      alert('No order selected.');
      return;
    }

    try {
      const orderNumericId = Number(orderId.split('/').pop());

      const mutation = {
        query: `
          mutation {
            flowTriggerReceive(
              handle: "ready-to-sync-with-bydesign",
              payload: { order_id: ${orderNumericId} }
            ) {
              userErrors {
                field
                message
              }
            }
          }
        `,
      };

      const res = await fetch('shopify:admin/api/graphql.json', {
        method: 'POST',
        body: JSON.stringify(mutation),
      });

      const result = await res.json();
      const errors = result?.data?.flowTriggerReceive?.userErrors;

      if (errors?.length) {
        console.error(errors[0].message);
      } else {
        close(); // optional: closes the AdminAction modal
      }
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  return (
    <AdminAction
      primaryAction={
        <Button onPress={sendToByDesign}>
          Send to ByDesign
        </Button>
      }
      secondaryAction={
        <Button onPress={close}>
          Close
        </Button>
      }
    >
      <BlockStack>
        <Text fontWeight="bold">Send this order to ByDesign</Text>
        <Text>Order ID: {orderId}</Text>
      </BlockStack>
    </AdminAction>
  );
}
