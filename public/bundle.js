
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Box.svelte generated by Svelte v3.6.7 */

    const file = "src/Box.svelte";

    function create_fragment(ctx) {
    	var section, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			section = element("section");

    			if (default_slot) default_slot.c();

    			attr(section, "class", "layout-box svelte-yhd2f9");
    			attr(section, "id", ctx.identifier);
    			add_location(section, file, 13, 0, 180);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(section_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.identifier) {
    				attr(section, "id", ctx.identifier);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { identifier } = $$props;

    	const writable_props = ['identifier'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('identifier' in $$props) $$invalidate('identifier', identifier = $$props.identifier);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { identifier, $$slots, $$scope };
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["identifier"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.identifier === undefined && !('identifier' in props)) {
    			console.warn("<Box> was created without expected prop 'identifier'");
    		}
    	}

    	get identifier() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set identifier(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Clock.svelte generated by Svelte v3.6.7 */

    const file$1 = "src/Clock.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.minuteMarks = list[i];
    	return child_ctx;
    }

    // (84:4) {#each [0,5,10,15,20,25,30,35,40,45,50,55] as minuteMarks}
    function create_each_block(ctx) {
    	var line;

    	return {
    		c: function create() {
    			line = svg_element("line");
    			attr(line, "class", "major-mark major-mark-" + ctx.minuteMarks + " svelte-1nrqea7");
    			attr(line, "y1", "30");
    			attr(line, "y2", "35");
    			attr(line, "transform", "rotate(" + 30 * ctx.minuteMarks + ")");
    			add_location(line, file$1, 84, 6, 1552);
    		},

    		m: function mount(target, anchor) {
    			insert(target, line, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(line);
    			}
    		}
    	};
    }

    // (80:0) <Box {identifier}>
    function create_default_slot(ctx) {
    	var svg, line0, line0_transform_value, line1, line1_transform_value, t0, div2, div0, span0, t1_value = ctx.hours > 12 ? ctx.hours-12 : ctx.hours, t1, t2, span1, t3_value = ctx.minutes >= 10 ? ctx.minutes : `0${ctx.minutes}`, t3, t4, span2, t5_value = ctx.hours > 12 ? 'PM' : 'AM', t5, t6, div1, span3, t7, t8, span4, t9, t10, span5, t11, t12, span6, t13;

    	var each_value = [0,5,10,15,20,25,30,35,40,45,50,55];

    	var each_blocks = [];

    	for (var i = 0; i < 12; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			svg = svg_element("svg");

    			for (var i = 0; i < 12; i += 1) {
    				each_blocks[i].c();
    			}

    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = text(":");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			span3 = element("span");
    			t7 = text(ctx.day);
    			t8 = text(",\n      ");
    			span4 = element("span");
    			t9 = text(ctx.month);
    			t10 = space();
    			span5 = element("span");
    			t11 = text(ctx.date);
    			t12 = space();
    			span6 = element("span");
    			t13 = text(ctx.year);
    			attr(line0, "class", "hour-hand svelte-1nrqea7");
    			attr(line0, "y1", "2");
    			attr(line0, "y2", "-20");
    			attr(line0, "transform", line0_transform_value = "rotate(" + (30 * ctx.hours + ctx.minutes / 2) + ")");
    			add_location(line0, file$1, 93, 4, 1738);
    			attr(line1, "class", "minute-hand svelte-1nrqea7");
    			attr(line1, "y1", "4");
    			attr(line1, "y2", "-30");
    			attr(line1, "transform", line1_transform_value = "rotate(" + (6 * ctx.minutes + ctx.seconds / 10) + ")");
    			add_location(line1, file$1, 101, 4, 1886);
    			attr(svg, "class", "analog-clock svelte-1nrqea7");
    			attr(svg, "viewBox", "-50 -50 100 100");
    			add_location(svg, file$1, 80, 2, 1408);
    			attr(span0, "class", "hour svelte-1nrqea7");
    			add_location(span0, file$1, 112, 6, 2091);
    			attr(span1, "class", "minute svelte-1nrqea7");
    			add_location(span1, file$1, 112, 64, 2149);
    			attr(span2, "class", "period svelte-1nrqea7");
    			add_location(span2, file$1, 113, 6, 2225);
    			attr(div0, "class", "time-output svelte-1nrqea7");
    			add_location(div0, file$1, 111, 4, 2059);
    			attr(span3, "class", "day svelte-1nrqea7");
    			add_location(span3, file$1, 116, 6, 2327);
    			attr(span4, "class", "month svelte-1nrqea7");
    			add_location(span4, file$1, 117, 6, 2365);
    			attr(span5, "class", "date svelte-1nrqea7");
    			add_location(span5, file$1, 118, 6, 2406);
    			attr(span6, "class", "year svelte-1nrqea7");
    			add_location(span6, file$1, 119, 6, 2445);
    			attr(div1, "class", "date-output svelte-1nrqea7");
    			add_location(div1, file$1, 115, 4, 2295);
    			attr(div2, "class", "digital-time-output svelte-1nrqea7");
    			add_location(div2, file$1, 110, 2, 2021);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);

    			for (var i = 0; i < 12; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append(svg, line0);
    			append(svg, line1);
    			insert(target, t0, anchor);
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, span0);
    			append(span0, t1);
    			append(div0, t2);
    			append(div0, span1);
    			append(span1, t3);
    			append(div0, t4);
    			append(div0, span2);
    			append(span2, t5);
    			append(div2, t6);
    			append(div2, div1);
    			append(div1, span3);
    			append(span3, t7);
    			append(div1, t8);
    			append(div1, span4);
    			append(span4, t9);
    			append(div1, t10);
    			append(div1, span5);
    			append(span5, t11);
    			append(div1, t12);
    			append(div1, span6);
    			append(span6, t13);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.hours || changed.minutes) && line0_transform_value !== (line0_transform_value = "rotate(" + (30 * ctx.hours + ctx.minutes / 2) + ")")) {
    				attr(line0, "transform", line0_transform_value);
    			}

    			if ((changed.minutes || changed.seconds) && line1_transform_value !== (line1_transform_value = "rotate(" + (6 * ctx.minutes + ctx.seconds / 10) + ")")) {
    				attr(line1, "transform", line1_transform_value);
    			}

    			if ((changed.hours) && t1_value !== (t1_value = ctx.hours > 12 ? ctx.hours-12 : ctx.hours)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.minutes) && t3_value !== (t3_value = ctx.minutes >= 10 ? ctx.minutes : `0${ctx.minutes}`)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.hours) && t5_value !== (t5_value = ctx.hours > 12 ? 'PM' : 'AM')) {
    				set_data(t5, t5_value);
    			}

    			if (changed.day) {
    				set_data(t7, ctx.day);
    			}

    			if (changed.month) {
    				set_data(t9, ctx.month);
    			}

    			if (changed.date) {
    				set_data(t11, ctx.date);
    			}

    			if (changed.year) {
    				set_data(t13, ctx.year);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div2);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var current;

    	var box = new Box({
    		props: {
    		identifier: identifier,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			box.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var box_changes = {};
    			if (changed.identifier) box_changes.identifier = identifier;
    			if (changed.$$scope || changed.year || changed.date || changed.month || changed.day || changed.hours || changed.minutes || changed.seconds) box_changes.$$scope = { changed, ctx };
    			box.$set(box_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};
    }

    const identifier = 'clock';

    function instance$1($$self, $$props, $$invalidate) {
    	

      let time = new Date();

      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      onMount(() => {
        const interval = setInterval(() => {
          $$invalidate('time', time = new Date());
        }, 1000);

        return () => {
          clearInterval(interval);
        };
      });

    	let hours, minutes, seconds, day, month, date, year;

    	$$self.$$.update = ($$dirty = { time: 1, days: 1, months: 1 }) => {
    		if ($$dirty.time) { $$invalidate('hours', hours = time.getHours()); }
    		if ($$dirty.time) { $$invalidate('minutes', minutes = time.getMinutes()); }
    		if ($$dirty.time) { $$invalidate('seconds', seconds = time.getSeconds()); }
    		if ($$dirty.days || $$dirty.time) { $$invalidate('day', day = days[time.getDay()]); }
    		if ($$dirty.months || $$dirty.time) { $$invalidate('month', month = months[time.getMonth()]); }
    		if ($$dirty.time) { $$invalidate('date', date = time.getDate()); }
    		if ($$dirty.time) { $$invalidate('year', year = time.getFullYear()); }
    	};

    	return {
    		hours,
    		minutes,
    		seconds,
    		day,
    		month,
    		date,
    		year
    	};
    }

    class Clock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    var config = {
      apiLocation: "http://localhost:8080/api"
    };

    /* src/Weather.svelte generated by Svelte v3.6.7 */

    const file$2 = "src/Weather.svelte";

    // (73:2) {:else}
    function create_else_block(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			attr(p, "class", "txt-center");
    			add_location(p, file$2, 73, 4, 1718);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (67:2) {#if weather}
    function create_if_block(ctx) {
    	var section, i, i_class_value, t0, h2, t1_value = ctx.weather.summary, t1, t2, t3_value = parseInt(ctx.weather.temperature), t3, sup, t5, h4;

    	return {
    		c: function create() {
    			section = element("section");
    			i = element("i");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = text("/");
    			t3 = text(t3_value);
    			sup = element("sup");
    			sup.textContent = "°";
    			t5 = space();
    			h4 = element("h4");
    			h4.textContent = "Mason, OH";
    			attr(i, "class", i_class_value = "weather-icon fas " + ctx.weatherIcon + " svelte-771lsu");
    			add_location(i, file$2, 68, 6, 1536);
    			add_location(sup, file$2, 69, 59, 1642);
    			attr(h2, "class", "svelte-771lsu");
    			add_location(h2, file$2, 69, 6, 1589);
    			add_location(h4, file$2, 70, 6, 1670);
    			attr(section, "class", "weather-condition svelte-771lsu");
    			add_location(section, file$2, 67, 4, 1494);
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, i);
    			append(section, t0);
    			append(section, h2);
    			append(h2, t1);
    			append(h2, t2);
    			append(h2, t3);
    			append(h2, sup);
    			append(section, t5);
    			append(section, h4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.weatherIcon) && i_class_value !== (i_class_value = "weather-icon fas " + ctx.weatherIcon + " svelte-771lsu")) {
    				attr(i, "class", i_class_value);
    			}

    			if ((changed.weather) && t1_value !== (t1_value = ctx.weather.summary)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.weather) && t3_value !== (t3_value = parseInt(ctx.weather.temperature))) {
    				set_data(t3, t3_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}
    		}
    	};
    }

    // (66:0) <Box {identifier}>
    function create_default_slot$1(ctx) {
    	var if_block_anchor;

    	function select_block_type(ctx) {
    		if (ctx.weather) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var current;

    	var box = new Box({
    		props: {
    		identifier: identifier$1,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			box.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var box_changes = {};
    			if (changed.identifier) box_changes.identifier = identifier$1;
    			if (changed.$$scope || changed.weather || changed.weatherIcon) box_changes.$$scope = { changed, ctx };
    			box.$set(box_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};
    }

    const identifier$1 = 'weather';

    function fetchWeather() {
      return fetch(`${config.apiLocation}/weather`)
        .then(res => {
          return res.json();
        });
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let weather;
      let weatherIcon = 'fa-sun';
      const weatherIcons = {
        'clear-day': 'fa-sun',
        'clear-night': 'fa-moon',
        'rain': 'fa-cloud-rain',
        'snow': 'fa-snowflake',
        'sleet': 'fa-snowflake',
        'wind': 'fa-wind',
        'fog': 'fa-smog',
        'cloudy': 'fa-cloud',
        'partly-cloudy-day': 'fa-cloud-sun',
        'partly-cloudy-night': 'fa-cloud-moon',
        'hail': 'fa-cloud-showers-heavy',
        'thunderstorm': 'fa-bolt',
        'tornado': 'poo-storm'
      };

      /**
       * Calls fetchWeather. Called after the component has mounted itself to the DOM.
       * */
      function postMount() {
        fetchWeather().then(response => {
          $$invalidate('weather', weather = response.currently);
          $$invalidate('weatherIcon', weatherIcon = weatherIcons[weather.icon] || 'fa-sun');
        });
      }

      /**
       * Svelte JS Lifecycle hook to trigger function once component is mounted to the DOM.
       * */
      onMount(() => {
        postMount();
        // request again in 30 minutes
        setTimeout(postMount, 1000 * 60 * 30);
      });

    	return { weather, weatherIcon };
    }

    class Weather extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/Releases.svelte generated by Svelte v3.6.7 */

    const file$3 = "src/Releases.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.release = list[i];
    	return child_ctx;
    }

    // (76:8) {:else}
    function create_else_block_1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Due Today";
    			add_location(p, file$3, 76, 10, 1715);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (74:8) {#if release.daysLeft > 0}
    function create_if_block$1(ctx) {
    	var p, t0, t1_value = ctx.release.daysLeft, t1, t2;

    	function select_block_type_1(ctx) {
    		if (ctx.release.daysLeft > 1) return create_if_block_1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			p = element("p");
    			t0 = text("Due in ");
    			t1 = text(t1_value);
    			t2 = space();
    			if_block.c();
    			add_location(p, file$3, 74, 10, 1610);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t0);
    			append(p, t1);
    			append(p, t2);
    			if_block.m(p, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.releases) && t1_value !== (t1_value = ctx.release.daysLeft)) {
    				set_data(t1, t1_value);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}

    			if_block.d();
    		}
    	};
    }

    // (75:69) {:else}
    function create_else_block$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Day");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (75:39) {#if release.daysLeft > 1}
    function create_if_block_1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Days");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (59:2) <Box {identifier}>
    function create_default_slot$2(ctx) {
    	var section, h2, t0_value = ctx.release.title, t0, t1, center, p, t2_value = ctx.release.description, t2, t3, div2, div0, h10, t4_value = ctx.release.appIssueCount, t4, t5, label0, t7, div1, h11, t8_value = ctx.release.apiIssueCount, t8, t9, label1, t11, t12;

    	function select_block_type(ctx) {
    		if (ctx.release.daysLeft > 0) return create_if_block$1;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			center = element("center");
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			t4 = text(t4_value);
    			t5 = space();
    			label0 = element("label");
    			label0.textContent = "App";
    			t7 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			t8 = text(t8_value);
    			t9 = space();
    			label1 = element("label");
    			label1.textContent = "Api";
    			t11 = space();
    			if_block.c();
    			t12 = space();
    			add_location(h2, file$3, 60, 6, 1178);
    			attr(p, "class", "release-desc svelte-1k9b6vy");
    			add_location(p, file$3, 62, 8, 1226);
    			add_location(h10, file$3, 65, 12, 1345);
    			add_location(label0, file$3, 66, 12, 1390);
    			attr(div0, "class", "column svelte-1k9b6vy");
    			add_location(div0, file$3, 64, 10, 1312);
    			add_location(h11, file$3, 69, 12, 1469);
    			add_location(label1, file$3, 70, 12, 1514);
    			attr(div1, "class", "column svelte-1k9b6vy");
    			add_location(div1, file$3, 68, 10, 1436);
    			attr(div2, "class", "row svelte-1k9b6vy");
    			add_location(div2, file$3, 63, 8, 1284);
    			add_location(center, file$3, 61, 6, 1209);
    			attr(section, "class", "releases-content svelte-1k9b6vy");
    			add_location(section, file$3, 59, 4, 1137);
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, h2);
    			append(h2, t0);
    			append(section, t1);
    			append(section, center);
    			append(center, p);
    			append(p, t2);
    			append(center, t3);
    			append(center, div2);
    			append(div2, div0);
    			append(div0, h10);
    			append(h10, t4);
    			append(div0, t5);
    			append(div0, label0);
    			append(div2, t7);
    			append(div2, div1);
    			append(div1, h11);
    			append(h11, t8);
    			append(div1, t9);
    			append(div1, label1);
    			append(center, t11);
    			if_block.m(center, null);
    			insert(target, t12, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.releases) && t0_value !== (t0_value = ctx.release.title)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.releases) && t2_value !== (t2_value = ctx.release.description)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.releases) && t4_value !== (t4_value = ctx.release.appIssueCount)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.releases) && t8_value !== (t8_value = ctx.release.apiIssueCount)) {
    				set_data(t8, t8_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(center, null);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			if_block.d();

    			if (detaching) {
    				detach(t12);
    			}
    		}
    	};
    }

    // (58:0) {#each releases as release}
    function create_each_block$1(ctx) {
    	var current;

    	var box = new Box({
    		props: {
    		identifier: identifier$2,
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			box.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var box_changes = {};
    			if (changed.identifier) box_changes.identifier = identifier$2;
    			if (changed.$$scope || changed.releases) box_changes.$$scope = { changed, ctx };
    			box.$set(box_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var each_1_anchor, current;

    	var each_value = ctx.releases;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.identifier || changed.releases) {
    				each_value = ctx.releases;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    const identifier$2 = 'releases';

    function fetchReleases() {
      return fetch(`${config.apiLocation}/releases`)
        .then(res => {
          return res.json();
        });
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let releases = [];

      /**
       * Calls fetchReleases. Called after the component has mounted itself to the DOM.
       * */
      function postMount() {
        fetchReleases().then(response => {
          $$invalidate('releases', releases = response.data);
        });
      }

      /**
       * Svelte JS Lifecycle hook to trigger function once component is mounted to the DOM.
       * */
      onMount(() => {
        postMount();
        // request again in 30 minutes
        setTimeout(postMount, 1000 * 60 * 30);
      });

    	return { releases };
    }

    class Releases extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.7 */

    const file$4 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	var div, t0, t1, current;

    	var weather = new Weather({ $$inline: true });

    	var clock = new Clock({ $$inline: true });

    	var releases = new Releases({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			weather.$$.fragment.c();
    			t0 = space();
    			clock.$$.fragment.c();
    			t1 = space();
    			releases.$$.fragment.c();
    			attr(div, "class", "application-container");
    			add_location(div, file$4, 6, 0, 144);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(weather, div, null);
    			append(div, t0);
    			mount_component(clock, div, null);
    			append(div, t1);
    			mount_component(releases, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(weather.$$.fragment, local);

    			transition_in(clock.$$.fragment, local);

    			transition_in(releases.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(weather.$$.fragment, local);
    			transition_out(clock.$$.fragment, local);
    			transition_out(releases.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(weather, );

    			destroy_component(clock, );

    			destroy_component(releases, );
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
