const gulp = require('gulp');
const zip = require('gulp-zip');
const gulpCopy = require('gulp-copy');
const bump = require('gulp-bump');
const fs = require('fs'); 


gulp.task('copy', () => {
var sourceFiles = [ 
	'node_modules/purecss/build/pure-min.css',
	'node_modules/angular/angular.min.js',
	'node_modules/angular-ui-ace/src/ui-ace.js'
];
var destination = 'libs/';

return gulp
    .src(sourceFiles)
    .pipe(gulpCopy('libs', {prefix: 1}));
});

gulp.task('bump', ['copy'], function(cb){
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