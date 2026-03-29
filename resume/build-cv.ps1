$Targets = @(
    @{ Source = "cv-ats-en.tex"; PublicPdf = "cv-en.pdf" },
    @{ Source = "cv-ats-de.tex"; PublicPdf = "cv-de.pdf" },
    @{ Source = "cv-ats-fr.tex"; PublicPdf = "cv-fr.pdf" }
)
$ErrorActionPreference = "Stop"

$miktexBin = Join-Path $env:LocalAppData "Programs\MiKTeX\miktex\bin\x64"
if (Test-Path $miktexBin) {
    $env:PATH = "$env:PATH;$miktexBin"
}

if (-not (Get-Command xelatex -ErrorAction SilentlyContinue)) {
    throw "xelatex was not found. Install MiKTeX or add it to PATH."
}

$resumeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $resumeDir
try {
    foreach ($target in $Targets) {
        $sourceFile = $target.Source
        $publicPdf = $target.PublicPdf

        if (-not (Test-Path $sourceFile)) {
            continue
        }

        $arguments = @(
            "-interaction=nonstopmode"
            "-halt-on-error"
            "-output-directory=."
            $sourceFile
        )

        & xelatex @arguments | Out-Host
        if ($LASTEXITCODE -ne 0) {
            throw "xelatex failed for $sourceFile"
        }

        & xelatex @arguments | Out-Host
        if ($LASTEXITCODE -ne 0) {
            throw "xelatex failed for $sourceFile"
        }

        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($sourceFile)
        $builtPdf = "$baseName.pdf"
        if (Test-Path $builtPdf) {
            Copy-Item -LiteralPath $builtPdf -Destination $publicPdf -Force
        }

        $cleanupFiles = @("$baseName.aux", "$baseName.log", "$baseName.out")
        foreach ($file in $cleanupFiles) {
            if (Test-Path $file) {
                Remove-Item -LiteralPath $file -Force
            }
        }
        Write-Host "`nBuilt: $(Join-Path $resumeDir $builtPdf)"
        Write-Host "Public: $(Join-Path $resumeDir $publicPdf)"
    }
}
finally {
    Pop-Location
}
