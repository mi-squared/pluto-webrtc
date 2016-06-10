'use strict';
/* jshint unused:false */

var gulp = require('gulp'),
    bower = require('gulp-bower'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-csso'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rimraf = require('gulp-rimraf'),
    svgmin = require('gulp-svgmin'),
    nodemon = require('gulp-nodemon'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul');


// Configuration Directories
var dir = {
    app:    'app',
    client: 'client',
    config: 'config',
    dist:   'dist'
};

function handleError(err) {
    /* jshint validthis:true */
    console.log(err.toString());
    this.emit('end');
}

gulp.task('rimraf', function() {
    return gulp.src(dir.dist, {read: false})
        .pipe(rimraf());
});

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(dir.client + '/scripts/vendor'));
});

gulp.task('bower-styles', function() {
    return bower({
        cwd: dir.client + '/sass'
    });
});

gulp.task('styles-sass', ['bower-styles'], function() {
    return gulp.src(dir.client + '/sass/*.{scss,sass}')
        .pipe(compass({
            style: 'expanded',
            css: dir.client + '/css',
            sass: dir.client + '/sass',
            require: []
        }))
        .on('error', handleError)
        .pipe(autoprefixer())
        .pipe(gulp.dest(dir.client + '/css'));
});

gulp.task('styles', ['styles-sass'], function() {
    return gulp.src(dir.client + '/css/**')
        .pipe(minifycss())
        .pipe(gulp.dest(dir.dist + '/css'));
});

gulp.task('scripts-browserify', function() {
    return gulp.src([
            dir.client + '/scripts/**/*.js',
            '!' + dir.client + '/scripts/models/**',
            '!' + dir.client + '/scripts/view-models/**',
            '!' + dir.client + '/scripts/lib/**',
            '!' + dir.client + '/scripts/vendor/**',
            '!' + dir.client + '/scripts/templates/**',
            '!' + dir.client + '/scripts/modules/**',
        ])
        .pipe(browserify({
            shim: {
                'bootstrap': {
                    path: dir.client + '/scripts/vendor/bootstrap.js',
                    exports: null,
                },

                'typeahead.bundle': {
                    path: dir.client + '/scripts/vendor/typeahead.bundle.min.js',
                    exports: null,
                },

                'bootstrap.datepicker': {
                    path: dir.client + '/scripts/vendor/bootstrap-datepicker.js',
                    exports: null,
                },

                'jquery': {
                    path: dir.client + '/scripts/vendor/jquery-1.10.2.min.js',
                    exports: null,
                },

                'jquery.dotdotdot': {
                    path: dir.client + '/scripts/vendor/jquery.dotdotdot.min.js',
                    exports: null,
                },

                'jquery.fancybox': {
                    path: dir.client + '/scripts/vendor/fancybox/jquery.fancybox.pack.js',
                    exports: null,
                },

                'jquery.flexslider': {
                    path: dir.client + '/scripts/vendor/jquery.flexslider-min.js',
                    exports: null,
                },

                'jquery.imagesloaded': {
                    path: dir.client + '/scripts/vendor/jquery.imagesloaded.js',
                    exports: null,
                },

                'jquery.mobile.custom': {
                    path: dir.client + '/scripts/vendor/jquery.mobile.custom.min.js',
                    exports: null,
                },

                'jquery.validate': {
                    path: dir.client + '/scripts/vendor/jquery.validate.min.js',
                    exports: null,
                },

                'jquery.wookmark': {
                    path: dir.client + '/scripts/vendor/jquery.wookmark.min.js',
                    exports: null,
                },

                'wookmark': {
                    path: dir.client + '/scripts/vendor/wookmark.min.js',
                    exports: null,
                },

                'jquery.cloudinary': {
                    path: dir.client + '/scripts/vendor/cloudinary/jquery.cloudinary.js',
                    exports: null,
                },

                'jquery.fileupload': {
                    path: dir.client + '/scripts/vendor/cloudinary/jquery.fileupload.js',
                    exports: null,
                },

                'jquery.iframetransport': {
                    path: dir.client + '/scripts/vendor/cloudinary/jquery.iframe-transport.js',
                    exports: null,
                },

                'jquery.ui.widget': {
                    path: dir.client + '/scripts/vendor/cloudinary/jquery.ui.widget.js',
                    exports: null,
                },
            }
        }))
        .on('error', handleError)
        .pipe(gulp.dest(dir.client + '/js'));
});

