import gulp from "gulp";
import fileInclude from "gulp-file-include";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import replace from "gulp-replace";
import sharp from "sharp";
import * as esbuild from "esbuild";
import browserSync from "browser-sync";
import { deleteAsync } from "del";
import { Transform } from "node:stream";

const { src, dest, watch, series, parallel, lastRun } = gulp;
const sass = gulpSass(dartSass);
const bs = browserSync.create();

let isProd = false;

// ======================
// Настройки
// ======================
const config = {
  webp: { quality: 80, effort: 5 },
  maxImageWidth: 2560, // картинки шире будут уменьшены
};

const paths = {
  dist: "dist",
  html: { pages: "src/pages/*.html", watch: "src/{pages,partials}/**/*.html" },
  scss: { entry: "src/scss/style.scss", watch: "src/scss/**/*.scss", dest: "dist/css" },
  js: { entry: "src/js/main.js", watch: "src/js/**/*.js", dest: "dist/js/main.js" },
  vendor: { src: "src/js/vendor/**/*", dest: "dist/js/vendor" },
  img: { src: "src/img/**/*", dest: "dist/img" },
  fonts: { src: "src/fonts/**/*", dest: "dist/fonts" },
  static: { src: "src/static/**/*", dest: "dist" },
};

// img/photo.jpg → img/photo.webp (в html, css, srcset, url())
const IMG_RE = /(img\/[^"'\s(),]+?)\.(jpe?g|png)(?=["'\s),?#]|$)/gi;

// ======================
// Задачи
// ======================
export const clean = () => deleteAsync([paths.dist]);

export const html = () =>
  src(paths.html.pages)
    .pipe(fileInclude({ prefix: "@@", basepath: "src/partials", indent: true }))
    .pipe(replace(IMG_RE, "$1.webp"))
    .pipe(dest(paths.dist))
    .pipe(bs.stream());

export const styles = () =>
  src(paths.scss.entry, { sourcemaps: !isProd })
    .pipe(sass({ style: isProd ? "compressed" : "expanded" }).on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(replace(IMG_RE, "$1.webp"))
    .pipe(dest(paths.scss.dest, { sourcemaps: isProd ? false : "." }))
    .pipe(bs.stream({ match: "**/*.css" }));

export const scripts = async () => {
  try {
    await esbuild.build({
      entryPoints: [paths.js.entry],
      outfile: paths.js.dest,
      bundle: true,
      format: "iife",
      target: "es2018",
      minify: isProd,
      sourcemap: !isProd,
      logLevel: "warning",
    });
    bs.reload();
  } catch {
    // ошибка уже выведена esbuild, dev-сервер не падает
  }
};

export const vendor = () =>
  src(paths.vendor.src, { encoding: false, allowEmpty: true }).pipe(dest(paths.vendor.dest));

// jpg/png → webp + ресайз; svg, gif и прочее копируются как есть
const toWebp = () =>
  new Transform({
    objectMode: true,
    async transform(file, _, cb) {
      if (file.isNull() || !/\.(jpe?g|png)$/i.test(file.path)) return cb(null, file);
      try {
        let img = sharp(file.contents);
        const { width } = await img.metadata();
        if (width > config.maxImageWidth) img = img.resize({ width: config.maxImageWidth });
        file.contents = await img.webp(config.webp).toBuffer();
        file.extname = ".webp";
        cb(null, file);
      } catch (err) {
        console.error(`[images] ${file.relative}: ${err.message}`);
        cb(null, file);
      }
    },
  });

export const images = () =>
  src(paths.img.src, { encoding: false, since: lastRun(images) })
    .pipe(toWebp())
    .pipe(dest(paths.img.dest))
    .pipe(bs.stream());

export const fonts = () =>
  src(paths.fonts.src, { encoding: false, since: lastRun(fonts) }).pipe(dest(paths.fonts.dest));

// favicon, robots.txt и т.п. — в корень dist без обработки
export const statics = () =>
  src(paths.static.src, { encoding: false, dot: true, allowEmpty: true }).pipe(dest(paths.static.dest));

// ======================
// Сервер и вотчеры
// ======================
const serve = (done) => {
  bs.init({ server: paths.dist, notify: false, open: false, port: 3000 });
  done();
};

const watcher = () => {
  watch(paths.html.watch, html);
  watch(paths.scss.watch, styles);
  watch(paths.js.watch, { ignored: "src/js/vendor/**" }, scripts);
  watch(paths.vendor.src, vendor);
  watch(paths.img.src, images);
  watch(paths.fonts.src, fonts);
  watch(paths.static.src, statics);
};

const setProd = (done) => { isProd = true; done(); };

const compile = parallel(html, styles, scripts, vendor, images, fonts, statics);

export const build = series(setProd, clean, compile);
export default series(clean, compile, serve, watcher);
