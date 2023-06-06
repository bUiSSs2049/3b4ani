const express = require('express');
const { get } = require('axios');
const { load } = require('cheerio');

const app = express();
app.set('view engine', 'ejs');

let validEmails = [];
const fetchPageInnerText = async (url) => {
  try {
    const response = await get(url);
    const $ = load(response.data);
    const innerText = $('body').text();
    findEmails(innerText)
    function findEmails(text) {
      var words = text.split(' ');
      var emails = [];
    
      words.forEach((word) => {
        if (word !== '') {
          if (word.includes('\n')) {
            word.split('\n').forEach((line) => {
              words.push(line);
            });
          }
        }
      });
    
      words.forEach((word) => {
        if (word !== '') {
          if (word.includes('@') && !word.includes('\n')) {
            var username = word.split('@')[0];
            var dot = word.split('.')[1];
            if (username !== '' && word.split('@')[1].includes('.') && dot !== '') {
              var countMap = {};
              var countMap1 = {};
    
              // Count occurrences of each item
              word.split('').forEach((item) => {
                countMap[item] = (countMap[item] || 0) + 1;
              });
    
              // Count occurrences of each item
              word.split('').forEach((item) => {
                countMap1[item] = (countMap1[item] || 0) + 1;
              });
    
              var elementToCheck = '.';
              var elementToCheck1 = '@';
              var count = 0;
              var count1 = 0;
    
              if (countMap.hasOwnProperty(elementToCheck)) {
                count = countMap[elementToCheck];
              }
    
              if (countMap1.hasOwnProperty(elementToCheck1)) {
                count1 = countMap1[elementToCheck1];
              }
    
              if (count === 1 && count1 === 1) {
                const email = word;
                emails.push(email);
              }
            }
          }
        }
      });
    
      var uniqueEmails = [...new Set(emails)];
      uniqueEmails.forEach((email) => {
          function validateWord(word) {
            var regex = /^[a-zA-Z0-9]+$/;
            return regex.test(word);
          }
          if ( validateWord(email.split('@')[0]) && validateWord(email.split('.')[1]) && validateWord(email.split('@')[1].split(".")[0]) ){
            validEmails.push(email)
          }
      });
    }
    return validEmails;
  } catch (error) {
    console.error('Error fetching page inner text:', error);
    return '';
  }
};



app.get('/Search/:query', (req, res) => {
  const webpageURL = 'https://www.bing.com/search?q=' + req.params.query + '&first=';
  validEmails = [];

  const fetchPromises = [];

  for (let n = 1; n < 90; n++) {
    const url = webpageURL + n;
    fetchPromises.push(fetchPageInnerText(url));
  }

  Promise.all(fetchPromises)
    .then((results) => {
      const allEmails = results.flat();
      res.render('data', { validEmails: allEmails, webpageURL });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.render('data', { validEmails: [], webpageURL: '' });
    });
});

app.get('/', (req, res) => {
  res.render('index')

});




app.listen(3000 || process.env.PORT , () => {
  console.log('Server listening on port 3000');
});
