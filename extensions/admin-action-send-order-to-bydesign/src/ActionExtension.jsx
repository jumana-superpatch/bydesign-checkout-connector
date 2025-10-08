import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  Icon
} from '@shopify/ui-extensions-react/admin';

const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data } = useApi(TARGET);

  const orderId = data.selected?.[0]?.id;
  const sendToByDesign = async () => {
    if (!orderId) {
      console.log('No order selected.');
      return;
    }

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

    fetch('shopify:admin/api/graphql.json', {
      method: 'POST',
      body: JSON.stringify(mutation),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        return res.json();
      })
      .then((result) => {
        const errors = result?.data?.flowTriggerReceive?.userErrors;
        if (errors?.length) {
          console.error(errors[0].message);
        } else {
          close();
        }
      })
      .catch((err) => {
        console.error('Mutation error:', err.message || err);
      });

  };

  return (
    <AdminAction
      primaryAction={
        <Button onPress={sendToByDesign}>
          Sync
          
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
