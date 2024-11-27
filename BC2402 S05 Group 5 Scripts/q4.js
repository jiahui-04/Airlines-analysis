// Q4
// [flight_delay] For each month, which route has the most instances of delays? 
// TIP: What are the first and last dates in the data?

db.flight_delay.aggregate([
    {$addFields:
            {Month: {$month: {$dateFromString: {dateString: "$Date", format: "%d-%m-%Y"}}}, 
            Route: {$concat: ["$Origin", " - ", "$Dest"]}}
    },
    {$match: 
            {$or:
                [{CarrierDelay: {$gt: 0}},
                {WeatherDelay: {$gt: 0}},
                {NASDelay: {$gt: 0}},
                {SecurityDelay: {$gt: 0}},
                {LateAircraftDelay: {$gt: 0}}]
            }
    },
    {$group: // group by month and route
            {_id: {Month: "$Month", Route: "$Route"},
            DelayCount: {$sum: 1}} 
    },
    {$sort: {"DelayCount": -1}}, 
    {$group: 
            {_id: "$_id.Month", 
            Route: {$first: "$_id.Route"}, 
            DelayCount: {$first: "$DelayCount"}} 
    },
    {$sort: {"_id": 1}},
    {$project:
            {Month: "$_id", 
            Route: 1, 
            DelayCount: 1, 
            _id: 0}
    }
])