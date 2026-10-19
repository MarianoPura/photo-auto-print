<?php

header('Content-Type: application/json');

if (!isset($_FILES["file"])) {
    exit(json_encode([
        "success" => false
    ]));
}

$ext = pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION);
$name = uniqid() . "." . $ext;

move_uploaded_file(
    $_FILES["file"]["tmp_name"],
    __DIR__ . "/uploads/" . $name
);

echo json_encode([
    "success" => true,
    "url" => "download.php?f=" . $name
]);
