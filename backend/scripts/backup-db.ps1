param(
    [int]$KeepDays = 14
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'
$backupDir = Join-Path $root 'backups'
$pgDump = 'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe'

if (-not (Test-Path $envFile)) { throw "Arquivo .env nao encontrado em $envFile" }
if (-not (Test-Path $pgDump)) { throw "pg_dump.exe nao encontrado em $pgDump" }
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

$line = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL=' }
if (-not $line) { throw "DATABASE_URL nao encontrada no .env" }

$url = [System.Uri]($line -replace '^DATABASE_URL=', '')
$dbUser = $url.UserInfo.Split(':')[0]
$dbPassword = $url.UserInfo.Split(':')[1]
$dbHost = $url.Host
$dbPort = $url.Port
$dbName = $url.AbsolutePath.TrimStart('/')

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$outFile = Join-Path $backupDir "smartstock_$timestamp.sql"

$env:PGPASSWORD = $dbPassword
& $pgDump -h $dbHost -p $dbPort -U $dbUser -d $dbName -F p -f $outFile
Remove-Item Env:\PGPASSWORD

if ($LASTEXITCODE -ne 0) { throw "pg_dump falhou com codigo $LASTEXITCODE" }

Write-Host "Backup criado: $outFile"

$cutoff = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem $backupDir -Filter 'smartstock_*.sql' |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
        Write-Host "Removendo backup antigo: $($_.Name)"
        Remove-Item $_.FullName -Force
    }
