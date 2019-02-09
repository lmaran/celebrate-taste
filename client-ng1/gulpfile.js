var gulp = require("gulp");
var del = require("del");
var inject = require("gulp-inject"); // inject a string into placeholders in html files
var runSequence = require("run-sequence"); // a cool way of choosing what must run sequentially, and what in parallel
var concat = require("gulp-concat"); // concatenate files
var uglify = require("gulp-uglify"); // js minification
var minifyCSS = require("gulp-minify-css"); // css minification
var rev = require("gulp-rev"); // add a unique id at the end of app.js (ex: app-f4446a9c.js) to prevent browser caching

exports.dev = gulp.series(clean, buildDevHtml);
exports.prod = gulp.series(clean, gulp.parallel(buildScripts, buildStyles), buildProdHtml);
exports.buildScripts = buildScripts;
exports.buildStyles = buildStyles;
exports.buildProdHtml = buildProdHtml;
exports.clean = clean;

// 1. development task definitions ============================================================

function buildDevHtml(cb) {
    gulp.src("./index.html")
        .pipe(inject(gulp.src("./app/**/*.css", { read: false }), { relative: true })) // css app files
        .pipe(inject(gulp.src("./app/**/*.js", { read: false }), { relative: true })) // js app files
        // .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name:'inject-vendor', relative: true})) // bower js and css files
        .pipe(gulp.dest("."));
    cb();
}

function clean(cb) {
    del.sync(["./app/app-*.min.js", "./app/app-*.min.css"]);
    cb();
}

// 1. development task definitions ============================================================

function buildScripts(cb) {
    return gulp
        .src("./app/**/*.js")
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(rev()) // add a unique id at the end of app.js (ex: app-f4446a9c.js)
        .pipe(gulp.dest("./app"));
    // cb();
}

function buildStyles(cb) {
    gulp.src("./app/**/*.css")
        .pipe(concat("app.min.css"))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest("./app"));
    cb();
}

function buildProdHtml(cb) {
    var localInject = function(pathGlob, name) {
        var options = {
            // ignorePath: "/dist/client/", // remove the '/dist/client' from the path
            addRootSlash: false, // do not add a root slash to the beginning of the path
            removeTags: false, // remove <--inject--> tags after injection
            name: name || "inject",
        };
        return inject(gulp.src(pathGlob, { read: false }), options);
    };

    gulp.src("./index.html")
        .pipe(localInject("./app/app-*.min.js")) // js app files
        .pipe(localInject("./app/app-*.min.css")) // css application files
        .pipe(gulp.dest("."));
    cb();
}
