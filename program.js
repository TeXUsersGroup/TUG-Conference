"use strict";

$(document).ready(function () {
    /**
     * Creates a current 'moment' object, with option to inject a "fake" time, based on requested timestamp as defined
     * in the URL using the 'time' parameter (expected in ISO8601 format).
     * 
     * Examples:
     * 1. ?time=2022-07-22T16:03:01Z
     * 2. ?time=2022-07-22T08:01 (assumes your own timezone)
     */
    class MomentGenerator {
        constructor() {
            this.offsetDuration = null;

            const urlParams = new URLSearchParams(window.location.search);
            const fakeTimeStr = urlParams.get('time')

            if (!fakeTimeStr) {
                return;
            }

            var fakeTime = moment(fakeTimeStr, moment.defaultFormat);
            if (fakeTime.isValid()) {
                // How much needs to be added to current time in order to get to the provided fake date-time.
                this.offsetDuration = moment.duration(fakeTime.diff(moment()));
            }
        }

        /**
         * Get the current moment object.
         * If the 'time' URL parameter was present when the page was loaded, the returned moment will be based on that
         * initial time.
         * 
         * @returns Moment object
         */
        currentMoment() {
            var now = moment();
            if (this.offsetDuration) {
                now.add(this.offsetDuration)
            }
            return now;
        }
    }

    var momentGenerator = new MomentGenerator();

    $(".accordion").click(function(e) {
        var $e = $(this);
        $e.toggleClass("active");
        var panel = $e.next();
        panel.toggle();
    });

    $("#toggle-abstracts").click(function(e) {
        var allOpen = $(".accordion.active").length  == $(".accordion").length;
        $(".accordion").each(function(i, e) {
            var $e = $(e);
            $e.toggleClass("active", !allOpen);
            var panel = $e.next();
            panel.toggle(!allOpen);
        });
    });
    
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
        var timeString = momentGenerator.currentMoment().format('H:mm:ss A');
        $('#yourTime').html(timeString);
    }

    /**
     * Goes through all items (sessions) and marks the 'current' one as "active-session".
     * This would affect its appearance (blinking background)
     */
    function markActiveSession() {
        var prevSession = {};

        var now = momentGenerator.currentMoment();
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

    function togglePoshlets(enabled) {
        $(poshletClasses).toggleClass("poshlet-enabled", enabled);
    }

    function getPoshletsState() {
        var poshletEnabled = localStorage.getItem('poshletEnabled');
        // Convert the string to boolean
        return (poshletEnabled === 'true');
    }

    function addTimezoneOptions() {
        const timezones_el = document.getElementById('timezones')
        const all_timezones = moment.tz.names()
    
        for (const timezone of all_timezones) {
            const option = document.createElement('option')
            option.value = timezone
            timezones_el.appendChild(option)
        }
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
    addTimezoneOptions();

    $('#toggle-poshlets').click(function (e) {
        var poshletEnabled = !getPoshletsState();
        togglePoshlets(poshletEnabled);
        localStorage.setItem('poshletEnabled', poshletEnabled);
    });
});