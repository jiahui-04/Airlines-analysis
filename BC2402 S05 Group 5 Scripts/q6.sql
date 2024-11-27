# Q6
# [customer_booking] For each sales_channel and each route, display the following ratios
	# average length_of_stay / average flight_hour
	# average wants_extra_baggage / average flight_hour
	# average wants_preferred_seat / average flight_hour
	# average wants_in_flight_meals / average flight_hour
# Our underlying objective: Are there any correlations between flight hours, length of stay, and various preferences 
# (i.e., extra baggage, preferred seats, in-flight meals)?


## to change flight_hour = “0” to “24” so the midnight flights can be included 
Create View cleaned_customer_booking AS
SELECT
    num_passengers,
    sales_channel,
    trip_type,
    purchase_lead,
    length_of_stay,
    (CASE
		WHEN flight_hour = 0 THEN 24
	ELSE flight_hour
    END) AS flight_hour,
    flight_day,
    route,
    booking_origin,
    wants_extra_baggage,
    wants_preferred_seat,
    wants_in_flight_meals,
    flight_duration, 
    booking_complete
FROM
	customer_booking;


## to display ratio for each sales_channel and each route     
SELECT
	sales_channel,
    route,
	AVG(length_of_stay)/AVG(flight_hour) AS 'lenghtofstay/flighthour',
    AVG(wants_extra_baggage)/AVG(flight_hour) AS 'wantsextrabaggage/flighthour',
    AVG(wants_preferred_seat)/AVG(flight_hour) AS 'wantspreferredseat/flighthour',
    AVG(wants_in_flight_meals)/AVG(flight_hour) AS 'wantsinflightmeals/flighthour'
FROM
	cleaned_customer_booking
GROUP BY
sales_channel,
    route;


## to find the correlation between flight hour and other stats
WITH flight_hour_table AS (
    SELECT
        flight_hour,
        AVG(length_of_stay) AS avg_length_of_stay,
        AVG(wants_extra_baggage) AS avg_extra_baggage,
        AVG(wants_preferred_seat) AS avg_preferred_seat,
        AVG(wants_in_flight_meals) AS avg_in_flight_meals
    FROM
        cleaned_customer_booking
    GROUP BY
       flight_hour
)
SELECT
    flight_hour,
    avg_length_of_stay,
    avg_extra_baggage,
    avg_preferred_seat,
    avg_in_flight_meals
FROM
    flight_hour_table
ORDER BY
   flight_hour;
