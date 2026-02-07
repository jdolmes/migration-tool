-- Query to get all unique unit groups from the database
SELECT DISTINCT
    unit_group as "Unit Group Code",
    unit_group_title as "Unit Group Title",
    COUNT(DISTINCT code) as "Number of Occupations",
    CASE 
        WHEN unit_group IN ('1111', '2613', '2621') THEN '✅ DONE'
        ELSE '⏳ Pending'
    END as "Status",
    CASE 
        WHEN unit_group IN ('1111', '2613', '2621') THEN 'Yes'
        ELSE 'No'
    END as "SQL Generated",
    CASE 
        WHEN unit_group IN ('1111', '2613', '2621') THEN 'Yes'
        ELSE 'No'
    END as "Imported to Supabase",
    '' as "Notes",
    CONCAT(
        'https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/',
        SUBSTRING(unit_group, 1, 1), '/',
        SUBSTRING(unit_group, 1, 2), '/',
        SUBSTRING(unit_group, 1, 3), '/',
        unit_group
    ) as "ABS URL"
FROM occupations
WHERE unit_group IS NOT NULL 
  AND catalogue_version = 'v2022'
GROUP BY unit_group, unit_group_title
ORDER BY unit_group;
