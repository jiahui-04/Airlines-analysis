// Q8
// *Open-ended question; [airlines_reviews] What are the common complaints?
// For each Airline and TypeofTraveller, list the top 5 common issues.


db.airlines_reviews.aggregate([
  {$group: 
      {_id: 
        {Airline: "$Airline",
        TypeofTraveller: "$TypeofTraveller",
        Recommended: "$Recommended"},
      AvgSeatComfort: {$avg: "$SeatComfort"},
      AvgStaffService: {$avg: "$StaffService"},
      AvgFoodnBeverages: {$avg: "$FoodnBeverages"},
      AvgInflightEntertainment: {$avg: "$InflightEntertainment"},
      AvgValueForMoney: {$avg: "$ValueForMoney"},
      AvgOverallRating: {$avg: "$OverallRating"},
      RecommendedTypeCount: {$sum: 1}}
  },
  {$project: 
      {_id: 0,
      Airline: "$_id.Airline",
      TypeofTraveller: "$_id.TypeofTraveller",
      RecommendedType: "$_id.Recommended",
      AvgSeatComfort: 1,
      AvgStaffService: 1,
      AvgFoodnBeverages: 1,
      AvgInflightEntertainment: 1,
      AvgValueForMoney: 1,
      AvgOverallRating: 1,
      RecommendedTypeCount: 1}
  },
  {$out: "ar_quantitative"}
])



db.airlines_reviews.aggregate([
  {$lookup: 
      {from: "ar_quantitative",
      let: 
        {airline: "$Airline",
        travellerType: "$TypeofTraveller",
        recommended: "$Recommended"},
      pipeline: [
        {$match: 
            {$expr: 
              {$and: [
                {$eq: ["$Airline", "$$airline"]},
                {$eq: ["$TypeofTraveller", "$$travellerType"]},
                {$eq: ["$RecommendedType", "$$recommended"]}
              ]
            }
          }
        }
      ],
      as: "quantitative_data"
    }
  },
  {$unwind: "$quantitative_data"},
  {$addFields: 
      {DiffSeatComfort: {$subtract: ["$SeatComfort", "$quantitative_data.AvgSeatComfort"]},
      DiffStaffService: {$subtract: ["$StaffService", "$quantitative_data.AvgStaffService"]},
      DiffFoodnBeverages: {$subtract: ["$FoodnBeverages", "$quantitative_data.AvgFoodnBeverages"]},
      DiffInflightEntertainment: 
        {$subtract: ["$InflightEntertainment", "$quantitative_data.AvgInflightEntertainment"]},
      DiffValueForMoney: {$subtract: ["$ValueForMoney", "$quantitative_data.AvgValueForMoney"]},
      DiffOverallRating: {$subtract: ["$OverallRating", "$quantitative_data.AvgOverallRating"]}}
  },
  {$match: 
      {$or:
        [{DiffSeatComfort: {$lte: 0}},
        {DiffStaffService: {$lte: 0}},
        {DiffFoodnBeverages: {$lte: 0}},
        {DiffInflightEntertainment: {$lte: 0}},
        {DiffValueForMoney: {$lte: 0}},
        {DiffOverallRating: {$lte: 0}}]}
  },
  {$project:
      {Airline: 1,
      TypeofTraveller: 1,
      RecommendedType: "$Recommended",
      Title: 1,
      Verified: 1,
      Reviews: 1,
      DiffSeatComfort: 1,
      DiffStaffService: 1,
      DiffFoodnBeverages: 1,
      DiffInflightEntertainment: 1,
      DiffValueForMoney: 1,
      DiffOverallRating: 1}
  },
  {$out: "badReviews_t"}
])



