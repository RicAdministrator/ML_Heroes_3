SELECT * FROM heroes;

SELECT * FROM roles;

SELECT 
	hr.id,
	h.name,
	r.role
FROM 
	hero_roles hr INNER JOIN
	heroes h ON hr.hero_id = h.id INNER JOIN
	roles r ON hr.role_id = r.id