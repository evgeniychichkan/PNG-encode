//Подключение необходимых NPM модулей
//----------------------------------------------------------------------------------

var fs = require('fs'),
    PNG = require('pngjs').PNG;

var srcFile = process.argv[2],
    flag = process.argv[3],
    dstFile = process.argv[6] || 'out.png';

var png = new PNG({
    filterType: 4
});
// var decMsg =[],
//     decPtrnW = 0,
//     decPtrnH = 0;
var imgPxArray = [];
var aSCIIArrayMsgDecode = [];
var aSCIIArrayMsg = [];

//-----------------------------------------------------------------------------------
// Преобразование строки сообщения в коды таблицы ASCII и запись их в массив
//----------------------------------------------------------------------------------

function arrayConvertToNumbers(msg, msgLength) {
    for (var i = 0; i < msgLength; i++) {
        aSCIIArrayMsg.push(msg.charCodeAt(i));
    }
    console.log(aSCIIArrayMsg);
    return aSCIIArrayMsg;
}


//-----------------------------------------------------------------------------------
// Преобразование массива из кодов таблицы ASCII в строку сообщения
//----------------------------------------------------------------------------------
function arrayConvertToString(aSCIIArrayMsgDecode) {
    var msg = '';
    for (var i = 0; i < msgLength; i++) {
        msg += String.fromCharCode(aSCIIArrayMsgDecode.pop());
    }
    console.log(aSCIIArrayMsgDecode);
    return msg;
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
            msgLength = process.argv[4].length,
            pattern = process.argv[5].split('x'),
            patternWidth = pattern[0],
            patternHeight = pattern[1];

        arrayConvertToNumbers(msg, msgLength);
        encodingFile(aSCIIArrayMsg, msgLength, patternWidth, patternHeight);

        console.log(srcFile + ' has encoded, message = \"' + msg + '\", pattern = ' + pattern.join("x"));

    } else if (flag == '-decode') {
        console.log('Start decoding file...\n');

         var decodeArray =  decodingFile(srcFile);
        //  var msgDecode = arrayConvertToString(decodeArray[0]);

        console.log(1, decodeArray);
        // console.log(srcFile + ' was decoded, message = \"' +
        // //  msgDecode+
        //  '\", pattern = ' +  decodeArray[1] + 'x' + decodeArray[2]);
    }
}

//----------------------------------------------------------------------------------
//  Загрузка файла и кодирование сообщения msg в файл dstFile, используя шаг pattern
//----------------------------------------------------------------------------------

function encodingFile(aSCIIArrayMsg, msgLength, patternWidth, patternHeight) {
    fs.createReadStream(srcFile)
        .pipe(png)
        .on('parsed', function() {
            var i = 0;
            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                  if (i >= aSCIIArrayMsg.length) {
    // // Alpha
                    this.data[x+y] = aSCIIArrayMsg[i];
                    i++;
                  } else break;
                }
            }
            this.data[this.width + this.height] = patternHeight;
            this.data[this.height] = patternWidth;
            this.data[0] = msgLength;
            console.log('\nЗначение png.data: ' + this.data.length);
            this.pack().pipe(dst = fs.createWriteStream(dstFile));

        });
}

//----------------------------------------------------------------------------------
// Декодирование сообщения в msg из файла srcFile
//----------------------------------------------------------------------------------

function decodingFile(srcFile) {
    var patternWidth,
        patternHeight;
    fs.createReadStream(srcFile)
        .pipe(png)
        .on('parsed', function() {
            var i = 0;
            patternWidth = this.data[this.height];
            console.log(patternWidth + '\n');
            patternHeight = this.data[this.width + this.height];
            console.log(patternHeight + '\n');
            var msgLength = this.data[0];
            console.log(msgLength + '\n');

            for (var y = 0; y < this.height; y += patternHeight) {
                for (var x = 0; x < this.width; x += patternWidth) {
                    // Alpha
                    if (i < msgLength) {
                        aSCIIArrayMsgDecode.push(this.data[x + y]);
                        i++;
                    }
                }
            }

            console.log('\nЗначение png.data: ' + this.data.length);
            console.log(srcFile + ' was decoded, message = \"' + aSCIIArrayMsgDecode + '\", pattern = ' + patternWidth + 'x' + patternHeight);
        });
      return [aSCIIArrayMsgDecode, patternWidth, patternHeight];
}

//------------------------------------------------------------------------------------
//Тело программы
//----------------------------------------------------------------------------------

console.log("Encode/Decode message to PNG image.\n");

whatToDo(flag);
