const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, 'resources', 'icon.svg');
const outputIco = path.join(__dirname, 'resources', 'icon.ico');

if (!fs.existsSync(inputSvg)) {
    console.error('icon.svg not found');
    process.exit(1);
}

async function convert() {
    try {
        await sharp(inputSvg, { density: 300 })
            .resize(256, 256)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-256.png'));
        
        await sharp(inputSvg, { density: 300 })
            .resize(128, 128)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-128.png'));
        
        await sharp(inputSvg, { density: 300 })
            .resize(64, 64)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-64.png'));
        
        await sharp(inputSvg, { density: 300 })
            .resize(48, 48)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-48.png'));
        
        await sharp(inputSvg, { density: 300 })
            .resize(32, 32)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-32.png'));
        
        await sharp(inputSvg, { density: 300 })
            .resize(16, 16)
            .png()
            .toFile(path.join(__dirname, 'resources', 'icon-16.png'));

        console.log('PNG icons generated. Please convert to .ico using an online tool or icon converter.');
        console.log('Files created in resources/: icon-16.png, icon-32.png, icon-48.png, icon-64.png, icon-128.png, icon-256.png');
    } catch (err) {
        console.error('Error:', err.message);
        console.log('Install sharp: npm install sharp');
    }
}

convert();