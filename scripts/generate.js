const fs = require('fs/promises');
const path = require('path');
const rimraf = require('rimraf')
const QRCode = require('qrcode');
const basePath = path.resolve(__dirname, '../dist');

const urlBase = `https://raw.gitmirror.com/htyf-mp-community/MusicFreePlugins/demo/dist/plugins.json`

async function run() {
    console.log('生成json文件...');
    const pluginPath = path.resolve(basePath, '_plugins');
    await rimraf(pluginPath);
    await fs.mkdir(pluginPath);
    const bundledPlugins = await fs.readdir(basePath);
    const output = {
        plugins: []
    };
    await Promise.all(bundledPlugins.map(async (bundleFolder) => {
        if (!bundleFolder.startsWith('_')) {
            try {
                const targetPluginPath = path.resolve(basePath, bundleFolder, 'index.js');
                await fs.stat(targetPluginPath);
                const origin = await fs.readFile(targetPluginPath, 'utf-8');
                const mexports = origin.match(/module.exports\s*=\s*([\s\S]*)$/)[1];
                const platform = mexports.match(/platform:\s*['"`](.*)['"`]/)[1]
                const version = mexports.match(/version:\s*['"`](.*)['"`]/)[1]
                const srcUrl = mexports.match(/srcUrl:\s*['"`](.*)['"`]/)[1]

                output.plugins.push({
                    name: platform,
                    url: srcUrl,
                    version: version
                })
            } catch(e) {
                console.warn('异常:', e);
             }
        }
    }))

    await fs.writeFile(path.resolve(pluginPath, 'plugins.json'), JSON.stringify(output));
    await fs.copyFile(path.resolve(pluginPath, 'plugins.json'), path.resolve(__dirname, '../plugins.json'))
    console.log('done√');
    const url = urlBase

    QRCode.toFile(path.join(__dirname, '../qrcode.png'), url, {
        margin: 1,
        width: 256,
        color: {
            dark: '#000000FF',
            light: '#FFFFFFFF'
        }
    }, function (err) {
        if (err) throw err;
        console.log('QR code saved!');
    });

}


run();