db.createCollection("keywords_t")
db.keywords_t.insertMany([
  // keywords for SeatComfort
  {KeywordID: 1, Keyword: "seat", Category: "SeatComfort"},  
  {KeywordID: 2, Keyword: "uncomfortable", Category: "SeatComfort"},  
  {KeywordID: 3, Keyword: "legroom", Category: "SeatComfort"},  
  {KeywordID: 4, Keyword: "recline", Category: "SeatComfort"},  
  {KeywordID: 5, Keyword: "footrest", Category: "SeatComfort"},  
  {KeywordID: 6, Keyword: "backache", Category: "SeatComfort"},  
  {KeywordID: 7, Keyword: "padding", Category: "SeatComfort"},  
  {KeywordID: 8, Keyword: "narrow", Category: "SeatComfort"},  
  
  // keywords for StaffService
  {KeywordID: 9, Keyword: "staff", Category: "StaffService"},  
  {KeywordID: 10, Keyword: "poor service", Category: "StaffService"},  
  {KeywordID: 11, Keyword: "unprofessional", Category: "StaffService"}, 
  {KeywordID: 12, Keyword: "luggage", Category: "StaffService"},  
  {KeywordID: 13, Keyword: "delay", Category: "StaffService"},  
  {KeywordID: 14, Keyword: "cancel", Category: "StaffService"}, 

  // keywords for FoodnBeverages
  {KeywordID: 15, Keyword: "food", Category: "FoodnBeverages"},  
  {KeywordID: 16, Keyword: "beverage", Category: "FoodnBeverages"},  
  {KeywordID: 17, Keyword: "quality", Category: "FoodnBeverages"},  
  {KeywordID: 18, Keyword: "special", Category: "FoodnBeverages"},  

  // keywords for InflightEntertainment
  {KeywordID: 19, Keyword: "inflight entertainment", Category: "InflightEntertainment"},  
  {KeywordID: 20, Keyword: "sound", Category: "InflightEntertainment"},  
  {KeywordID: 21, Keyword: "variety", Category: "InflightEntertainment"},  
  {KeywordID: 22, Keyword: "internet", Category: "InflightEntertainment"},  
  {KeywordID: 23, Keyword: "remote control", Category: "InflightEntertainment"},  
  {KeywordID: 24, Keyword: "quality", Category: "InflightEntertainment"},  

  // keywords for ValueForMoney
  {KeywordID: 25, Keyword: "money", Category: "ValueForMoney"},  
  {KeywordID: 26, Keyword: "worth", Category: "ValueForMoney"}  
])


db.createCollection("synonyms_t")
db.synonyms_t.insertMany([
  // synonyms of keywords of SeatComfort
  {SynonymID: 1, KeywordID: 1, Synonym: ["seating"]},
  {SynonymID: 2, KeywordID: 2, Synonym: ["not comfortable"]},
  {SynonymID: 3, KeywordID: 3, Synonym: ["leg room"]},
  {SynonymID: 4, KeywordID: 4, Synonym: ["lie-flat", "lie flat"]},
  {SynonymID: 5, KeywordID: 5, Synonym: ["foot"]},
  {SynonymID: 6, KeywordID: 6, Synonym: ["back ache"]},
  {SynonymID: 7, KeywordID: 7, Synonym: ["cushion", "hard"]},
  {SynonymID: 8, KeywordID: 8, Synonym: ["tight", "cramp", "space"]},

  // synonyms for keywords of StaffService  
  {SynonymID: 9, KeywordID: 9, Synonym: ["crew", "attendant", "FA", "service"]},
  {SynonymID: 10, KeywordID: 10, Synonym: ["poor", "bad", "disappoint", "terrible", "worst", "nightmare"]},
  {SynonymID: 11, KeywordID: 11, Synonym: ["not friendly", "unfriendly", "unhelpful", "inflexible", "impolite", "robotic", "unwilling", "not willing", "not helpful", "no response", "no answer", "rush", "inexperienced", "inefficient", "responsibility"]},
  {SynonymID: 12, KeywordID: 12, Synonym: ["baggage", "bag"]},
  {SynonymID: 13, KeywordID: 13, Synonym: ["postpone"]},
  {SynonymID: 14, KeywordID: 14, Synonym: ["wrong", "mistake"]},

  // synonyms for keywords of FoodnBeverages  
  {SynonymID: 15, KeywordID: 15, Synonym: ["meal", "dish", "diet", "cook", "refreshment", "order", "breakfast", "lunch", "dinner"]},
  {SynonymID: 16, KeywordID: 16, Synonym: ["drink", "wine", "water", "champagne"]},
  {SynonymID: 17, KeywordID: 17, Synonym: ["tasty", "tasteless", "delicious", "bland", "flavour", "high quality", "low quality", "tasteless"]},
  {SynonymID: 18, KeywordID: 18, Synonym: ["vegetarian", "vegan", "gluten", "allergy", "allergies"]},

  // synonyms for keywords of InflightEntertainment  
  {SynonymID: 19, KeywordID: 19, Synonym: ["IFE", "entertainment", "tv", "television", "screen", "device"]},
  {SynonymID: 20, KeywordID: 20, Synonym: ["music", "headphone", "earphone"]},
  {SynonymID: 21, KeywordID: 21, Synonym: ["option", "choice", "selection", "watch", "limited"]},
  {SynonymID: 22, KeywordID: 22, Synonym: ["wifi"]},
  {SynonymID: 23, KeywordID: 23, Synonym: ["console", "remote"]},
  {SynonymID: 24, KeywordID: 24, Synonym: ["resolution", "reboot", "poor", "dated", "broke", "bad"]},

  // synonyms for keywords of ValueForMoney  
  {SynonymID: 25, KeywordID: 25, Synonym: ["cost", "price", "paid"]},
  {SynonymID: 26, KeywordID: 26, Synonym: ["expensive", "not cheap", "value", "deal", "waste"]}
])


