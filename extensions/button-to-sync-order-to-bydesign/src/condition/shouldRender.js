
// The target used here must match the target used in the extension's toml file (./shopify.extension.toml), 
// except for the "should-render" suffix
const TARGET = 'admin.order-details.action.render';

// The second argument to the render callback provides access to the resource ID.
// export default shopify.extend(TARGET, async ({ data }) => {
//   const variantCount = await getVariantsCount(data.selected[0].id);

//   return {display: variantCount > 1 }
// });



// // Use direct API calls to fetch data from Shopify.
// // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
// async function getVariantsCount(id) {
//   const getProductQuery = {
//     query: `query Product($id: ID!) {
//       product(id: $id) {
//         variantsCount {
//           count
//         }
//       }
//     }`,
//     variables: { id },
//   };

//   const res = await fetch("shopify:admin/api/graphql.json", {
//     method: "POST",
//     body: JSON.stringify(getProductQuery),
//   });

//   if (!res.ok) {
//     console.error("Network error");
//   }

//   const productData = await res.json();
//   return productData.data.product.variantsCount.count;
// }


// export default shopify.extend(TARGET, async ({ data }) => {
//   const orderId = data.selected[0].id;
//   console.log(orderId);
//   const query = {
//     query: `
//       query GetOrderTags($id: ID!) {
//         order(id: $id) {
//           tags
//         }
//       }
//     `,
//     variables: { id: orderId },
//   };

//   const res = await fetch("shopify:admin/api/graphql.json", {
//     method: "POST",
//     body: JSON.stringify(query),
//   });
//   console.log(res);

//   if (!res.ok) {
//     console.error("Network error fetching order tags");
//     return { display: false };
//   }

//   const json = await res.json();
//   const tags = json?.data?.order?.tags || [];
//   return { display: tags.includes("review-order") };
// });

export default shopify.extend(TARGET, async () => {
  console.log('shouldRender data:', data);
  return { display: true };
});
