#!/bin/bash
echo "Starting DTR Automate..."

if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Please install from https://nodejs.org/"
    exit
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f "dist/server.cjs" ]; then
    echo "Building application..."
    npm run build
fi

echo "Starting server..."
node dist/server.cjs &
SERVER_PID=$!

sleep 3

echo "Opening application..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --app=http://localhost:3000 || open http://localhost:3000
else
    google-chrome --app=http://localhost:3000 || xdg-open http://localhost:3000
fi

echo "Press [CTRL+C] to stop the server..."
wait $SERVER_PID
