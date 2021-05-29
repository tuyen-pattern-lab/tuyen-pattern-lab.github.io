const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const webpack = require('webpack-stream');
const del = require('del');

const paths = {
  styles: {
    watch: ['source/css/style.scss', 'source/css/scss/**/*.scss'],
    src: 'source/css/style.scss',
    dest: 'dist/css/'
  },
  scripts: {
    watch: ['source/js/**/*.js', '!source/js/main.min.js'],
    src: 'source/js/main.js',
    dest: 'dist/js/'
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
const clean = () => {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  const cleanPaths = [
    'dist/**',
    '!dist',
    '!dist/css',
    '!dist/css/svg-sprite.css',
    '!dist/fonts/**'
  ]
  return del(cleanPaths);
}

/*
 * Define our tasks using plain functions
 */
const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(sass())
    .pipe(cleanCSS())
    // pass in options to the stream
    // .pipe(rename({
    //   basename: 'style',
    // }))
    .pipe(gulp.dest(paths.styles.dest));
}

const scripts = () => {
  return gulp
    .src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(webpack({
      mode: 'production'
    }))
    // .pipe(babel({
    //   presets: ['@babel/env']
    // }))
    // .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

const fonts = () => {
  return gulp.src('source/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));
}

const svgSprite = () => {
  return gulp.src('source/css/svg-sprite.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest('public/css/'));
}

const patternScaffolding = () => {
  return gulp.src('source/css/pattern-scaffolding.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest('public/css/'));
}

const watch = () => {
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.styles.watch, styles);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(styles, scripts, fonts, svgSprite, patternScaffolding));

const serve = gulp.series(build, watch);

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.serve = serve;
exports.build = build;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;