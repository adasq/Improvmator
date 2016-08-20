var gulp = require('gulp');
const zip = require('gulp-zip');
var bump = require('gulp-bump');
var fs = require('fs'); 

gulp.task('bump', function(cb){
  gulp.src(['./manifest.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'))
  .on('end', cb);
});

gulp.task('zip', ['bump'], () => {
    var manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
    var filename = [manifest.name.toLowerCase(), manifest.version].join('-');

    return gulp.src(['**/*', '!node_modules/**/*', '!dist/**/*'])
        .pipe(zip(filename + '.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['zip']);