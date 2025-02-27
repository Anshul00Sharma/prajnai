# PowerShell script to remove Notion-related dependencies

Write-Host "Removing Notion-related dependencies..." -ForegroundColor Green

# List of packages to uninstall
$packagesToRemove = @(
    "@notionhq/client",
    "notion-client", 
    "notion-types", 
    "react-notion-x"
)

# Uninstall each package
foreach ($package in $packagesToRemove) {
    Write-Host "Uninstalling $package..." -ForegroundColor Yellow
    npm uninstall $package
}

Write-Host "All Notion-related dependencies have been removed!" -ForegroundColor Green
