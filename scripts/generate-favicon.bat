@echo off
cd /d "%~dp0.."

REM Generate PNG favicon from SVG using ImageMagick
REM Requires ImageMagick to be installed: https://imagemagick.org/script/download.php

echo Converting SVG favicon to PNG...

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %errorlevel% neq 0 (
    where convert >nul 2>nul
    if %errorlevel% neq 0 (
        echo Error: ImageMagick not found. Please install ImageMagick first.
        echo Download from: https://imagemagick.org/script/download.php
        exit /b 1
    )
    set CONVERT_CMD=convert
) else (
    set CONVERT_CMD=magick
)

REM Input and output paths
set SVG_FILE=static\favicon.svg
set PNG_FILE=static\favicon.png

REM Check if SVG file exists
if not exist "%SVG_FILE%" (
    echo Error: SVG file not found at %SVG_FILE%
    exit /b 1
)

REM Convert SVG to PNG at 64x64 pixels with explicit transparency
echo Using %CONVERT_CMD% to convert favicon...
%CONVERT_CMD% -background none "%SVG_FILE%" -resize 64x64 "%PNG_FILE%"

REM Check if conversion was successful
if %errorlevel% equ 0 (
    if exist "%PNG_FILE%" (
        echo ✅ Success! Generated %PNG_FILE% ^(64x64 pixels^)

        REM Show file size
        for %%A in ("%PNG_FILE%") do echo 📦 File size: %%~zA bytes
    ) else (
        echo ❌ Error: PNG file was not created
        exit /b 1
    )
) else (
    echo ❌ Error: Failed to generate PNG favicon
    exit /b 1
)

echo 🎯 Favicon generation complete!
