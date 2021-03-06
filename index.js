/**
 * metasmith-bundles
 * Handles javascript and css resources as bundles for easy (conditional) inclusion in templates
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var fs    = require('fs'),
    debug = require('debug')('metalsmith-bundles');

/**
 * Cache the read templates and paths to minimize disk reading
 *
 * @type {Object}
 */
var Cache = {

    extension: 'html',

    bundles: {},

    paths: {},

    read: function (bundle, section) {
        var sectionPath = bundle + '/' + section + '.' + Cache.extension;
        if (Cache.bundles[sectionPath]) {
            return Cache.bundles[sectionPath];
        }
        if (!Cache.isFile(sectionPath)) {
            Cache.bundles[sectionPath] = new Buffer('');
        } else {
            try {
                Cache.bundles[sectionPath] = fs.readFileSync(sectionPath);
            } catch (e) {}
        }
        return Cache.bundles[sectionPath];
    },

    isDirectory: function (path) {
        if (Cache.paths[path]) {
            return true;
        }
        try {
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                Cache.paths[path] = true;
            }
        } catch (e) {}
        return Cache.paths[path] === true;
    },

    isFile: function (path) {
        if (Cache.paths[path]) {
            return true;
        }
        try {
            var stats = fs.statSync(path);
            if (stats.isFile()) {
                Cache.paths[path] = true;
            }
        } catch (e) {}
        return Cache.paths[path] === true;
    }
};

/**
 * Reads the key `bundles` in the front matter and load the specified bundles.
 * Three sections are searched for each bundle: head, page and footer.
 *
 * @param  {Object} options
 *         options.directory: The base path where the bundles are
 *         options.extension: The extension of each section file
 *
 * @return {Function}
 */
var bundlesPlugin = function (options) {

    options = Object.assign({
            directory: null,
            extension: 'html'
        },
        (options || {})
    );

    return function (files, metalsmith, done) {

        setImmediate(done);
        var meta = metalsmith.metadata();
        Cache.extension = options.extension;

        if (!Cache.isDirectory(options.directory)) {
            debug('Bundle directory not found: %s', options.directory);
            return;
        }

        Object.keys(files).forEach(function (key) {

            var data = files[key];
            if (!data.bundles) {
                return;
            }

            debug('checking file %s', key);

            data.bundles.forEach(function (bundle) {

                var stats = null;

                try {

                    var head = null;
                    var page = null;
                    var footer = null;
                    var bundlePath = options.directory + '/' + bundle;

                    if (!Cache.isDirectory(bundlePath)) {
                        debug('Bundle path not found: %s', bundlePath);
                        return;
                    }

                    debug('including bundle %s', bundle);

                    head = Cache.read(bundlePath, 'head');
                    page = Cache.read(bundlePath, 'page');
                    footer = Cache.read(bundlePath, 'footer');

                    files[key].bundlesData = files[key].bundlesData || {
                        head: new Buffer(''),
                        page: new Buffer(''),
                        footer: new Buffer('')
                    };

                    files[key].bundlesData.head = Buffer.concat([files[key].bundlesData.head, head]);
                    files[key].bundlesData.page = Buffer.concat([files[key].bundlesData.page, page]);
                    files[key].bundlesData.footer = Buffer.concat([files[key].bundlesData.footer, footer]);

                } catch (e) {
                    debug(e.message);
                }
            });
        });
    };
};

var handlebarsPlugin = function (handlebars, options) {

    handlebars.registerHelper('bundles', function (section, options) {
        try {
            var data = options.data.root.bundlesData[section];
        } catch (e) {
            var data = '';
        }
        var ret = new Handlebars.SafeString(data);
        return ret;
    });
};

module.exports = {
    bundles: bundlesPlugin,
    registerBundles: handlebarsPlugin
};
