# Q7
# [airlines_reviews] Airline seasonality.
# For each Airline and Class, display the averages of SeatComfort, FoodnBeverages, InflightEntertainment, ValueForMoney,
# and OverallRating for the seasonal and non-seasonal periods, respectively.

SELECT 
    Airline,
    Class,
    CASE
        WHEN MONTH(STR_TO_DATE(CONCAT('01-', MonthFlown), '%d-%b-%y')) IN (6, 7, 8, 9) THEN 'Seasonal'
# Convert the MonthFlown field to date form and extract the month 
        ELSE 'Non-Seasonal'
    END AS SeasonalPeriod,
    AVG(SeatComfort) AS AvgSeatComfort,
    AVG(FoodnBeverages) AS AvgFoodnBeverages,
    AVG(InflightEntertainment) AS AvgInflightEntertainment,
    AVG(ValueForMoney) AS AvgValueForMoney,
    AVG(OverallRating) AS AvgOverallRating
FROM
    airlines_reviews
GROUP BY Airline, Class, SeasonalPeriod
ORDER BY Airline, Class, SeasonalPeriod ASC;

