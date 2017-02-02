/**
 * Parse a custom protocol format
 * https://github.com/adhocteam/homework/tree/master/proto
 *
 * # To run:
 * node app.js
 *  
 */


/**
 * Import libraries
 */
let fs = require('fs');

/**
 * Setup file information and constants
 */
let filename = 'txnlog.dat';
let fileStats = fs.statSync(filename);
const DEBIT = 0;
const CREDIT = 1;
const STARTAUTOPAY = 2;
const ENDAUTOPAY = 3;

/**
 * Read the file
 */
fs.open(filename, 'r', function(error, data) {
    if (error) {
        console.log(error.message);
        return;
    }

    let buffer = new Buffer(fileStats.size);
    fs.read(data, buffer, 0, fileStats.size, 0, function(err, num) {

        /**
         * Read Header information
         */
        let header = {
            magicString: buffer.slice(0,4).toString(),
            version: buffer.slice(4,5).readIntBE(0, 1),
            numberOfRecords: buffer.slice(5,9).readUInt32BE()
        };

        /**
         * Loop through the records create an array
         */
        let pos = 9; // Starting position after header
        let records = [];
        for (let i=0; i<header.numberOfRecords; i++) {
            let record = {
                _id: i,
                type: buffer.slice(pos, pos+1).readIntBE(0, 1),
                timestamp: buffer.slice(pos+1, pos+5).readUInt32BE(),
                userId: buffer.slice(pos+5, pos+13).readUIntBE(0, 8),
            };
            record.date = new Date(record.timestamp*1000); // store the timestamp as UTC
            pos = pos + 13;

            // Include additional amount (float) field for Debit and Credit records
            if (record.type < 2) {
                record.amount = buffer.slice(pos, pos+8).readFloatBE(0, 8);
                pos = pos + 8;
            }

            records.push(record); // Add the record to our array
        }

        /**
         * Answer homework questions
         */
        console.log('What is the total amount in dollars of debits? ', records.reduce((total, record) => { return (record.type==DEBIT) ? total + record.amount : total}, 0));
        console.log('What is the total amount in dollars of credits? ', records.reduce((total, record) => { return (record.type==CREDIT) ? total + record.amount : total}, 0));
        console.log('How many autopays were started? ', records.filter((record) => record.type==STARTAUTOPAY).length);
        console.log('How many autopays were ended? ', records.filter((record) => record.type==ENDAUTOPAY).length);
        console.log('What is balance of user ID 2456938384156277127? ', records.filter((record) => record.userId==2456938384156277127).reduce((total, record) => { return (record.type==CREDIT) ? total + record.amount : (record.type==DEBIT) ? total - record.amount : total }, 0));

    });
});