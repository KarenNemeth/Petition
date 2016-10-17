SELECT
    signatures.FirstName,
    signatures.LastName,
    user_profiles.Age,
    user_profiles.City,
    user_profiles.URL
FROM
    signatures
LEFT JOIN user_profiles ON signatures.user_ID = user_profiles.user_ID;
