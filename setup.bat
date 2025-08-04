@echo off
echo 🚀 Setting up ModulaR API development environment...

REM Check if Corepack is available
where corepack >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Corepack not found. Please install Node.js 16+ and enable corepack:
    echo    npm install -g corepack && corepack enable
    exit /b 1
)

REM Enable corepack
echo 📦 Enabling Corepack...
corepack enable

REM Install dependencies
echo 📥 Installing dependencies...
if exist yarn.lock (
    echo ✅ yarn.lock exists - using immutable install
    yarn install --immutable
) else (
    echo 🔄 No yarn.lock found - creating one
    yarn install
    echo ✅ yarn.lock created successfully
)

REM Build the project
echo 🔨 Building project...
yarn build

echo ✅ Setup complete! You can now run:
echo    yarn dev    - Start development server
echo    yarn build  - Build the project
echo    yarn start  - Start production server
pause
