# Photo Watcher

Photo Watcher is a small Windows utility for automatically handling photos
added to a folder. It is intended for events, photo booths, or other
situations where you want to:

1. Put a photo into a folder.
2. Upload it to a web-based media service.
3. Print a small card containing a QR code.
4. Let someone scan the QR code to download the photo.

The utility runs in the background from a command window. It does not have a
graphical settings screen.

## How it works

When Photo Watcher is running, it watches the folder named `drop-here`.
Whenever a new file is added, it:

1. Waits until the file has finished copying.
2. Uploads the file to the configured upload address.
3. Creates a QR code pointing to the uploaded file.
4. Creates and prints a PDF card with the message **“Scan QR to Download”**.
5. Moves the original file to `processed`.

If an upload, QR-code, or printing step fails, Photo Watcher moves the
original file to `failed` instead.

Files that were already in `drop-here` before the program started are not
automatically processed. Add files after starting the program, or move
pre-existing files out and back into the folder.

## Features

- Watches a folder for newly added files.
- Waits for a file copy to finish before processing it.
- Uploads files to a separate PHP media service.
- Creates a QR code for each successful upload.
- Prints a QR-code card to a selected printer.
- Keeps successfully handled files in `processed`.
- Keeps files that could not be handled in `failed`.
- Processes files one at a time in the order they are detected.

## What you need

Before using Photo Watcher, make sure you have:

- A Windows computer.
- A printer that is installed and available to Windows.
- A working PHP media service containing the project's `media-service`
  files.
- A web address for that service's `upload.php` file.
- Permission for the media service to save files in its `uploads` folder.
- A network connection from the computer running Photo Watcher to the media
  service.

The project includes a copy of Node.js and the required packages, so the
provided `start.bat` file can start the watcher without a separate Node.js
installation.

## Getting started

### 1. Prepare the media service

Place the `media-service` folder on a PHP-enabled web server. The folder
contains:

- `upload.php`, which receives and saves an uploaded file.
- `download.php`, which sends a saved file back when its QR-code link is
  opened.
- `uploads`, which is where uploaded files are stored.

Make sure the web server can write to `media-service/uploads`. The upload
address must be the full web address of `upload.php`, for example:

```text
https://your-server.example/media-service/upload.php
```

Do not put a password, API key, or other private information in the README or
share it publicly. The project does not provide a login screen for the media
service.

### 2. Set the local configuration

Open `config.json` in a text editor and replace the placeholder values:

```json
{
    "uploadUrl": "https://your-server.example/media-service/upload.php",
    "watchFolder": "drop-here",
    "processedFolder": "processed",
    "failedFolder": "failed",
    "printer": "Your Windows printer name",
    "eventName": "Your event name",
    "paperWidth": 300,
    "paperHeight": 450
}
```

Configuration options:

| Setting | What it controls |
| --- | --- |
| `uploadUrl` | The web address of the media service's `upload.php` file. |
| `watchFolder` | The folder where new files should be placed. |
| `processedFolder` | Where successfully handled files are moved. |
| `failedFolder` | Where files are moved when processing fails. |
| `printer` | The exact printer name recognized by Windows. |
| `eventName` | A saved event label. The current watcher does not display or print this value. |
| `paperWidth` | The print document width used when creating the QR-code card. |
| `paperHeight` | The print document height used when creating the QR-code card. |

The default folders are included in the project folder. If you change a folder
name, create the replacement folder before starting the watcher.

### 3. Start the watcher

Double-click `start.bat`. A command window will open and show messages such
as:

```text
Photo Watcher Started
Watching: drop-here
```

Leave this window open while you want automatic processing to continue. Close
the window to stop the watcher.

### 4. Process a photo

1. Start Photo Watcher.
2. Copy a photo or other file into `drop-here`.
3. Wait while the file is uploaded and the QR card is printed.
4. Check `processed` for the original file after a successful run.
5. Give the printed card to the person who needs the file.
6. Scanning the QR code opens a download link for the uploaded file.

If something goes wrong, check the command window for the error and look in
`failed` for the original file.

## Understanding the folders

- **`drop-here`** — Place new files here while the watcher is running.
- **`processed`** — Files that completed uploading and printing.
- **`failed`** — Files that could not complete processing.
- **`qr`** — QR-code images and temporary PDF cards created for printing.
- **`media-service/uploads`** — Uploaded files stored by the PHP service.

The `qr` folder is local to the watcher computer. The `uploads` folder is on
the computer or web server hosting the media service.

## Important notes and limitations

- There is no graphical user interface. Status and errors appear in the
  command window.
- The watcher only reacts to files added after it starts; it ignores files
  already present in the watch folder.
- Every newly added file is treated as something to upload. The code does not
  check whether a file is a photo or restrict file extensions.
- Files are processed one at a time. A large upload or a printer problem can
  delay later files.
- The file is considered ready when its size stops changing. Avoid editing or
  replacing a file while it is being processed.
- A successful upload depends on the PHP service returning a successful JSON
  response. The media service must remain reachable while the watcher is
  running.
- The QR-code card uses the configured paper dimensions and a fixed QR-code
  size. The application does not provide a print preview or print settings
  screen.
- The media service stores uploaded files in its `uploads` directory and
  provides downloads through `download.php`. Protect that service according
  to the privacy needs of the photos.
- `eventName` is present in the configuration, but the current application
  does not use it in the upload, QR code, or printed card.

## Troubleshooting

### The watcher does not start

- Make sure you are running `start.bat` from the project folder.
- Do not delete `node.exe` or the `node_modules` folder included with the
  project.
- If the window reports a configuration or file error, confirm that
  `config.json` is valid JSON and that its folder names are correct.

### New files do nothing

- Confirm the command window says it is watching the folder you are using.
- Put the file into `drop-here` after the watcher has started.
- Check that the file is not still being copied.
- Check whether the file was moved to `failed`.

### Uploads fail

- Confirm `uploadUrl` points to `upload.php`, not only to the containing
  folder.
- Open the media service address in a browser or ask the server
  administrator to confirm that it is online.
- Check that the server can write to `media-service/uploads`.
- Confirm the computer running the watcher can reach the server.

### The QR card is not printed

- Confirm the printer is installed and turned on.
- Copy the printer's exact Windows name into the `printer` setting.
- Check the command window for the reported error.
- The original file will normally be placed in `failed` when printing fails.

### A QR code cannot download the file

- Confirm the uploaded file exists in the media service's `uploads` folder.
- Confirm the web server can run both `upload.php` and `download.php`.
- Check that the media service URL and its download path are reachable from
  the device scanning the QR code.

## Project license

The repository includes a `LICENSE` file. Review it for the licensing terms
that apply to the bundled project files and software.
