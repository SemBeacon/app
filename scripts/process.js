const fs = require('fs');
const path = require('path');
const externals = require('./externals.json');

const dir = path.join(__dirname, "../public/js/vendor/openhps");
const files = fs.readdirSync(dir);
files.forEach(file => {
    if (!externals.includes(file)) {
        console.log(`Deleting ${file} ...`);
        fs.rmSync(path.join(dir, file));
    }
});
