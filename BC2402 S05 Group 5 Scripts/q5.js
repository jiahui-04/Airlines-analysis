// Q5
// [sia_stock] For the year 2023, display the quarter-on-quarter changes in high and low prices and the quarterly average price.

db.sia_stock.aggregate([
  {$addFields: {
      StockDate_new: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}},
      Year: {$year: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}}},
      QuarterNumber: {
        $toInt: {
          $ceil: {
            $divide: [
              {$month: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}}},
              3
            ]
          }
        }
      }
    }
  },
  {
    $match: {
      StockDate_new: {$gte: ISODate("2022-10-01"), $lte: ISODate("2023-12-31")}
    }
  },
  {
    $group: {
      _id: {Year: "$Year", QuarterNumber: "$QuarterNumber"},
      QuarterlyAvgHigh: {$avg: "$High"},
      QuarterlyAvgLow: {$avg: "$Low"},
      QuarterlyAvgPrice: {$avg: "$Price"}
    }
  },
  {
    $sort: {"_id.Year": 1, "_id.QuarterNumber": 1}
  },
  {
    $lookup: {
      from: "sia_stock",
      let: {currYear: "$_id.Year", currQuarter: "$_id.QuarterNumber"},
      pipeline: [
        {
          $addFields: {
            StockDate_new: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}},
            Year: {$year: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}}},
            QuarterNumber: {
              $toInt: {
                $ceil: {
                  $divide: [
                    {$month: {$dateFromString: {dateString: "$StockDate", format: "%m/%d/%Y"}}},
                    3
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $or: [
                {$and: [{$eq: ["$Year", {$add: ["$$currYear", -1]}]}, {$eq: ["$QuarterNumber", 4]}]},
                {$and: [{$eq: ["$Year", "$$currYear"]}, {$eq: ["$QuarterNumber", {$add: ["$$currQuarter", -1]}]}]}
              ]
            }
          }
        },
        {
          $group: {
            _id: {Year: "$Year", QuarterNumber: "$QuarterNumber"},
            QuarterlyAvgHigh: {$avg: "$High"},
            QuarterlyAvgLow: {$avg: "$Low"},
            QuarterlyAvgPrice: {$avg: "$Price"}
          }
        }
      ],
      as: "PreviousQuarter"
    }
  },
  {
    $project: {
      _id: 1,
      QoQAvgHighChange: {
        $subtract: [
          "$QuarterlyAvgHigh",
          {$arrayElemAt: ["$PreviousQuarter.QuarterlyAvgHigh", 0]}
        ]
      },
      QoQAvgLowChange: {
        $subtract: [
          "$QuarterlyAvgLow",
          {$arrayElemAt: ["$PreviousQuarter.QuarterlyAvgLow", 0]}
        ]
      },
      QoQAvgPriceChange: {
        $subtract: [
          "$QuarterlyAvgPrice",
          {$arrayElemAt: ["$PreviousQuarter.QuarterlyAvgPrice", 0]}
        ]
      }
    }
  },
  {
    $match: {"_id.Year": 2023}
  },
  {
    $sort: {"_id.Year": 1, "_id.QuarterNumber": 1}
  }
])