// Q3
// [flight_delay] For each airline, display the instances of cancellations and delays.
   
db.flight_delay.aggregate([
    {
        $facet: {
            cancellations: [
                { $match: { "Cancelled": 1 } },
                { $group: { _id: "$Airline", cancellations: { $sum: 1 } } }
            ],
            delays: [
                { $match: { $or: [{ "ArrDelay": { $gt: 0 } }, { "DepDelay": { $gt: 0 } },  {"CarrierDelay": { $gt: 0 } },  
                    {"WeatherDelay": { $gt: 0 } }, {"NASDelay": { $gt: 0 } }, {"SecurityDelay": { $gt: 0 } }, {"LateAircraftDelay": { $gt: 0 } }] } },
                { $group: { _id: "$Airline", delays: { $sum: 1 } } }
            ]
        }
    },
    {
        $project: {
            data: { $concatArrays: ["$cancellations", "$delays"] }
        }
    },
    {
        $unwind: "$data"
    },
    {
        $group: {
            _id: "$data._id",
            cancellations: { $sum: "$data.cancellations" },
            delays: { $sum: "$data.delays" }
        }
    }
]) 
