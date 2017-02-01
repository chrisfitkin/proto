/*

What is the total amount in dollars of debits?
What is the total amount in dollars of credits?
How many autopays were started?
How many autopays were ended?
What is balance of user ID 2456938384156277127?

*/


var fs = require('fs');

/*
let proto = {};
const filename = 'txnlog.dat';

console.log(' ----- BEGIN ----- ');
var readStream = fs.createReadStream(filename);
readStream
  .on('data', function (chunk) {
    proto._chunks = proto._chunks || [];
    proto._chunks.push(chunk);
  })
  .on('end', function () {
    console.log(' ----- END ----- ');
    proto._data = Buffer.concat(proto._chunks).toString();
    console.log('proto', proto);
    //assert(proto._data === message);

  });
  */

fs.open('txnlog.dat', 'r', function(error, data) {
    if (error) {
        console.log(error.message);
        return;
    }
    var buffer = new Buffer(100);
    fs.read(data, buffer, 0, 100, 0, function(err, num) {
        // console.log(buffer.toString('utf8', 0, num));
        console.log(buffer);

        // message buffer
        var header = {
            magicString: buffer.slice(0,4).toString(),
            version: buffer.slice(4,5).readIntBE(0, 1),
            numberOfRecords: buffer.slice(5,9).readUInt32BE()
        };

        console.log('header', header);

        var pos = 9;
        for (let i=0; i<header.numberOfRecords; i++) {

            console.log('attempt record at pos: ', pos);
            var record = {
                _id: i,
                pos: pos,
                type: buffer.slice(pos, pos+1).readIntBE(0, 1),
                timestamp: buffer.slice(pos+1, pos+5).readUInt32BE(),
                userId: buffer.slice(pos+5, pos+13).readUIntBE(0, 8),
            };
            console.log('record', record);
            pos = pos + 13;
            if (record.type < 2) {
                console.log('attempt float at pos: ', pos);
                record.amount = buffer.slice(pos, pos+8).readFloatBE(0, 8);
                pos = pos + 8;
            }
            console.log('record', record);
        }

    });
});