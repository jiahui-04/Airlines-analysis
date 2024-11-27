// Q10

// Consider airlines_reviews to identify the relevant issues (e.g., safety and compensations).
// exceptional circumstances, relevant issues
db.airlines_reviews.find(
  {$and: [
    {Airline: "Singapore Airlines"},
    {Recommended: "no"}, // To retrieve generally negative reviews
    {Verified: "TRUE"},    // To ensure authenticity and reliability
    {$or: [
        {Reviews: {$regex: /delay/i}},
        {Reviews: {$regex: /cancel/i}},
        {Reviews: {$regex: /compensation/i}},
        {Reviews: {$regex: /reimburse/i}},
        {Reviews: {$regex: /safety/i}},
        {Reviews: {$regex: /complain/i}},
        {Reviews: {$regex: /reschedule/i}},
        {Reviews: {$regex: /special/i}},
        {Reviews: {$regex: /mistake/i}},
        {Reviews: {$regex: /pre-order/i}},
        {Reviews: {$regex: /pre order/i}},
        {Reviews: {$regex: /refund/i}},
        {Reviews: {$regex: /allergy/i}},
        {Reviews: {$regex: /emergency/i}},
        {Reviews: {$regex: /claim/i}},
        {Reviews: {$regex: /reclamation/i}},
        {Reviews: {$regex: /remove/i}},
        {Reviews: {$regex: /delete/i}},
        {Reviews: {$regex: /withdraw/i}},
        {Reviews: {$regex: /penal/i}},   // Matches penalty, penalties, penalise
        {Reviews: {$regex: /termin/i}}, // Matches terminate, termination
        {Reviews: {$regex: /wrong/i}},
        {Reviews: {$regex: /error/i}}]
    }
  ]
})

// Consider customer support in the general chatbot responses to various lexical variations.
// find chat responses to lexical variations
db.customer_support.find(
  {$and: [
    {category: {$in: ['REFUND', 'FEEDBACK', 'ORDER', 'CANCEL', 'SHIPPING']}},
    {$or: [
        {$and: [
            {category: 'REFUND'},
            {instruction: {$regex: /(refund|reimburse|compensation)/i}}
          ]
        },
        {$and: [
            {category: 'FEEDBACK'},
            {instruction: {$regex: /(claim|reclamation|complain)/i}}
          ]
        },
        {$and: [
            {category: 'ORDER'},
            {instruction: {$regex: /(cancel|remove|delete)/i}}
          ]
        },
        {$and: [
            {category: 'CANCEL'},
            {instruction: {$regex: /(cancel|withdraw|penal|termin)/i}}
          ]
        },
        {$and: [
            {category: 'SHIPPING'},
            {instruction: {$regex: /(wrong|error)/i}}
          ]
        }
      ]
    }
  ]
})

// Propose linguistic design considerations for the chatbot (e.g., apologetic tones, detailed explanations, simple sentences).
// count the number of responses addressing different lexical variations grouped by category and tone
db.customer_support.aggregate([
  {$match:
      {category: {$in: ['REFUND', 'FEEDBACK', 'ORDER', 'CANCEL', 'SHIPPING']},
      $or: [
        {category: 'REFUND', instruction: {$regex: /(refund|reimburse|compensation)/i}},
        {category: 'FEEDBACK', instruction: {$regex: /(claim|reclamation|complain)/i}},
        {category: 'ORDER', instruction: {$regex: /(cancel|remove|delete)/i}},
        {category: 'CANCEL', instruction: {$regex: /(cancel|withdraw|penal|termin)/i}},
        {category: 'SHIPPING', instruction: { $regex: /(wrong|error)/i}}
      ]
    }
  },
  {$addFields: 
      {tone:
        {$cond: [
          {$regexMatch: {input: "$response", regex: /(apolog|sorry|appreciate|sincere)/i}}, 'Apologetic',
          {$cond: [
            {$regexMatch: {input: "$response", regex: /(underst|empathi)/i}}, 'Empathetic',
            {$cond: [
              {$regexMatch: {input: "$response", regex: /(assure|absolutely|help|committed|unquestionably|positively|indeed|do my best|no problem|resolve|for sure|certainly|definitely|assist|no worries|got your back)/i } }, 'Reassuring',
              {$cond: [
                {$regexMatch: {input: "$response", regex: /please/i}}, 'Formal',
                {$cond: [
                  {$regexMatch: {input: "$response", regex: /(upgraded|happy|pleased|good news)/i}}, 'Positive',
                  'Neutral'
                ]}
              ]}
            ]}
          ]}
        ]
      }
    }
  },
  {$group: 
     {_id: {category: "$category", tone: "$tone"},
      count: {$sum: 1}}
  },
  {$sort: {"_id.category": 1, count: -1}}
])

// to determine character length for simple sentences and detailed explanations based on top few frequency of character length of responses 
db.customer_support.aggregate([
  {$match: 
      {category: {$in: ['CANCEL', 'FEEDBACK', 'ORDER', 'REFUND', 'SHIPPING']}}
  },
  {$addFields: 
      {response_length: {$strLenCP: "$response"}}
  },
  {$group: 
      {_id: {response_length: "$response_length", category: "$category"},
      response_count: {$sum: 1}}
  },
  {$sort: {response_count: -1}},
  {$project: 
      {_id: 0,
      response_length: "$_id.response_length",
      category: "$_id.category",
      response_count: 1}
  }
])

// count how many simple sentences and detailed explanations there are to determine if the chatbot responses are grouped by category
db.customer_support.aggregate([
  {$match:
      {category: {$in: ['REFUND', 'FEEDBACK', 'ORDER', 'CANCEL', 'SHIPPING']},
      $or: [
        {category: 'REFUND', instruction: {$regex: /(refund|reimburse|compensation)/i}},
        {category: 'FEEDBACK', instruction: {$regex: /(claim|reclamation|complain)/i}},
        {category: 'ORDER', instruction: {$regex: /(cancel|remove|delete)/i}},
        {category: 'CANCEL', instruction: {$regex: /(cancel|withdraw|penal|termin)/i}},
        {category: 'SHIPPING', instruction: {$regex: /(wrong|error)/i}}
      ]
    }
  },
  {$addFields: 
      {response_type:
        {$cond: [
          {$lt: [{$strLenCP: "$response" }, 400]}, 'Simple Sentence', 'Detailed Explanation'
        ]
      }
    }
  },
  {$group:
      {_id: {category: "$category", response_type: "$response_type"},
      response_count: {$sum: 1}}
  },
  {$sort: { "_id.category": 1, response_count: -1 }}
])

