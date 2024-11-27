# Q8
# *Open-ended question; [airlines_reviews] What are the common complaints?
# For each Airline and TypeofTraveller, list the top 5 common issues.

# create ar_quatitative view, with average ratings, group by airline, typeoftraveller and recommendedtype
CREATE VIEW ar_quantitative AS
	SELECT 
		ar.Airline, 
		ar.TypeofTraveller, 
		ar.Recommended AS RecommendedType,
		AVG(ar.SeatComfort) AS AvgSeatComfort,
		AVG(ar.StaffService) AS AvgStaffService,
		AVG(ar.FoodnBeverages) AS AvgFoodnBeverages,
		AVG(ar.InflightEntertainment) AS AvgInflightEntertainment,
		AVG(ar.ValueForMoney) AS AvgValueForMoney,
		AVG(ar.OverallRating) AS AvgOverallRating,
		COUNT(*) AS RecommendedTypeCount
	FROM 
		airlines_reviews ar
	GROUP BY 
		ar.Airline, ar.TypeofTraveller, ar.Recommended;


# create badReviews_t
# bad reviews are defined to include the reviews with individual ratings being less than or equal to the average ratings
CREATE VIEW badReviews_t AS
	SELECT 
		ar.Airline,
		ar.TypeofTraveller,
		ar.Recommended AS RecommendedType,
		ar.Title,
		ar.Verified,
		ar.Reviews,
		(ar.SeatComfort - arq.AvgSeatComfort) AS DiffSeatComfort,
		(ar.StaffService - arq.AvgStaffService) AS DiffStaffService,
		(ar.FoodnBeverages - arq.AvgFoodnBeverages) AS DiffFoodnBeverages,
		(ar.InflightEntertainment - arq.AvgInflightEntertainment) AS DiffInflightEntertainment,
		(ar.ValueForMoney - arq.AvgValueForMoney) AS DiffValueForMoney,
		(ar.OverallRating - arq.AvgOverallRating) AS DiffOverallRating
	FROM 
		airlines_reviews ar
	LEFT OUTER JOIN 
		ar_quantitative arq
	ON 
		ar.Airline = arq.Airline 
		AND ar.TypeofTraveller = arq.TypeofTraveller
		AND ar.Recommended = arq.RecommendedType
	WHERE 
		ar.SeatComfort <= arq.AvgSeatComfort OR
		ar.StaffService <= arq.AvgStaffService OR
		ar.FoodnBeverages <= arq.AvgFoodnBeverages OR
		ar.InflightEntertainment <= arq.AvgInflightEntertainment OR
		ar.ValueForMoney <= arq.AvgValueForMoney OR
		ar.OverallRating <= arq.AvgOverallRating;


# create keywords_t table to insert keywords that highlight commons issues 
CREATE TABLE keywords_t (
    KeywordID INT AUTO_INCREMENT PRIMARY KEY,
    Keyword VARCHAR(100),
    Category VARCHAR(50) 
);

INSERT INTO keywords_t (Keyword, Category) VALUES
    # keywords for SeatComfort
    ('seat', 'SeatComfort'), # 1
    ('uncomfortable', 'SeatComfort'), # 2
    ('legroom', 'SeatComfort'), # 3 
    ('recline', 'SeatComfort'), # 4
    ('footrest', 'SeatComfort'), # 5
    ('backache', 'SeatComfort'), # 6
    ('padding', 'SeatComfort'), # 7 
    ('narrow', 'SeatComfort'), # 8
	# keywords for StaffService
    ('staff', 'StaffService'), # 9
    ('poor service', 'StaffService'), # 10
	('unprofessional', 'StaffService'),	# 11	
	('luggage', 'StaffService'), # 12
    ('delay', 'StaffService'), # 13
    ('cancel', 'StaffService'), # 14
	# keywords for FoodnBeverages
    ('food', 'FoodnBeverages'), # 15
    ('beverage', 'FoodnBeverages'), # 16
    ('quality', 'FoodnBeverages'), # 17
    ('special', 'FoodnBeverages'), # 18
    # keywords for InflightEntertainment
	('inflight entertainment', 'InflightEntertainment'), # 19
    ('sound', 'InflightEntertainment'), # 20
	('variety', 'InflightEntertainment'), # 21	
	('internet', 'InflightEntertainment'), # 22
    ('remote control', 'InflightEntertainment'), # 23
	('quality', 'InflightEntertainment'),# 24
    # keywords for ValueForMoney
	('money', 'ValueForMoney'), # 25
    ('worth', 'ValueForMoney'); # 26


# create synonyms_t table because different reviews can use different words that imply the same thing
CREATE TABLE synonyms_t (
    SynonymID INT AUTO_INCREMENT PRIMARY KEY,
    KeywordID INT,
    Synonym VARCHAR(100),
    FOREIGN KEY (KeywordID) REFERENCES keywords_t(KeywordID)
);

