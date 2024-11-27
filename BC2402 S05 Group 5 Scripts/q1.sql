# Q1
# How many categories are in [customer_suppport]?

-- correct all the intents under each category --
Create View cleanedIntentTable AS
SELECT
    flags,
    instruction, 
    category,
    (CASE 
-- category: ORDER. intents: cancel_order, change_order --
	WHEN intent LIKE "%cancel_order%" THEN "cancel_order"
	WHEN intent like "%change_order%" THEN "change_order"
-- category: REFUND. intents: check_refund_policies, get_refund, track_refund --
	WHEN intent LIKE "%refund policies%" OR intent LIKE "%check_refund_policy%" OR intent LIKE "%refund process%" OR intent LIKE "%documentation needed%" OR intent LIKE "%any applicable fees or conditions%" OR intent LIKE "%such as the {{Order Number}}%" OR intent LIKE "%such as your order number or any other relevant information%" OR intent LIKE "%please provide me with the order number%" OR intent LIKE "%or if you require any additional assistance%" OR intent LIKE "%purchase details%" OR intent LIKE "%for any concerns or further assistance%" THEN "check_refund_policy"
	WHEN intent LIKE "%such as your order number or any other relevant information%" OR intent LIKE "%and I'll be more than happy to help you further. Your satisfaction is our top priority%" OR intent LIKE "%as it may contain specific terms and conditions that apply to your situation. If you have any further questions or need assistance with any aspect of our refund policy%" THEN "get_refund"
	WHEN intent like "%""Approved%" THEN "track_refund"
-- category: CONTACT. intents: contact_customer_service, contact_human_agent --
	WHEN intent LIKE "%at {{Customer Support Phone Number}}%" OR intent LIKE "%contact_customer_service%" OR intent LIKE "%email addresses%" OR intent LIKE "%or live chat%" THEN "contact_customer_service"
	WHEN intent LIKE "%contact_human_agent%" THEN "contact_human_agent"
-- category: SHIPPING_ADDRESS. intents: change_shipping_address, set_up_shipping_address --
	WHEN intent LIKE "%change_shipping_address%" OR intent LIKE  "%state%" OR intent LIKE "%postal code%" OR intent LIKE "%city%" THEN "change_shipping_address"
-- category: CANCELLATION_FEE. intents: check_cancellation_fee --
	WHEN intent LIKE "%check_cancellation_fee%" THEN "check_cancellation_fee"
-- category: FEEDBACK. intents: complaint --
	WHEN intent LIKE "%complaint%" THEN "complaint"
-- category: INVOICE. intents: check_invoice
	WHEN intent LIKE "%check_invoice%" OR intent LIKE "%due date%" OR intent LIKE "%we're always here to make things easier for you%" OR intent LIKE "%payment due date%" THEN "check_invoice"
            WHEN intent LIKE "%including the one with the number {{Invoice Number}}. If you're having trouble finding it%" OR intent LIKE "%or any other relevant information%" THEN "get_invoice"
-- category: PAYMENT. intents: check_payment_methods
            WHEN intent LIKE "%check_payment_methods%" OR intent LIKE "%bank transfer%" OR intent LIKE "%PayPal%" OR intent LIKE "%bank transfers%" OR intent LIKE "%Apple Pay%" OR intent LIKE "%Mastercard%" THEN "check_payment_methods"
	ELSE intent
	END) AS cleanedIntent,
    response
FROM
	customer_support;

-- correct all the category based on the intent we have modified --
Create View cleanedCategoryTable AS 
SELECT
    flags,
    instruction,
    CASE
        WHEN cleanedIntent IN ("cancel_order", "change_order") THEN "ORDER"
        WHEN cleanedIntent IN ("check_refund_policy", "get_refund", "track_refund") THEN "REFUND"
        WHEN cleanedIntent IN ("contact_customer_service", "contact_human_agent") THEN "CONTACT"
        WHEN cleanedIntent = "change_shipping_address" THEN "SHIPPING_ADDRESS"
        WHEN cleanedIntent = "check_cancellation_fee" THEN "CANCELLATION_FEE"
        WHEN cleanedIntent = "complaint" THEN "FEEDBACK"
        WHEN cleanedIntent IN ("check_invoice", "get_invoice") THEN "INVOICE"
        WHEN cleanedIntent = "check_payment_methods" THEN "PAYMENT"
		ELSE cleanedIntent
    END AS cleanedCategory,
    cleanedIntent,
    response
FROM 
    cleanedIntentTable;

-- Count the number of distinct category in cleanedCategoryTable --
SELECT
	COUNT(DISTINCT cleanedCategory) as CategoryCount
FROM
	cleanedCategoryTable;
