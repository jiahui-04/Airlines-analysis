// Q6
// [customer_booking] For each sales_channel and each route, display the following ratios
//      - average length_of_stay / average flight_hour
//      - average wants_extra_baggage / average flight_hour
//      - average wants_preferred_seat / average flight_hour
//      - average wants_in_flight_meals / average flight_hour 
// Our underlying objective: Are there any correlations between flight hours, length of stay, and various preferences (i.e., extra baggage, preferred seats, in-flight meals)?


// to change flight_hour = “0” to “24” so the midnight flights can be included 
db.customer_booking.aggregate([
  {$addFields: 
      {flight_hour: 
        {$cond: {if: {$eq: ["$flight_hour", 0]}, then: 24, else: "$flight_hour"}}
    }
  },
  {$project: 
      {num_passengers: 1,
      sales_channel: 1,
      trip_type: 1,
      purchase_lead: 1,
      length_of_stay: 1,
      flight_hour: 1,
      flight_day: 1,
      route: 1,
      booking_origin: 1,
      wants_extra_baggage: 1,
      wants_preferred_seat: 1,
      wants_in_flight_meals: 1,
      flight_duration: 1,
      booking_complete: 1}
  },
  {$out: "cleaned_customer_booking"}
])


// to display ratio for each sales_channel and each route
db.cleaned_customer_booking.aggregate([
  {$group: 
      {_id: 
        {sales_channel: "$sales_channel",
        route: "$route"},
      avgLengthOfStay: {$avg: "$length_of_stay"},
      avgFlightHour: {$avg: "$flight_hour"},
      avgWantsExtraBaggage: {$avg: "$wants_extra_baggage"},
      avgWantsPreferredSeat: {$avg: "$wants_preferred_seat"},
      avgWantsInFlightMeals: {$avg: "$wants_in_flight_meals"}}
  },
  {$project: 
      {sales_channel: "$_id.sales_channel",
      route: "$_id.route",
      _id: 0, 
      lengthofstay_flight_hour: { $divide: ["$avgLengthOfStay", "$avgFlightHour"]},
      wantsextrabaggage_flight_hour: { $divide: ["$avgWantsExtraBaggage", "$avgFlightHour"]},
      wantspreferredseat_flight_hour: { $divide: ["$avgWantsPreferredSeat", "$avgFlightHour"]},
      wantsinflightmeals_flight_hour: { $divide: ["$avgWantsInFlightMeals", "$avgFlightHour"]}}
  }
])


// to find the correlation between flight hour and other stats
db.cleaned_customer_booking.aggregate([
  {$group: 
      {_id: "$flight_hour", 
      avg_length_of_stay: {$avg: "$length_of_stay"},
      avg_extra_baggage: {$avg: "$wants_extra_baggage"},
      avg_preferred_seat: {$avg: "$wants_preferred_seat"},
      avg_in_flight_meals: {$avg: "$wants_in_flight_meals"}}
  },
  {$project:
      {_id: 0, 
      flight_hour: "$_id", 
      avg_length_of_stay: 1,
      avg_extra_baggage: 1,
      avg_preferred_seat: 1,
      avg_in_flight_meals: 1}
  },
  {$sort: {flight_hour: 1}}
])

