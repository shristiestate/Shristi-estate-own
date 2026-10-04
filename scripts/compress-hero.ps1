Add-Type -AssemblyName System.Drawing

$inputPath = "public/hero-commercial-park.png"
$outputPath = "public/hero-commercial-park.jpg"
$mobileOutputPath = "public/hero-commercial-park-mobile.jpg"

if (Test-Path $inputPath) {
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $inputPath).Path)
    $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    $jpegCodec = $null
    foreach ($encoder in $encoders) {
        if ($encoder.MimeType -eq "image/jpeg") {
            $jpegCodec = $encoder
            break
        }
    }

    if ($jpegCodec) {
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]78)
        
        # Desktop version (1024px)
        $img.Save((Join-Path (Get-Location) $outputPath), $jpegCodec, $encoderParams)
        Write-Host "Success! Created $outputPath with size: $((Get-Item $outputPath).Length) bytes"

        # Mobile version (640px)
        $mobileWidth = 640
        $mobileHeight = [int]($img.Height * ($mobileWidth / $img.Width))
        $mobileBmp = New-Object System.Drawing.Bitmap($mobileWidth, $mobileHeight)
        $g = [System.Drawing.Graphics]::FromImage($mobileBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $mobileWidth, $mobileHeight)
        $g.Dispose()

        $mobileParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $mobileParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]74)
        $mobileBmp.Save((Join-Path (Get-Location) $mobileOutputPath), $jpegCodec, $mobileParams)
        $mobileBmp.Dispose()
        Write-Host "Success! Created $mobileOutputPath with size: $((Get-Item $mobileOutputPath).Length) bytes"
    }
    $img.Dispose()
}
