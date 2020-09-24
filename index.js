var fs = require('fs');
var pth = require('path');
var join = pth.join;
var args = require("args-parser")(process.argv);

var dir = args.dir;
if(!dir) {
    console.error("Каталог для просмотра не найден");
} else {
    console.log('Запущена очистка');
    deleteLastFiles();
}

/**
 * удаление старых файлов из временной папки public/temp
 */
function deleteLastFiles() {
    var dt = Date.now();
    // время хранения данных
    var expired = args.expired;
    var maxsize = args.maxsize;

    if (!expired) {
        expired = 7;
        console.log('Параметр expired не указан. По умолчанию берется значение ' + expired);
    }

    if (!maxsize) {
        maxsize = 10;
        console.log('Параметр maxsize не указан. По умолчанию берется значение ' + minBkpSize);
    }

    fs.readdir(dir, function (err, files) {
        if (files) {
            var count = 0;
            console.log("Найдено " + files.length + " файлов.");
            files.forEach(function (file) {
                var path = join(dir, file);
                var stats = fs.statSync(path);
                if(stats) {
                    var time = stats.birthtime.getTime();
                    if (dt - time > (expired * 24 * 60 * 60 * 1000) || // данные живут столько дней
                        (stats.size < maxsize * 1024 && pth.extname(path) != '.failed') || // удалить меньше определенного объема
                        (pth.extname(path) == '.pkg' && dt - time > (24 * 60 * 60 * 1000))) { // данные живут столько дней или удалить все pkg
                        fs.unlinkSync(path);
                        count++;
                    }
                }
            });
            console.log("Удалено " + count + " файлов.");
        } else {
            console.error(err);
        }
    });
}