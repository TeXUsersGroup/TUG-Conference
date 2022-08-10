// Stuff for an interactive plot of the Dulk 1985 synchrotron models.

var RevealDulk1985 = window.RevealDulk1985 || (function () {
    /* Lame generic math functions! */

    function logspace (start, end, n) {
	const k = Math.log (end / start) / (n - 1);
	var x = new Array (n);
	for (var i = 0; i < n; i++)
	    x[i] = start * Math.exp (i * k);
	return x;
    }

    /* Copied from pwkit dulk_models.py and cgs.py */

    const ujy_per_cgs = 1e29;
    const electron_charge = 4.80320425e-10;
    const electron_mass = 9.1093897e-28;
    const speed_of_light = 29979245800.0;

    function compute_nu_b (b) {
	return electron_charge * b / (2 * Math.PI * electron_mass * speed_of_light);
    }

    function gyrosynch_eta (b, ne, delta, sinth, nu) {
	var s = nu / compute_nu_b (b);
	return (b * ne *
		3.3e-24 *
		Math.pow (10, -0.52 * delta) *
		Math.pow (sinth, -0.43 + 0.65 * delta) *
		Math.pow (s, 1.22 - 0.90 * delta));
    }

    function gyrosynch_kappa (b, ne, delta, sinth, nu) {
	var s = nu / compute_nu_b (b);
	return (ne / b *
		1.4e-9 *
		Math.pow (10, -0.22 * delta) *
		Math.pow (sinth, -0.09 + 0.72 * delta) *
		Math.pow (s, -1.30 - 0.98 * delta));
    }

    function compute_snu (eta, kappa, width, elongation, dist) {
	var omega = Math.pow (width / dist, 2);
	var depth = width * elongation;
	var tau = depth * kappa;
	var sourcefn = eta / kappa;
	return 2 * omega * sourcefn * (1 - Math.exp (-tau));
    }

    function gyrosynch_snu_ujy (b, ne, delta, sinth, width, elongation, dist, ghz) {
	var hz = ghz * 1e9;
	var eta = gyrosynch_eta (b, ne, delta, sinth, hz);
	var kappa = gyrosynch_kappa (b, ne, delta, sinth, hz);
	var snu = compute_snu (eta, kappa, width, elongation, dist);
	return snu * ujy_per_cgs;
    }

    /* Physical stuff specific to this plot */

    var params = {
	b: 1000,
	logne: 6,
	delta: 3,
	sinth: 0.7,
	logwidth: 7,
	elongation: 1,
	dist: 1e16,
    };

    var ranges = {
	b: [10, 5000],
	logne: [2, 8],
	delta: [2, 7],
	sinth: [0.05, 0.95],
	logwidth: [6, 10],
    };

    var steps = {
	b: 1,
	logne: 0.1,
	delta: 0.1,
	sinth: 0.05,
	logwidth: 0.1,
    };

    var nice_params = {
	b: 'B',
	logne: 'log n<sub>e</sub>',
	delta: 'δ',
	sinth: 'sin θ',
	logwidth: 'log ℓ',
	elongation: 'elong.',
	dist: 'd',
    };

    function fluxdensity (ghz) {
	return gyrosynch_snu_ujy (params.b, Math.pow (10, params.logne), params.delta,
				  params.sinth, Math.pow (10, params.logwidth),
				  params.elongation, params.dist, ghz);
    }

    function setup_slider (param_name) {
	var slider = document.getElementById ('dulk1985-' + param_name + '-slider')
	var label = document.getElementById ('dulk1985-' + param_name + '-slider-label')

	function set_label (value) {
	    label.innerHTML = nice_params[param_name] + ': ' + value.toString ();
	}

	slider.addEventListener ('input', function (event) {
	    params[param_name] = 1.0 * event.target.value;
	    svg.select ('.dulk-line').attr ('d', dulk_line);
	    set_label (event.target.value);
	});

	slider.min = ranges[param_name][0];
	slider.max = ranges[param_name][1];
	slider.value = params[param_name];
	slider.step = steps[param_name];
	set_label (slider.value);
    }

    const min_freq = 0.28; // GHz
    const max_freq = 120;
    const n_freq_samps = 60;
    var freqs = logspace (min_freq, max_freq, n_freq_samps);

    const min_snu = 0.8;
    const max_snu = 3000;

    /* Reference curves. */

    const n33370b_data = [
	[1.4, 890],
	[6.05, 1360],
	[21.85, 1460],
	[33.5, 1300],
	[43.7, 1180],
	[97.5, 680]
    ];

    const lp349_data = [
	[1.4, 226],
	[4.86, 383],
	[8.46, 320],
	[10.01, 283],
	[22.17, 141]
    ];

    /* Actual plotting. */

    /* full reveal.js space: 960x720; margin includes axis labels */
    const y_label_width = 30;
    const y_ticks_width = 90;
    const field_right_margin = 20;
    const total_width = 960;
    const field_left_margin = y_ticks_width + y_label_width;
    const field_width = total_width - (field_left_margin + field_right_margin);

    const field_top_margin = 10; /* needed for ticks to not go off edge */
    const x_label_height = 60;
    const x_ticks_height = 10;
    const x_ticks_drop = 10;
    const total_height = 500;
    const field_bottom_margin = x_ticks_height + x_label_height + x_ticks_drop;
    const field_height = total_height - (field_top_margin + field_bottom_margin);

    var x = d3.scaleLog ()
	.base (10)
	.domain ([min_freq, max_freq])
	.range ([0, field_width]);

    var y = d3.scaleLog ()
	.base (10)
	.domain ([min_snu, max_snu])
	.range ([field_height, 0]);

    var dulk_line = d3.line ()
	.x (function(d) { return x (d); })
	.y (function(d) { return y (fluxdensity (d)); });

    var svg = d3.select ('#dulk1985').append ('svg')
	.attr ('width', total_width)
	.attr ('height', total_height)
	.append ('g')
	.attr ('transform', 'translate(' + field_left_margin + ',' + field_top_margin + ')');

    /* Following elements are relative to the above <g> element */

    svg.append ('g')
	.attr ('class', 'axis')
	.attr ('transform', 'translate(0,' + field_height + ')')
	.call (d3.axisBottom (x)
	       .tickSize (10)
	       .tickPadding (6)
	       .tickSizeOuter (0)
	       .tickValues ([0.3, 1, 3, 10, 30, 100])
	       .tickFormat (function (x) { return x.toString (); }));

    svg.append ('text')
	.attr ('class', 'x label')
	.attr ('text-anchor', 'middle')
	.attr ('x', field_width / 2)
	.attr ('y', field_height + x_ticks_height + x_label_height)
	.text ('Frequency (GHz)');

    svg.append ('g')
	.attr ('class', 'axis')
	.call (d3.axisLeft (y)
	       .tickSize (10)
	       .tickSizeOuter (0)
	       .tickValues ([0.1, 1, 10, 100, 1000])
	       .tickFormat (function (x) { return x.toString (); }));

    svg.append ('g')
	.attr ('transform', 'translate(' + (-y_ticks_width) + ', ' + field_height / 2 + ')')
	.append ('text')
	.attr ('class', 'y label')
	.attr ('text-anchor', 'middle')
	.attr ('transform', 'rotate(-90)')
	.text ('Flux density (μJy)');

    svg.append('defs').append('clipPath')
	.attr('id', 'dulk85clip')
	.append('rect')
	.attr('width', field_width)
	.attr('height', field_height);

    svg.append ('path')
	.datum (freqs)
	.attr ('class', 'dulk-line')
	.attr ('d', dulk_line)
	.attr('clip-path', 'url(#dulk85clip)');

    /* NLTT 33370 B data */

    var data_line = d3.line ()
	.x (function(d) { return x (d[0]); })
	.y (function(d) { return y (d[1]); });

    var g = svg.append ('g');

    svg.append ('path')
	.datum (n33370b_data)
	.attr ('class', 'n33370b-line')
	.attr ('d', data_line)
	.attr('clip-path', 'url(#dulk85clip)');

    svg.append ('g')
	.selectAll ('n33370b-dots')
	.data (n33370b_data)
	.enter ()
	.append ('circle')
	.attr ('class', 'n33370b-dot')
	.attr ('r', 8)
	.attr ('cx', function(d) { return x (d[0]); })
	.attr ('cy', function(d) { return y (d[1]); });

    /* LP 349-25 AB data */

    svg.append ('path')
	.datum (lp349_data)
	.attr ('class', 'lp349-line')
	.attr ('d', data_line)
	.attr('clip-path', 'url(#dulk85clip)');

    svg.append ('g')
	.selectAll ('lp349-dots')
	.data (lp349_data)
	.enter ()
	.append ('circle')
	.attr ('class', 'lp349-dot')
	.attr ('r', 8)
	.attr ('cx', function(d) { return x (d[0]); })
	.attr ('cy', function(d) { return y (d[1]); });

    /* Sliders */

    setup_slider ('b');
    setup_slider ('logne');
    setup_slider ('delta');
    setup_slider ('logwidth');
}) ();
