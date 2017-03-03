var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyInline = require('gulp-minify-inline');
var htmlclean = require('gulp-htmlclean');

//script paths
var jsFiles = ['src/js/three.js', 'src/js/app.js', 'src/js/shaders/*.js'],
    jsDest = 'build';

gulp.task('scripts', function() {
  console.log('doing scripts');
  return gulp.src(jsFiles)
    .pipe(concat('script.js'))
    .pipe(uglify().on('error', console.log))
    .pipe(gulp.dest(jsDest));
});

gulp.task('index', function(){
  console.log('doing index');
  return gulp.src('src/index.html')
    .pipe(htmlclean())
    .pipe(minifyInline())
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['index','scripts']);
