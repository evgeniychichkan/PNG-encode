//Подключение необходимых NPM модулей
var fs = require('fs'),
    PNG = require('pngjs').PNG,
    http = require('http');
request = require('request');

// Переменные для работы с файлами
var srcFile = process.argv[2],
    flag = process.argv[3],
    dstFile = process.argv[6];

var srcFileLocal = 'out.png',
    regexp = /(http|ftp|https|www):/gi,
    testURL = srcFile.match(regexp);

// Объект для работы с PNG изображением
var png = new PNG({
    filterType: 4
});

//-----------------------------------------------------------------------------------
//   Преобразование строки сообщения в коды таблицы ASCII и запись их в массив
//----------------------------------------------------------------------------------
function arrayConvertToNumbers(msg, msgLength) {
    var msgArray = [];
    for (var i = 0; i < msgLength; i++) {
        msgArray.push(msg.charCodeAt(i));
    }
    return msgArray;
}


//-----------------------------------------------------------------------------------
//   Преобразование массива из кодов таблицы ASCII в строку сообщения
//-----------------------------------------------------------------------------------
function arrayConvertToString(MsgDecode) {
    var msg = '';
    for (var i = 0; i < MsgDecode.length; i++) {
        msg += String.fromCharCode(MsgDecode[i]);
    }
    return msg;
}

//-----------------------------------------------------------------------------------
// Загрузка изображения для кодирования по url
//-----------------------------------------------------------------------------------
function fromWhereFile(srcFile, filename) {
    var request = http.get(srcFile, function(response) {
        if (response.statusCode === 200) {
            response.pipe(fs.createWriteStream(filename))
                .on('close', function() {
                    // console.log('Downloading done.');
                })
                .on('error', function() {
                    console.log('File don\'t exists!');
                });
            // Ожидание скачивания файла
            request.setTimeout(800, function() {
                request.abort();
                console.log('Downloading is abort\nTry again or check URL...\n');
            });
        }
    });
}

//-----------------------------------------------------------------------------------
/* Функция выбора режима работы с изображением по значению флага
(-encode - кодирование или
 -decode - декодирвоание)
*/
//----------------------------------------------------------------------------------
function whatToDo(flag) {
    // Загрузка файла по http://
    if (testURL == 'http:' || testURL == 'www') {
        fromWhereFile(srcFile, srcFileLocal);
    }
    //----------------------------------------------------------------------------------
    // Логика программы, если получен флаг на кодирование '-encode'
    if (flag == '-encode') {
        console.log('Start encoding file...\n');
        var msg = process.argv[4],
            msgLength = process.argv[4].length,
            pattern = process.argv[5].split('x'),
            patternWidth = parseInt(pattern[0]),
            patternHeight = parseInt(pattern[1]);
        //Конвертирование полученного сообщения в архив из кодов символов
        var arrayMsgASCII = arrayConvertToNumbers(msg, msgLength);
        /* Функция кодирования сообщения.
          Получает параметрами:
          - архив ASCII кодов символов сообщения;
          - длину сообщения;
          - шаг кодирования по ширине;
          - шаг кодирования по высоте.
          */
        encodingFile(srcFileLocal, arrayMsgASCII, msgLength, msg, patternWidth, patternHeight);
        //----------------------------------------------------------------------------------
        // Логика программы, если получен флаг на декодирование '-decode'
    } else if (flag == '-decode') {
        console.log('Start decoding file...\n');
        /* Функция декодирования сообщения.
          Получает параметрами:
          - имя файла для декодирования
          */
        decodingFile(srcFile);
    }
}

//----------------------------------------------------------------------------------
//  Загрузка файла и кодирование сообщения msg в файл dstFile, используя шаг pattern
//----------------------------------------------------------------------------------
function encodingFile(srcFileEncode, msgArrayASCII, msgLength, msg, patternWidth, patternHeight) {
    fs.createReadStream(srcFileEncode)
        .pipe(png)
        .on('parsed', function() {
            var i = 0;
            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                    // Запись очередной буквы в виде ее ASCII кода в значение альфа-канала пикселя
                    if (i !== msgLength) {
                        var indx = (this.width * y + x) * 4;
                        this.data[indx + 3] = msgArrayASCII[i];
                        i++;
                    }
                }
            }
            //Запись шага кодирования по высоте
            this.data[this.width * this.height] = patternHeight;
            //Запись шага кодирования по ширине
            this.data[this.height] = patternWidth;
            //Запись длины сообщения
            this.data[0] = msgLength;
            //Запись массива данных пикселей data в новый файл
            this.pack()
                .pipe(fs.createWriteStream(dstFile));
            // Вывод результата кодирования
            console.log(srcFile + ' has encoded, message = \"' + msg + '\", pattern = ' + patternWidth + 'x' + patternHeight);
        });
}

//----------------------------------------------------------------------------------
// Декодирование сообщения в msg из файла srcFile
//----------------------------------------------------------------------------------
function decodingFile(srcFileDecoded) {
    fs.createReadStream(srcFileDecoded)
        .pipe(png)
        .on('parsed', function() {
            var i = 0;
            var msgDecodeArrayASCII = [];
            //Получение шага декодирования по ширине
            var patternWidth = this.data[this.height];
            //Получение шага декодирования по высоте
            var patternHeight = this.data[this.width * this.height];
            //Получение длины декодируемого сообщения
            var msgLength = this.data[0];

            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                    // Чтение ASCII кода очередного символа декодируемого сообщения
                    if (i !== msgLength) {
                        var indx = (this.width * y + x) * 4;
                        msgDecodeArrayASCII.push(this.data[indx + 3]);
                        i++;
                    }
                }
            }
            //Вывод результата декодирования
            console.log(srcFileDecoded + ' was decoded, message = \"' + arrayConvertToString(msgDecodeArrayASCII) + '\", pattern = ' + patternWidth + 'x' + patternHeight);
        });
}

//------------------------------------------------------------------------------------
//Тело программы
//----------------------------------------------------------------------------------
console.log("Encode/Decode message to PNG image.\n");
whatToDo(flag);
