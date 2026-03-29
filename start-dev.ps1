# Run Arabic Kitchen App locally on Windows

$ErrorActionPreference = "Stop"

# 1. Check if pnpm is installed
if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm is not installed. Please install it using: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# 2. Check for DATABASE_URL environment variable
if (-not $env:DATABASE_URL) {
    Write-Host "WARNING: DATABASE_URL environment variable is not set." -ForegroundColor Yellow
    Write-Host "The application requires a PostgreSQL database to run."
    Write-Host "Example:"
    Write-Host "  `$env:DATABASE_URL=`"postgres://postgres:password@localhost:5432/arabic_kitchen`"" -ForegroundColor Cyan
    Write-Host "Please set it and run this script again."
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Green
pnpm install

Write-Host "Pushing database schema..." -ForegroundColor Green
pnpm --filter @workspace/db run push

Write-Host "Starting API Server on port 3000 and Frontend on port 5173..." -ForegroundColor Green

# Using Start-Process to open in new windows, so you can see both logs
$apiArgs = "-NoProfile -NoExit -Command `"`$env:PORT=3000; pnpm --filter @workspace/api-server run dev`""
Start-Process powershell -ArgumentList $apiArgs -Wait:$false

$frontArgs = "-NoProfile -NoExit -Command `"`$env:PORT=5173; `$env:BASE_PATH='/'; pnpm --filter @workspace/restaurant run dev`""
Start-Process powershell -ArgumentList $frontArgs -Wait:$false

Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Frontend will be available at http://localhost:5173" -ForegroundColor Green
Write-Host "API will be available at http://localhost:3000/api/" -ForegroundColor Green
