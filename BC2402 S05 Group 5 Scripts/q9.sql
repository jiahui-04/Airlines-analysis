# Q9
# *Open-ended question; [airlines_reviews] and additional data*
# Are there any systematic differences in customer preferences/complaints pre- and post-COVID specific to Singapore Airlines?

# clean data and remove data that is during COVID-19 (March 2020 to April 2024)
# defined by World Health Organisation
CREATE VIEW sia_review_noncovid AS
    SELECT 
        Title,
        Name,
        Airline,
        Reviews,
        Class,
        TypeofTraveller,
        MonthFlown_month,
        MonthFlown_year,
        CASE
            WHEN MonthFlown_year <= 2020 THEN 'Pre-COVID'
            ELSE 'Post-COVID'
        END AS TimePeriod,
        Route AS OriginalRoute, # keep the original Route for reference
        REPLACE(Route, 'Z?Â¬rich', 'Zurich') AS FixedRoute, # fix the Route data error
        SUBSTRING_INDEX(REPLACE(Route, 'Z?Â¬rich', 'Zurich'), ' to ', -1) AS Destination, # extract the destination
        SeatComfort,
        StaffService,
        FoodnBeverages,
        InflightEntertainment,
        ValueForMoney,
        OverallRating,
        Recommended
    FROM (
        SELECT 
            Title,
            Name,
            ReviewDate,
            Airline,
            Reviews,
            Class,
            TypeofTraveller,
            MonthFlown,
            MONTH(STR_TO_DATE(CONCAT('01-', ar.MonthFlown), '%d-%b-%y')) AS MonthFlown_month,
            YEAR(STR_TO_DATE(CONCAT('01-', ar.MonthFlown), '%d-%b-%y')) AS MonthFlown_year,
            Route,
            SeatComfort,
            StaffService,
            FoodnBeverages,
            InflightEntertainment,
            ValueForMoney,
            OverallRating,
            Recommended
        FROM
            airlines_reviews ar
    ) AS MonthFlown_t
    WHERE
        Airline = 'Singapore Airlines' AND
         (((MonthFlown_year = 2020 AND MonthFlown_month IN (1, 2)) # only Jan-Feb 2020
            OR
            (MonthFlown_year = 2023 AND MonthFlown_month NOT IN (1, 2, 3, 4))) # only May-Dec 2023
        OR MonthFlown_year NOT IN (2021, 2022));


# create destination_t table to map and clean data manually
CREATE TABLE destination_t (
    OriginalName VARCHAR(255),
    StandardisedName VARCHAR(255)
);

