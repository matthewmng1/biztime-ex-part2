const request = require('supertest');

const app = require('../app');
const { createData } = require("../_test-common")
const db = require('../db');

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", () => {
  test("Get list of companies", async () => {
    const res = await request(app).get('/companies')
    expect(res.body).toEqual({
      "companies":[
        {code:"apple", name:"Apple", description:"Maker of OSX."},
        {code:"ibm", name:"IBM", description:"Big Blue."}
      ]
    } )
  })
})

describe("GET /apple", () => {
  test("Returns company information", async () => {
    const res = await request(app).get(`/companies/apple}`)
    
    expect(res.body).toEqual(
      { 
        "company": {
          code: "apple",
          name: "Apple",
          description: "Maker of OSX.",
          invoice: [1, 2]} })
  })

  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).get(`/companies/nothinghere`)
    expect(res.statusCode).toBe(404);
  })
})

describe("POST /", () => {
  test("Creates a company", async () => {
    const res = await request(app)
      .post('/companies')
      .send({ 
        name: 'Dell', 
        description: 'Computer Maker' });

    expect(res.body).toEqual({
      "company": { 
        code: 'dell', 
        name: 'Dell', 
        description: 'Computer Maker'
      }
    });
  });
  test("Return 500 for conflict", async () => {
    const res = await request(app)
      .post("/companies")
      .send({name: "Apple", description: "iPhones & iPads"});
    expect(res.status).toEqual(500);
  })
});


describe("PATCH /companies/:code", () => {
  test("Updates a company", async () => {
    const res = await request(app)
      .patch(`/companies/apple`)
      .send({ 
        name: 'Apple Inc.', 
        description: 'Steve Jobs!'});
    
    expect(res.body).toEqual({
      "company": {
        code: "apple", 
        name: 'Apple Inc.', 
        description: 'Steve Jobs!'}
    })
  })
  test("Return 500 for no data", async () => {
    const res = await request(app)
      .patch("/companies/apple")
      .send({});
    expect(res.status).toEqual(500)
  })
})

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app)
      .delete(`/companies/apple`);

    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
  test("Return 404 for does not exist", async () => {
    const res = await request(app)
      .delete("/companies/nothinghere");
    expect(res.status).toEqual(404);
  })
})