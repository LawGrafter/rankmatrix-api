module.exports = function parseHaryana($) {
  const result = {
    source: 'haryana',
    name: '',
    rollNumber: '',
    examDate: '',
    examTime: '',
    subject: '',
    testCenter: '',
    questions: [],
    sectionSummary: [],
  };

  // Extract basic candidate details from the main info table
  $('table').each((i, table) => {
    // Look for the table that contains basic info (has Assessment Name, Roll No, etc.)
    const tableText = $(table).text();
    if (tableText.includes('Assessment Name') && tableText.includes('Roll No')) {
      $(table).find('tr').each((j, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim().toLowerCase();
          const value = $(cells[1]).text().trim();

          if (label.includes('applicant name')) result.name = value;
          else if (label.includes('roll no')) result.rollNumber = value;
          else if (label.includes('exam date')) result.examDate = value;
          else if (label.includes('shift')) result.examTime = value;
          else if (label.includes('assessment name')) result.subject = value;
        }
      });
    }
  });

  // Extract questions and sections
  let currentSection = 'Unknown';

  // Iterate through each section container
  $('.section-cntnr').each((i, sectionContainer) => {
    // Extract section title from the section label
    const sectionLabel = $(sectionContainer).find('.section-lbl .bold').text().trim();
    if (sectionLabel) {
      currentSection = sectionLabel;
    }

    // Extract questions from this section
    $(sectionContainer).find('.question-pnl').each((j, questionPanel) => {
      const question = {
        section: currentSection,
        questionText: '',
        options: {},
        correctAnswer: '',
        chosenAnswer: '',
      };

      // Extract question text from the second row, second cell
      const questionText = $(questionPanel).find('.questionRowTbl tr:nth-child(2) td:nth-child(2)').text().trim();
      question.questionText = questionText;

      // Extract options from cells with wrngAns or rightAns classes
      $(questionPanel).find('.wrngAns, .rightAns').each((k, optionCell) => {
        const optionText = $(optionCell).text().trim();
        
        // Check if this is an option (starts with a number)
        if (optionText && optionText.match(/^\d+\./)) {
          const optionNumber = optionText.match(/^(\d+)\./)[1];
          const optionContent = optionText.replace(/^\d+\.\s*/, '');
          question.options[optionNumber] = optionContent;

          // Check if this is the correct answer (has tick.png image)
          const hasTick = $(optionCell).find('img[src*="tick.png"]').length > 0;
          if (hasTick) {
            question.correctAnswer = optionNumber;
          }
        }
      });

      // Extract chosen answer from menu-tbl
      const chosenOptionText = $(questionPanel).find('.menu-tbl tr:last-child td:last-child').text().trim();
      if (chosenOptionText) {
        question.chosenAnswer = chosenOptionText;
      }

      if (question.questionText) {
        result.questions.push(question);
      }
    });
  });

  // Calculate section summary
  const sectionCounts = {};
  result.questions.forEach(q => {
    if (!sectionCounts[q.section]) {
      sectionCounts[q.section] = { total: 0, right: 0, wrong: 0 };
    }
    sectionCounts[q.section].total++;
    if (q.correctAnswer && q.chosenAnswer && q.correctAnswer === q.chosenAnswer) {
      sectionCounts[q.section].right++;
    } else {
      sectionCounts[q.section].wrong++;
    }
  });

  Object.keys(sectionCounts).forEach(section => {
    result.sectionSummary.push({
      section: section,
      total: sectionCounts[section].total,
      right: sectionCounts[section].right,
      wrong: sectionCounts[section].wrong,
      marks: sectionCounts[section].right
    });
  });

  return result;
};
  