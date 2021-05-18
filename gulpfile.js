const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const log = require('fancy-log');
const autoprefixer = require('autoprefixer');
const scss = require('postcss-scss');


/* CSS ******************************** */

gulp.task('css', function () {
    return gulp.src('src/scss/main.scss')
        .pipe(postcss([autoprefixer()], {syntax: scss}))
        .pipe(
            sass({outputStyle: 'compressed'}),
            log.error
        )
        .pipe(gulp.dest('src/assets/css'));
});


/* Watch ******************************** */

gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', ['css']);
});

/* Build ******************************** */

gulp.task('build', ['css']);
gulp.task('default', ['css', 'watch']);
