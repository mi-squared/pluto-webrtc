/**
 * Created by alykoshin on 17.05.15.
 */
'use strict';

var gulp        = require('gulp');

var zip         = require('gulp-zip');
var bump        = require('gulp-bump');
var gutil       = require('gulp-util');
var install     = require('gulp-install');
var header      = require('gulp-header');

var git         = require('gulp-git');
var jshint      = require('gulp-jshint');
var mocha       = require('gulp-mocha');
var jade        = require('gulp-jade');
var del         = require('del');
var vinylPaths  = require('vinyl-paths');
var vinylSourceStream  = require('vinyl-source-stream');
var vinylTransform  = require('vinyl-transform');
var vinylBuffer  = require('vinyl-buffer');
var rename      = require('gulp-rename');
var sass        = require('gulp-sass');
var concat      = require('gulp-concat');
var groupConcat = require('gulp-group-concat');
var uglify      = require('gulp-uglify');
var size        = require('gulp-size');          // print size of files
var print       = require('gulp-print');         // Prints names of files to the console so that you can see what's in the pipe.
var sourcemaps  = require('gulp-sourcemaps');
var stripDebug  = require('gulp-strip-debug');
var runSequence = require('run-sequence');
var lazypipe    = require('lazypipe');
var mainBowerFiles = require('main-bower-files');
var filter      = require('gulp-filter');
var ejs         = require('gulp-ejs');           // A plugin for Gulp that parses ejs template files
//var es = require('event-stream');
var addsrc      = require('gulp-add-src');
var shell       = require('gulp-shell');
//var domain      = require('domain');
var tap         = require('gulp-tap');
var replace         = require('gulp-replace');

var sassdoc     = require('sassdoc');
var browserify  = require('browserify');

var exorcist    = require('exorcist');
var streamify   = require('streamify');


var fs          = require('fs');
var path        = require('path');
var _           = require('lodash');
var merge       = require('merge-stream');
var moment      = require('moment');


var config = {
  bowerDir: './bower_components'
};

var paths = {};


var scriptsPath = '.';

var base = [
  //'**/source/*',
  './source/**/*',
  '!./source/gulpfile.js',
  //'!./source/node_modules',
  //'!./source/node_modules/*',
  '!./source/node_modules/**/*',
  //'!./source/bower_components',
  //'!./source/bower_components/*',
  '!./source/bower_components/**/*',
  '!./source/client/uploads/**/*'
];

gulp.task( 'zip-src', function() {
  var version = require('./package.json').version;  // Get current version
  var date = moment().format('YYYYMMDD-HHmmss');    // ... and current date
  var archiveName = 'source-'+ version + '-' + date +'.zip';
  var files = base;
  gutil.log('files:', files);

  return gulp.src( files , { cwd: '..', cwdbase: true } )
    .pipe( zip( archiveName ) )
    .pipe( gulp.dest( '../archive/' ) );
  //.pipe( gulp.dest( './' ) );
});

gulp.task( 'zip-all', function() {
  var version = require('./package.json').version;  // Get current version
  var date = moment().format('YYYYMMDD-HHmmss');    // ... and current date
  var archiveName = 'source-'+ version + '-' + date +'.zip';
  var files = base;
  gutil.log('archiveName:', archiveName);
  gutil.log('files:', files);

  return gulp.src( files , { cwd: '..', cwdbase: true } )
    .pipe( zip( archiveName ) )
    .pipe( gulp.dest( '../archive/' ) );
  //.pipe( gulp.dest( './' ) );
});

gulp.task('bump-version', function () {
  //Note: I have hardcoded the version change type to 'patch' but it may be a good idea to use
  //      minimist (https://www.npmjs.com/package/minimist) to determine with a command argument whether you are doing
  //      a 'major', 'minor' or a 'patch' change.
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: "patch"}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('_install', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(install());
});

gulp.task('_default', function() {
  runSequence(
    'bump-version',
    'zip-src',
    function (error) {
      if (error) { gutil.log(error.message); }
      else { gutil.log('RELEASE FINISHED SUCCESSFULLY'); }
      //callback(error);
    }
  );
});

//gulp.task('lint1', function () {
//  return gulp
//    .src('./sample.js')
//    .pipe(jshint())
//    .pipe(jshint.reporter('default'));
//});

//gulp.task('lint', function () {
//  return gulp
//    .src('./src/*.js')
//    .pipe(jshint('.jshintrc'))
//    .pipe(jshint.reporter('jshint-stylish'));
//});

