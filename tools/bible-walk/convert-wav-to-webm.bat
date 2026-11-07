@echo off
setlocal

echo ============================================
echo   Bible Walk: WAV to WebM (speech) converter
echo ============================================
echo.
echo Copy this file next to a "wav" folder of recordings named by episode id
echo (walk-00.wav, mark-01.wav ...). It writes one .webm per file to "webm".
echo Opus at 48 kbps mono: about 3 MB for an 8-minute episode.
echo.

set "INPUT_DIR=wav"
set "OUTPUT_DIR=webm"

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

if not exist "%INPUT_DIR%" (
    echo ERROR: Input directory "%INPUT_DIR%" does not exist.
    echo.
    pause
    exit /b 1
)

for %%F in ("%INPUT_DIR%\*.wav") do (
    echo Converting: %%~nxF
    ffmpeg -y -hide_banner -loglevel error -i "%%F" ^
        -codec:a libopus ^
        -b:a 48k ^
        -ac 1 ^
        -ar 48000 ^
        "%OUTPUT_DIR%\%%~nF.webm"
)

echo.
echo ============================================
echo Conversion complete!
echo Input : %INPUT_DIR%\
echo Output: %OUTPUT_DIR%\
echo Upload each file to R2 at audio/bible-walk/^<book^>/^<id^>.webm
echo ============================================
pause