INSERT INTO synonyms_t (KeywordID, Synonym) VALUES
    # synonyms of keywords of SeatComfort
    (1, 'seating'),
    (2, 'not comfortable'),
    (3, 'leg room'),
    (4, 'lie-flat'), (4, 'lie flat'),
    (5, 'foot'),
    (6, 'back ache'),
    (7, 'cushion'), (7, 'hard'),
    (8, 'tight'), (8, 'cramp'), (8, 'space'),
	# synonyms for keywords of StaffService	
    (9, 'crew'), (9, 'attendant'), (9, 'FA'), (9, 'service'),
    (10, 'poor'), (10, 'bad'), (10, 'disappoint'), (10, 'terrible'), (10, 'worst'), (10, 'nightmare'),
    (11, 'not friendly'), (11, 'unfriendly'), (11, 'unhelpful'), (11, 'inflexible'), (11, 'impolite'), (11, 'robotic'), 
    (11, 'unwilling'), (11, 'not willing'), (11, 'not helpful'), (11, 'no response'), (11, 'no answer'), (11, 'rush'), 
    (11, 'inexperienced'), (11, 'inefficient'), (11, 'responsibility'),
    (12, 'baggage'), (12, 'bag'),
    (13, 'postpone'), 
    (14, 'wrong'), (14, 'mistake'),
    # synonyms for keywords of FoodnBeverages
	(15, 'meal'), (15, 'dish'), (15, 'diet'), (15, 'cook'), (15, 'refreshment'), (15, 'order'), (15, 'breakfast'), (15, 'lunch'), 
    (15, 'dinner'),
    (16, 'drink'), (16, 'wine'), (16, 'water'), (16, 'champagne'),
    (17, 'tasty'), (17, 'tasteless'), (17, 'delicious'), (17, 'bland'), (17, 'flavour'), (17, 'high quality'), (17, 'low quality'), 
    (17, 'tasteless'), 
    (18, 'vegetarian'), (18, 'vegan'), (18, 'gluten'), (18, 'allergy'), (18, 'allergies'),
	# synonyms for keywords of InflightEntertainment
	(19, 'IFE'), (19, 'entertainment'), (19, 'tv'), (19, 'television'), (19, 'screen'), (19, 'device'),
    (20, 'music'), (20, 'headphone'), (20, 'earphone'), 
    (21, 'option'), (21, 'choice'), (21, 'selection'), (21, 'watch'), (21, 'limited'),
    (22, 'wifi'), 
    (23, 'console'), (23, 'remote'),
	(24, 'resolution'), (24, 'reboot'), (24, 'poor'), (24, 'dated'), (24, 'broke'), (24, 'bad'),
	# synonyms for keywords of ValueForMoney
	(25, 'cost'), (25, 'price'), (25, 'paid'),
    (26, 'expensive'), (26, 'not cheap'), (26, 'value'), (26, 'deal'), (26, 'waste');


# create stored procedure to get the top 5 complaints for each airline and each typeoftraveller
DELIMITER $$

CREATE PROCEDURE filtered_complaints(
    IN p_Airline VARCHAR(100), 
    IN p_TypeofTraveller VARCHAR(100)
)
BEGIN
    WITH matched_reviews AS (
        SELECT 
            k.Category,
            k.Keyword,
            br.Airline,
            br.TypeofTraveller,
            COUNT(*) AS Frequency,
            AVG(br.DiffSeatComfort) AS AvgDiffSeatComfort,
            AVG(br.DiffStaffService) AS AvgDiffStaffService,
            AVG(br.DiffFoodnBeverages) AS AvgDiffFoodnBeverages,
            AVG(br.DiffInflightEntertainment) AS AvgDiffInflightEntertainment,
            AVG(br.DiffValueForMoney) AS AvgDiffValueForMoney
        FROM badReviews_t br
        JOIN keywords_t k 
            ON br.Reviews LIKE CONCAT('%', k.Keyword, '%')
        LEFT JOIN synonyms_t s 
            ON k.KeywordID = s.KeywordID 
            AND br.Reviews LIKE CONCAT('%', s.Synonym, '%')
        WHERE 
            br.Verified = 'TRUE' AND
            k.Keyword NOT IN ('seat', 'staff', 'food', 'inflight entertainment', 'money')
        GROUP BY k.Category, k.Keyword, br.Airline, br.TypeofTraveller
    )
    SELECT 
        Airline,
        TypeofTraveller,
        Category,
        Keyword,
        Frequency,
        CASE 
            WHEN Category = 'SeatComfort' THEN AvgDiffSeatComfort
            WHEN Category = 'StaffService' THEN AvgDiffStaffService
            WHEN Category = 'FoodnBeverages' THEN AvgDiffFoodnBeverages
            WHEN Category = 'InflightEntertainment' THEN AvgDiffInflightEntertainment
            WHEN Category = 'ValueForMoney' THEN AvgDiffValueForMoney
            ELSE NULL
        END AS AverageDifference
    FROM matched_reviews
    WHERE
        Airline = p_Airline AND
        TypeofTraveller = p_TypeofTraveller AND
        (
            (Category = 'SeatComfort' AND AvgDiffSeatComfort < 0.2) OR
            (Category = 'StaffService' AND AvgDiffStaffService < 0.2) OR
            (Category = 'FoodnBeverages' AND AvgDiffFoodnBeverages < 0.2) OR
            (Category = 'InflightEntertainment' AND AvgDiffInflightEntertainment < 0.2) OR
            (Category = 'ValueForMoney' AND AvgDiffValueForMoney < 0.2)
        )
    ORDER BY Frequency DESC
    LIMIT 5;
END $$
DELIMITER ;
# the above method may be flawed but I decided that this method may be better than using MATCH() AGAINST()
# MATCH() AGAINST() gives relevance value, which primarily measures how well a review matches the keyword query
# however, it doesn’t directly indicate how significant the issue is as a complaint 
# so I thought that focusing on frequency and average differences in seat comfort ratings may provide more actionable insights 
# into the severity and prevalence of the complaints


# getting the output for each airline and each typeoftraveller
CALL filtered_complaints('Singapore Airlines','Business');
CALL filtered_complaints('Singapore Airlines','Couple Leisure');
CALL filtered_complaints('Singapore Airlines','Family Leisure');
CALL filtered_complaints('Singapore Airlines','Solo Leisure');
CALL filtered_complaints('Qatar Airways','Business');
CALL filtered_complaints('Qatar Airways','Couple Leisure');
CALL filtered_complaints('Qatar Airways','Family Leisure');
CALL filtered_complaints('Qatar Airways','Solo Leisure');
