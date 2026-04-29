from fastapi import WebSocket
from typing import List
from backend.core.logger import logger
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        logger.info(f"Broadcasting WebSocket message to {len(self.active_connections)} clients")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Cleanup stale connections
        for conn in disconnected:
            self.disconnect(conn)

# Global manager instance
manager = ConnectionManager()
