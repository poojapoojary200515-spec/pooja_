$port = 8080
$basePath = $PSScriptRoot
if (-not $basePath) { $basePath = Get-Location }

# Attempt to bind to 8080 or fallback to another port if 8080 is busy
$listener = $null
$bound = $false

foreach ($p in @(8080, 5500, 3000, 8000, 8888)) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$p/")
        $listener.Start()
        $port = $p
        $bound = $true
        break
    } catch {
        if ($listener) { $listener.Close() }
    }
}

if (-not $bound) {
    Write-Error "Could not bind to any test port."
    exit 1
}

Write-Output "HTTP server running on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $localPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($localPath)) {
                $localPath = "index.html"
            }
            
            # Replace slashes for Windows paths
            $localPath = $localPath -replace '/', '\'
            $filePath = Join-Path $basePath $localPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".ico"  { "image/x-icon" }
                    ".json" { "application/json; charset=utf-8" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                
                # Do not write body on HEAD requests
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $msg.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
            $response.OutputStream.Close()
        } catch {
            # Continue listening even if an individual connection error occurs
            try { $response.OutputStream.Close() } catch {}
        }
    }
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}
