const { expect } = require('chai');
const supertest = require('supertest');

const app = require('../app');

describe('Express App', () => {
  
  it('should return a message from GET /', () => {
    return(
      supertest(app)
        .get('/')
        .expect(200, 'Hello Express')
    )
  });
  
});

describe('GET /sum', () => {
  
  it('8 / 4 should be 2', () => {
    return(
      supertest(app)
        .get('/sum')
        .query({
          a: 8,
          b: 4
        })
        .expect(
          200, 
          '8 divided by 4 is 2'
        )
    ); 
  });

  it('should return 400 if "a" is missing', () => {
    return(
      supertest(app)
        .get('/sum')
        .query({
          b: 4
        })
        .expect(
          400,
          'A value for "a" is needed.'
        )
    );
  });

  it('should return 400 if "b" is missing', () => {
    return(
      supertest(app)
        .get('/sum')
        .query({
          a: 4
        })
        .expect(
          400,
          'A value for "b" is needed.'
        )
    );
  });

});

describe('GET /generate', () => {
  
  it('should generate an array of 5', () => {
    return(
      supertest(app)
        .get('/generate')
        .query({
          nums: 5
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {

          expect(res.body)
            .to.be.an('array');

          expect(res.body)
              .to.be.an('array')
              .that.have.members([
                1, 2, 3, 4, 5
              ]);
        })
    );
  });

});

describe('GET /midpoint', () => {

  it('should find a midpoint between NY and LA', () => {

    const query = {
      lat1: 40.6976701, // NY
      lon1: -74.2598674, // NY
      lat2: 34.0207305, // LA
      lon2: -118.6919221 // LA
    };

    // somewhere near Aurora, Kansas
    const expected = {
      lat: 39.50597300917347,
      lon: -97.51789156106972
    };    

    return(
      supertest(app)
        .get('/midpoint')
        .query(query)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {

          expect(res.body)
            .to.have.all.keys('lat', 'lon');

          expect(res.body)
            .to.eql(expected);
        })
    );
  });

});

describe('GET /frequency', () => {
  
  it('should contain count, average, and highest', () => {

    const query = {
      string: encodeURIComponent("Testing a string")
    };

    return(
      supertest(app)
        .get('/frequency')
        .query(query)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
  
          expect(res.body)
            .to.include.all.keys(
              'count',
              'average',
              'highest'
            );
        })
    )
  });

  it('should not add spaces as a key', () => {

    const query = {
      string: encodeURIComponent("abc e")
    };

    const expected = {
      count: 4,
      highest: "a",
      average: 1,
      a: 1,
      b: 1,
      c: 1,
      e: 1
    }

    return(
      supertest(app)
        .get('/frequency')
        .query(query)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body)
            .to.eql(expected);
        })
    );
  });

});