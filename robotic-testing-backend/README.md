# Robotic Testing System - Backend

A professional FastAPI backend for robotic sensor data simulation and management. This backend demonstrates advanced Python/FastAPI patterns, real-time WebSocket communication, data validation, and professional software architecture.

## 🚀 Features

### Core Functionality
- **Real-time Sensor Simulation**: Multi-threaded sensor simulators for Force, Motor, and Camera systems
- **WebSocket Communication**: Real-time data streaming to frontend clients
- **Data Validation**: Advanced validation with configurable thresholds and alerting
- **Session Management**: Complete recording session lifecycle management
- **Data Export**: CSV export functionality for collected sensor data
- **RESTful API**: Comprehensive REST endpoints for all system operations

### Technical Highlights
- **FastAPI Framework**: Modern async Python web framework
- **Pydantic Models**: Advanced data validation and serialization
- **Abstract Base Classes**: Professional OOP inheritance patterns
- **Threading**: Safe multi-threaded sensor simulation
- **Type Hints**: Complete type coverage throughout codebase
- **Configuration Management**: Environment-based settings with Pydantic
- **Error Handling**: Comprehensive exception handling
- **Testing**: pytest-ready test structure

## 🏗️ Architecture

```
app/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configuration and events
│   ├── config.py          # Application settings
│   └── events.py          # Startup/shutdown handlers
├── models/                 # Pydantic data models
│   ├── sensor.py          # Sensor data models
│   └── session.py         # Session management models
├── services/               # Business logic services
│   ├── sensor_simulator.py # Sensor simulation classes
│   ├── data_manager.py    # Data management service
│   └── validation.py      # Data validation service
├── api/                    # API routes
│   ├── routes/
│   │   ├── sensors.py     # Sensor endpoints
│   │   ├── sessions.py    # Session management endpoints
│   │   └── websocket.py   # WebSocket endpoints
│   └── deps.py            # FastAPI dependencies
└── utils/
    └── helpers.py         # Utility functions
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.11+
- pip or poetry

### Quick Start

```bash
# Clone the repository
cd robotic-testing-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Setup

```bash
# Build and run with Docker
docker-compose up --build

# Or run individually
docker build -t robotic-backend .
docker run -p 8000:8000 robotic-backend
```

## 📡 API Endpoints

### Health & Status
- `GET /` - Basic health check
- `GET /health` - Detailed system health
- `GET /api/v1/sensors/status` - Sensor system status

### Session Management  
- `POST /api/v1/sessions/start` - Start recording session
- `POST /api/v1/sessions/stop` - Stop recording session
- `GET /api/v1/sessions/status` - Get session status
- `POST /api/v1/sessions/reset` - Reset session data
- `GET /api/v1/sessions/export/csv` - Export data as CSV

### Sensor Data
- `GET /api/v1/sensors/readings` - Get sensor readings (with filtering)
- `GET /api/v1/sensors/readings/latest` - Get latest readings from each sensor
- `GET /api/v1/sensors/readings/aggregated` - Get aggregated data over time
- `GET /api/v1/sensors/validation` - Get validation results

### WebSocket
- `WS /ws/sensor-data` - Real-time sensor data stream

## 🔧 Configuration

Environment variables (see `.env.example`):

```env
# Application
PROJECT_NAME="Robotic Testing System"
VERSION="1.0.0"
DEBUG=False

# Server
HOST=0.0.0.0
PORT=8000

# Sensor Rates (Hz)
FORCE_SENSOR_HZ=10.0
MOTOR_SENSOR_HZ=5.0
CAMERA_SENSOR_HZ=1.0

# Validation Thresholds
FORCE_THRESHOLD_HIGH=80.0
MOTOR_THRESHOLD=55.0

# Data Management
MAX_DATA_POINTS=10000
DATA_EXPORT_PATH="./data/exports/"
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_sensors.py -v
```

## 🏭 Production Deployment

### Using uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using gunicorn:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables for Production:
```env
DEBUG=False
ALLOWED_HOSTS=["https://your-frontend-domain.com"]
```

## 🎯 Professional Python Patterns Demonstrated

1. **FastAPI Advanced Usage**
   - Lifespan events for startup/shutdown
   - Dependency injection
   - WebSocket handling
   - Background tasks

2. **Pydantic Advanced Features**
   - Custom validators
   - Settings management
   - Complex nested models
   - Type coercion

3. **Object-Oriented Design**
   - Abstract base classes
   - Inheritance hierarchies
   - Design patterns (Factory, Strategy)

4. **Async Programming**
   - Proper async/await usage
   - Thread-safe operations
   - Async context managers

5. **Error Handling & Validation**
   - Custom exception handling
   - Data validation at multiple levels
   - Graceful degradation

6. **Testing & Quality**
   - Pytest fixtures and parametrization
   - Type hints throughout
   - Professional documentation

## 📊 Real-time Data Flow

1. **Sensor Simulators** generate data on separate threads
2. **Data Manager** receives and validates all sensor data
3. **Validation Service** checks data against thresholds
4. **WebSocket Manager** broadcasts data to connected clients
5. **REST API** provides historical data access and session management

## 🔍 Monitoring & Observability

The system provides comprehensive monitoring through:
- System health endpoints
- Validation result tracking
- Data integrity checks
- Connection status monitoring
- Performance metrics

## 🚀 Deployment Ready

- Docker containerization
- Environment-based configuration
- Production WSGI server ready
- Health checks included
- Graceful shutdown handling

---

This backend showcases professional Python development practices suitable for production environments and technical interviews. The codebase demonstrates mastery of modern Python frameworks, async programming, and software architecture principles.