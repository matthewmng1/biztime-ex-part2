const request = require('supertest');
const app = require('../app');
const { createData } = require("../_test-common");
const db = require('../db');

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", () => {
  test("Get a list with invoices", async () => {
    const res = await request(app)
      .get('/invoices')
    expect(res.body).toEqual(
      { "invoices" : [
        {id: 1, comp_code: "apple"},
        {id: 2, comp_code: "apple"},
        {id: 3, comp_code: "ibm"}
      ]
    });
  })
});

describe("GET /1", () => {
  test("Gets invoice information", async () => {
    const res = await request(app)
      .get(`/invoices/1`)

    expect(res.body).toEqual(
      { 
        "invoice": {
          id: 1,
          amt: 100,
          add_date: '2018-01-01T08:00:00.000Z',
          paid: false,
          paid_date: null,
          company: {
            code: "apple",
            name: "Apple", 
            description: "Maker of OSX."
          }
        }
      });
  });
  test("Responds with 404 for invalid invoice", async () => {
    const res = await request(app)
      .get(`/invoices/0`)
    expect(res.statusCode).toBe(404);
  })
})

describe("POST /invoices", () => {
  test("Creates a new invoice", async () => {
    const res = await request(app)
      .post('/invoices')
        .send({ comp_code: 'ibm', amt: 400 });

        expect(res.body).toEqual(
          { 
            "invoice": {
              id: 4,
              comp_code: "ibm",
              amt: 400,
              add_date: expect.any(String),
              paid: false,
              paid_date: null,
            }
    })
  });
});

describe("PATCH /", () => {
  test("Updates an invoice", async () => {
    const res = await request(app)
      .patch(`/companies/1`)
      .send({ amt: 2000, paid: false});

    expect(res.body).toEqual(
      {
        "invoice": {
          id: 1,
          comp_code: 'apple',
          paid: false,
          amt: 2000,
          add_date: expect.any(String),
          paid_date: null
        }        
      }
    );
  });

  test("Returns 404 for no invoice", async ()=>{
    const res = await request(app)
      .patch("/invoices/0")
      .send({amt:4000});
    expect(res.status).toEqual(404);
  })

  test("Returns 500 for no data", async ()=>{
    const res = await request(app)
      .patch("/invoices/1")
      .send({});

    expect(res.status).toEqual(500);
  })
})

describe("DELETE /", () => {
  test("Deletes a single invoices", async () => {
    const res = await request(app)
      .delete(`/invoices/1`);

      expect(res.body).toEqual({ msg: 'DELETED!' })
  });

  test("It should return 404 for no such invoice", async () => {
    const res = await request(app)
        .delete("/invoices/0");

    expect(res.status).toEqual(404);
  });
})