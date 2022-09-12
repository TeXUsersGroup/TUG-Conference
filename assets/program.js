"use strict";
function toggleAll() {
    var acc = document.getElementsByClassName("accordion");
    var count = acc.length
    var open = 0;
    for (let i = 0; i < count; i++) {
        open += 1 ? acc[i].nextElementSibling.style.display == "block" : 0
    }
    for (var i = 0; i < acc.length; i++) {
        var panel = acc[i].nextElementSibling;
        if (open == count) {
            if (acc[i].classList.contains("active"))
                acc[i].classList.toggle("active");
            panel.style.display = "none";
        } else {
            if (!acc[i].classList.contains("active"))
                acc[i].classList.toggle("active");
            panel.style.display = "block";
        }
    }
}

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

$(document).ready(function () {
    const timezoneInput = document.getElementById('yourTimeZone')

    timezoneInput.oninput = function () {
        if (this.value === "") {
            return;
        }

        // Ignore if the value is not in the list of timezones
        if (!moment.tz.names().includes(this.value)) {
            return;
        }

        setDefaultTimezone(this.value);
    }

    timezoneInput.onchange = function () {
        // Handle empty value (user cleared the input box).
        if (this.value === "") {
            this.value = moment.tz.guess();
            // Trigger 'input' event, so the new value will be handled
            this.dispatchEvent(new Event('input'));
        }
    }

    /**
     * 1. Sets the given timezone as the default for moment.tz
     * 2. Stores this timezone in local storage as 'preferredTimezone'
     * 3. Reformat all dates on the page.
     */
    function setDefaultTimezone(newTimezone) {
        moment.tz.setDefault(newTimezone);
        localStorage.setItem('preferredTimezone', newTimezone);
        formatDatetimes();
    }

    const poshletClasses = ".latex, .tex, .xetexwithsub, .xetex, .xesomething";

    function displayUserTimezone() {
        var preferredTimezone = localStorage.getItem('preferredTimezone');
        var tzString = preferredTimezone || moment.tz.guess();
        moment.tz.setDefault(tzString);
        timezoneInput.value = tzString;
    }

    function displayUserTime() {
        // For Civilian Time:
        //timeString = moment().format('LTS');
        var timeString = moment().format('H:mm:ss A');
        $('#yourTime').html(timeString);
    }

    /**
     * Goes through all items (sessions) and marks the 'current' one as "active-session".
     * This would affect its appearance (blinking background)
     */
    function markActiveSession() {
        var prevSession = {};

        var now = getCurrentMoment();
        $('.timeboxL').each(function (i, e) {
            var $e = $(e);
            var datetime = $e.data('datetime');
            // Skip in case datetime attribute is not there
            if (datetime == null) {
                return true;
            }
            var d = moment(datetime);
            if (prevSession.moment) {
                var isActiveSession = now.isBetween(prevSession.moment, d);
                prevSession.$element.parent().toggleClass("active-session", isActiveSession);
            }
            prevSession = {
                moment: d,
                $element: $e
            }
        });

        // Also check the last session
        if (prevSession.moment) {
            const lastSessionDurationMinutes = 45;
            var endOfSession = prevSession.moment.clone().add(lastSessionDurationMinutes, 'minutes');
            var isActiveSession = now.isBetween(prevSession.moment, endOfSession);
            prevSession.$element.parent().toggleClass("active-session", isActiveSession);
        }
    }

    function getCurrentMoment() {
        // For testing, hardcode current time
        // var now  = moment('2022-07-22T16:03:01Z');
        // var now  = moment('2022-07-24T21:59:01Z');

        // For production, get actual current time
        var now = moment();
        return now;
    }

    function formatDatetimes() {
        // Find all timeboxL elements and display their time.
        $('.timeboxL').each(function (i, e) {
            var $e = $(e);
            var datetime = $e.data('datetime');
            // Skip in case datetime attribute is not there
            if (datetime == null) {
                return true;
            }
            var d = moment(datetime);
            // Format in local time. See: https://momentjs.com/docs/#/displaying/format/
            //var localTimeStr = d.format('llll');
            var localTimeStr = d.format("ddd, D MMM – H:mm A");
            $e.html(localTimeStr);
        });
    }

    displayUserTimezone();
    formatDatetimes();
    // To prevent initial flickering, show user time on load
    displayUserTime();
    setInterval(function () {
        displayUserTime();
        markActiveSession();
    }, 1000);
    togglePoshlets(getPoshletsState());

    function togglePoshlets(enabled) {
        $(poshletClasses).toggleClass("poshlet-enabled", enabled);
    }

    function getPoshletsState() {
        var poshletEnabled = localStorage.getItem('poshletEnabled');
        // Convert the string to boolean
        return (poshletEnabled === 'true');
    }

    $('#toggle-poshlets').click(function (e) {
        var poshletEnabled = !getPoshletsState();
        togglePoshlets(poshletEnabled);
        localStorage.setItem('poshletEnabled', poshletEnabled);
    });
});

{
    const timezones_el = document.getElementById('timezones')
    const all_timezones = moment.tz.names()

    for (const timezone of all_timezones) {
        const option = document.createElement('option')
        option.value = timezone
        timezones_el.appendChild(option)
    }
}