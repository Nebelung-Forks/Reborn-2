<?php
echo "https://slider.kz" . rawurlencode($_GET['mp3']) . "?extra=" . rawurlencode($_GET['extra']) . "&long_chunk=1";
$string = file_get_contents("https://slider.kz" . $_GET['mp3'] . "?extra=" . rawurlencode($_GET['extra']) . "&long_chunk=1");

header("Content-Transfer-Encoding: binary");
header("Content-Type: audio/mpeg, audio/x-mpeg, audio/x-mpeg-3, audio/mpeg3");

echo $string;
?>
