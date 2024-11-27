# Q2
# [customer_suppport] For each category, display the number of records that contained
# colloquial variation and offensive language.

-- delete those flags that are not in the right flags format --
Create View cleanedFlagsTable AS
SELECT 
	*
FROM 
	cleanedCategoryTable
WHERE 
	flags REGEXP '^[A-Z]+$';
-- display the number of rows with offensive and colloquial words under each category --
SELECT
	cleanedCategory,
	COUNT(*) AS numOfRecords
FROM
	cleanedFlagsTable
WHERE
	flags LIKE "%Q%"
    AND flags LIKE "%W%"
GROUP BY
	cleanedCategory;