// Function to perform the filtered_complaints operation
function filteredComplaints(p_Airline, p_TypeofTraveller) 
  {db.badReviews_t.aggregate([
    {$match:
        {Verified: 'TRUE',
        Airline: 'p_Airline',
        TypeofTraveller: 'p_TypeofTraveller',
        'Keyword': {$nin: ['seat', 'staff', 'food', 'inflight entertainment', 'money']}}
    },
    {$lookup: 
        {from: 'keywords_t',
        localField: 'Reviews',
        foreignField: 'Keyword',
        as: 'matched_keywords'}
    },
    {$lookup:
        {from: 'synonyms_t',
        localField: 'Reviews',
        foreignField: 'Synonym',
        as: 'matched_synonyms'}
    },
    {$unwind: {path: "$matched_keywords", preserveNullAndEmptyArrays: true}
    },
    {$unwind: {path: "$matched_synonyms", preserveNullAndEmptyArrays: true}},
    {$group: 
        {_id: 
          {Airline: "$Airline",
          TypeofTraveller: "$TypeofTraveller",
          Category: "$matched_keywords.Category",
          Keyword: "$matched_keywords.Keyword"},
        Frequency: {$sum: 1},
        AvgDiffSeatComfort: {$avg: "$DiffSeatComfort"},
        AvgDiffStaffService: {$avg: "$DiffStaffService"},
        AvgDiffFoodnBeverages: {$avg: "$DiffFoodnBeverages"},
        AvgDiffInflightEntertainment: {$avg: "$DiffInflightEntertainment"},
        AvgDiffValueForMoney: {$avg: "$DiffValueForMoney"}}
    },
    {$match: 
        {$or: [
          {"Category": "SeatComfort", "AvgDiffSeatComfort": {$lt: 0.2}},
          {"Category": "StaffService", "AvgDiffStaffService": {$lt: 0.2}},
          {"Category": "FoodnBeverages", "AvgDiffFoodnBeverages": {$lt: 0.2}},
          {"Category": "InflightEntertainment", "AvgDiffInflightEntertainment": {$lt: 0.2}},
          {"Category": "ValueForMoney", "AvgDiffValueForMoney": {$lt: 0.2}}
        ]
      }
    },
    {$project: 
        {Airline: "$_id.Airline",
        TypeofTraveller: "$_id.TypeofTraveller",
        Category: "$_id.Category",
        Keyword: "$_id.Keyword",
        Frequency: 1,
        AverageDifference: 
          {$switch: 
            {branches: [
              {case: {$eq: ["$Category", "SeatComfort"]}, then: "$AvgDiffSeatComfort"},
              {case: {$eq: ["$Category", "StaffService"]}, then: "$AvgDiffStaffService"},
              {case: {$eq: ["$Category", "FoodnBeverages"]}, then: "$AvgDiffFoodnBeverages"},
              {case: {$eq: ["$Category", "InflightEntertainment"]}, then: "$AvgDiffInflightEntertainment"},
              {case: {$eq: ["$Category", "ValueForMoney"]}, then: "$AvgDiffValueForMoney"}
            ],
            default: null
          }
        }
      }
    },
    {$sort: {Frequency: -1}},
    {$limit: 5}
  ]).toArray();
}

filteredComplaints('Singapore Airlines', 'Business')
filteredComplaints('Singapore Airlines', 'Couple Leisure')
filteredComplaints('Singapore Airlines', 'Family Leisure')
filteredComplaints('Singapore Airlines', 'Solo Leisure')
filteredComplaints('Qatar Airways', 'Business')
filteredComplaints('Qatar Airways', 'Couple Leisure')
filteredComplaints('Qatar Airways', 'Family Leisure')
filteredComplaints('Qatar Airways', 'Solo Leisure')









