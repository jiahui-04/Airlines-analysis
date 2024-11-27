// Q1
// How many categories are in [customer_suppport]?

// update intents to the correct ones under each category
db.customer_support.aggregate([
  {
    $project: {
      flags: 1,
      instruction: 1,
      category: 1,
      cleanedIntent: {
        $switch: {
          branches: [
            // category: ORDER. intents: cancel_order, change_order
            {
              case: { $regexMatch: { input: "$intent", regex: /cancel_order/ } },
              then: "cancel_order"
            },
            {
              case: { $regexMatch: { input: "$intent", regex: /change_order/ } },
              then: "change_order"
            },
            // category: REFUND. intents: check_refund_policy, get_refund, track_refund
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /refund policies/ } },
                  { $regexMatch: { input: "$intent", regex: /check_refund_policy/ } },
                  { $regexMatch: { input: "$intent", regex: /refund process/ } },
                  { $regexMatch: { input: "$intent", regex: /documentation needed/ } },
                  { $regexMatch: { input: "$intent", regex: /any applicable fees or conditions/ } },
                  { $regexMatch: { input: "$intent", regex: /such as the {{Order Number}}/ } },
                  { $regexMatch: { input: "$intent", regex: /such as your order number or any other relevant information/ } },
                  { $regexMatch: { input: "$intent", regex: /please provide me with the order number/ } },
                  { $regexMatch: { input: "$intent", regex: /or if you require any additional assistance/ } },
                  { $regexMatch: { input: "$intent", regex: /purchase details/ } },
                  { $regexMatch: { input: "$intent", regex: /for any concerns or further assistance/ } }
                ]
              },
              then: "check_refund_policy"
            },
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /such as your order number or any other relevant information/ } },
                  { $regexMatch: { input: "$intent", regex: /and I'll be more than happy to help you further. Your satisfaction is our top priority/ } },
                  { $regexMatch: { input: "$intent", regex: /as it may contain specific terms and conditions that apply to your situation. If you have any further questions or need assistance with any aspect of our refund policy/ } }
                ]
              },
              then: "get_refund"
            },
            {
              case: { $regexMatch: { input: "$intent", regex: /""Approved/ } },
              then: "track_refund"
            },
            // category: CONTACT. intents: contact_customer_service, contact_human_agent
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /at {{Customer Support Phone Number}}/ } },
                  { $regexMatch: { input: "$intent", regex: /contact_customer_service/ } },
                  { $regexMatch: { input: "$intent", regex: /email addresses/ } },
                  { $regexMatch: { input: "$intent", regex: /or live chat/ } }
                ]
              },
              then: "contact_customer_service"
            },
            {
              case: { $regexMatch: { input: "$intent", regex: /contact_human_agent/ } },
              then: "contact_human_agent"
            },
            // category: SHIPPING_ADDRESS. intents: change_shipping_address
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /change_shipping_address/ } },
                  { $regexMatch: { input: "$intent", regex: /state/ } },
                  { $regexMatch: { input: "$intent", regex: /postal code/ } },
                  { $regexMatch: { input: "$intent", regex: /city/ } }
                ]
              },
              then: "change_shipping_address"
            },
            // category: CANCELLATION_FEE. intents: check_cancellation_fee
            {
              case: { $regexMatch: { input: "$intent", regex: /check_cancellation_fee/ } },
              then: "check_cancellation_fee"
            },
            // category: FEEDBACK. intents: complaint
            {
              case: { $regexMatch: { input: "$intent", regex: /complaint/ } },
              then: "complaint"
            },
            // category: INVOICE. intents: check_invoice, get_invoice
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /check_invoice/ } },
                  { $regexMatch: { input: "$intent", regex: /due date/ } },
                  { $regexMatch: { input: "$intent", regex: /we're always here to make things easier for you/ } },
                  { $regexMatch: { input: "$intent", regex: /payment due date/ } }
                ]
              },
              then: "check_invoice"
            },
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /including the one with the number {{Invoice Number}}. If you're having trouble finding it/ } },
                  { $regexMatch: { input: "$intent", regex: /or any other relevant information/ } }
                ]
              },
              then: "get_invoice"
            },
            // category: PAYMENT. intents: check_payment_methods
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$intent", regex: /check_payment_methods/ } },
                  { $regexMatch: { input: "$intent", regex: /bank transfer/ } },
                  { $regexMatch: { input: "$intent", regex: /PayPal/ } },
                  { $regexMatch: { input: "$intent", regex: /bank transfers/ } },
                  { $regexMatch: { input: "$intent", regex: /Apple Pay/ } },
                  { $regexMatch: { input: "$intent", regex: /Mastercard/ } }
                ]
              },
              then: "check_payment_methods"
            }
          ],
          default: "$intent"  
        }
      },
      response: 1
    }
  },
  { $out: "cleanedIntentCollection" }  // name the new collection: cleanedIntentcollection
])

