# Axis Plugin

Comprehensive axis monitoring and control plugin for industrial automation.

## Features

1. **Display All Axis States** - Comprehensive visualization of motion states, activity bits, and status flags
2. **SF Number Configuration** - Configurable function number per node for step control
3. **Step Control Function** - Preset step sizes (0.1, 1, 10, 100) for manual axis movement
4. **HTTP API Integration** - Send function calls to control axis via REST API

---

## Configuration

### Global Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| mqttSource | string | (default) | MQTT broker selection |
| mainTopic | string | machine/axes | MQTT topic for axis data |
| errorTopic | string | machine/errors | MQTT topic for errors |
| httpBaseUrl | string | http://localhost:3021 | Base URL for function call API |
| errorColor | color | #ff0000 | Color for error state |
| homingColor | color | #00aaff | Color for homing state |
| motionColor | color | #00ff00 | Color for motion states |
| emissiveIntensity | number | 0.6 | Glow intensity (0-1) |

### Instance Settings (Per Node)

| Setting | Type | Required | Description |
|---------|------|----------|-------------|
| axisName | string | Yes | Axis name for MQTT filtering |
| functionNo | number | Yes | SF number for step commands (e.g., 5031) |
| conversionFactor | number | No | Position to world coordinate multiplier |
| transformAxis | enum | No | Animation axis (x/y/z/rotX/rotY/rotZ) |
| invertDirection | boolean | No | Invert movement direction |

---

## MQTT Data Format (Release 11)

### Axis Status Payload

```json
{
  "t": "0000019B4BE4D956",
  "data": [
    {
      "typ": "Axis",
      "id": "00000003",
      "name": "FrontPortalAxisZ                        ",
      "sS": "0001",
      "mtAcMk": "0000",
      "motMsk": "1F006000",
      "posS0": "42700000",
      "pos": "42700000",
      "vel": "00000000"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| t | hex string | Timestamp |
| typ | string | Always "Axis" |
| id | hex string | Axis ID |
| name | string | Axis name (may have trailing spaces) |
| sS | hex (WORD) | Motion State (MotionState enum) |
| mtAcMk | hex (WORD) | Motion Activity Status Bits Mask |
| motMsk | hex (DWORD) | Motion Status Mask |
| posS0 | hex (REAL) | Actual Position in World Coordinates |
| pos | hex (REAL) | Actual Position |
| vel | hex (REAL) | Actual Velocity |

---

## State Definitions

### MotionState (sS)

| Value | Name | Visual Feedback |
|-------|------|-----------------|
| 0 | ErrorStop | Red glow |
| 1 | Standstill | No glow |
| 2 | Homing | Blue glow |
| 3 | Stopping | No glow |
| 4 | Disabled | No glow |
| 5 | DiscreteMotion | Green glow |
| 6 | ContinuousMotion | Green glow |
| 7 | SynchronizedMotion | Green glow |

### MotionActivityStatusBits (mtAcMk)

| Bit | Name | Description |
|-----|------|-------------|
| 0 | MotionIsActive | Motion is currently active |
| 1 | JogNegativeIsActive | Jog negative direction active |
| 2 | JogPositiveIsActive | Jog positive direction active |
| 3 | HomingIsActive | Homing operation active |
| 4 | ResetControllerFaultIsActive | Fault reset in progress |
| 5 | VelocityPositiveIsActive | Positive velocity command |
| 6 | VelocityNegativeIsActive | Negative velocity command |
| 7 | StoppingIsActive | Stopping in progress |

### MotionStatusMask (motMsk)

| Bit | Name | Description |
|-----|------|-------------|
| 0 | IsReady | Axis is ready |
| 1 | IsEnabled | Axis is enabled |
| 2 | IsSwitchedOn | Axis is switched on |
| 3 | IsHomed | Axis is homed |
| 4 | IsCommutated | Motor is commutated |
| 5 | InternalLimitIsActive | Internal limit active |
| 6 | HasWarning | Warning present |
| 7 | HasError | Error present |
| 8 | IsInVelocity | At target velocity |
| 16 | OverrideEnabled | Override is enabled |
| 19 | HardwareLimitSwitchNegativeActivated | HW limit neg. |
| 20 | HardwareLimitSwitchPositiveActivated | HW limit pos. |
| 21 | HardwareHomeSwitchActivated | Home switch active |
| 22 | HardwareEnableActivated | Hardware enable active |
| 23 | EmergencyDetectedDelayedEnabled | Emergency delayed |
| 24 | SoftwareLimitSwitchNegativeActivated | SW limit neg. |
| 25 | SoftwareLimitSwitchPositiveActivated | SW limit pos. |
| 26 | SoftwareLimitSwitchNegativeReached | SW limit neg. reached |
| 27 | SoftwareLimitSwitchPositiveReached | SW limit pos. reached |

---

## Step Control Function

### Usage

The popup UI provides step control buttons with configurable step sizes:

| Preset | Value | Use Case |
|--------|-------|----------|
| 0.1 | Fine adjustment | Precision positioning |
| 1 | Normal step | Standard movement |
| 10 | Fast step | Quick positioning |
| 100 | Large step | Rapid movement |

### HTTP API Call

Endpoint: `POST {httpBaseUrl}/v1/commands/functioncall`

```json
{
  "functionNo": 5031,
  "functionCommand": 83,
  "functionInvokerCommand": "Start",
  "inputs": [
    {
      "functionNo": 5031,
      "parameters": [
        {
          "parameterIndex": 4,
          "typeOfParameter": "float",
          "parameter": -10
        }
      ]
    }
  ]
}
```

### Example cURL

```bash
curl -X 'POST' \
  'http://localhost:3021/v1/commands/functioncall' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
    "functionNo": 5031,
    "functionCommand": 83,
    "functionInvokerCommand": "Start",
    "inputs": [
      {
        "functionNo": 5031,
        "parameters": [
          {
            "parameterIndex": 4,
            "typeOfParameter": "float",
            "parameter": -10
          }
        ]
      }
    ]
  }'
```

---

## UI Components

### Axis Details Popup

Shows comprehensive axis information:

1. **Header**
   - Axis name
   - Current motion state with color indicator

2. **Status Overview**
   - Motion State (sS)
   - Activity Status (mtAcMk) - all bits visualized
   - Status Flags (motMsk) - all bits visualized

3. **Position & Velocity**
   - World Position (posS0)
   - Actual Position (pos)
   - Velocity (vel)
   - Last Update timestamp

4. **Step Control**
   - Step size selector: 0.1, 1, 10, 100
   - Negative step button (-)
   - Positive step button (+)
   - Current step value display

5. **Error Log**
   - Last 5 errors
   - Acknowledge functionality

---

## Installation

### Local Development

```
URL: http://localhost:3100/plugins/axis/dist/
```

### Production (GitHub via jsDelivr)

```
Monorepo: mongoistkeingemuese/3D-Viewer-Plugins
Version: vX.Y.Z
Plugin Path: plugins/axis/dist
```

---

## Changelog

### v1.0.0

- Initial release with Release 11 MQTT format support
- Comprehensive status display (all bits from motMsk and mtAcMk)
- Step control function with HTTP API integration
- SF number configuration per node
