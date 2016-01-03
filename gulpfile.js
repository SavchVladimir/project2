'use strict';

var gulp 		= require("gulp"),
	browserSync = require('browser-sync'),
	reload 		= browserSync.reload,
	rename 		= require('gulp-rename'),
	concatCss 	= require('gulp-concat-css'),
	minifyCss 	= require('gulp-minify-css'),	//min css
	sass 		= require('gulp-sass'),
	uglify 		= require('gulp-uglify'), //min js
	filter 		= require('gulp-filter'),
	imagemin 	= require('gulp-imagemin'),
	useref      = require('gulp-useref'),		//html
	gulpif 		= require('gulp-if'),
	wiredep 	= require('wiredep').stream,
	jade 		= require('gulp-jade'),
	del 		= require('del'),
	size 		= require('gulp-size')
	;

//----------------------server--------------------------//
gulp.task('server', function(){
	browserSync({
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});
//----------------------watch--------------------------//
gulp.task('watch', function() {
	gulp.watch('app/scss/**/*.scss',['sass']);
	gulp.watch('app/templates/pages/**/*.jade',['jade']);
	gulp.watch('bower.json', ['wiredep']);
	gulp.watch([
		'app/*.html',
		'app/js/**/*.js',
		'app/css/**/*.css'
		]).on('change', reload);
});
//>>>-------------default------------------------------//
gulp.task('default', ['server', 'watch']);
//-------------------SASS----------------------------//
gulp.task('sass', function() {
  return gulp.src('app/scss/*.scss')
    .pipe(sass({
      noCache: true,
      style: "expanded",
      lineNumbers: true
    }))
    .pipe(gulp.dest('app/css'))
    .pipe(reload({stream: true})); 
});
//-------------------JADE----------------------------//
gulp.task('jade', function() {
  return gulp.src('app/templates/pages/*.jade')
    .pipe(jade({pretty:true}))
    .pipe(gulp.dest('app/'))
    .pipe(reload({stream: true}));
});
//-------------------CSS----------------------------//
//собираем в dist
gulp.task('css', function () {
  return gulp.src('app/css/**/*.css')
    //.pipe(concatCss("fullstyle.css")) 
    .pipe(gulp.dest('dist'));
});
//-------------------JS----------------------------//
//собираем в dist
gulp.task('js', function () {
  return gulp.src('app/js/**/*.js')
    .pipe(gulp.dest('dist'));
});
//-------------------JS----------------------------//
//собираем в dist
gulp.task('html', function () {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist'));
});
//-------------------HTML----------------------------//
//link в html и копируем из dist в prod
// Переносим HTML, CSS, JS в папку prod
gulp.task('useref', function () {
    return gulp.src('dist/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('prod'));
});
//-------------------FONTS----------------------------//
//Переносим шрифты
gulp.task('fonts', function() {
	gulp.src('app/fonts/*')
	.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
	.pipe(gulp.dest('dist/fonts/'))
	.pipe(gulp.dest('prod/fonts/'))
});
//-----------------------IMAGES-------------------------//
//Копируем в dist. Из dist минимизируем в prod
gulp.task('images', function () {
	return gulp.src('app/img/**/*')
	.pipe(gulp.dest('dist/img'))
	.pipe(imagemin({
	progressive: true,
	interlaced: true
		}))
	.pipe(gulp.dest('prod/img'));
});
//---------------OTHER---------------------------------//
//копируем в dist и prod
gulp.task('extras', function () {
	return gulp.src([
	'app/*.*',
	'!app/*.html'
	])
	.pipe(gulp.dest('dist'))
	.pipe(gulp.dest('prod'));
});
//---------------BOWER---------------------------------//
gulp.task('wiredep', function () {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/'))
  });
//---------------DEL---------------------------------//
gulp.task('del', function () {
   del(['dist','prod']);
});
//>>>------------------собираем------------------------------//
// Сборка
//css и  js копирует в папку dist
//html минимизирует и объединяет в папку prod
//['images', 'fonts', 'extras'] - копируют в dist и prod
gulp.task('prod', ['css', 'js', 'html', 'images', 'fonts', 'extras', 'useref'], function () {
  return gulp.src('prod/**/*').pipe(size({title: 'build'}));
});

//(только после очистки и компиляции Jade и sass и подключении стилей и js)
//у [jade', 'sass', 'wiredep'] действие происходит в папке app
gulp.task('build', ['del', 'jade', 'sass'], function () {
  gulp.start('prod');
});
//------------------------------------------------//