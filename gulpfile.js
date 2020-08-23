// VARIABLES & PATHS

let preprocessor = 'sass', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    baseDir      = 'app', // Base directory path without «/» at the end
    distDir      = 'dist',
    online       = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

	html: {
		src:  baseDir + "/*.html",
		dest: distDir + '/',
	},

	scripts: {
		src: [
			'node_modules/jquery/dist/jquery.min.js', // npm vendor example (npm i --save-dev jquery)
			baseDir + '/js/custom.js' // custom.js. Always at the end
		],
		dest: distDir + '/js',
	},

	styles: {
		src:  baseDir + '/' + preprocessor + '/main.*',
		dest: distDir + '/css',
	},

	images: {
		src:  baseDir + '/images/src/**/*',
		dest: distDir + '/images',
	},

	fonts: {
		src:  baseDir + '/fonts/src/*.ttf',
		dest: distDir + '/fonts/',
	},

	deploy: {
		hostname:    'username@yousite.com', // Deploy hostname
		destination: 'yousite/public_html/', // Deploy destination
		include:     [/* '*.htaccess' */], // Included files to deploy
		exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
	},

	cssOutputName:   'style.min.css',
	cssOutputName_2: 'style.css',
	jsOutputName:    'script.min.js',
	jsOutputName_2:  'script.js',

}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const sass         = require('gulp-sass');
const scss         = require('gulp-sass');
const less         = require('gulp-less');
const styl         = require('gulp-stylus');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const webp         = require("gulp-webp");
const newer        = require('gulp-newer');
const ttf2woff     = require("gulp-ttf2woff");
const ttf2woff2    = require("gulp-ttf2woff2");
const rsync        = require('gulp-rsync');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: distDir + '/' },
		notify: false,
		online: online
	})
}

function html() {
    return src(paths.html.src)
	.pipe(dest(paths.html.dest))
	.pipe(browserSync.stream())
}

function scripts() {
	return src(paths.scripts.src)
	.pipe(concat(paths.jsOutputName_2))
	.pipe(dest(paths.scripts.dest))
	.pipe(concat(paths.jsOutputName))
	.pipe(uglify())
	.pipe(dest(paths.scripts.dest))
	.pipe(browserSync.stream())
}

function styles() {
	return src(paths.styles.src)
	.pipe(eval(preprocessor)())
	.pipe(concat(paths.cssOutputName_2))
	.pipe(dest(paths.styles.dest))
	.pipe(concat(paths.cssOutputName))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
	.pipe(dest(paths.styles.dest))
	.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
	.pipe(newer(paths.images.dest))
	.pipe(src(paths.images.src))
	.pipe(
		webp({
			quality: 70
		})
	)
	.pipe(dest(paths.images.dest))
	.pipe(src(paths.images.src))
	.pipe(imagemin())
	.pipe(dest(paths.images.dest))
}

function fonts() {
    src(paths.fonts.src)
        .pipe(ttf2woff())
        .pipe(dest(paths.fonts.dest))
    return src(paths.fonts.src)
       .pipe(ttf2woff2())
       .pipe(dest(paths.fonts.dest))
}

function cleanimg() {
	return del('' + paths.images.dest + '/**/*', { force: true })
}

function deploy() {
	return src(baseDir + '/')
	.pipe(rsync({
		root: baseDir + '/',
		hostname: paths.deploy.hostname,
		destination: paths.deploy.destination,
		include: paths.deploy.include,
		exclude: paths.deploy.exclude,
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
}

function startwatch() {
	watch(baseDir  + '/**/*.html', html);
	watch(baseDir  + '/' + preprocessor + '/**/*', {usePolling: true}, styles);
	watch(baseDir  + '/images/src/**/*.{' + imageswatch + '}', {usePolling: true}, images);
	watch(baseDir  + '/**/*.{' + fileswatch + '}', {usePolling: true}).on('change', browserSync.reload);
	watch([baseDir + '/js/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], {usePolling: true}, scripts);
}

exports.browsersync = browsersync;
exports.assets      = series(cleanimg, styles, scripts, images);
exports.html 		= html;
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.fonts       = fonts;
exports.cleanimg    = cleanimg;
exports.deploy      = deploy;
exports.default     = parallel(images, styles, scripts, html, browsersync, startwatch);
