$images = @(
    "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-1645062cd95c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1457144759132-40d119c2f120?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80"
)

$destDir = "assets\gallery"
if (!(Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

for ($i=0; $i -lt $images.Length; $i++) {
    $outFile = Join-Path $destDir "$($i+1).jpg"
    Write-Host "Downloading $($i+1).jpg..."
    try {
        Invoke-WebRequest -Uri $images[$i] -OutFile $outFile
    } catch {
        Write-Error "Failed to download image $($i+1)"
    }
}
Write-Host "All downloads complete."
