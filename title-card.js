let presentation = { };
const NEXT = 'next', CURRENT = 'current';
const REAL = 'real', TEST = 'test';
let time;
let talk;

const DAY = 86_400_000;

const setEnvironment = () => {
  const queryParams = { };
  window.location.search.substring(1).split('&').forEach((param) => {
    const keyvalue = param.split('=');
    queryParams[keyvalue[0]] = keyvalue[1];
  });
  time = queryParams['time'] === TEST ? TEST : REAL;
  talk = queryParams['talk'] === CURRENT ? CURRENT : NEXT;
}

setEnvironment();

function format(num) {
  if (num < 10) return '0' + String(num);
  else return String(num);
}

function setTalk() {
  let timeOffset = 0;
  let currentPresentation, nextPresentation;

  if (time === TEST) {
    const now = new Date();
    const month = format(1 + now.getUTCMonth());
    const day = format(now.getUTCDate()); // getUTCDay() returns day of the week!
    const toParse = `${now.getUTCFullYear()}-${month}-${day}T00:00:00Z`;
    const midnightUTCBeforeNow = Date.parse(toParse);
    timeOffset = Date.parse('2021-08-07T00:00:00Z') - midnightUTCBeforeNow
  }

  let nextIsCurrent = false;
  presentations.every((pres) => {
    let now = Date.now() + timeOffset;
    if (Date.parse(pres.time) < now) {
      if (nextIsCurrent) {
        currentPresentation = pres;
        nextIsCurrent = false;
      }
      return false;
    }

    nextPresentation = pres;
    nextIsCurrent = true;

    return true;
  });
  presentation = talk === CURRENT ? { ...currentPresentation } : { ...nextPresentation };
  presentation.time = nextPresentation.time;
  document.querySelector('#next-or-current').innerHTML = talk;
  const speaker = document.querySelector('#speaker');
  const title = document.querySelector('#title');
  speaker.innerHTML = presentation.author || '';
  title.innerHTML = presentation.title;
}

setTalk();
setInterval(setTalk, 10_000);

/*
function animate() {
  // Wrap every letter in a span
  var textWrapper = document.querySelector('#speaker');
  textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

  anime.timeline({loop: true})
    .add({
      targets: '#speaker .letter',
      opacity: [0,1],
      easing: "easeInOutQuad",
      duration: 2250,
      delay: (el, i) => 150 * (i+1)
    }).add({
      targets: '#speaker',
      opacity: 0,
      duration: 1000,
      easing: "easeOutExpo",
      delay: 1000
    });
}
*/

var hoursContainer = document.querySelector('.hours');
var minutesContainer = document.querySelector('.minutes');
var secondsContainer = document.querySelector('.seconds');
var tickElements = Array.from(document.querySelectorAll('.tick'))

var last = new Date(0);

function updateTime() {
  var timeOfTalk = Date.parse(presentation.time);
  const diff = timeOfTalk - Date.now();
  /* We cheat by pretending the duration is a date.  It works! */
  var now = new Date(diff);

  var lastHours = last.getUTCHours().toString();
  var nowHours = now.getUTCHours().toString();
  if (lastHours !== nowHours) updateContainer(hoursContainer, nowHours);

  var lastMinutes = last.getUTCMinutes().toString();
  var nowMinutes = now.getUTCMinutes().toString();
  if (lastMinutes !== nowMinutes) updateContainer(minutesContainer, nowMinutes);

  var lastSeconds = last.getUTCSeconds().toString();
  var nowSeconds = now.getUTCSeconds().toString();
  if (lastSeconds !== nowSeconds) updateContainer(secondsContainer, nowSeconds);

  last = now;
}

function tick () {
  tickElements.forEach(t => t.classList.toggle('tick-hidden'));
}

function updateContainer(container, newTime) {
  var time = newTime.split('');

  if (time.length === 1) time.unshift('0');

  var first = container.firstElementChild;
  if (first.lastElementChild.textContent !== time[0]) updateNumber(first, time[0]);

  var last = container.lastElementChild;
  if(last.lastElementChild.textContent !== time[1]) updateNumber(last, time[1]);
}

function updateNumber (element, number) {
  var second = element.lastElementChild.cloneNode(true);
  second.textContent = number;

  element.appendChild(second);
  element.classList.add('move');

  setTimeout(function() { element.classList.remove('move') }, 990);
  setTimeout(function() { element.removeChild(element.firstElementChild) }, 990);
}

setInterval(updateTime, 100);
