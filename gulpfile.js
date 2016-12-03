/* global process */
/* aside notes: 
    - 'livereload' works in conjunction with a node.js middleware (connect-nodemon). Alternatively, you can use a browser plugin
    - in Chrome, changes in 'less' files are visible only after you move the mouse over the browser. Works fine in IE and FF.
        * seems to be a browser problem: https://github.com/livereload/livereload-extensions/issues/26#issuecomment-96439256
        * keeping Elements tab in Developer Tools opened seems to be a workaround: https://github.com/livereload/livereload-extensions/issues/26#issuecomment-104997269
    - an error occurs when you delete a folder under watched (a gulp restart is require) - https://github.com/gulpjs/gulp/issues/945
    - sometimes, renaming a file requires a full page reload. That is because renaming a file invokes two events: "deleted" and "renamed" - https://github.com/gulpjs/gulp/issues/917
*/
var gulp = require('gulp'), // task runner
    bowerFiles = require('main-bower-files'), // get all bower files (js and css) based on bower.json 
    inject = require('gulp-inject'), // inject a string into placeholders in html files
    livereload = require('gulp-livereload'), // automatically refresh the browser; requires a browser plugin OR a node.js middleware
    nodemon = require('gulp-nodemon'), // monitor for changes in node.js files and restart your app
    less = require('gulp-less'), // compile less to css
    jshint = require('gulp-jshint'), // a js code quality tool
    stylish = require('jshint-stylish'), // another reporter for jshint
    runSequence = require('run-sequence'), // a cool way of choosing what must run sequentially, and what in parallel
    del = require('del'), // delete files/folders  
    concat = require('gulp-concat'), // concatenate files    
    // babel = require('gulp-babel'), // back thick (`) used for inline template is feature of ES5: http://stackoverflow.com/a/34411589
    uglify = require('gulp-uglify'), // js minification
    minifyCSS = require('gulp-minify-css'), // css minification
    rev = require('gulp-rev'), // add a unique id at the end of app.js (ex: app-f4446a9c.js) to prevent browser caching
    filter = require('gulp-filter'), // filter files in a stream  
    //notify = require('gulp-notify'),  // display a message inside the pipeline  Ex: .pipe(notify('some message'))  
    gutil = require('gulp-util'), // colorful logs and ather stuff
    path = require('path'); // handling file path
    //var debug = require('gulp-debug'); // => display files that run through your pipeline Ex: .pipe(debug())
    var mocha = require('gulp-mocha');
    var through = require('through2');
    var ghPages = require('gulp-gh-pages');
    // var gnf = require('gulp-npm-files'); // copy only node_modules used in production (not "dev_dependencies")
    var file = require('gulp-file'); // create a file from string
    var ts = require('gulp-typescript');
    var tsProject = ts.createProject('tsconfig.json');
    var tslint = require('gulp-tslint');
    
/*  usage:
    
    "gulp" - an alias for "gulp dev:watch"
    "gulp dev:watch" - build and livereload for dev
    "gulp dev" - build for dev
    "gulp prod" - build for prod
*/

gulp.task('default',['dev:watch']);

gulp.task('dev:watch', function(cb) {
    runSequence(
        'dev',
        ['watch-client', 'watch-server'],
    cb);
});

gulp.task('dev', function(cb) {
    runSequence(
        'clean-css',
        ['less', 'less-srv'],
        'tslint',
        'tsc',        
        'jshint',        
        'build-dev-html',
    cb);
});

gulp.task('prod', function(cb) {
    runSequence(
        ['clean-dist', 'clean-css'],
        ['less', 'less-srv', 'tsc'],
        ['build-scripts', 'build-scripts-bower', 'build-styles', 'build-styles-bower'],
        ['copy-server', 'copy-client', 'copy-bootstrap-fonts', 'copy-assets', 'copy-node-modules', 'create-buildInfo.json'],
        'build-prod-html',
    cb);
});

gulp.task('test', function(cb) {
    runSequence(
        ['test:server'],
    cb);
});


