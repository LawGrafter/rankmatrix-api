// routes/analyze.js
const cheerio = require('cheerio');
const parseSupreme = require('../Parsers/supreme');
const parseHaryana = require('../Parsers/haryana');

module.exports = function analyze(html) {
  const $ = cheerio.load(html);

  // Detect if it's Haryana format
  const isHaryana = $('td:contains("Assessment Name")').length > 0;

  if (isHaryana) {
    return parseHaryana($);
  }

  // Default to Supreme Court format
  return parseSupreme($);
};
