const fs = require('fs');
const path = require('path');
const externals = require('./externals_production.json');

const dir = path.join(__dirname, "../public/js/vendor/openhps");
const files = fs.readdirSync(dir);

// First, delete the files that are not in the externals list
files.forEach(file => {
    const externalFile = externals.find(external => {
        if (typeof external === 'string') {
            return external === file || file === `${external}.map`;
        } else if (external.original) {
            return external.original === file || file === `${external.original}.map`;
        }
        return false;
    });
    if (!externalFile) {
        console.log(`Deleting ${file} ...`);
        fs.rmSync(path.join(dir, file));
    }
});

// Then, rename the files as specified in the externals list
externals.forEach(external => {
    if (typeof external === 'object' && external.rename) {
        // Rename main file
        const originalPath = path.join(dir, external.original);
        const renamePath = path.join(dir, external.rename);
        if (fs.existsSync(originalPath)) {
            console.log(`Renaming ${external.original} to ${external.rename} ...`);
            fs.renameSync(originalPath, renamePath);
        }
        // Rename .map file if it exists
        const originalMap = `${external.original}.map`;
        const renameMap = `${external.rename}.map`;
        const originalMapPath = path.join(dir, originalMap);
        const renameMapPath = path.join(dir, renameMap);
        if (fs.existsSync(originalMapPath)) {
            console.log(`Renaming ${originalMap} to ${renameMap} ...`);
            fs.renameSync(originalMapPath, renameMapPath);
        }
    }
});

// Update references in all files
files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        externals.forEach(external => {
            if (typeof external === 'object' && external.rename) {
                const regex = new RegExp(external.original, 'g');
                content = content.replace(regex, external.rename);
            }
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated references in ${file}`);
    }
});
