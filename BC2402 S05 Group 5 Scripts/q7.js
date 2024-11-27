// Q7
// [airlines_reviews] Airline seasonality.
// For each Airline and Class, display the averages of SeatComfort, FoodnBeverages, InflightEntertainment, ValueForMoney,
// and OverallRating for the seasonal and non-seasonal periods, respectively.
   
db.airlines_reviews.aggregate([
    {
        // Extract the month part from MonthFlown
        $addFields: {
            Month: {
                $arrayElemAt: [
                    { $split: ["$MonthFlown", "-"] },
                    0
                ]
            }
        }
    },
    {
        // Convert the month into numerical form 
        $addFields: {
            MonthNumber: {
                $switch: {
                    branches: [
                        { case: { $eq: ["$Month", "Jan"] }, then: 1 },
                        { case: { $eq: ["$Month", "Feb"] }, then: 2 },
                        { case: { $eq: ["$Month", "Mar"] }, then: 3 },
                        { case: { $eq: ["$Month", "Apr"] }, then: 4 },
                        { case: { $eq: ["$Month", "May"] }, then: 5 },
                        { case: { $eq: ["$Month", "Jun"] }, then: 6 },
                        { case: { $eq: ["$Month", "Jul"] }, then: 7 },
                        { case: { $eq: ["$Month", "Aug"] }, then: 8 },
                        { case: { $eq: ["$Month", "Sep"] }, then: 9 },
              { case: { $eq: ["$Month", "Oct"] }, then: 10 },
                        { case: { $eq: ["$Month", "Nov"] }, then: 11 },
                        { case: { $eq: ["$Month", "Dec"] }, then: 12 }
                    ],
                    default: null
                }
            }
        }
    },
    {
        // Define SeasonalPeriod based on MonthNumber
        $addFields: {
            SeasonalPeriod: {
                $cond: [
                    { $in: ["$MonthNumber", [6, 7, 8, 9]] },
                    "Seasonal",
                    "Non-Seasonal"
                ]
            }
        }
    },
    {
        // Project the necessary fields
        $project: {
            Airline: 1,
            Class: 1,
            SeatComfort: 1,
            FoodnBeverages: 1,
            InflightEntertainment: 1,
            ValueForMoney: 1,
            OverallRating: 1,
            SeasonalPeriod: 1
        }
    },
    {
        // Group by Airline, Class, and SeasonalPeriod
        $group: {
    _id: {
                airline: "$Airline",
                class: "$Class",
                seasonalPeriod: "$SeasonalPeriod"
            },
            avgSeatComfort: { $avg: "$SeatComfort" },
            avgFoodnBeverages: { $avg: "$FoodnBeverages" },
            avgInflightEntertainment: { $avg: "$InflightEntertainment" },
            avgValueForMoney: { $avg: "$ValueForMoney" },
            avgOverallRating: { $avg: "$OverallRating" }
        }
    },
    {
        // Project the fields in a user-friendly form
        $project: {
            _id: 0, // Hide the _id field
            Airline: "$_id.airline",
            Class: "$_id.class",
            SeasonalPeriod: "$_id.seasonalPeriod",
            AvgSeatComfort: "$avgSeatComfort",
            AvgFoodnBeverages: "$avgFoodnBeverages",
            AvgInflightEntertainment: "$avgInflightEntertainment",
            AvgValueForMoney: "$avgValueForMoney",
            AvgOverallRating: "$avgOverallRating"
        }
    },
    {
        // Sort by Airline, Class, and SeasonalPeriod
        $sort: {
            Airline: 1, // Sort by airline first (ascending)
            Class: 1,   // Sort by class within each airline
            SeasonalPeriod: 1 // Sort by seasonal period
        }
    }
])