//gulp.task('mocha', function () {
//  gulp.src('./test/*.js')
//    .pipe(mocha({ reporter: 'list' }));
//});

//gulp.task('sass', function() {
//  return gulp.src('scss/*.scss')
//    .pipe(sass())
//    .pipe(gulp.dest('css'));
//});

//gulp.task('clean:dist', function (cb) {
//  del([
//    '../dist/**/*'
//  ], {force: true}, cb);
//});

//gulp.task('clean:build', function (cb) {
//  del([
//    '../build/**/*'
//  ], {force: true}, cb);
//});

//gulp.task('clean', ['clean:dist', 'clean:build']);

//gulp.task('build', ['test', 'clean'], function () {
//  var info = '// <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %>\n';
//  var pkg = require('./package.json');
//
//  return gulp
//    .src('./src/contra.js')
//    .pipe(gulp.dest('../dist'))
//    .pipe(rename('contra.min.js'))
//    .pipe(uglify())
//    .pipe(header(info, { pkg : pkg }))
//
//    .pipe(size())
//    .pipe(gulp.dest('./dist'));
//});

//gulp.task('build-shim', ['build'], function () {
//  return gulp
//    .src('./src/contra.shim.js')
//    .pipe(gulp.dest('./dist'))
//    .pipe(rename('contra.shim.min.js'))
//    .pipe(uglify())
//    .pipe(size())
//    .pipe(gulp.dest('./dist'));
//});

//gulp.task('tag', ['bump'], function () {
//  var pkg = require('./package.json');
//  var v = 'v' + pkg.version;
//  var message = 'Release ' + v;
//
//  return gulp
//    .src('./')
//    .pipe(git.commit(message))
//    .pipe(git.tag(v, message))
//    .pipe(git.push('origin', 'master', '--tags'))
//    .pipe(gulp.dest('./'));
//});

//gulp.task('npm', ['tag'], function (done) {
//  require('child_process').spawn('npm', ['publish'], { stdio: 'inherit' })
//    .on('close', done);
//});

//gulp.task('test', ['lint', 'mocha']);
//gulp.task('ci', ['build']);
//gulp.task('release', ['npm']);

//gulp.task('concat-js', function() {
//  return gulp
//    .src(['./public/*.js'])
//    .pipe(sourcemaps.init('../dist', {loadMaps: true}))
//    .pipe(groupConcat({
//      //'components.js': '**/components/*.js',
//      'bundle.js': '**/*.js'
//    }))
//    .pipe(sourcemaps.write('.'))
//    .pipe(gulp.dest('../dist'))
//});

//gulp.task('min-js', ['concat-js'], function() {
//  var info = '// <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %>\n';
//  var pkg = require('./package.json');
//  return gulp
//    //.src(['../dist/bundle.js'])
//    .src(['./public/*.js'])
//    .pipe(sourcemaps.init('../dist', {loadMaps: true}))
//    .pipe(groupConcat({
//      //'components.js': '**/components/*.js',
//      'bundle.js': '**/*.js'
//    }))
//    .pipe(rename('bundle.min.js'))
//    .pipe(size())
//    .pipe(uglify())
//    // corrupts sourcemaps >> //.pipe(header(info, { pkg : pkg })) // <<
//    .pipe(size())
//    .pipe(sourcemaps.write('.'))
//    .pipe(gulp.dest('../dist'));
//});

//gulp.task('strip', function () {
//  return gulp.src('./public/*.js')
//    .pipe(stripDebug())
//    .pipe(gulp.dest('../dist'));
//});

//gulp.task('min', ['min-js']);

//gulp.task('scripts', ['min']);

// Watch Files For Changes
//gulp.task('watch', function() {
//  //gulp.watch('js/*.js', ['lint', 'scripts']);
//
//gulp.watch(['**/*.js', '**/*.json', '**/*.html', '**/*.css'], ['build:dev']);
//
//  //gulp.watch('scss/*.scss', ['sass']);
//
//.on('change', function(event) {
//  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//})

//});

//gulp.task('default2', ['lint', 'sass', 'scripts', 'watch']);

/*
 dev int demo train stage preprod prod

 Development Integration Staging/Demonstration/Training pre production
 Production
 dev qa staging production
 PACKAGING
 */

