# 10. How can a customer service chatbot be designed to help Singapore Airlines in such exceptional circumstances?
# Consider airlines_reviews to identify the relevant issues (e.g., safety and compensations).
# exceptional circumstances, relevant issues
SELECT 
    *
FROM
    airlines_reviews
WHERE
    Airline = 'Singapore Airlines'
        AND recommended = 'no'
        AND verified = 'TRUE'
        AND (Reviews LIKE '%delay%'
        OR Reviews LIKE '%cancel%'
        OR Reviews LIKE '%compensation%'
        OR Reviews LIKE '%reinburse%'
        OR Reviews LIKE '%safety%'
        OR Reviews LIKE '%complain%'
        OR Reviews LIKE '%reschedule%'
        OR Reviews LIKE '%special%'
        OR Reviews LIKE '%mistake%'
        OR Reviews LIKE '%pre-order%'
        OR Reviews LIKE '%pre order%'
        OR Reviews LIKE '%refund%'
        OR Reviews LIKE '%allergy%'
        OR Reviews LIKE '%emergency%'
        OR Reviews LIKE '%claim%'
        OR Reviews LIKE '%reclamation%'
        OR Reviews LIKE '%remove%'
        OR Reviews LIKE '%delete%'
        OR Reviews LIKE '%withdraw%'
        OR Reviews LIKE '%penal%'
        OR Reviews LIKE '%termin%'
        OR Reviews LIKE '%wrong%'
        OR Reviews LIKE '%error%');

# remove useless data (incorrect categories) from customer_support
CREATE VIEW cleaned_customer_support AS
    SELECT 
        *
    FROM
        customer_support
    WHERE
        category IN ('CANCEL' , 'CONTACT',
            'FEEDBACK',
            'INVOICE',
            'ORDER',
            'PAYMENT',
            'REFUND',
            'SHIPPING');


# Consider customer support in the general chatbot responses to various lexical variations.
# find chat responses to lexical variations
SELECT *
FROM cleaned_customer_support
WHERE category = 'REFUND'
  AND (instruction LIKE '%refund%'
       OR instruction LIKE '%reimburse%'
       OR instruction LIKE '%compensation%')
UNION ALL
SELECT *
FROM cleaned_customer_support
WHERE category = 'FEEDBACK'
  AND (instruction LIKE '%claim%'
       OR instruction LIKE '%reclamation%'
       OR instruction LIKE '%complain%')
UNION ALL
SELECT *
FROM cleaned_customer_support
WHERE category = 'ORDER'
  AND (instruction LIKE '%cancel%'
       OR instruction LIKE '%remove%'
       OR instruction LIKE '%delete%')
UNION ALL
SELECT *
FROM cleaned_customer_support
WHERE category = 'CANCEL'
  AND (instruction LIKE '%cancel%'
       OR instruction LIKE '%withdraw%'
       OR instruction LIKE '%penal%' # for penalty, penalties, penalise
       OR instruction LIKE '%termin%') # for terminate, termination 
UNION ALL
SELECT *
FROM cleaned_customer_support
WHERE category = 'SHIPPING'
  AND (instruction LIKE '%wrong%'
       OR instruction LIKE '%error%');

# Propose linguistic design considerations for the chatbot (e.g., apologetic tones, detailed explanations, simple sentences).
# count the number of responses addressing different lexical variations grouped by category and tone
 SELECT 
    category,
    CASE
        WHEN
            response LIKE '%apolog%'
                OR response LIKE '%sorry%'
                OR response LIKE '%appreciate%'
                OR response LIKE '%sincere%'
        THEN
            'Apologetic'
        WHEN
            response LIKE '%underst%'
                OR response LIKE '%empathi%'
        THEN
            'Empathetic'
        WHEN
            response LIKE '%assure%'
                OR response LIKE '%absolutely%'
                OR response LIKE '%help%'
                OR response LIKE '%committed%'
                OR response LIKE '%unquestionably%'
                OR response LIKE '%positively%'
                OR response LIKE '%indeed%'
                OR response LIKE '%do my best%'
                OR response LIKE '%no problem%'
                OR response LIKE '%resolve%'
                OR response LIKE '%for sure%'
                OR response LIKE '%certainly%'
                OR response LIKE '%definitely%'
                OR response LIKE '%assist%'
                OR response LIKE '%no worries%'
                OR response LIKE '%got your back%'
        THEN
            'Reassuring'
        WHEN response LIKE '%please%' THEN 'Formal'
        WHEN
            response LIKE '%upgraded%'
                OR response LIKE '%happy%'
                OR response LIKE '%pleased%'
                OR response LIKE '%good news%'
        THEN
            'Positive'
        ELSE 'Neutral'
    END AS tone,
    COUNT(*) AS count
FROM
    (SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'REFUND'
            AND (instruction LIKE '%refund%'
            OR instruction LIKE '%reimburse%'
            OR instruction LIKE '%compensation%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'FEEDBACK'
            AND (instruction LIKE '%claim%'
            OR instruction LIKE '%reclamation%'
            OR instruction LIKE '%complain%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'ORDER'
            AND (instruction LIKE '%cancel%'
            OR instruction LIKE '%remove%'
            OR instruction LIKE '%delete%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'CANCEL'
            AND (instruction LIKE '%cancel%'
            OR instruction LIKE '%withdraw%'
            OR instruction LIKE '%penal%'
            OR instruction LIKE '%termin%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'SHIPPING'
            AND (instruction LIKE '%wrong%'
            OR instruction LIKE '%error%')) chatbox_instruction
GROUP BY category , tone
ORDER BY category , count DESC;

# to determine character length for simple sentences and detailed explanations based on top 10 frequency of character length of responses 
SELECT 
    category,
    CHAR_LENGTH(response) AS response_length,
    COUNT(*) AS response_count
FROM
    cleaned_customer_support
WHERE
    category IN ('CANCEL' , 'FEEDBACK',
        'ORDER',
        'REFUND',
        'SHIPPING')
GROUP BY CHAR_LENGTH(response) , category
ORDER BY response_count DESC
LIMIT 10;

# count how many simple sentences and detailed explanations there are to determine if the chatbot responses are grouped by category
SELECT 
    category, response_type, COUNT(*) AS response_count
FROM
    (SELECT 
        response,
            category,
            CASE
                WHEN CHAR_LENGTH(response) < 400 THEN 'Simple Sentence'
                WHEN
                    CHAR_LENGTH(response) >= 400
                        OR response LIKE '%1.%'
                THEN
                    'Detailed Explanation'
            END AS response_type
    FROM
        (SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'REFUND'
            AND (instruction LIKE '%refund%'
            OR instruction LIKE '%reimburse%'
            OR instruction LIKE '%compensation%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'FEEDBACK'
            AND (instruction LIKE '%claim%'
            OR instruction LIKE '%reclamation%'
            OR instruction LIKE '%complain%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'ORDER'
            AND (instruction LIKE '%cancel%'
            OR instruction LIKE '%remove%'
            OR instruction LIKE '%delete%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'CANCEL'
            AND (instruction LIKE '%cancel%'
            OR instruction LIKE '%withdraw%'
            OR instruction LIKE '%penal%'
            OR instruction LIKE '%termin%') UNION ALL SELECT 
        *
    FROM
        cleaned_customer_support
    WHERE
        category = 'SHIPPING'
            AND (instruction LIKE '%wrong%'
            OR instruction LIKE '%error%')) AS chatbox_instruction) AS categorized_responses
GROUP BY category , response_type
ORDER BY category , response_count DESC;

