// Parsers/supreme.js
module.exports = function parseSupreme($) {
    const result = {
      source: 'supreme',
      name: '',
      rollNumber: '',
      examDate: '',
      examTime: '',
      subject: '',
      testCenter: '',
      questions: [],
      sectionSummary: [],
    };
  
    // Extract metadata
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
  
    // Extract questions
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
    return result;
  };
  