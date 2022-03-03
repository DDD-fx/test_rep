
let project_folder = "dist";
let source_folder = "#src";

let path = {
    build:{
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src:{
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],           //исключить файлы с _ из отслеживания и копирования в dist, т.к. они встраиваются в индекс
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,webp,ico}",                //** - все подпапки
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch:{
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,webp,ico}",
    },
    clean: "./" + project_folder + "/"
}

let {src, dest} = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),             //настройка плагинов
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass")(require('sass')),               //!
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    terser = require("gulp-terser"),
    imagemin = require("gulp-imagemin"),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminMozjpeg = require("imagemin-mozjpeg"),
    imageminOptipng = require("imagemin-optipng"),
    imageminSvgo = require("imagemin-svgo"),
    {extendDefaultPlugins} = require('svgo'),
    webp = require("gulp-webp"),
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss"),
    svgSprite = require("gulp-svg-sprite"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter");

function browserSync(params) {
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html(){
    return src(path.src.html)                       //обращение к исходникам и выгрузка в результат
        .pipe(fileinclude())                        //@@include
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"             //удобочитаемое отображение
            }).on('error', scss.logError)
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist:["last 5 versions"],            //поддержка 5 последних версий браузеров
                cascade: true                                       //стиль написания
            })
        )
        .pipe(
            webpcss({
                webpClass: '.webp',
                noWebpClass: '.no-webp'
            })
        )
        .pipe(dest(path.build.css))                         //до сжатия и переим. файл выгружается
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"              //имя минификатора для подключения в индекс style.min.css
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js(){
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))              //выгрузка несжатого файла
        .pipe(terser({
            keep_fnames: true,
            mangle: false
        }))
        .pipe(
            rename({
                extname: ".min.js"              //имя минификатора для подключения в индекс
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images(){
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))                     //после обработки сразу копирование, потом обработка обычных изображений
        .pipe(src(path.src.img))
        .pipe(
            imagemin([
                imageminGifsicle({interlaced: true}),
                imageminMozjpeg({quality: 75, progressive: true}),              //Compression quality, in range 0 (worst) to 100 (perfect).
                imageminOptipng({optimizationLevel: 5}),                        //between 0 and 7 (max compression).
                imageminSvgo({
                    plugins: extendDefaultPlugins([
                        {name: 'removeViewBox', active: false}
                    ])
                })
            ])
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

gulp.task("svgSprite", function () {
    return gulp.src([source_folder + "/iconsprite/*.svg"])
        .pipe(svgSprite({
                mode:{
                    stack:{
                        sprite: "../icons/icons.svg",           //sprite file name
                        example: true                         //создает хтмл файл с примерами иконок
                    }
                },
            })
        )
        .pipe(dest(path.build.img))
})

gulp.task("otf2ttf", function () {
    return gulp.src([source_folder + "/fonts/*.otf"])
        .pipe(fonter({
            formats:["ttf"]
        }))
        .pipe(dest(source_folder + "/fonts/"));
})

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

function watchFiles(){                              //отслеживание и трансляция изменений
    gulp.watch([path.watch.html], html)         //html - функция, обрабатывающая файл
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], images)
}

function clean() {
    return del(path.clean)      //путь к очищаемой папке
}

let build = gulp.series(clean, gulp.parallel(html, js, css, images, fonts));           //удаление старых файлов и одновременное выполнение
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.build = build;
exports.watch = watch;
exports.default = watch;