//var jadeTask = lazypipe()
//  .pipe( jade, { pretty: true } );
//
//gulp.task('jade', function() {
//  return gulp.src('public/*.jade')
//
//    //.pipe(jade({
//    //  pretty: true
//    //}))
//    .pipe(jadeTask())
//    .pipe(gulp.dest('../dist/'));
//    //.pipe( livereload( server ));
//});

var path_js_vendor  = 'public/vendor/js/';
var path_css_vendor = 'public/vendor/css/';
var path_swf_vendor = 'public/vendor/swf/';
var path_img_vendor = 'public/vendor/img/';

var bowerFileTypes = [{
  filter: '*.js',
  dest:   path_js_vendor
}, {
  filter: '*.css',
  dest:   path_css_vendor
}, {
  filter: '*.swf',
  dest:   path_swf_vendor
}, {
  filter: ['*.png', '*.jpg', '*.jpeg', '*.bpm', '*.gif'],
  dest:   path_img_vendor
}
];

// List of files not properly determined by main-bower-files plugin
var mainBowerFix = [
  config.bowerDir+'/jquery-ui/themes/smoothness/jquery-ui.css',
  config.bowerDir+'/jquery-ui/themes/smoothness/theme.css',
  config.bowerDir+'/jquery-ui/themes/smoothness/images/*'
];

// Copy main Bower files

gulp.task('bower-copy-main', function() {
  var stream, streams = [];
  for (var len=bowerFileTypes.length, i=0; i<len; ++i) {
    stream = gulp
        .src(mainBowerFiles())
        .pipe(addsrc( mainBowerFix ))
        .pipe(filter( bowerFileTypes[i].filter ))
        .pipe(gulp.dest(  bowerFileTypes[i].dest ))
        .pipe(print(function (filepath) {
          return 'bower-copy: ' + filepath;
        }))
      ;
    streams.push(stream);
  }

  return merge(streams);
});

// Copy Bower files not properly defined

gulp.task('bower-jquery-css-fix', ['bower-copy-main'], function() {
  // Fix for jquery-ui paths
  return gulp
    .src( path.join( path_css_vendor, '/*') )
    .pipe(replace('url("images/', 'url("../img/'))
    .pipe( gulp.dest( path_css_vendor) )
    .pipe(print(function (filepath) {
      return 'replace: ' + filepath;
    }))
  ;
});

gulp.task('bower-copy-fix', ['bower-copy-main'], function() {
});

// Copy Bower files

gulp.task('bower-copy', ['bower-copy-main', 'bower-copy-fix', 'bower-jquery-css-fix']);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Setting up JSDoc with NPM and Gulp Task Runner
//
// http://dannydelott.com/setting-up-jsdoc-with-npm-and-gulp/

//var jsdoc_source_dir = 'public/js/wrtclib/connection/**/*';
//var jsdoc_source_dir = 'public/js/wrtclib/connection/test.js';

// if use blolbs, then jsdoc gets each file and dir (handled as empty input)
var jsdoc_source_dir =
    'public/js/wrtclib'
//'public/js/wrtclib/WebRTC.js'
  ;
var jsdoc_target_dir = '../doc/jsdoc';

gulp.task('jsdoc', function() {

  //var jsdoc = 'nodejs ./node_modules/jsdoc/jsdoc';
  //var jsdoc = '/usr/local/bin/jsdoc';
  var jsdoc = 'jsdoc';

  //shell.task( [
  //  jsdoc + ' -r ' + ' -d ' + jsdoc_target_dir + ' '+jsdoc_source_dir
  //]);

  var cmd = jsdoc +
    ' --recurse ' +
    ' --private ' +
    ' -d ' + jsdoc_target_dir +
    '    "<%= file.path %>" ';

  // https://github.com/sun-zheng-an/gulp-shell
  return gulp.src(jsdoc_source_dir, {read: false})
    .pipe(shell([
      'echo shell: '+cmd,
      cmd
    ]));

});