// 1. development task definitions ============================================================

gulp.task('test:server', function () {
    return gulp.src('./server/**/*.spec.js', {read: false})
        .pipe(mocha({
            //reporter: 'spec'
        }))
        .once('error', function () {
            process.exit(1);
        })
        .once('end', function () {
            process.exit();
        });
});


gulp.task('clean-css', function (cb) {
    return del(['./client/app/**/*.css'], cb); // we have to be sure that there are no CSS files without a corresponding LESS
});

gulp.task('less', function() {
    return gulp.src('./client/app/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./client/app'));
});

gulp.task('less-srv', function() {
    return gulp.src('./server/public/css/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./server/public/css'));
});

gulp.task('build-dev-html', function(){  
    return gulp.src('./client/index.html')
        .pipe(inject(gulp.src('./client/app/**/*.css', {read:false}), {relative: true})) // css app files  
        .pipe(inject(gulp.src('./client/app/**/*.js', {read: false}), {relative: true})) // js app files  
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name:'inject-vendor', relative: true})) // bower js and css files  
        .pipe(gulp.dest('./client/'));
});

gulp.task('jshint', function() { 
    var err = false;
    return gulp.src('./client/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish)) // defines how errors are displayed      
        .pipe(jshint.reporter('fail')) // throw an error if there are errors in jshint. Catch it with 'plumber' or 'on error' event    
        .on('error', function(error){
            err = true;
            gutil.log(gutil.colors.red('JSHINT failed!'));
            this.emit('end'); // end the current task so that 'passed' msg is no longer displayed
        })
        .on('end', function(error){
            if(!err)
                gutil.log(gutil.colors.green('JSHINT passed!'));
        });                        
});

gulp.task('tslint', function() { 
    var err = false;
    return gulp.src('./client/app/**/*.ts')
        .pipe(tslint())
        .pipe(tslint.report("prose")) // defines how errors are displayed         
        .on('error', function(error){
            err = true;
            gutil.log(gutil.colors.red('TSLINT failed!'));
            this.emit('end'); // end the current task so that 'passed' msg is no longer displayed
        })
        .on('end', function(error){
            if(!err)
                gutil.log(gutil.colors.green('TSLINT passed!'));
        });                          
});

gulp.task('watch-server', function() {
    livereload.listen({port:35729}); // listen for changes
	nodemon({ // nodemon config - http://jpsierens.com/tutorial-livereload-nodemon-gulp/
    		script: 'server/app.js', // the script to run the app
            //verbose: true,
    		ext: 'js hbs html',
            ignore: ['node_modules/', 'client', 'gulpfile.js']
            //stdout: false
        })
	   .on('restart', function(){                 
            gulp.src('server/app.js', {read:false})
                .pipe(livereload({port:35729}));
        });
});

gulp.task('watch-client', function() { // using the native "gulp.watch" plugin

    function injectJsAndReload(cb){
        gulp.src('./client/index.html')
            .pipe(inject(gulp.src('./client/app/**/*.js', {read: false}), {relative: true})) // js app files   
            .pipe(gulp.dest('./client/'))
            .on('end', function(){ 
                livereload.reload(); // 'add' and 'delete' generate a modification in index.html so that a full page reload is required
            }); 
    };
        
    function injectCssAndReload(){
        gulp.src('./client/index.html')
            .pipe(inject(gulp.src('./client/app/**/*.css', {read: false}), {relative: true})) // css app files   
            .pipe(gulp.dest('./client/'))
            .on('end', function(){ 
                livereload.reload();
            }); 
    };

    gulp.watch('client/app/**/*.*').on('change', function(file) { // no "./" in front of glob
        // we have to monitor all kind of files, in all folders
        // otherwise, the 'watch' doesn't catch added files in new folders,
        // or folders that does't contain at least one file with same extension as that monitored.
        
        var ext = path.extname(file.path); // ex: .js       
        //var fileName = file.path.replace(__dirname, ''); // ex: \client\app\controllers\test.js
        var fileName = path.basename(file.path); // ex: test.css
        var crtDir = path.parse(file.path).dir; // ex: c:/.../controllers
        var name = path.parse(file.path).name; // ex: test      

        gutil.log(gutil.colors.cyan('watch-all'), 'saw',  gutil.colors.magenta(fileName), 'was ' + file.type);            
        
        if(ext == '.less'){                                                 
            if(file.type === 'deleted'){
                del(path.join(crtDir, name) + '.css'); 
            } else if(file.type === 'added' || file.type === 'changed' || file.type === 'renamed'){
                gulp.src(file.path)
                    .pipe(less())
                    .pipe(gulp.dest(path.parse(file.path).dir)); 
            };             
        
        } else if(ext == '.css'){                  
            if(file.type === 'added' || file.type === 'renamed'){
                injectCssAndReload();
            } else if(file.type === 'deleted'){ 
                del(file.path, injectCssAndReload);
            } else if(file.type === 'changed'){
                livereload.changed(fileName);         
            };             
        
        } else if(ext == '.js'){                
            if(file.type === 'added' || file.type === 'renamed'){
                injectJsAndReload();
            } else if(file.type === 'deleted'){
                del(file.path, injectJsAndReload); 
            } else if(file.type === 'changed'){
                gulp.src(file.path)    
                    .pipe(jshint())
                    .pipe(jshint.reporter(stylish))
                    .pipe(jshint.reporter('fail')) // throw an error if jshint reports invalid code. This error is caught by 'plumber' or 'error' handler
                    .on('error', function(error){
                        gutil.log(gutil.colors.red('JSHINT failed!'));
                        this.emit('end'); // end the current task so that 'passed' msg is no longer displayed
                    })                                   
                    // .pipe(notify(function(){ // hack - 'notify' is used just as a wrapper to run regular code into the pipeline
                    //     gutil.log(gutil.colors.green('JSHINT passed!'));
                    //     livereload.changed(fileName);
                    // }))
                    .pipe(through.obj(function(file, enc, cb) { // 'through2' is used as a wrapper to run regular code into the pipeline
                        gutil.log(gutil.colors.green('JSHINT passed!'));
                        livereload.changed(fileName);
                        cb(null, file);
                    }));                 
            };         
        } else if(ext == '.html'){
            livereload.changed(fileName); 
        } else if(ext == '.ts' && file.type === 'changed'){
            // ts-lint
            gulp.src([file.path])
                    .pipe(tslint())
                    .pipe(tslint.report("prose"))                  
                    .on('error', function(error){
                        gutil.log(gutil.colors.red('TSLINT failed!'));
                        this.emit('end'); // end the current task so that 'passed' msg is no longer displayed
                    })                                   
                    .pipe(through.obj(function(file, enc, cb) { // 'through2' is used as a wrapper to run regular code into the pipeline
                        gutil.log(gutil.colors.green('TSLINT passed!'));
                        //livereload.changed(fileName);
                        cb(null, file);
                    }));
                    
            // ts-compile
            gulp.src([file.path, "typings/**/**.d.ts"])
                    .pipe(ts(tsProject))
                    .js.pipe(gulp.dest(path.parse(file.path).dir));                                                     
        };   

    });
});
        

// 2. production task definitions ===============================================================


gulp.task('clean-dist', function (cb) {
    return del(['./dist/'], cb); // delete the 'dist' folder
});
 
gulp.task('build-scripts', function() {
    return gulp.src('./client/app/**/*.js')
        .pipe(concat('app.js'))
        // .pipe(babel({
        //     presets: ['es2015'], // add support for ES2015 (back thick "`" in inline template) http://stackoverflow.com/a/34411589
        //     compact: false // remove warning: 'code generator has deoptimised...' ->http://stackoverflow.com/a/30879872
        // }))       
        .pipe(uglify()
            .on('error', function(e){
                console.log(e);
            }))
        .pipe(rev()) // add a unique id at the end of app.js (ex: app-f4446a9c.js)
        .pipe(gulp.dest('./dist/client/app'));
});
 
gulp.task('build-scripts-bower', function() {
    return gulp.src(bowerFiles())
        .pipe(filter(['*.js', '!bootstrap-sass-official', '!bootstrap.js', '!json3', '!es5-shim']))
        .pipe(concat('vendor.js'))
        .pipe(uglify()
            .on('error', function(e){
                console.log(e);
            }))        
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});
 
gulp.task('build-styles',function() {
    return gulp.src('./client/app/**/*.css')
        .pipe(concat('app.css'))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});
 
gulp.task('build-styles-bower', function() {
    return gulp.src(bowerFiles())
        .pipe(filter(['*.css', '!bootstrap-sass-official', '!json3',  '!es5-shim']))
        .pipe(concat('vendor.css'))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});
 
gulp.task('copy-server', function(){
    return gulp.src('./server/**/*.*')
        .pipe(gulp.dest('./dist/server'));
});
 
gulp.task('copy-client', function(){
    //return gulp.src('./client/**/**/*.+(html|txt|ico)')
    return gulp.src(['./client/**/**/*.html','./client/*.+(txt|ico)'])
        .pipe(gulp.dest('./dist/client/'));
});

gulp.task('copy-bootstrap-fonts', function(){
    return gulp.src('./client/bower_components/bootstrap/dist/fonts/*.*')
        .pipe(gulp.dest('./dist/client/fonts'));
});
 
gulp.task('copy-assets', function() {
    return gulp.src('./client/assets/**/*.*')
        .pipe(gulp.dest('./dist/client/assets'));
});

gulp.task('copy-node-modules', function() {
    // return gulp.src(gnf(), {base:'./'})
    //     .pipe(gulp.dest('./dist'));

    // on the build server, use 'npm i --only=prod' to not install dev. packages: http://stackoverflow.com/a/9276112
    return gulp.src('./node_modules/**/*.*')
        .pipe(gulp.dest('./dist/node_modules'));
});

// gulp.task('create-package.json', function() {
//     var str = 
//       '{\n' +
//       '    "scripts": {\n' +
//       '        "start": "node server/app.js",\n' +
//       '        "start_windows": "set NODE_ENV=production&&node server/app.js"\n' +
//       '    }\n' +
//     '}';
//     return file('package.json', str, { src: true })
//         .pipe(gulp.dest('./dist'));
// });

gulp.task('build-prod-html', function(){
    var localInject = function(pathGlob, name) {
		var options = {
        	ignorePath: '/dist/client/', // remove the '/dist/client' from the path           
        	addRootSlash: false, // do not add a root slash to the beginning of the path
            removeTags: true, // remove <--inject--> tags after injection
            name: name || 'inject'
		};
		return inject(gulp.src(pathGlob, {read:false}), options);
	};
    
    return gulp.src('./client/index.html')
        .pipe(localInject('./dist/client/app/app*.js')) // js app files   
        .pipe(localInject('./dist/client/app/app*.css')) // css application files            
        .pipe(localInject('./dist/client/app/vendor*.js','inject-vendor'))  // js vendor files  
        .pipe(localInject('./dist/client/app/vendor*.css','inject-vendor')) // css vendor files       
        .pipe(gulp.dest('./dist/client/'));
});

gulp.task('create-buildInfo.json', function () {
    var str =
        '{\n' +
        '   "commitId": "' + process.env['CI_COMMIT_ID'] + '",\n' +
        '   "buildId": "' + process.env['CI_BUILD_NUMBER'] + '",\n' +
        '   "buildDate": "' + new Date().toISOString() + '"\n' +        
        '}';
    return file('buildInfo.json', str, { src: true })
        .pipe(gulp.dest('./dist'));
});

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages({
        branch:'dist',
        message: 'Update ' + new Date().toISOString() + ' [skip ci]' // https://codeship.com/documentation/continuous-integration/skipping-builds/
    }));
}); 

gulp.task("tsc", function () {
    return gulp.src([
            "client/**/**.ts",
            "typings/**/**.d.ts"
        ])
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest("client"));
});