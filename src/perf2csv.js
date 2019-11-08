'use strict';
const fs = require('fs');
const path = require('path');
module.exports = md2csv;
//Modified from https://github.com/Claude-Ray/md2xlsx

md2csv('./test.md');

/**
 * Convert markdown table to xlsx file
 * @param {string} fpath - markdown filepath
 * @param {object} [opts={}]
 * @param {boolean} opts.workbook - return workbook object only
 * @param {string} opts.basename - basename of xlsx file
 * @param {string} opts.extname - extname of xlsx file
 */

function md2csv(fpath, opts = {}) {
    const text = fs.readFileSync(fpath);
    const csvArray = toCSV(text);
    if (opts.workbook) return workbook;
  
    const extname = opts.extname || 'csv';
    const basename = opts.basename || path.basename(fpath, path.extname(fpath));
    writeCSVFile(csvArray, `${basename}.${extname}`);
};
/**
 * Write csvArray to csvFileName
 * @param {Array} csvArray 
 * @param {string} csvFileName 
 */

function writeCSVFile(csvArray, csvFileName){
    const file = fs.createWriteStream(csvFileName);
    csvArray.forEach(row => {
        if(typeof(row)=='object'){
            let line=row.map(str => str.trim()).join(',')+'\n'
            file.write(line);
        }
    });
    file.end()
}

/**
 * convert markdown table to object
 * @param {string|buffer} text
 * @param {object} workbook
 */
function toCSV(text) {
    if (!text) throw new Error(`empty table`);
    if (Buffer.isBuffer(text)) text = text.toString();
    const cells = textParser(text);
    if (!isValidTable(cells))
      throw new Error(`invalid table`);
    // splice the dividing line
    cells.splice(1, 1);
    return cells
}
  
/**
 * check if the table is valid
 * @param {array[]} cells
 * @return {boolean}
 */
function isValidTable(cells) {
return cells.length > 3 &&
    cells[0] &&
    cells[0].length === cells[1].length &&
    /^-+$/.test(cells[1].join(''));
}

/**
 * parse markdown table to cells
 * @param {string} text
 * @return {array[]}
 */
function textParser(text) {
    return text.split('\n').map(line => {
        line = line.trim();
        if (!line) return '';
        if (!line.startsWith('|')) line = `|${line}`;
        if (!line.endsWith('|')) line = `${line}|`;

        return line.split('|').slice(1, -1);
    });
}
