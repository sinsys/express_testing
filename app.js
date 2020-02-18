const express = require('express');
const morgan = require('morgan');
// const open = require('open');

const app = express();

const helpers = {
  toRadians: (deg) => {
    return(
      deg * (Math.PI / 180)
    );
  },
  toDegrees: (rad) => {
    return(
      rad * (180 / Math.PI)
    );
  }
};

app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res
    .status(200)
    .send('Hello Express');
});

app.get('/sum', (req, res) => {
  const { a, b } = req.query;

  if(!a) {
    return(
      res
        .status(400)
        .send('A value for "a" is needed.')
    );
  };

  if(!b) {
    return(
      res
        .status(400)
        .send('A value for "b" is needed.')
    );
  };

  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if( 
    isNaN(numA) || 
    isNaN(numB) 
  ) {
    return(
      res
        .status(400)
        .send('Values for "A" and "B" must be numeric')
    );
  };

  if( numB == 0 ) {
    return(
      res
        .status(400)
        .send('Cannot divide by 0')
    );
  };
  
  // Validation passes - Let's roll

  const answer = numA / numB;

  res
    .send(`${a} divided by ${b} is ${answer}`);
});

app.get('/generate', (req, res) => {
  const { nums } = req.query;

  if( !nums ) {
    return(
      res
        .status(400)
        .send('Query parameter "nums" is required')
    );
  };

  const num = parseInt(nums);

  if( isNaN(num) ) {
    return(
      res
        .status(400)
        .send('Invalid value for query parameter "nums"')
    );
  };

  // Generate Array
  const initial = 
    Array(num)
      .fill(1)
      .map((_, i) => {
        return(
          i + 1
        )
      });

  initial.forEach((e, i) => {
    let random = Math.floor(Math.random() * num);
    let temp = initial[i];
    initial[i] = initial[random];
    initial[random] = temp;
  });

  res
    .status(200)
    .json(initial);
});

app.get('/midpoint', (req, res) => {
  const { 
    lat1, 
    lon1, 
    lat2, 
    lon2 
  } = req.query;

  const rlat1 = helpers.toRadians(lat1);
  const rlon1 = helpers.toRadians(lon1);
  const rlat2 = helpers.toRadians(lat2);
  const rlon2 = helpers.toRadians(lon2);

  const bx = Math.cos(rlat2) * Math.cos(rlon2 - rlon1);
  const by = Math.cos(rlat2) * Math.sin(rlon2 - rlon1);

  const midLat = Math.atan2(
    Math.sin(rlat1) + Math.sin(rlat2),
    Math.sqrt(
      (Math.cos(rlat1) + bx)
      * (Math.cos(rlat1) + bx)
      + by * by
    )
  );
  const midLon = rlon1 + Math.atan2(by, Math.cos(rlat1) + bx);

  res
    .status(200)
    .json({
      lat: helpers.toDegrees(midLat),
      lon: helpers.toDegrees(midLon)
    });

});

app.get('/frequency', (req, res) => {

  const string = decodeURIComponent(req.query.string);

  if( !string ) {
    res
      .status(400)
      .send('You must supply a "string" query');
  };

  if( !typeof string === 'string' ) {
    res
      .status(400)
      .send('The "string" parameter must be a string');
  };

  const split = 
    string
      .toLowerCase()
      .split('');

  const stringAttrs = {
    count: 0,
    highest: ''
  };

  const uniques = {};
  
  split.map(char => {
    if( char !== " " ) {
      (uniques.hasOwnProperty(char))
        ? uniques[char] += 1
        : (uniques[char] = 1,
          stringAttrs.count += 1)
    }
  });

  const unique = Object.keys(uniques);

  stringAttrs.average = stringAttrs.count / unique.length;

  let highestVal = 0;

  unique.forEach(letter => {
    if (uniques[letter] > highestVal) {
      highestVal = uniques[letter];
    }
    stringAttrs[letter] = uniques[letter];
  });

  const ties = [];

  unique.forEach(k => {
    if( uniques[k] === highestVal ) {
      ties.push(k);
    }
  });

  ties.sort();
  stringAttrs.highest = ties[0];

  console.log(stringAttrs);
  res
    .status(200)
    .send(stringAttrs);
});

module.exports = app;