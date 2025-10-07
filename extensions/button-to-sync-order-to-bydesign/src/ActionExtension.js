import {
  extension,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from "@shopify/ui-extensions/admin";

const TARGET = "admin.order-details.action.render";

export default extension(TARGET, (root, { close, data, toast }) => {
  console.log('extension is there');
  const orderId = data.selected?.[0]?.id; // e.g. gid://shopify/Order/6115848224921
  console.log(orderId);
  const sendToByDesign = async () => {
    try {
      const orderNumericId = Number(orderId.split("/").pop());

      const mutation = {
        query: `
          mutation {
            flowTriggerReceive(
              handle: "ready-to-sync-with-bydesign",
              payload: {
                order_id: ${orderNumericId}
              }
            ) {
              userErrors {
                field
                message
              }
            }
          }
        `,
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(mutation),
      });

      const json = await res.json();
      const errors = json?.data?.flowTriggerReceive?.userErrors;

      if (errors?.length) {
        toast.show(`Error: ${errors[0].message}`);
      } else {
        toast.show("Successfully sent to ByDesign!");
        close(); // optional
      }
    } catch (e) {
      console.error("Mutation error:", e);
      toast.show("Unexpected error triggering Flow");
    }
  };

  const sendButton = root.createComponent(Button, { onPress: sendToByDesign }, "Send to ByDesign");
  const cancelButton = root.createComponent(Button, { onPress: close }, "Cancel");

  const content = root.createComponent(BlockStack, null, [
    root.createComponent(Text, { fontWeight: "bold" }, "Send this order to ByDesign"),
  ]);

  const adminAction = root.createComponent(AdminAction, {
    primaryAction: sendButton,
    secondaryAction: cancelButton,
    children: [content],
  });

  root.append(adminAction);
});