INSERT INTO destination_t (OriginalName, StandardisedName)
VALUES
    ('SIN', 'Singapore'),
    ('Singapore', 'Singapore'),
    ('Singaporec', 'Singapore'),
    ('Sinhapore', 'Singapore'),
    ('AMS', 'Amsterdam'),
    ('Amsterdam', 'Amsterdam'),
    ('AKL', 'Auckland'),
    ('HKG', 'Hong Kong'),
    ('Hong Kong', 'Hong Kong'),
    ('SYD', 'Sydney'),
    ('Sydney', 'Sydney'),
    ('BKK', 'Bangkok'),
    ('Bangkok', 'Bangkok'),
    ('DPS', 'Denpasar'),
    ('Denpasar', 'Denpasar'),
    ('Denpasar Bali', 'Denpasar'),
    ('LHR', 'London'),
    ('London', 'London'),
    ('London Heathrow', 'London'),
    ('BNE', 'Brisbane'),
    ('CAN', 'Guangzhou'),
    ('CBR', 'Canberra'),
    ('CCU', 'Kolkata'),
    ('CDG', 'Paris'),
    ('CGK', 'Jakarta'),
    ('ckholm', 'Stockholm'),
    ('Dallas Ft Worth', 'Dallas'),
    ('DEL', 'Delhi'),
    ('DME', 'Moscow'),
	('DXB', 'Dubai'),
    ('FRA', 'Frankfurt'),
    ('GRU', 'Sao Paulo'),
    ('Tokyo Haneda', 'Tokyo'),
    ('Tokyo Narita', 'Tokyo'),
	('Narita', 'Tokyo'),
    ('HND', 'Tokyo'),
    ('IAH', 'Houston'),
    ('SGN', 'Ho Chi Minh'),
    ('Ho Chi Minh City', 'Ho Chi Minh'),
    ('KUL', 'Kuala Lumpur'),
    ('kwi', 'Kuwait'),
	('Lahore VIA \DOHA', 'Lahore'),
    ('LAX', 'Los Angeles'),
    ('MAA', 'Chennai'),
    ('MEL', 'Melbourne'),
    ('MNL', 'Manila'),
    ('MUC', 'Munich'),
    ('MXP', 'Milan'),
    ('n Dulles', 'Washington'),
    ('New York JFK', 'New York'),
    (' New York', 'New York'),
    ('New York JFK', 'New York'),
    ('New York via Frankfurt', 'New York'),
    ('New York via Singapore', 'New York'),
    ('NRT', 'Tokyo'),
    ('Ord', 'Chicago'),
    ('PEK', 'Beijing'),
    ('PER', 'Perth'),
    ('RGN', 'Yangon'),
    ('S?Å“o Paulo', 'Sao Paulo'),
	('Sao Paulo GRU', 'Sao Paulo'),
    ('Seoul Incheon', 'Seoul'),
    ('SFO', 'San Francisco'),
    ('sharjah', 'Sharjah'),
	('SUB', 'Surabaya'),
    ('TRV', 'Trivandrum'),
    ('USM', 'Koh Samui'),
	('diha', 'Doha'),
    ('Qingdoa', 'Qingdao'),
    ('Adelaide via Singapore','Adelaide'),
    ('Ahmedabad via Singapore','Ahmedabad'),
    ('AKL via SIN','Auckland'),
    ('AMS via SIN','Amsterdam'),
    ('Amsterdam via Singapore','Amsterdam'),
    ('Athens via Singapore','Athens'),
    ('Auckland via Singapore','Auckland'),
    ('Bali via Singapore','Bali'),
    ('Bangalore via Melbourne, Singapore','Bangalore'),
    ('Bangalore via Singapore','Bangalore'),
    ('Bangkok via Singapore','Bangkok'),
    ('Barcelona via Singapore','Barcelona'),
    ('Beijing via Singapore','Beijing'),
    ('BKK via NRT / SIN','Bangkok'),
    ('BKK via SIN','Bangkok'),
	('Brisbane via Singapore','Brisbane'),
    ('Cairns via Singapore','Cairns'),
    ('Canberra via Sydney','Canberra'),
    ('Cape Town via Singapore','Cape Town'),
    ('CCU via SIN','Kolkata'),
    ('CDG via SIN','Paris'),
    ('CGK via SIN','Jakarta'),
    ('Christchurch via Singapore','Christchurch'),
    ('Coimbatore via Singapore','Coimbatore'),
    ('Colombo via Singapore','Colombo'),
    ('Copenhagen via Singapore','Copenhagen'),
    ('DEL via SIN','Delhi'),
    ('Delhi via Singapore','Delhi'),
    ('Denpasar via Singapore','Denpasar'),
    ('Dhaka via Singapore','Dhaka'),    
	('DME via SIN','Moscow'),
    ('DPS via SIN','Bali'),
    ('Dubai via Singapore','Dubai'),
    ('Dublin via Munich','Dublin'),
    ('Dusseldorf via Singapore','Dusseldorf'),
    ('Frankfurt via Singapore','Frankfurt'),
    ('Fukuoka via Singapore','Fukuoka'),
    ('Haneda via Singapore','Tokyo'),
    ('Hanoi via Singapore','Hanoi'),
    ('HKG via SIN','Hong Kong'),
    ('HND via SIN','Tokyo'),
    ('Ho Chi Minh City via Singapore','Ho Chi Minh'),
    ('Ho Chi Minh via Singapore','Ho Chi Minh'),
    ('Hong Kong via Singapore','Hong Kong'),
    ('IAH via MAN','Houston'),    
    ('Istanbul via Singapore','Istanbul'),
    ('Jakarta via Singapore','Jakarta'),
    ('Jakarta via Tokyo, Singapore','Jakarta'),
    ('Johannesburg via Singapore','Johannesburg'),
    ('Kansai via Singapore','Kansai'),
    ('Kochi via Singapore','Kochi'),
    ('Koh Samui via Singapore','Koh Samui'),
    ('Kolkata via Singapore','Kolkata'),
    ('Kuala Lumpur via Singapore','Kuala Lumpur'),
    ('LHR via SIN','London'),
    ('London  via Singapore','London'),
    ('London via Singapore','London'),
    ('Los Angeles via Incheon', 'Los Angeles'),
	('Los Angeles via Narita', 'Los Angeles'),
    ('Los Angeles via Singapore', 'Los Angeles'),
	('Los Angeles via Singapore and Seoul', 'Los Angeles'), 
	('Los Angeles via Tokyo', 'Los Angeles'),
    ('MAA via SIN','Chennai'),
    ('Makassar via Singapore','Makassar'),
	('Manchester via Singapore','Manchester'),
    ('Manila via Milan / Singapore','Manila'),
    ('Manila via Singapore','Manila'),
    ('MEL via SIN','Melbourne'),
    ('Melbourne via Singapore','Melbourne'),
    ('MUC via SIN','Munich'),
    ('Mumbai via Melbourne / Singapore','Mumbai'),
    ('Mumbai via Singapore','Mumbai'),
    ('Munich via Singapore','Munich'),
    ('MXP via SIN','Milan'),
    ('New Delhi via Singapore','Delhi'),
    ('NRT via SIN','Narita'),
    ('Paris via Singapore','Paris'),
    ('PEK via PER','Beijing'),
    ('PEK via SiN','Beijing'),    
	('Penang via Rome','Penang'),
    ('Penang via Singapore','Penang'),
    ('Perth via Singapore','Perth'),
    ('Phuket via Singapore','Phuket'),
    ('Qingdoa via Singapore','Qingdao'),
    ('San Francisco via Hong Kong','San Francisco'),
    ('San Francisco via Singapore','San Francisco'),
    ('Seattle via Singapore','Seattle'),
    ('Seoul Incheon via Singapore','Seoul'),
    ('Seoul via Singapore','Seoul'),
    ('SFO via HKG','San Francisco'),
    ('SGN via SIN','Ho Chi Minh'),
    ('Shanghai via Singapore','Shanghai'),
    ('SIN via HKG','Singapore'),
    ('SIN via JNB','Singapore'),    
	('SIN via MAN','Singapore'),
    ('Singapore via Canberra','Singapore'),
    ('Singapore via Frankfurt','Singapore'),
    ('Singapore via Hong Kong','Singapore'),
    ('Singapore via Johannesburg','Singapore'),
    ('Singapore via Melbourne','Singapore'),
    ('Singapore via Moscow','Singapore'),
    ('Singapore via Sydney','Singapore'),
    ('Stockholm via Moscow','Singapore'),
    ('SUB via SIN','Surabaya'),
    ('Surabaya via Singapore','Surabaya'),
    ('SYD via SIN','Sydney'),
	('Sydney via Singapore','Sydney'),
    ('Tokyo Narita via Singapore','Tokyo'),
    ('Tokyo via Singapore','Tokyo'),
    ('Toronto via Incheon','Tokyo'),
    ('Trivandrum via Singapore','Trivandrum'),
    ('TRV via SIN','Trivandrum'),
    ('USM via SIN','Ko Samui'),
	('Vientiane via Singapore','Vientiane'),
    ('Zagreb via Singapore / Frankfurt','Zagreb'),
    ('Zurich via Singaphore','Zurich'),
    ('Zurich via Singapore','Zurich');


