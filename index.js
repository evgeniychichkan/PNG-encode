//Подключение необходимых NPM модулей
//----------------------------------------------------------------------------------

var fs = require('fs'),
    PNG = require('pngjs').PNG;

var srcFile = process.argv[2],
    flag = process.argv[3],
    dstFile = process.argv[6];

var src = fs.createReadStream(srcFile),
    dst = fs.createWriteStream(dstFile),
    png = new PNG({
        filterType: -1
    });

// var decMsg =[],
//     decPtrnW = 0,
//     decPtrnH = 0;

var asciiArrayDec = [];
var asciiArray = [];

//-----------------------------------------------------------------------------------
// Преобразование строки сообщения в коды таблицы ASCII и запись их в массив
//----------------------------------------------------------------------------------

function arrayConvert(msg, msgLen) {
    for (var i = 0; i < msgLen; i++) {
        // asciiArray.push(msg.charCodeAt(i));
        asciiArray.push(msg.charAt(i));
    }
    console.log(asciiArray);
}

//-----------------------------------------------------------------------------------
/*
Функция выбора режима работы с изображением по значению флага
(-encode - кодирование или
 -decode - декодирвоание)
*/
//----------------------------------------------------------------------------------

function whatToDo(flag) {
    if (flag == '-encode') {
        console.log('Start encoding file...\n');

        var msg = process.argv[4],
            msgLen = process.argv[4].length,
            pattern = process.argv[5].split('x'),
            patternWidth = pattern[0],
            patternHeight = pattern[1];

        arrayConvert(msg, msgLen);
        encodingFile(msgLen, patternWidth, patternHeight);

        console.log(srcFile + ' has encoded, message = \"' + msg + '\", pattern = ' + pattern.join("x"));

    } else if (flag == '-decode') {
        console.log('Start decoding file...\n');

        decodingFile();

        // console.log(3, decMsg);
        // console.log(srcFile + ' was decoded, message = \"' + decArray[0] + '\", pattern = ' +  decArray[1] + 'x' + decArray[2]);
    }
}

//----------------------------------------------------------------------------------
//  Загрузка файла и кодирование сообщения msg в файл dstFile, используя шаг pattern
//----------------------------------------------------------------------------------

function encodingFile(msgLen, patternWidth, patternHeight) {

    src.pipe(png)
        .on('parsed', function() {
            var i = 0;
            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                    if (i >= asciiArray.length) {
                        console.log(asciiArray[i]);
                        // Alpha
                        this.data[x + y] = asciiArray[i];
                        i++;
                    } else break;
                }
            }
            this.data[this.width * this.height] = patternHeight;
            this.data[this.height] = patternWidth;
            this.data[0] = msgLen;
            console.log('\nЗначение this.data: ' + this.data.length);
            png.pack().pipe(dst);
        });
}

//----------------------------------------------------------------------------------
// Декодирование сообщения в msg из файла srcFile, используя шаг pattern
//----------------------------------------------------------------------------------

function decodingFile() {
    src.pipe(png)
        .on('parsed', function() {
            var i = 0;
            var patternWidth = this.data[this.height];
            console.log(patternWidth + '\n');
            var patternHeight = this.data[this.width * this.height];
            console.log(patternHeight + '\n');
            var msgLen = this.data[0];
            console.log(msgLen + '\n');

            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                    // Alpha
                    if (i < msgLen) {
                        asciiArrayDec.push(this.data[x + y]);
                        i++;
                    } else break;
                }
            }

            console.log('\nЗначение this.data: ' + this.data.length);
            console.log(srcFile + ' was decoded, message = \"' + asciiArrayDec + '\", pattern = ' + patternWidth + 'x' + patternHeight);
        })
        .on('close', function() {
            console.log('\nЗначение this.data:');
        });
}


//------------------------------------------------------------------------------------
//Тело программы
//----------------------------------------------------------------------------------

console.log("Encode/Decode message to PNG image.\n");


whatToDo(flag);
