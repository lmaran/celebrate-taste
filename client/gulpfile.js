var gulp = require("gulp");
var del = require("del");
var inject = require("gulp-inject"); // inject a string into placeholders in html files
var concat = require("gulp-concat"); // concatenate files
var uglify = require("gulp-uglify"); // js minification
var minifyCSS = require("gulp-minify-css"); // css minification
var rev = require("gulp-rev"); // add a unique id at the end of app.js (ex: app-f4446a9c.js) to prevent browser caching

// main tasks
exports.default = buildDevHtml;
exports.prod = gulp.series(cleanDist, copyToDist, gulp.parallel(buildProdJs, buildProdCss), buildProdHtml);

// sub-tasks (exposed for debug)
exports.cleanDist = cleanDist;
exports.copyToDist = copyToDist;
exports.buildProdJs = buildProdJs;
exports.buildProdCss = buildProdCss;
exports.buildProdHtml = buildProdHtml;

// 1. development task definitions ============================================================

function buildDevHtml() {
    return gulp
        .src("./src/index.html")
        .pipe(inject(gulp.src("./src/app/**/*.css", { read: false }), { relative: true })) // css app files
        .pipe(inject(gulp.src("./src/app/**/*.js", { read: false }), { relative: true })) // js app files
        .pipe(gulp.dest("./src"));
}

// 2. production task definitions ============================================================

function buildProdHtml(cb) {
    return gulp
        .src("./dist/index.html")
        .pipe(inject(gulp.src("./dist/app/app-*.min.css", { read: false }), { relative: true, removeTags: true })) // css app files
        .pipe(inject(gulp.src("./dist/app/app-*.min.js", { read: false }), { relative: true, removeTags: true })) // js app files
        .pipe(gulp.dest("./dist"));
}

function buildProdJs() {
    return gulp
        .src("./src/app/**/*.js")
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(rev()) // add a unique id at the end of app.js (ex: app-f4446a9c.js)
        .pipe(gulp.dest("./dist/app"));
}

function buildProdCss() {
    return gulp
        .src("./src/app/**/*.css")
        .pipe(concat("app.min.css"))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest("./dist/app"));
}

function copyToDist() {
    return gulp.src("./src/**/*.!(js|css)").pipe(gulp.dest("./dist"));
}

function cleanDist() {
    return del("./dist");
}