//gulp.task('watch', ['jsdoc'], function () {
gulp.task('watch-jsdoc', function () {
  return gulp
    .watch(/*paths.js*/ jsdoc_source_dir, ['jsdoc'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
    ;
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// http://sassdoc.com/gulp/
//
gulp.task('sassdoc', function () {
  var paths = {
    source: './public/skins/**/*',
    dest:   '../doc/sassdoc'
  };

  var options = {
    dest: paths.dest,
    verbose: true,
    display: {
      access: ['public', 'private'],
      alias: true,
      watermark: true,
    },
    //groups: {
    //  'undefined': 'Ungrouped',
    //  foo: 'Foo group',
    //  bar: 'Bar group',
    //},
    //basePath: 'https://github.com/SassDoc/sassdoc',
  };

  return gulp.src(paths.source)
    .pipe(sassdoc(options))
    .resume(); // Drain event - http://sassdoc.com/gulp/#drain-event
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

paths.templates = {
  main:     './public/templates/*.ejs',
  partials: './public/templates/partials/**/*.ejs',
  watch:    './public/templates/**/*.ejs',
  output:   './public'
};

gulp.task('ejs', function() {
  gulp.src(paths.templates.main)
    //.pipe(print(function (filepath) {
    //  return 'ejs1: ' + filepath;
    //}))

    .pipe(ejs({
      //msg: 'Hello Gulp!'
      //test: '11111111111111111' // function() { return 'tttttttttt';}
      require: require
    })
      .on('error', gutil.log))

    //.pipe(print(function (filepath) {
    //  return 'ejs2: ' + filepath;
    //}))

    .pipe(gulp.dest( paths.templates.output ))
  ;
});

gulp.task('watch-ejs', ['ejs'], function () {
  return gulp
    .watch([paths.templates.watch], ['ejs'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
    ;
});




var bases = {
  app:  '.',
  dist: {
    root: '../build/',
    dev:  'dev/'
  }
};

paths.client_js = ['./client/js/**/*.js', '!scripts/lib/**/*'];
paths.server_js = ['./server/*.js',  './server/*.json'];
paths.lib =    ['scripts/libs/jquery/dist/jquery.js', 'scripts/libs/underscore/underscore.js', 'scripts/backbone/backbone.js'];
paths.stylesheets = ['./client/stylesheets/**/*.css'];
paths.html =   ['./client/**/*.html', '!./client/**/_*.html', '404.html'];
paths.images = ['./client/images/**/*.png', './client/images/**/*.jp?g'];
paths.extras = ['crossdomain.xml', 'humans.txt', 'manifest.appcache', 'robots.txt', 'favicon.ico'];

var targets  = {
  client: {
    js:          'client/js/',
    html:        'client/html/',
    images:      'client/images/',
    stylesheets: 'client/stylesheets'
  },
  server: {
    js: 'server/'
  }
};

gulp.task('build:dev', ['clean'], function() {
  var dest;

  dest = bases.dist.root + bases.dist.dev;

  // Copy package.json, bower.json, .bowerrc
  gulp.src(['package.json', 'bower.json', '.bowerrc'], { cwd: bases.app })
    .pipe(gulp.dest( dest ));

  // Copy client .js
  //gulp.src(paths.client_js, { cwd: bases.app })
  //  .pipe(gulp.dest( dest + targets.client.js));

  // Copy client .html
  //gulp.src(paths.html, { cwd: bases.app })
  //  .pipe(gulp.dest( dest + targets.client.html ));

  // Copy client images
  //gulp.src(paths.images,    { cwd: bases.app })
  //  .pipe(gulp.dest( dest + targets.client.images ));

  // Copy client .css
  //gulp.src(paths.stylesheets,    { cwd: bases.app })
  //  .pipe(gulp.dest( dest + targets.client.stylesheets ));

  // Copy server .js
  //gulp.src(paths.server_js, { cwd: bases.app })
  //  .pipe(gulp.dest( dest + targets.server.js ));

});

gulp.task('watch', ['watch-ejs', 'watch-jsdoc', 'watch-bfy'], function() {
//  //gulp.watch('js/*.js', ['lint', 'scripts']);
//
//gulp.watch(['**/*.js', '**/*.json', '**/*.html', '**/*.css'], ['build:dev']);
//
//  //gulp.watch('scss/*.scss', ['sass']);
//
//.on('change', function(event) {
//  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

var bfy_base = './public/js';
//var bfy_base = './js';

var bfy_watch_dir = [
  bfy_base+'/wrtclib/**/*.js',
  '!'+bfy_base+'/dist/**/*'
];

var bfy_start_files_arr = [
  bfy_base+'/wrtclib/connection/endpoint.js',
  //'./public/js/wrtclib/containers/basicContainer.js',
  bfy_base+'/wrtclib/containers/videoContainer.js',
  bfy_base+'/wrtclib/containers/videoHolder.js',
  bfy_base+'/wrtclib/localMedia/localMedia.js'
];
var bfy_dest_file  = 'bundle.js';
var bfy_dest_prod_file  = 'bundle.min.js';
var bfy_dest_dev_dir   = bfy_base+'/dist/dev' ;
var bfy_dest_prod_dir  = bfy_base+'/dist/prod' ;

gulp.task('browserify_not_work', function() {

  // Diagnose what browserify-shim is doing
  process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

  gulp.src('src/app.js', {read: false})
    .pipe(tap(function(file) {
      var d = domain.create();

      d.on('error', function(err) {
        gutil.log(
          gutil.colors.red('Browserify compile error:'),
          err.message,
          '\n\t',
          gutil.colors.cyan('in file'),
          file.path
        );
      });

      d.run(function() {
        file.contents = browserify({
          entries: [file.path],
          debug: true
        })
          //.add(es6ify.runtime)
          //.transform(hbsfy)
          //.transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
          //.transform(bulkify)
          //.transform(aliasify)
          .bundle();
      });
    }))
    .pipe(streamify(concat( bfy_dest_file )))
    .pipe(gulp.dest( bfy_dest_dir ))
  ;
});

gulp.task('browserify', function(done) {

  // Diagnose what browserify-shim is doing
  //process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

  var targets = [
    {
      name: 'wrtclib',
      files: [
        bfy_base+'/wrtclib/connection/endpoint.js',
        //'./public/js/wrtclib/containers/basicContainer.js',
        bfy_base+'/wrtclib/containers/videoContainer.js',
        bfy_base+'/wrtclib/containers/videoHolder.js',
        bfy_base+'/wrtclib/localMedia/localMedia.js'
      ]
    }
  ];

  targets.forEach(function(entry, i, entries) {

    entries.remaining = entries.remaining || entries.length*2;

    var bfy_options = {
      entries: entry.files,
      debug: true
    };

    var bfy_dev_file        = entry.name + '.bundle.js';
    var map_dev_file        = entry.name + '.bundle.map';
    var map_dev_filepath    = path.join( bfy_dest_dev_dir, map_dev_file);
    browserify(bfy_options)
      .bundle()
      .pipe(exorcist(map_dev_filepath , map_dev_file, 'file://' + __dirname))
      .pipe(vinylSourceStream( entry.name ))
      .pipe(vinylBuffer())
      .pipe(rename({extname:'.bundle.js'}))
      .pipe(gulp.dest( bfy_dest_dev_dir ))
      .on('end', function() {
        if (! --entries.remaining) done();
        console.log('end');
      })
    ;

    //var bfy_prod_file        = entry.name + '.bundle.js';
    var map_prod_file        = entry.name + '.bundle.min.map';
    var map_prod_filepath    = path.join( bfy_dest_prod_dir, map_prod_file);
    browserify(bfy_options)
      .bundle()
      .pipe(exorcist(map_prod_filepath , map_prod_file, 'file://' + __dirname))
      .pipe(vinylSourceStream( entry.name ))
      //.pipe(vinylBuffer())
      //.pipe(uglify)
      //.pipe(streamify(uglify()))
      .pipe(rename({extname:'.bundle.min.js'}))
      .pipe(gulp.dest( bfy_dest_prod_dir ))
      .on('end', function() {
        if (! --entries.remaining) done();
        console.log('end');
      })
    ;
  });

  //var bfy_options = {
  //  entries: bfy_start_files_arr,
  //  debug: true
  //};

  //process.chdir('public');
  /*
   Source maps supported by WebStorm

   var bundle_file     = bfy_dest_file;
   var bundle_filepath = path.join( bfy_dest_dev_dir, bfy_dest_file );
   var map_file        = bfy_dest_file + '.map';
   var map_filepath    = path.join( bfy_dest_dev_dir, map_file);
   // !!! for this to work project path must not contains symbol links
   //     maybe also be full like '/home/alykoshin/.....'
   //var sourceRoot = 'file://' + __dirname;// path.join( __dirname, 'public/js');
   //!!! working
   var sourceRoot = 'file:///home/alykoshin/sync/al-projects/odesk/05-WebRTC for TeleHealth/source';// path.join( __dirname, 'public/js');
   //!!! working
   //var sourceRoot = 'file:///~/projects/odesk/05-WebRTC for TeleHealth/source';
   //var sourceRoot = 'file://./source/public';
   //var sourceRoot = 'source';
   return browserify({debug: true})
   .add(bfy_start_files_arr)
   .bundle()
   .pipe(exorcist(map_filepath , map_file, sourceRoot))
   .pipe(vinylSourceStream( bfy_dest_file ))
   .pipe(gulp.dest( bfy_dest_dev_dir ))
   .pipe(gulp.dest(bfy_dest_prod_dir))
   ;  */

  /*  return     browserify(bfy_options)
   .bundle()
   .pipe(vinylSourceStream('bundle.js')) // gives streaming vinyl file object
   //.pipe(vinylBuffer()) // <----- convert from streaming to buffered
   .pipe(vinylTransform(function () {
   return exorcist(path.join(bfy_dest_dev_dir, 'bundle.map'));
   }))
   //.pipe(concat('bundle.js'))
   .pipe(gulp.dest(bfy_dest_dev_dir));
   */
  //.pipe(gulp.dest(bfy_dest_dev_dir))
  //.pipe(sourcemaps.init({loadMaps: true}))
  /* .pipe(uglify()) // {debug: true})) // now gulp-uglify works
   .on('error', gutil.log)
   .pipe(rename({
   //dirname: 'main/text/ciao',
   //basename: 'aloha',
   //prefix: 'bonjour-',
   suffix: '-min',
   //extname: '.md'
   })) */
  //.pipe(sourcemaps.write({includeContent: false, sourceRoot: './'}))
  //.pipe(gulp.dest(bfy_dest_prod_dir))
  //.pipe(exorcist(path.join(bfy_dest_dev_dir, 'bundle.js.map')))
  //.pipe(gulp.dest(bfy_dest_prod_dir))
  //.pipe(fs.createWriteStream(path.join(bfy_dest_dev_dir, 'bundle.js'), 'utf8'))

  //.pipe(exorcist(path.join(bfy_dest_prod_dir, 'bundle.min.js.map')))
  // //.pipe(gulp.dest(bfy_dest_prod_dir))
  //.pipe(fs.createWriteStream(path.join(bfy_dest_prod_dir, 'bundle.min.js'), 'utf8'))
  //;

  /*  return browserify( bfy_options )
   .on('error', function (err) {
   gutil.log(err);
   //console.log(err.toString());
   this.emit('end');
   })
   .bundle()
   // Передаем имя файла, который получим на выходе, vinyl-source-stream
   //.pipe(vinylSourceStream('bundle.js'))
   //.pipe(gulp.dest( bfy_dest_dir ))
   //.pipe(streamify(uglify()))
   .pipe(vinylSourceStream('bundle.js'))
   .pipe(streamify(uglify()))
   .pipe(gulp.dest( bfy_dest_dir + '/bundle.min.js' ))
   ;*/

  /*  // use `vinyl-transform` to wrap the regular ReadableStream returned by `b.bundle();` with vinyl file object
   // so that we can use it down a vinyl pipeline
   // while taking care of both streaming and buffered vinyl file objects
   var browserified = vinylTransform(function(filename) {
   // filename = './source/scripts/app.js' in this case
   return browserify({
   entries: [filename],
   debug: true
   })
   //.on('error', function (err) {
   //  gutil.log(err);
   //  //console.log(err.toString());
   //  this.emit('end');
   //})
   .bundle();
   });

   return gulp.src( bfy_start_files_arr ) // you can also use glob patterns here to browserify->uglify multiple files
   .pipe(browserified)
   .pipe(uglify())
   .pipe(gulp.dest(bfy_dest_dir))
   ;           */

  //return browserify( bfy_options )
  //  .on('error', function (err) {
  //    gutil.log(err);
  //    console.log(err.toString());
  //    this.emit('end');
  //})
  //.bundle()
  // Передаем имя файла, который получим на выходе, vinyl-source-stream
  //.pipe(vinylSourceStream('bundle.js'))
  //.pipe(gulp.dest( bfy_dest_dir ))
  //.pipe(streamify(uglify()))
  //.pipe(vinylSourceStream('bundle.js'))
  //.pipe(streamify(uglify()))
  //.pipe(gulp.dest( bfy_dest_dir + '/bundle.min.js' ))
  //;
});

gulp.task('watch-bfy', ['browserify'], function () {
  return gulp
    .watch(/*paths.js*/ bfy_watch_dir, ['browserify'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
    ;
});
