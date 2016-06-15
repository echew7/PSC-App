const PATH = require('path');

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');

const ROOT = '../../';

const SERVER_PATHS = [
    'server/server.js'
].map(function(path) {
    return PATH.resolve(__dirname, ROOT, path);
});

const CONFIG_PATH = PATH.resolve(__dirname, ROOT, 'tools/build/config/eslint-config.json');

gulp.task('lint:server', function () {
    return gulp.src(SERVER_PATHS)
        .pipe(plumber())
        .pipe(eslint({configFile: CONFIG_PATH}))
        .pipe(eslint.format());
});

gulp.task('lint:watch:server', ['lint:server'], function() {
    gulp.watch(SERVER_PATHS, ['lint:server']);
});