gulp.task('clientScripts', ['clientLint', 'scripts-browserify'], function() {
    return gulp.src(dir.client + '/js/**/*.js')
        // .pipe(uglify())
        .pipe(gulp.dest(dir.dist + '/js'));
});

gulp.task('images', function() {
    return gulp.src(dir.client + '/img/**/*.{png,jpg,jpeg}')
        .pipe(
            imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
        .pipe(gulp.dest(dir.dist + '/img/'));
});

gulp.task('gif', function() {
    return gulp.src(dir.client + '/img/**/*.gif')
        .pipe(gulp.dest(dir.dist + '/img/'));
});

gulp.task('svg', function() {
    return gulp.src(dir.client + '/img/**/*.svg')
        .pipe(
            svgmin()
        )
        .pipe(gulp.dest(dir.dist + '/img/'));
});

gulp.task('fonts', function() {
    return gulp.src(dir.client + '/fonts/**')
        .pipe(gulp.dest(dir.dist + '/fonts/'));
});

gulp.task('watch-pot', ['mocha'], function() {
    gulp.watch('test/**/*.js', ['mocha']);
});

gulp.task('watch', ['client'], function() {

    // Watch client scripts
    gulp.watch(dir.client + '/scripts/**/*.js', ['clientScripts']);

    // Watch image files
    gulp.watch(dir.client + '/img/**/*.{png,jpg,jpeg}', ['images']);

    // Watch svg files
    gulp.watch(dir.client + '/img/**/*.svg', ['svg']);

    // Watch font files
    gulp.watch(dir.client + '/fonts/**', ['fonts']);

    // Watch styles
    gulp.watch([
            dir.client + '/sass/**/*.{sass,scss}',
        ], ['styles']);
});

gulp.task('mocha', function(cb) {
    gulp.src([
        'app/**/*.js',
        'config/**/*.js',
        'lib/**/*.js',
        // 'clients/scripts/**/*.js',
        // '!clients/scripts/vendor/**/*.js',
    ])
        .pipe(istanbul({
                includeUntested: true
            }))
        .pipe(istanbul.hookRequire())
        .on('error', handleError)
        .on('finish', function() {
            gulp.src('test/**/*.js')
                .pipe(mocha({ reporter: 'list' }))
                .on('error', handleError)
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('lint-tests', function() {
    return gulp.src([
            'test/**/*.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('lint', function() {
    return gulp.src([
            'gulpfile.js',
            'app/**/*.js',
            'config/**/*.js',
            'lib/**/*.js',
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('clientLint', function() {
    return gulp.src([
            dir.client + '/scripts/**/*.js',
            '!' + dir.client + '/scripts/vendor/**',
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('client', ['rimraf', 'bower'], function() {
    gulp.start('styles', 'clientScripts', 'images', 'gif', 'svg', 'fonts');
});

gulp.task('test', ['lint', 'mocha']);

gulp.task('app', function() {
    return nodemon({
            script: 'server.js',
            ignore: [
                'README.md',
                'node_modules/**',
                dir.client,
                dir.dist
            ],
            watchedExtensions: ['js', 'json', 'html'],
            watchedFolders: [dir.app, 'config', 'views', '!coverage'],
            debug: true,
            delayTime: 1,
            env: {
                NODE_ENV: 'local'
            },
        })
        .on('restart', ['lint']);
});

// Restart the app server
gulp.task('app-restart', function() {
    nodemon.emit('restart');
});

/** Build it all up and serve it */
gulp.task('default', ['app', 'watch']);

// /** Build it all up and serve the production version */
// gulp.task('serve', ['app', 'client', 'watch']);
