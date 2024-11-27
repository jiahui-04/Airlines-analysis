# Q4
# [flight_delay] For each month, which route has the most instances of delays? 
# TIP: What are the first and last dates in the data?

SELECT DISTINCT
    (STR_TO_DATE(Date, '%d-%m-%Y'))
FROM
    flight_delay; # to find out first and last dates 

SELECT 
    Month,
    Route,
    DelayCount
FROM (
    SELECT 
        MONTH(STR_TO_DATE(Date, '%d-%m-%Y')) AS Month,
        CONCAT(Origin, ' - ', Dest) AS Route,
        COUNT(*) AS DelayCount,
        ROW_NUMBER() OVER (PARTITION BY MONTH(STR_TO_DATE(Date, '%d-%m-%Y')) ORDER BY COUNT(*) DESC) AS RowNum
        # gives a unique row number within each month, ordered by the delay count
        # route with the highest delay count for each month will get RowNum = 1
    FROM 
        flight_delay
    WHERE 
        CarrierDelay > 0 OR WeatherDelay > 0
        OR NASDelay > 0 OR SecurityDelay > 0 OR LateAircraftDelay > 0
    GROUP BY 
        Month, Route
) AS fd
WHERE 
    RowNum = 1
ORDER BY 
    Month;
    