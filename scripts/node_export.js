// export = feng3d;

const fs = require("fs");

const dtsAddStr = `
export = feng3d;`;
const dtsPath = 'dist/index.d.ts';
let dtsContent = fs.readFileSync(dtsPath, { encoding: 'utf8' })
if (dtsContent.indexOf(dtsAddStr) === -1)
{
    dtsContent += dtsAddStr;
    fs.writeFileSync(dtsPath, dtsContent);
}

const jsAddStr = `
/**
 * node.js export for non-compiled source
 */
if (typeof module !== 'undefined')
{
    module.exports = feng3d;
}`;
const jsPath = 'dist/index.js';
let jsContent = fs.readFileSync(jsPath, { encoding: 'utf8' })
if (jsContent.indexOf(jsAddStr) === -1)
{
    jsContent += jsAddStr;
    fs.writeFileSync(jsPath, jsContent);
}

