const fs = require('fs'), process = require('process');
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/* TODO’s:
   * Type (talk, workshop, break, etc.)
   * Day change furigana (!!)
   * Time zone change!!
   * Title cards ...
   * Prettify presentations JSON before writing it out
   * Dichotomy
   * Equivalent of break with forEach?
   * Timer for current
   * Write to presentations.dat after reformatting!
   * Rename to whats-on.html */

const parseDatabase = (datafile) => {
  const database = fs.readFileSync(datafile, 'utf8');
  let data = [{ }];

  database.split("\n").forEach((line) => {
    if (line === '') {
      data.unshift({ });
      return;
    }

    const chunks = line.split(':');
    const key = chunks.shift();
    const value = chunks.join(':').trim();
    if (key === 'slides') data[0][key] = value.split(',');
    else data[0][key] = value;
  });

  return data.filter((entry) => {
    return entry.title;
  }).sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
};

const formatDuration = ((duration) => {
  if (duration < HOUR) {
    return `${duration / MINUTE} minutes`;
  };

  const hours = Math.floor(duration / HOUR);
  const remainder = duration - hours * HOUR;

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainder ? formatDuration(remainder) : ''}` 
});

const formatData = (data) => {
  let dataFormatted = '';
  let nextTalkTime;
  data.forEach((pres) => {
    if (!pres.time) return;
    const thisTalkTime = Date.parse(pres.time);

    if (/^Break,/.test(pres.title)) {
      klass = 'accordion-break';
      const duration = nextTalkTime - thisTalkTime;
      pres.title = `Break, ${formatDuration(duration)}`.trim();
    } else {
      klass = 'accordion';
    }

    dataFormatted = `</button>
      <div class="panel">
      <p>
      ${pres.abstract}
      </p>
      </div>\n\n` + dataFormatted;

    if (pres.sources) {
      dataFormatted = `<a href="${pres.sources}"><img src="assets/img/tgz.png" height="24" alt="Sources" /></a>\n` + dataFormatted;
    }

    if (pres.slides) {
      pres.slides.forEach((slidesFile) => {
        dataFormatted = `<a class="presLink" href="${slidesFile}"><img class="presLink" src="assets/img/Slides.png" alt="Slides" /></a>\n` + dataFormatted;
      });
    }

    if (pres.preprint) {
      dataFormatted = `<a class="pdfLink" href="${pres.preprint}"><img src="assets/img/PDF_24.png" alt="Preprint"/></a>` + dataFormatted;
    }

    dataFormatted = `<font class="serif">${pres.title}</font>\n` + dataFormatted;

    if (pres.author) dataFormatted = `| ${pres.author} ` + dataFormatted;

    dataFormatted = `<button class="${klass}" id="${pres.time}">
      <span class="timeboxL" data-datetime="${pres.time}"></span>\n` + dataFormatted;

    nextTalkTime = thisTalkTime;
  });

  console.log(data);
  fs.writeFileSync('presentations.js', `const presentations = ${JSON.stringify(data, null, 2)}\n`, 'utf8');

  return dataFormatted;
};

const writeout = (environment) => {
  const inSchedule = fs.readFileSync('program.html.in', 'utf8');
  const outSchedule = inSchedule.replace(
                        '<list-of-presentations />',
                        formatData(parseDatabase('pres.dat')));
  fs.writeFileSync('program.html', outSchedule, 'utf8');
}

/*
const data = parseDatabase('pres.dat');
for (let i in data) { console.log('i =', i, ', data[i] =', data[i]); } // “let in data” valid??
for (let j in data) { // but “let i data” invalid :-P
  const i = parseInt(j);
  console.log('i = ', i, ', data[i] =', data[i], ', data[i+1] =', data[i+1]);
}
*/

writeout();
