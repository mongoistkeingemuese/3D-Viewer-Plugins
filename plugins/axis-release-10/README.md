# Axis Release 10 Plugin

Industrial axis monitoring plugin for 3DViewer with real-time position animation, motion state visualization, and comprehensive error logging.

## Features

### 1. Visual Status Indication
- **Emissive Color Glow**: Nodes glow based on motion state
  - Red: Error Stop (MotionState = 0)
  - Blue: Homing (MotionState = 2)
  - Green: Motion (MotionState = 5, 6, 7)
  - No Glow: Standstill, Stopping, Disabled (MotionState = 1, 3, 4)

### 2. Real-time Position Animation
- Reads `ActualPositionInWorldCoordinates` from MQTT
- Applies conversion factor and direction inversion
- Animates node position on configurable axis (X, Y, Z, RotX, RotY, RotZ)

### 3. Comprehensive Axis Details Popup
- Current position, velocity, and world position
- Motion state display
- Last 5 errors with timestamps
- Error acknowledgement functionality

### 4. MQTT Integration
- Subscribes to axis data topic (default: `machine/axes`)
- Subscribes to error topic (default: `machine/errors`)
- Filters payloads by configured axis name

## Configuration

### Global Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| mainTopic | string | `machine/axes` | MQTT topic for axis data |
| errorTopic | string | `machine/errors` | MQTT topic for error messages |
| errorColor | color | `#ff0000` | Emissive color for Error Stop state |
| homingColor | color | `#00aaff` | Emissive color for Homing state |
| motionColor | color | `#00ff00` | Emissive color for motion states |
| emissiveIntensity | number | `0.6` | Glow intensity (0-1) |

### Instance Settings (Per Node)

| Setting | Type | Required | Description |
|---------|------|----------|-------------|
| axisName | string | Yes | Axis name for filtering MQTT payloads |
| conversionFactor | number | No (default: 1.0) | Multiplier for position values |
| transformAxis | enum | No (default: y) | Which axis to animate (x, y, z, rotX, rotY, rotZ) |
| invertDirection | boolean | No (default: false) | Multiply position by -1 |

## MQTT Payload Format

### Axis Data Payload
```json
{
  "pack": [
    {
      "t": "timestamp",
      "Axis": {
        "id": "00000006",
        "name": "GoodPartsLiftAxis",
        "sS": { "typ": "i", "val": "0001" },
        "posS0": { "typ": "f", "val": "41200000" },
        "pos": { "typ": "f", "val": "40A00000" },
        "vel": { "typ": "f", "val": "3F800000" }
      }
    }
  ]
}
```

**Field Descriptions:**
- `sS.val`: Motion state (hex integer)
- `posS0.val`: World position (hex float, IEEE 754)
- `pos.val`: Actual position (hex float, IEEE 754)
- `vel.val`: Velocity (hex float, IEEE 754)

### Error Payload
```json
{
  "utc": 1766430782875,
  "lvl": "ERR",
  "src": "GoodPartsLiftAxis",
  "typ": "Axis",
  "msg": {
    "txt": "Position limit exceeded",
    "val": {}
  }
}
```

**Field Descriptions:**
- `utc`: Timestamp in milliseconds
- `lvl`: Error level (ERR, WARN, INFO)
- `src`: Source axis name (must match configured axisName)
- `msg.txt`: Error message text

## Motion States

| Value | Name | Visual Effect |
|-------|------|---------------|
| 0 | ErrorStop | Red glow |
| 1 | Standstill | No glow |
| 2 | Homing | Blue glow |
| 3 | Stopping | No glow |
| 4 | Disabled | No glow |
| 5 | DiscreteMotion | Green glow |
| 6 | ContinuousMotion | Green glow |
| 7 | SynchronizedMotion | Green glow |

## Usage

1. **Bind Plugin to Node**: Right-click a 3D object representing an axis and bind the plugin
2. **Configure Axis Name**: Set the `axisName` in instance settings to match MQTT payload
3. **Configure Transform**: Set `transformAxis` to the axis you want to animate
4. **Adjust Settings**: Fine-tune `conversionFactor` and `invertDirection` as needed
5. **Monitor**: Watch the node glow and move based on real-time axis data
6. **View Details**: Right-click → "Show Axis Details" to see detailed information

## Error Handling

- Last 5 errors per axis are stored
- Errors are filtered by axis name (source field)
- Critical errors show UI notifications
- Errors can be acknowledged in the details popup
- Acknowledged errors are visually marked but remain in history

## Implementation Details

### Hex Float Conversion
The plugin includes a `hexToFloat()` function to convert IEEE 754 hex strings to JavaScript floats:
```typescript
hexToFloat("41200000") // => 10.0
```

### Subscription Management
- Each node maintains separate MQTT subscriptions
- Subscriptions are properly cleaned up on unbind
- Error topic subscription is shared but filtered per axis

### Performance
- Position updates are throttled with 100ms animation duration
- Error list is limited to 5 entries per axis
- UI updates every 500ms when popup is open

## Development

Build the plugin:
```bash
npm run build --workspace=plugins/axis-release-10
```

Test the plugin:
```bash
npm run dev
```

Then load in browser at: `http://localhost:3100`

## License

MIT
