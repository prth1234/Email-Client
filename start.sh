#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}[Cleanup] Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}[Cleanup] Stopping servers...${NC}"
    
    # Kill backend and frontend processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}[Cleanup] Backend stopped${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}[Cleanup] Frontend stopped${NC}"
    fi
    
    # Kill any remaining processes on the ports we used
    if [ ! -z "$BACKEND_PORT" ]; then
        kill_port $BACKEND_PORT
    fi
    if [ ! -z "$FRONTEND_PORT" ]; then
        kill_port $FRONTEND_PORT
    fi
    
    exit 0
}

# Trap exit signals
trap cleanup SIGINT SIGTERM EXIT

if [ "$1" = "dev" ]; then
    echo "=================================="
    echo "   Starting Dev Servers..."
    echo "=================================="
    
    # Kill any existing processes on default ports
    echo -e "${YELLOW}[Cleanup] Checking for existing processes...${NC}"
    kill_port 3001
    kill_port 5173
    
    # Find available ports
    BACKEND_PORT=$(find_available_port 3001)
    FRONTEND_PORT=$(find_available_port 5173)
    
    echo -e "${GREEN}[Backend] Starting on port $BACKEND_PORT...${NC}"
    echo -e "${GREEN}[Frontend] Starting on port $FRONTEND_PORT...${NC}"
    
    # Start Backend
    cd backend
    PORT=$BACKEND_PORT npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 2
    
    # Start Frontend  
    cd frontend
    VITE_PORT=$FRONTEND_PORT npm run dev -- --port $FRONTEND_PORT &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "=================================="
    echo -e "${GREEN}   Servers Running!${NC}"
    echo "=================================="
    echo -e "Backend:  ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    echo -e "Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
    echo ""
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
else
    echo "Usage: ./start.sh dev"
    echo "This will start both backend and frontend servers."
    echo "Servers will automatically find available ports if defaults are taken."
fi
