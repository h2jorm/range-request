const fs = require('fs');

const RANGE_REG = /^bytes=(\d*)-(\d*)/;

/**
 * decode `req.headers.range` and pipe partial resource
 * @param {Request} req
 * @param {Response} res
 * @param {number} fileSize
 * @param {string} filePath
 */
function handleRangeRequest(req, res, fileSize, filePath) {
  const {range} = req.headers;
  if (!range) {
    res.writeHead(200, {
      'accept-ranges': 'bytes',
      'content-length': fileSize,
    });
    res.end();
    return;
  }
  let [, startIndex, endIndex] = RANGE_REG.exec(range);
  startIndex = parseInt(startIndex);
  endIndex = parseInt(endIndex);
  if (isNaN(startIndex)) {
    const len = endIndex;
    endIndex = fileSize - 1;
    startIndex = endIndex - len + 1;
  }
  if (isNaN(endIndex)) {
    endIndex = fileSize - 1;
  }
  if (endIndex > fileSize - 1) {
    res.writeHead(416, {
      'content-range': `bytes */${fileSize}`,
    });
    res.end();
    return;
  }
  res.writeHeader(206, {
    'content-range': `bytes ${startIndex}-${endIndex}/${fileSize}`,
    'content-length': endIndex - startIndex + 1,
  });
  fs.createReadStream(filePath, {start: startIndex, end: endIndex}).pipe(res);
}

/**
 * Create a range request handler
 * @param {string} filePath absolute file path
 * @return {Function}
 */
module.exports = function(filePath) {
  return function(req, res) {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        res.statusCode = 404;
        res.end();
        return;
      }
      handleRangeRequest(req, res, stat.size, filePath);
    });
  };
};
