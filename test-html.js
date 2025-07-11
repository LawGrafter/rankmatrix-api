const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeHTML() {
  const url = 'https://cdn3.digialm.com//per/g26/pub/32912/touchstone/AssessmentQPHTMLMode1//32912O2542/32912O2542S1D1/17466113789011594/135120030013_32912O2542S1D1E1.html';
  
  try {
    console.log('Fetching HTML...');
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    console.log('HTML loaded successfully');
    console.log('Document title:', $('title').text());
    
    // Check for common patterns
    console.log('\n=== Checking for spans with labels ===');
    $('span').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 50) {
        console.log(`Span ${i}: "${text}"`);
      }
    });
    
    console.log('\n=== Checking for tables ===');
    $('table').each((i, table) => {
      const tableClass = $(table).attr('class');
      const tableId = $(table).attr('id');
      console.log(`Table ${i}: class="${tableClass}", id="${tableId}"`);
      
      // Check first few rows
      $(table).find('tr').slice(0, 3).each((j, row) => {
        const cells = $(row).find('td, th');
        if (cells.length > 0) {
          const rowText = cells.map((k, cell) => $(cell).text().trim()).get().join(' | ');
          console.log(`  Row ${j}: ${rowText}`);
        }
      });
    });
    
    console.log('\n=== Checking for divs with specific content ===');
    $('div').each((i, div) => {
      const text = $(el).text().trim();
      if (text.includes('Candidate') || text.includes('Roll') || text.includes('Exam') || text.includes('Subject')) {
        console.log(`Div ${i}: "${text.substring(0, 100)}..."`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

analyzeHTML(); 