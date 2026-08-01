const PDFDocument = require("pdfkit");
const { print } = require("pdf-to-printer");
const chokidar = require("chokidar");
const axios = require("axios");
const FormData = require("form-data");
const QRCode = require("qrcode");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
let queue = [];
let processing = false;

const config = require("./config.json");

console.log("====================================");
console.log(" Photo Watcher Started");
console.log("====================================");

const upload = async (file) => {

    console.log("Checking:", file);

    // wait hanggang matapos mag copy
    let oldSize = -1;

    while (true) {

        const size = fs.statSync(file).size;

        if (size === oldSize)
            break;

        oldSize = size;

        await new Promise(r => setTimeout(r, 1000));

    }

    console.log("Uploading...");

    try {

        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream(file)
        );

        const res = await axios.post(
            config.uploadUrl,
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity
            }
        );

        if (!res.data.success)
            throw "Upload failed";

        console.log("Uploaded!");

        const qrName =
            path.parse(file).name + ".png";

        const qrPath =
            path.join("qr", qrName);

        await QRCode.toFile(
            qrPath,
            res.data.url
        );

        console.log("QR Generated");

        await printQR(
            qrPath,
            file
        );

        console.log("Printed");

        const destination =
            path.join(
                config.processedFolder,
                path.basename(file)
            );

        await fse.move(file, destination, {
            overwrite: true
        });

        console.log("Moved to Processed");

    }
    catch (err) {

        console.log(err);

        const failed =
            path.join(
                config.failedFolder,
                path.basename(file)
            );

        await fse.move(file, failed, {
            overwrite: true
        });

        console.log("Moved to Failed");

    }

};

async function printQR(qrImage, imageName) {
    const qrSize = 220;
    const qrX = (config.paperWidth - qrSize) / 2;
    return new Promise((resolve, reject) => {

        const pdf =
            `qr/${path.parse(imageName).name}.pdf`;

        const doc = new PDFDocument({

            size: [
                config.paperWidth,
                config.paperHeight
            ],

            margin: 20

        });

        const stream =
            fs.createWriteStream(pdf);

        doc.pipe(stream);

        doc.fontSize(12);

        doc.text(
            "Scan QR to Download",
            {
                align: "center"
            }
        );

        doc.moveDown();

        doc.image(
            qrImage,
            qrX,
            doc.y,
            {
                fit: [qrSize, qrSize]
            }
        );

        doc.end();

        stream.on("finish", async () => {

            try {

                await print(pdf, {
                    printer: config.printer
                });

                resolve();

            } catch (err) {

                reject(err);

            }

        });

    });

}

const watcher = chokidar.watch(
    config.watchFolder,
    {
        ignoreInitial: true
    }
);

watcher.on("add", file => {

    queue.push(file);

    processQueue();

});

async function processQueue() {

    if (processing)
        return;

    processing = true;

    while (queue.length) {

        const file = queue.shift();

        console.log("--------------------------------");
        console.log("Processing:", path.basename(file));

        await upload(file);

        console.log("--------------------------------");

    }

    processing = false;

}

console.log("Watching:", config.watchFolder);