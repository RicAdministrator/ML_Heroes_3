const Joi = require('joi');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const { Pool } = require('pg');
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "12345678",
    database: "ml_heroes",
    port: 5432
});

// roles > create
app.post('/api/roles', async (req, res) => {
    const { error } = validateRole(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const selectRoleQuery = `SELECT * FROM roles WHERE role = $1`;
    try {
        const result = await pool.query(selectRoleQuery, [req.body.role]);
        if (result.rows.length > 0) {
            return res.status(400).send({ error: "Role already exists" });
        } else {
            const sql = `
                INSERT INTO roles (role, logo_url, primary_function, key_attributes)
                VALUES ($1, $2, $3, $4)
                RETURNING id, role, logo_url, primary_function, key_attributes
            `;
            const values = [
                req.body.role,
                req.body.logo_url,
                req.body.primary_function,
                req.body.key_attributes
            ];
            const resultInsert = await pool.query(sql, values);
            res.send(resultInsert.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// roles > retrieve all
app.get('/api/roles', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM roles ORDER BY role");
        res.send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// roles > update by id
app.put('/api/roles/:id', async (req, res) => {
    const { error } = validateRole(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const sql = `
        UPDATE roles
        SET role = $1, logo_url = $2, primary_function = $3, key_attributes = $4
        WHERE id = $5
        RETURNING id, role, logo_url, primary_function, key_attributes
    `;
    const values = [
        req.body.role,
        req.body.logo_url,
        req.body.primary_function,
        req.body.key_attributes,
        parseInt(req.params.id)
    ];
    try {
        const result = await pool.query(sql, values);
        res.send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// roles > delete by id
app.delete('/api/roles/:id', async (req, res) => {
    const sql = "DELETE FROM roles WHERE id = $1";
    try {
        await pool.query(sql, [parseInt(req.params.id)]);
        res.send("Role deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// heroes > create
app.post('/api/heroes', async (req, res) => {
    console.log('req.body:', req.body);

    // return the id to be used for hero_roles insertion
    const sql = `
        INSERT INTO heroes (name, image_url, description)
        VALUES ($1, $2, $3)
        RETURNING id, name, image_url, description
    `;

    const values = [
        req.body.name,
        req.body.image_url,
        req.body.description
    ];
    try {
        const result = await pool.query(sql, values);
        const heroId = result.rows[0].id;
        const roles = req.body.roles || [];
        if (roles.length > 0) {
            const heroRolesValues = roles.map(roleId => `(${heroId}, ${roleId})`).join(',');
            console.log(heroRolesValues);
            const sqlHeroRoles = `INSERT INTO hero_roles (hero_id, role_id) VALUES ${heroRolesValues}`;
            console.log(sqlHeroRoles); // e.g INSERT INTO hero_roles (hero_id, role_id) VALUES (9, 3),(9, 2)
            await pool.query(sqlHeroRoles);
        }
        res.send({
            id: heroId,
            name: req.body.name,
            image_url: req.body.image_url,
            roles: req.body.rolesDisplay,
            description: req.body.description
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// heroes > retrieve all
app.get('/api/heroes', async (req, res) => {
    const sql = `
        SELECT
            h.id,
            h.name,
            h.image_url,
            tbl.roles,
            h.description
        FROM
            heroes h
            INNER JOIN (
                SELECT
                    hero_id,
                    STRING_AGG(r.role, ' / ' ORDER BY r.role) AS roles
                FROM
                    hero_roles hr
                    INNER JOIN roles r ON hr.role_id = r.id
                GROUP BY hero_id
            ) tbl ON h.id = tbl.hero_id
    `;
    try {
        const result = await pool.query(sql);
        res.send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// heroes > update by id
app.put('/api/heroes/:id', async (req, res) => {
    const sql = `
        UPDATE heroes
        SET name = $1, image_url = $2, description = $3
        WHERE id = $4
        RETURNING id, name, image_url, description
    `;
    const values = [
        req.body.name,
        req.body.image_url,
        req.body.description,
        parseInt(req.params.id)
    ];
    try {
        await pool.query(sql, values);

        const selectedRoles = req.body.roles || [];
        if (selectedRoles.length > 0) {
            // Delete old roles
            await pool.query("DELETE FROM hero_roles WHERE hero_id = $1", [parseInt(req.params.id)]);
            // Insert new roles
            const heroRolesValues = selectedRoles.map(roleId => `(${parseInt(req.params.id)}, ${roleId})`).join(',');
            const sqlHeroRoles = `INSERT INTO hero_roles (hero_id, role_id) VALUES ${heroRolesValues}`;
            await pool.query(sqlHeroRoles);
        }
        res.send({
            id: req.params.id,
            name: req.body.name,
            image_url: req.body.image_url,
            roles: req.body.rolesDisplay,
            description: req.body.description
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// heroes > delete by id
app.delete('/api/heroes/:id', async (req, res) => {
    const sql = "DELETE FROM heroes WHERE id = $1";
    try {
        await pool.query(sql, [parseInt(req.params.id)]);
        res.send("Hero deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// hero_roles > retrieve all
app.get('/api/hero_roles', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM hero_roles");
        res.send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function validateRole(role) {
    const schema = Joi.object({
        role: Joi.string().max(50).required(),
        logo_url: Joi.string().max(150).allow(''),
        primary_function: Joi.string().max(150).allow(''),
        key_attributes: Joi.string().max(150).allow('')
    });

    return schema.validate(role);
}