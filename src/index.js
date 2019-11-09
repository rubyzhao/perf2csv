// Function:
// Combine JSON.stringify(performance.getEntries()) output files to one CombinedPerfEntries.csv file
// clear();location.reload();
// JSON.stringify(performance.getEntries())
// In Console of DevTools:
// 1. Reload!!!
// 2. JSON.stringify(performance.getEntries())
// 3. The right button click, save as the the log file
// 4. Run this script
// 5. Power BI

// The script is to read each file which has the result of performance.timing
// And write to one CombinedPerfEntries.csv for Power BI analysis.
const fs = require('fs');
const path = require('path');
const dateFormat = require('dateformat');
const opn = require('opn');

const csvCombinedFileName = 'CombinedPerfEntries.csv';
// async open
fs.open(csvCombinedFileName, 'w', function(err, fd) {
    if (err && err.code === 'EBUSY') {
        console.log(`Other Applications locked the file: ${csvCombinedFileName}`);
        console.log('Please close it and run again');
        process.exit(1);
    }
});

// try {
//     let fd=fs.open(csvCombinedFileName, 'w');
//     fs.closeSync(fd);
// } catch (e) {
//     console.log('Error:', e);
//     console.log('Other Applications locked the file: '+csvCombinedFileName);
//     console.log('Please close it and run again');
//     process.exit(1);
// }

const csvStream = fs.createWriteStream(csvCombinedFileName);
const files = fs.readdirSync('./');
let i = 0;
files.forEach(file => {
    if (file.endsWith('.log') || file.endsWith('.txt')) {
        // *.log from Chrome; *.txt from Firefox;
        // process each log file
        console.log(`Processing file: ${file}`);

        let lines = fs.readFileSync(file).toString();
        // for Firefox, replace \" with "
        lines = lines.replace(/\\"/g, '"');
        // find the start of performance entries
        const startIndex = lines.indexOf('[{"name":');
        let Results = lines.substring(startIndex, lines.length);
        // Replace }]" with }] at end of the file
        Results = Results.replace('}]"', '}]');
        // console.log(Results);
        const jsonResult = JSON.parse(Results);
        let newLine = '';
        if (i == 0) {
            // First time to write out the column name
            // console.log("inside s");
            newLine = GetNames(jsonResult);
            csvStream.write(`${newLine.join(',')},LogFileTime,LogFile\n`); // output column name
            i++;
        }
        newLine = GetValues(jsonResult);
        csvStream.write(`${newLine.join(',')},${GetDateTime(file)},${file}\n`);
    }
});
process.on('exit', function(code) {
    csvStream.end();
    setTimeout(function() {
        opn(csvCombinedFileName);
    }, 5000);

    // console.log(csvCombinedFileName);

    opn('CombinedPerfEntries.csv');
    return console.log(`At End of Exit. About to exit with code ${code}`);
});
/**
 * Get all Keys from all entries of performance
 * @param {JSON Object} jsonResult
 */
function GetNames(jsonResult) {
    const Names = [];
    jsonResult.forEach(entry => {
        Names.push(GetNamesByEntry(entry)); // Process each entry of the performance
    });
    // console.log(Names);
    return Names;
}
/**
 * Get names for each entry
 * @param {Performance for each entry} PerformanceObject
 */
function GetNamesByEntry(PerformanceObject) {
    const Names = [];
    let ObjectName = '';
    // console.log(PerformanceObject.entryType);
    if (PerformanceObject.entryType == 'paint') {
        if (PerformanceObject.name == 'first-paint') {
            ObjectName = 'FP';
        } else {
            ObjectName = 'FCP';
        }
    } else {
        ObjectName = PerformanceObject.entryType.toUpperCase();
        ObjectName = ObjectName.substring(0, 3);
    }
    // console.log(ObjectName);

    const name = Object.keys(PerformanceObject);
    for (let i = 0; i < name.length; i++) {
        Names.push(`${ObjectName}_${name[i]}`);
    }
    // console.log(Names);
    return Names;
}
/**
 * Get Date Time from file name
 * @param {string} fileName
 * @returns {string} format: dd-mm-yyyy-hh-MM-ss
 */
function GetDateTime(fileName) {
    const fileExtension = path.extname(fileName);
    let dateTime;
    if (fileExtension == '.log') {
        // for Chrome, the log file name is like: 127.0.0.1-1572765123665.log
        // console.log(fileName);
        const removeURL = fileName.split('-')[1]; // Get 1572765123665.log from 127.0.0.1-1572765123665.log
        // console.log(removeURL);

        const timeStamp = Number(removeURL.match(/(\d+)/)[0]);
        // console.log(timeStamp);

        dateTime = new Date(timeStamp);
        dateTime = dateFormat(dateTime, 'yyyy-mm-dd_hh-MM-ss');
    } else {
        // for Firefox, the log file name is like console-export-2019-11-9_10-32-12.txt
        dateTime = fileName.replace('console-export-', ''); // remove console-export-
        dateTime = dateTime.replace('.txt', ''); // remove .txt
    }
    return dateTime;
}
/**
 * Get all values from all entries of performance
 * @param {JSON object} jsonResult
 * @returns {Array}
 */
function GetValues(jsonResult) {
    const Values = [];
    // let i=0;
    jsonResult.forEach(entry => {
        // if(i<4){  //only process the first 4 object
        Object.values(entry).forEach(value => {
            Values.push(value);
        });
        //  }
        // i++;
    });
    // console.log(Values);
    return Values;
}
