<?php

$file=basename($_GET["f"]);

$path=__DIR__."/uploads/".$file;

if(!file_exists($path))
{
    http_response_code(404);
    exit;
}

header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"$file\"");

readfile($path);
