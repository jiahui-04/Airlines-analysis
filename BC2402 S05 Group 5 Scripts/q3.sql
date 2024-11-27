# Q3 
# [flight_delay] For each airline, display the instances of cancellations and delays.

SELECT 
    Airline,
    SUM(DelayCount) AS DelayCount,
    SUM(CancellationCount) AS CancellationCount
FROM (
    SELECT 
        Airline,
        COUNT(*) AS DelayCount,
        0 AS CancellationCount
    FROM 
        flight_delay
    WHERE 
        ArrDelay > 0 OR DepDelay > 0
        OR CarrierDelay > 0 OR WeatherDelay > 0
        OR NASDelay > 0 OR SecurityDelay > 0
        OR LateAircraftDelay > 0
    GROUP BY 
        Airline
    UNION ALL
    SELECT 
        Airline,
        0 AS DelayCount,
        COUNT(*) AS CancellationCount
    FROM 
        flight_delay
    WHERE 
        CancellationCode = 'Y' OR Cancelled = 1
    GROUP BY 
        Airline
) AS Combined
GROUP BY 
    Airline;
