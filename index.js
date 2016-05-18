
//Подключение необходимых NPM модулей
var fs = require('fs'),
    PNG = require('pngjs').PNG;

var srcFile = process.argv[2],
		flag = process.argv[3],
		msg = process.argv[4],
    // .split('')
		msgLen = process.argv[4].length,
		msgCounter = 0,
		pattern = process.argv[5].split('x'),
		patternWidth = pattern[0],
		patternHeight = pattern[1],
		dstFile = process.argv[6];


  /*
    Перечисление возможных и необходимых ключей при запуске приложения

    encoder
    	.option('-encode <required>')
    	.option('-decode <required>')
    	.parse(process.argv);
  */
  
  


//-----------------------------------------------------------------------------------
// Преобразование строки сообщения в коды таблицы ASCII и запись их в массив
var asciiArray = [];
for (var i = 0; i < msg.length; i++) {
    asciiArray.push(msg.charCodeAt(i));
}
console.log(asciiArray);


//-----------------------------------------------------------------------------------
/*
Функция выбора режима работы с изображением по значению флага
(-encode - кодирование или
 -decode - декодирвоание)
*/
function whatToDo (flag) {
	if (flag == '-encode') {
		console.log('Start encoding file...\n');
    console.log(srcFile + ' has encoded, message = ' + msg + ', pattern = ' + pattern);
	} else if (flag == '-decode') {
		console.log('Start decoding file...\n');
    console.log(srcFile + ' was decoded, message = ' + msg + ', pattern = ' + pattern);
	}
}


//----------------------------------------------------------------------------------
//  Загрузка файла и кодирование сообщения msg в файл dstFile, используя шаг pattern
function encodingFile () {
fs.createReadStream(srcFile)
    .pipe(new PNG({
        filterType: 4
				// colorType: 6
    }))
    .on('parsed', function() {
      for (var i = 0; i < asciiArray.length; i++) {
        for (var y = 0; y < this.height; y++) {
          // var stepY = (y + patternHeight);
            for (var x = 0; x < this.width; x++) {
              var stepX = (x + patternWidth);
//R G B
              this.data[stepX] = asciiArray[i];
              // this.data[stepX+1] = 255 - asciiArray[i];
              // this.data[stepX+2] = 255 - asciiArray[i];
              // this.data[stepX+3] = asciiArray[i];

// Alpha
              // this.data[stepX+3] = this.data[stepX+3] >> 1;
		}
	}
  console.log(asciiArray[i]);
}
	console.log(this.data.length);
	// console.log(this.bgColor);
this.pack().pipe(fs.createWriteStream( dstFile ));
});
}


//----------------------------------------------------------------------------------

// Декодирование сообщения в msg из файла srcFile, используя шаг pattern
fs.createReadStream(srcFile).pipe(new PNG({
        // filterType: 4
				colorType: 6
    })).on('metadata', function() {
    console.log(this.alpha);
  });



//----------------------------------------------------------------------------------
//Вывод в файл и сообщения в консоль






//------------------------------------------------------------------------------------
//Тело программы
console.log("Encode/Decode message to PNG image.\n");
//console.log(process.argv);

console.log('Длина сообщения: ' + msgLen);
console.log('Кодировка - ' + pattern.join('x') +  ';' +
			' Шаг по X (patternWidth): ' + patternWidth +
			'; Шаг по Y (patternHeight): ' + patternHeight);

whatToDo(flag);

console.log(msg);
