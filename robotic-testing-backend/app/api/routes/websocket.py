"""
WebSocket endpoints for real-time communication.
Demonstrates advanced WebSocket handling in FastAPI.
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core import events

router = APIRouter()


@router.websocket("/sensor-data")
async def websocket_sensor_data(websocket: WebSocket):
    """WebSocket endpoint for real-time sensor data streaming."""
    await websocket.accept()
    
    try:
        # Add connection to data manager
        await events.data_manager.add_websocket_connection(websocket)
        
        # Send initial system status
        status = {
            "type": "connection_established",
            "data": {
                "message": "Connected to sensor data stream",
                "sensors_active": events.sensor_manager.get_status() if events.sensor_manager else {},
                "recording": events.data_manager.recording if events.data_manager else False
            }
        }
        await websocket.send_text(json.dumps(status))
        
        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for client messages (ping, commands, etc.)
                message = await websocket.receive_text()
                
                # Parse client message
                try:
                    client_data = json.loads(message)
                    await handle_client_message(websocket, client_data)
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }))
                    
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        # Clean up connection
        if events.data_manager:
            await events.data_manager.remove_websocket_connection(websocket)


async def handle_client_message(websocket: WebSocket, message: dict):
    """Handle incoming WebSocket messages from clients."""
    message_type = message.get("type", "unknown")
    
    if message_type == "ping":
        # Respond to ping with pong
        await websocket.send_text(json.dumps({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }))
    
    elif message_type == "get_status":
        # Send current system status
        if events.data_manager and events.sensor_manager:
            status = {
                "type": "system_status",
                "data": {
                    "sensors": events.sensor_manager.get_status(),
                    "recording": events.data_manager.recording,
                    "data_summary": events.data_manager.get_data_summary()
                }
            }
            await websocket.send_text(json.dumps(status))
    
    elif message_type == "subscribe":
        # Handle subscription preferences
        # Could extend this to allow filtering by sensor type
        await websocket.send_text(json.dumps({
            "type": "subscription_confirmed",
            "data": message.get("data", {})
        }))
    
    else:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }))