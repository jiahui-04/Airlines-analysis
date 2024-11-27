// Q9
// *Open-ended question; [airlines_reviews] and additional data*
// Are there any systematic differences in customer preferences/complaints pre- and 
// post- COVID specific to Singapore Airlines?

// find the average ratings for each category and type of traveller, pre- and post-COVID 
db.airlines_reviews.aggregate([
  {
    $addFields: {
      // convert the string month to a number
      monthNum: {
        $switch: {
          branches: [
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Jan"] }, then: "01" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Feb"] }, then: "02" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Mar"] }, then: "03" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Apr"] }, then: "04" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "May"] }, then: "05" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Jun"] }, then: "06" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Jul"] }, then: "07" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Aug"] }, then: "08" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Sep"] }, then: "09" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Oct"] }, then: "10" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Nov"] }, then: "11" },
            { case: { $eq: [{ $substr: ["$MonthFlown", 0, 3] }, "Dec"] }, then: "12" }
          ],
          default: "Unknown"
        }
      },
      // convert year to full year format
      yearFull: { $concat: ["20", { $substr: ["$MonthFlown", 4, 2] }] },
      // determine TimePeriod
      TimePeriod: {
        $cond: [
          // Pre-COVID Condition -- before March 2020
          {
            $and: [
              { $lt: [{ $toInt: { $concat: ["20", { $substr: ["$MonthFlown", 4, 2] }] } }, 2020] },
              { $lt: [{ $toInt: "$monthNum" }, 3] }
            ]
          },
          "Pre-COVID",
          {
            // Post-COVID Condition -- May 2023 onwards
            $cond: [
              {
                $or: [
                  // May 2023 to December 2023
                  {
                    $and: [
                      { $eq: [{ $toInt: { $concat: ["20", { $substr: ["$MonthFlown", 4, 2] }] } }, 2023] },
                      { $gte: [{ $toInt: "$monthNum" }, 5] }
                    ]
                  },
                  // Entire year of 2024
                  { $eq: [{ $toInt: { $concat: ["20", { $substr: ["$MonthFlown", 4, 2] }] } }, 2024] }
                ]
              },
              "Post-COVID",
              // During-COVID -- everything else
              "During-COVID"
            ]
          }
        ]
      }
    }
  },
  {
    $project: {
      Title: 1,
      Name: 1,
      Airline: 1,
      Reviews: 1,
      Class: 1,
      TypeofTraveller: 1,
      formattedDate: {
        $concat: ["$monthNum", "-", "$yearFull"]
      },
      Route: 1,
      SeatComfort: 1,
      StaffService: 1,
      FoodnBeverages: 1,
      InflightEntertainment: 1,
      ValueForMoney: 1,
      OverallRating: 1,
      Recommended: 1,
      TimePeriod: 1
    }
  },
  {
    $match: {
      Airline: "Singapore Airlines",
      TimePeriod: { $in: ["Pre-COVID", "Post-COVID"] }
    }
  },
  // group to calculate averages per time period and traveller type
  {
    $group: {
      _id: { TimePeriod: "$TimePeriod", TypeofTraveller: "$TypeofTraveller" },
      AvgSeatComfort: { $avg: "$SeatComfort" },
      AvgStaffService: { $avg: "$StaffService" },
      AvgFoodnBeverages: { $avg: "$FoodnBeverages" },
      AvgInflightEntertainment: { $avg: "$InflightEntertainment" },
      AvgValueForMoney: { $avg: "$ValueForMoney" },
      AvgOverallRating: { $avg: "$OverallRating" }
    }
  },
  // reshape results for merging Pre-COVID and Post-COVID ratings
  {
    $group: {
      _id: "$_id.TypeofTraveller",
      ratings: {
        $push: {
          TimePeriod: "$_id.TimePeriod",
          SeatComfort: "$AvgSeatComfort",
          StaffService: "$AvgStaffService",
          FoodnBeverages: "$AvgFoodnBeverages",
          InflightEntertainment: "$AvgInflightEntertainment",
          ValueForMoney: "$AvgValueForMoney",
          OverallRating: "$AvgOverallRating"
        }
      }
    }
  },
  // separate ratings for Pre-COVID and Post-COVID
  {
    $project: {
      _id: 1,
      PreCOVIDAvgRatings: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$ratings",
              as: "rating",
              cond: { $eq: ["$$rating.TimePeriod", "Pre-COVID"] }
            }
          },
          0
        ]
      },
      PostCOVIDAvgRatings: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$ratings",
              as: "rating",
              cond: { $eq: ["$$rating.TimePeriod", "Post-COVID"] }
            }
          },
          0
        ]
      }
    }
  },
  // projects final answer
  {
    $project: {
      _id: 1,
      PreCOVIDAvgRatings: {
        SeatComfort: { $toDecimal: "$PreCOVIDAvgRatings.SeatComfort" },
        StaffService: { $toDecimal: "$PreCOVIDAvgRatings.StaffService" },
        FoodnBeverages: { $toDecimal: "$PreCOVIDAvgRatings.FoodnBeverages" },
        InflightEntertainment: { $toDecimal: "$PreCOVIDAvgRatings.InflightEntertainment" },
        ValueForMoney: { $toDecimal: "$PreCOVIDAvgRatings.ValueForMoney" },
        OverallRating: { $toDecimal: "$PreCOVIDAvgRatings.OverallRating" }
      },
      PostCOVIDAvgRatings: {
        SeatComfort: { $toDecimal: "$PostCOVIDAvgRatings.SeatComfort" },
        StaffService: { $toDecimal: "$PostCOVIDAvgRatings.StaffService" },
        FoodnBeverages: { $toDecimal: "$PostCOVIDAvgRatings.FoodnBeverages" },
        InflightEntertainment: { $toDecimal: "$PostCOVIDAvgRatings.InflightEntertainment" },
        ValueForMoney: { $toDecimal: "$PostCOVIDAvgRatings.ValueForMoney" },
        OverallRating: { $toDecimal: "$PostCOVIDAvgRatings.OverallRating" }
      }
    }
  }
])