# find out the changes in preferences in destinations with SIA pre- and post-COVID
CREATE VIEW cleaned_destination_t AS
SELECT 
    COALESCE(d.StandardisedName, sr.Destination) AS CleanedDestination, # match standardised names or fall back to the extracted destination
    SUM(CASE WHEN sr.TimePeriod = 'Pre-COVID' THEN 1 ELSE 0 END) AS PreCOVIDCount,
    SUM(CASE WHEN sr.TimePeriod = 'Post-COVID' THEN 1 ELSE 0 END) AS PostCOVIDCount
FROM 
    sia_review_noncovid sr
LEFT JOIN 
    destination_t d 
ON 
    LOWER(TRIM(sr.Destination)) = LOWER(TRIM(d.OriginalName)) # match cleaned destination names to the standard mapping
GROUP BY 
    CleanedDestination
ORDER BY 
    CleanedDestination;


# find out the changes in complaints with SIA pre- and post-COVID by looking at ratings
SELECT
	TimePeriod, 
    AVG(SeatComfort) AS AvgSeatComfort,
    AVG(StaffService) AS AvgStaffService,
    AVG(FoodnBeverages) AS AvgFoodnBeverages,
    AVG(InflightEntertainment) AS AvgInflightEntertainment,
    AVG(ValueForMoney) AS AvgValueForMoney,
    AVG(OverallRating) AS AvgOverallRating,
	Recommended AS RecommendedType,
    COUNT(*) AS RecommendedTypeCount
FROM 
	sia_review_noncovid
GROUP BY 
	TimePeriod, RecommendedType;