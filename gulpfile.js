const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require("del");
const sass = require("gulp-sass");
const postcss = require('gulp-postcss');
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const imagemin = require("gulp-imagemin");

sass.compiler = require('node-sass');

// CLEAN
function cleanHTML() {
    return del("./build/*.html");
}
function cleanStyle() {
    return del(["./src/css", "./build/css"]);
}
function cleanJS() {
    return del(['src/js/**/*.min.js', "./build/js"])
}
function cleanIMG() {
    return del("./build/img");
}
function clean() {
    return del(["./build", "./src/css", './src/js/*.min.js'])
}

// HTML
function html() {
    return src('src/**/*.html')
        .pipe(dest('build/'))
        .pipe(browserSync.stream());
}

// CSS
var cssFile = [
    'src/sass/style.scss',
    'src/sass/media.scss'
];
sass.compiler = require('node-sass');
function css() {
    return src(cssFile)
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('src/css'))
        .pipe(postcss([autoprefixer({ browsers: ['last 5 versions', '> 1%', 'ie 9', 'ie 8'], cascade: false }), cssnano()]))
        .pipe(concat('all.css'))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest('src/css'))
        .pipe(dest('build/css'))
        .pipe(browserSync.stream());
}

// JS
var jsFile = [
    'src/js/template.js'
];
function js() {
    return src(jsFile)
        .pipe(babel())
        .pipe(uglify({ toplevel: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest("src/js"))
        .pipe(dest('build/js'))
        .pipe(browserSync.stream());
}

// IMG
function img() {
    return src('src/img/**/*')
        .pipe(imagemin())
        .pipe(dest("build/img"))
        .pipe(browserSync.stream());
}

// WATCH
function watchFiles() {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
    watch("src/*.html", series(cleanHTML, html));
    watch("src/sass/*.scss", series(cleanStyle, css));
    watch('src/js/template.js', series(cleanJS, js));
    watch(".src/img/**/*", series(cleanIMG, img));
}

// TASK
exports.js = js;
exports.css = css;
exports.html = html;
exports.img = img;
exports.clean = clean;
exports.watchFiles = watchFiles;
exports.dev = series(clean, parallel(html, css, js, img), watchFiles);
exports.build = series(clean, parallel(html, css, js, img));