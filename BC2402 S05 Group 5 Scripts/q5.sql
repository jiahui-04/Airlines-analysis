# Q5 
# [sia_stock] For the year 2023, display the quarter-on-quarter changes in high and low prices and the quarterly average price.

# create quartertable view with different quarters and relevant data
CREATE VIEW QuarterTable 
AS
	SELECT 
		YEAR(StockDate_new) AS Year,
		QUARTER(StockDate_new) AS QuarterNumber, 
		# not MAX(High) or MIN(Low) because they only tell me the extreme values, 
        # and this does not reflect the changes in price accurately
        AVG(High) AS QuarterlyAvgHigh,		 
		AVG(Low) AS QuarterlyAvgLow,
		AVG(Price) AS QuarterlyAvgPrice
	FROM
		(SELECT Price, High, Low, STR_TO_DATE(StockDate,'%m/%d/%Y') AS StockDate_new
		FROM sia_stock
		WHERE STR_TO_DATE(StockDate, '%m/%d/%Y') BETWEEN '2022-10-01' AND '2023-12-31') StockDate_t
	GROUP BY 
		Year, QuarterNumber
	ORDER BY 
		Year, QuarterNumber;

# final answer
SELECT 
	qt1.Year,
    qt1.QuarterNumber,
    (qt1.QuarterlyAvgHigh - qt2.QuarterlyAvgHigh) AS QoQAvgHighChange,
	(qt1.QuarterlyAvgLow - qt2.QuarterlyAvgLow) AS QoQAvgLowChange,
	(qt1.QuarterlyAvgPrice - qt2.QuarterlyAvgPrice) AS QoQAvgPriceChange
FROM
	QuarterTable qt1
LEFT OUTER JOIN
	QuarterTable qt2
ON
	# compare year 2023 quarter 1 with year 2022 quarter 4
	(qt1.Year = qt2.Year + 1 AND qt1.QuarterNumber = 1 AND qt2.QuarterNumber = 4)
    OR (qt1.Year = qt2.Year AND qt1.QuarterNumber = qt2.QuarterNumber + 1)
WHERE qt1.Year = 2023
ORDER BY 
    qt1.Year, qt1.QuarterNumber;  