const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`
      SELECT * 
      FROM invoices`);
    return res.json({ "invoices":results.rows })
  } catch (e) {
    return next(e);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const invResults = await db.query(`
      SELECT id, amt, paid, add_date, paid_date 
      FROM invoices 
      WHERE id=$1`, 
    [req.params.id])

    const compResults = await db.query(`
      SELECT * 
      FROM companies 
      INNER JOIN invoices 
      ON companies.code = invoices.comp_code 
      WHERE invoices.id = $1`, 
    [req.params.id])

    if(invResults.rows.length===0) {
      throw new ExpressError(`Can't find invoice with id of ${req.params.id}`, 404)
    } 
    
    const invoice = invResults.rows[0]
    const { code, name, description } = compResults.rows[0]

    return res.send ({ "invoice": invoice , "company": {code, name, description}})
  } catch (e) {
    return next(e);
  }
})

// POST /invoices
// Adds an invoice.

// Needs to be passed in JSON body of: {comp_code, amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(`
      INSERT INTO invoices (comp_code, amt) 
      VALUES ($1, $2) 
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
    [comp_code, amt])
    
    return res.status(201).json({ "invoice" : results.rows[0]})
  } catch (e) {
    return next(e);
  }
})
// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid
      FROM inoices
      WHERE id = $1`
    [id]);

    if(currResult.rows.length === 0){
      throw new ExpressError(`No invoice with id of ${id}`, 404)
    }

    const currPaidDate = currResult.rows[0].paid_date;
    
    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null
    } else {
      paidDate = currPaidDate;
    }

    const results = await db.query(`
      UPDATE invoices 
      SET amt=$1, paid=$2, paid_date=$3
      WHERE id=$4 
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
    [amt, paid, paidDate, id])

    if (results.rowCount.length===0){
      throw new ExpressError(`Cannot update invoice with id of ${id}`, 404)
    }

    return res.send({"invoice" : results.rows[0]})
  } catch (e) {
    return next(e);
  }
})

// DELETE /invoices/[id]
// Deletes an invoice.

// If invoice cannot be found, returns a 404.

// Returns: {status: "deleted"}

router.delete('/:id', async (req, res, next) => {
  try {
    const results = db.query(`
      DELETE FROM invoices 
      WHERE id=$1
      RETURNING id`, 
    [req.params.id])

    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice with id of ${id}`, 404);
    }

    return res.send({msg: 'DELETED!'})
  } catch (e) {
    return next(e);
  }
})


module.exports = router;