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
    if (key === 'author' || key === 'slides' || key === 'preprint' || key === 'sources' || key === 'links' || key === 'videos') data[0][key] = value.split(',');
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

    if (pres.pres === 'break') {
      klass = 'accordion-break';
      const duration = nextTalkTime - thisTalkTime;
      pres.title = `Break, ${formatDuration(duration)}`.trim();
    } else {
      klass = 'accordion';
    }

    dataFormatted = `</h2>
      <div class="panel">
      <p>
      ${pres.abstract}
      </p>
      </div>\n\n` + dataFormatted;

    if (pres.videos) {
      pres.videos.forEach((videosFile) => {
        dataFormatted = `<a class="presLink" href="${videosFile}"><img class="presLink" src="assets/img/video.png" alt="Video" /></a>\n` + dataFormatted;
      });
    }

    if (pres.links) {
      pres.links.forEach((linksFile) => {
        dataFormatted = `<a class="presLink" target="_blank" href="${linksFile}"><img class="presLink" src="assets/img/external-link-symbol-24.png" alt="Link" /></a>\n` + dataFormatted;
      });
    }

    // Copy input files (sources, slides, preprint) and add links to them in the HTML
    if (pres.pres != 'break') {
      copyInputFiles(pres, 'sources').forEach((path) => {
        dataFormatted = `<a href="${path}"><img src="assets/img/tgz.png" height="24" alt="Sources" /></a>\n` + dataFormatted;
      });

      copyInputFiles(pres, 'slides').forEach((path) => {
        dataFormatted = `<a class="presLink" href="${path}"><img class="presLink" src="assets/img/Slides.png" alt="Slides" /></a>\n` + dataFormatted;
      });

      copyInputFiles(pres, 'preprint').forEach((path) => {
        dataFormatted = `<a class="pdfLink" href="${path}"><img src="assets/img/PDF_24.png" alt="Preprint"/></a>` + dataFormatted;
      });
    }

    dataFormatted = `<font class="serif">${pres.title}</font>\n` + dataFormatted;

//    if (pres.author) dataFormatted = `| ${pres.author} ` + dataFormatted;
    if (pres.author) {
      const authorsLine = new Intl.ListFormat('en-GB', { style: 'short', type: 'conjunction' }).format(pres.author);
            dataFormatted = `| ${authorsLine} ` + dataFormatted;
    }
    dataFormatted = `<h2 class="${klass}" id="${pres.time}">
      <span class="timeboxL" data-datetime="${pres.time}"></span>\n` + dataFormatted;

    nextTalkTime = thisTalkTime;
  });

  //console.log(data);
  fs.writeFileSync('presentations.js', `const presentations = ${JSON.stringify(data, null, 2)}\n`, 'utf8');

  return dataFormatted;
};

/**
 * Given a file name and the presentation record, get the long name for this file.
 * The returned string represents only the file name itself (not the path).
 * 
 * @param {Object} pres 
 * @param {String} fileName 
 * @returns the long file name
 */
 const getLongFileName = (pres, fileName) => {
  const authors = pres.author;
  let normalizedAuthorsList = [];
  
  pres.author.forEach((author) => {
    normalizedAuthorsList.push(normalizeAuthorName(author));
  });
  const normalizedAuthorsString = normalizedAuthorsList.join("-");

  return `${normalizedAuthorsString}-TUG2022-${pres.pres}-${fileName}`;
}

const normalizeAuthorName = (author) => {
  return author.replaceAll(" ", "_");
}

/**
 * Copy all files from the given 'assetType' directory into the 'served' folder.
 * The files are named based on their authors.
 * 
 * @param {*} pres the presentation record
 * @param {*} assetType the asset type (sources / slides / preprint), which corresponds to a sub-folder under the 'tag' folder
 * @returns list of the copied files (paths of their new file names)
 */
const copyInputFiles = (pres, assetType) => {
  const incomingTagDir = `assets/incoming/${pres.pres}`
  const incomingAssetTypeDir = `${incomingTagDir}/${assetType}`;

  // Create the incoming asset-type folder, if it doesn't exist
  createDirIfNotExists(incomingTagDir);
  createDirIfNotExists(incomingAssetTypeDir);

  let destPaths = [];
  fs.readdirSync(incomingAssetTypeDir).forEach(file => {
    const destFileName = getLongFileName(pres, file);
    const destPath = `assets/served/${destFileName}`;
    // Copy the file to the 'served' folder
    fs.copyFile(`${incomingAssetTypeDir}/${file}`, destPath, (err) => {
      if (err) {
        console.log("Error copying file:", err);
      }
    });
    destPaths.push(destPath);
  });
  return destPaths;
}

const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const writeout = (environment) => {
  createDirIfNotExists("assets/served");
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
