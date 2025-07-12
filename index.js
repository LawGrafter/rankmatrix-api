const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json()); // to parse application/json

// Analyze Route – For Answer Key Parser
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const result = {
      name: '',
      rollNumber: '',
      examDate: '',
      examTime: '',
      subject: '',
      testCenter: '',
      questions: [],
      sectionSummary: [],
    };

    $('table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        if (label.includes('participant name')) result.name = value;
        else if (label.includes('participant id')) result.rollNumber = value;
        else if (label.includes('test date')) result.examDate = value;
        else if (label.includes('test time')) result.examTime = value;
        else if (label.includes('subject')) result.subject = value;
        else if (label.includes('test center')) result.testCenter = value;
      }
    });

    const sections = {};
    let currentSection = 'Unknown';

    $('.section-lbl, .rw').each((i, elem) => {
      const $elem = $(elem);

      if ($elem.hasClass('section-lbl')) {
        const label = $elem.find('.bold').first().text().trim();
        if (label) currentSection = label;
        return;
      }

      if (!$elem.hasClass('rw')) return;

      const questionText = $elem.find('.questionRowTbl td').eq(1).text().trim();
      if (!questionText) return;

      const options = {};
      let correctAnswer = '';
      let chosenAnswer = '';

      $elem.find('.questionRowTbl tr').each((j, row) => {
        const optionCell = $(row).find('td').eq(1);
        const rawText = optionCell.text().trim();
        const match = rawText.match(/^([A-D])\.\s*(.*)$/);
        if (match) {
          const option = match[1];
          const text = match[2];
          options[option] = text;

          if (optionCell.find('img[src*="tick.png"]').length) {
            correctAnswer = option;
          }
        }
      });

      const chosen = $elem.find('td:contains("Chosen Option")').next().text().trim();
      if (chosen) chosenAnswer = chosen;

      const isCorrect = correctAnswer === chosenAnswer;

      if (!sections[currentSection]) {
        sections[currentSection] = {
          section: currentSection,
          total: 0,
          right: 0,
          wrong: 0,
          marks: 0,
        };
      }

      sections[currentSection].total++;
      if (isCorrect) {
        sections[currentSection].right++;
        sections[currentSection].marks++;
      } else {
        sections[currentSection].wrong++;
      }

      result.questions.push({
        section: currentSection,
        questionText,
        options,
        correctAnswer,
        chosenAnswer,
        isCorrect,
      });
    });

    result.sectionSummary = Object.values(sections);

    return res.json(result);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch or analyze answer key.' });
  }
});

// New Generic JSON Echo Route (for JSON Sender Tool)
app.all('/api/echo', (req, res) => {
  console.log('📩 Received API Call');
  res.status(201).json({
    method: req.method,
    body: req.body,
    message: 'Request received and echoed back successfully.',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
