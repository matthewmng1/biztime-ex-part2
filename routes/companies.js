const express = require("express");
const slugify = require("slugify")
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT * FROM companies`);

    return res.json( {"companies" : results.rows} )
  } catch (e) {
    return next(e);
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const compResults = await db.query(`
      SELECT * 
      FROM companies 
      WHERE code = $1`, 
    [req.params.code])
    
    const invResults = await db.query(`
      SELECT * 
      FROM invoices 
      WHERE comp_code= $1`, 
    [req.params.code])

    if(compResults.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} does not exist`, 404)
    }
    const { code, name, description } = compResults.rows[0]
    const invoice = invResults.rows
    return res.send ({ "company": {code,name,description, invoice: [invoice]} })
  } catch (e) {
    return next(e);
  }
})

router.post('/', async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = slugify(name, {lower: true})

    const results = await db.query(`
      INSERT INTO companies (code, name, description) 
      VALUES ($1, $2, $3) 
      RETURNING code, name, description`, 
    [code, name, description])

    return res.status(201).json({ "company" : results.rows[0]})
  } catch (e) {
    return next(e);
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(`
      UPDATE companies 
      SET name=$1, description=$2 
      WHERE code=$3 
      RETURNING code, name, description`, 
    [name, description, code])

    if (results.rows.length===0){
      throw new ExpressError(`Company with code of ${code} does not exist`, 404)
    } else {
    return res.send({"company" : results.rows[0]})
    }
  } catch (e) {
    return next(e);
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const results = db.query(`
      DELETE FROM companies 
      WHERE code=$1
      RETURNING code`, 
    [req.params.code])
    if(results.rows.length === 0 ){
      throw new ExpressError(`Company with code of ${code} does not exist`, 404)
    } else {
    return res.send({msg: 'DELETED!'})
    }
  } catch (e) {
    return next(e);
  }
})

module.exports = router;