// update the category according to the updated intents for each document
db.cleanedIntentCollection.aggregate([
  {
    $project: {
      flags: 1,
      instruction: 1,
      category: 1,
      cleanedIntent: 1,
      cleanedCategory: {
        $switch: {
          branches: [
            // category: ORDER. intents: cancel_order, change_order
            {
              case: { 
                  $or: [
                      { $regexMatch: { input: "$cleanedIntent", regex: /cancel_order/ } },
                      { $regexMatch: { input: "$cleanedIntent", regex: /change_order/ } }
                     ]
              },
              then: "ORDER"
            },
            // category: REFUND. intents: check_refund_policy, get_refund, track_refund
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$cleanedIntent", regex: /check_refund_policy/ } },
                  { $regexMatch: { input: "$cleanedIntent", regex: /get_refund/ } },
                  { $regexMatch: { input: "$cleanedIntent", regex: /track_refund/ } }
                ]
              },
              then: "REFUND"
            },
            // category: CONTACT. intents: contact_customer_service, contact_human_agent
            {
              case: {
                  $or: [
                    { $regexMatch: { input: "$cleanedIntent", regex: /contact_customer_service/ } },
                    { $regexMatch: { input: "$cleanedIntent", regex: /contact_human_agent/ } }
                  ]
              },
              then: "CONTACT"
            },
            // category: SHIPPING_ADDRESS. intents: change_shipping_address
            {
              case: { $regexMatch: { input: "$cleanedIntent", regex: /change_shipping_address/ } },
              then: "SHIPPING_ADDRESS"
            },
            // category: CANCELLATION_FEE. intents: check_cancellation_fee
            {
              case: { $regexMatch: { input: "$cleanedIntent", regex: /check_cancellation_fee/ } },
              then: "CANCELLATION_FEE"
            },
            // category: FEEDBACK. intents: complaint
            {
              case: { $regexMatch: { input: "$cleanedIntent", regex: /complaint/ } },
              then: "FEEDBACK"
            },
            // category: INVOICE. intents: check_invoice, get_invoice
            {
              case: {
                $or: [
                  { $regexMatch: { input: "$cleanedIntent", regex: /check_invoice/ } },
                  { $regexMatch: { input: "$cleanedIntent", regex: /get_invoice/ } }
                ]
              },
              then: "INVOICE"
            },
            // category: PAYMENT. intents: check_payment_methods
            {
              case: { $regexMatch: { input: "$cleanedIntent", regex: /check_payment_methods/ } },
              then: "PAYMENT"
            }
          ],
          default: "$cleanedIntent"  
        }
      },
      response: 1
    }
  },
  { $out: "cleanedCategoryCollection" }  // name the new collection: cleanedCategoryCollection
])

// To display the number of categories 
db.cleanedCategoryCollection.aggregate([
  {
    $group: {
      _id: "$cleanedCategory"  
    }
  },
  {
    $count: "distinctcleanedCategoryCount"  // Count the number of distinct cleanedCategory
  }
])




