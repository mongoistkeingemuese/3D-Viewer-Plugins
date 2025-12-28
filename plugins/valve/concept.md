# Valve Plugin Konzept

> Version: 1.0 | Ziel-Release: 8-11 | Vorlage: axis-release-10

## 1. Übersicht

Plugin zur Statusanzeige und Bedienung von Ventil-Bausteinen (Release 8-11).
Weitere Releases können später hinzugefügt werden.

### Kernfunktionen

| Feature | Beschreibung |
|---------|-------------|
| Status-Anzeige | Ventilposition (gS, sS), Laufzeiten |
| Bedienung | AST/GST fahren, Drucklos, Modi |
| Visualisierung | Node-Position + Highlighting |
| Errors | Error-Tab mit Acknowledge |

---

## 2. MQTT Datenformat

### Valve Payload (Release 8-11)

```json
{
  "pack": [
    {
      "t": "0000019B6690B8DC",
      "Valve": {
        "id": "0000000B",
        "name": "CenteringValveLiftInterLayer            ",
        "gS": { "typ": "i", "val": "0A" },
        "sS": { "typ": "i", "val": "00" },
        "recipe": { "typ": "i", "val": "00" }
      }
    }
  ]
}
```

### Generic State (gS) - BehaviorModelStateEnum

| Wert | Hex | Name | Beschreibung |
|------|-----|------|-------------|
| -1 | FF | Unknown | Unbekannter Zustand (Diagnose) |
| 0 | 00 | Idle | Wartet auf xExecute |
| 1 | 01 | Executing | ExecutingAction() läuft |
| 2 | 02 | Done | Ready-Bedingung erreicht |
| 3 | 03 | Error | Fehlerbedingung erreicht |
| 4 | 04 | Pausing | PauseAction() läuft |
| 5 | 05 | Paused | Pause-Bedingung erreicht |
| 6 | 06 | Aborting | AbortAction() läuft |
| 7 | 07 | Aborted | Abbruch-Bedingung erreicht |
| 8 | 08 | Resetting | ResetAction() läuft |
| 9 | 09 | Preparing | PreparingAction() läuft |
| 10 | 0A | Initialising | Initialize() läuft |

### Specific State (sS) - ValvePositionEnum

| Wert | Hex | Name | Beschreibung | Node-Aktion |
|------|-----|------|-------------|-------------|
| 0 | 00 | IsPressureFree | Drucklos | - |
| 1 | 01 | MovingToBasePosition | Fährt zu GST | Highlighting + Interpolation zu (0,0,0) |
| 2 | 02 | MovingToWorkPosition | Fährt zu AST | Highlighting + Interpolation zu AST-Pos |
| 3 | 03 | IsInBasePosition | In GST | Node auf (0,0,0) |
| 4 | 04 | IsInWorkPosition | In AST | Node auf AST-Pos |
| 5 | 05 | IsInUndefinedPosition | Undefiniert | - |

---

## 3. HTTP Function Commands

### Basis-URL Schema

```
POST {httpBaseUrl}/v1/commands/functioncall
```

### Function Numbers für Ventilbedienung

| Nr | Name | Beschreibung |
|----|------|-------------|
| 0 | MoveToBasePosition | Fahre zu GST |
| 1 | MoveToWorkPosition | Fahre zu AST |
| 2 | TogglePosition | Position wechseln |
| 3 | SwitchToPressureFree | Drucklos schalten |
| 50 | SwitchToOptionMonostable | Modus: Monostabil |
| 51 | SwitchToOptionBistablePulsed | Modus: Bistabil Pulsed |
| 52 | SwitchToOptionBistablePermanent | Modus: Bistabil Permanent |
| 53 | SwitchToOptionBistableMiddlePositionOpen | Modus: Bistabil Mittelstellung offen |

### Request Payload Beispiel

```json
{
  "functionNo": 1234,
  "functionCommand": 0,
  "functionInvokerCommand": "Start",
  "inputs": []
}
```

---

## 4. UI Design

### Tab-Struktur (wie Axis)

```
┌─────────────────────────────────────────┐
│ Valve: CenteringValveLift               │
│ Status: IsInBasePosition ● (grün)       │
├─────────────┬───────────────┬───────────┤
│   Status    │   Bedienung   │ Errors(2) │
├─────────────┴───────────────┴───────────┤
│                                         │
│  [TAB CONTENT]                          │
│                                         │
└─────────────────────────────────────────┘
```

### Status Tab

```
┌─────────────────────────────────────────┐
│ Ventilstatus                            │
├─────────────────────────────────────────┤
│ Generic State:    Idle                  │
│ Specific State:   IsInBasePosition      │
├─────────────────────────────────────────┤
│ Laufzeiten                              │
├─────────────────────────────────────────┤
│ Letzte GST → AST:  1.234 s              │
│ Letzte AST → GST:  0.987 s              │
├─────────────────────────────────────────┤
│ Letztes Update:    14:32:15             │
└─────────────────────────────────────────┘
```

### Bedienung Tab

```
┌─────────────────────────────────────────┐
│ Hauptbedienung                          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         AST fahren              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         GST fahren              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        Drucklos                 │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│ Betriebsmodus                           │
├─────────────────────────────────────────┤
│ [Mono] [BiPuls] [BiPerm] [BiMitte]      │
│   ^-- aktiver Modus hervorgehoben       │
└─────────────────────────────────────────┘
```

### Errors Tab (mit Badge-Counter)

```
┌─────────────────────────────────────────┐
│ Errors (2 unbestätigt)                  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ERR  14:30:22                       │ │
│ │ Timeout beim Fahren zu AST          │ │
│ │ Source: CenteringValveLift          │ │
│ │                     [Acknowledge]   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Acknowledged                      │ │
│ │ WARN  14:28:05                      │ │
│ │ Langsame Ventilbewegung             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 5. Node-Visualisierung

### Position Animation

| Zustand | Node Position | Dauer |
|---------|--------------|-------|
| IsInBasePosition / MovingToBase | `(0, 0, 0, 0, 0, 0)` | `durationMoveGST` ms |
| IsInWorkPosition / MovingToWork | AST-Pos aus Config | `durationMoveAST` ms |
| Undefiniert | Letzte Position | - |

### Highlighting (Emissive Glow)

| Zustand | Highlighting | Farbe |
|---------|-------------|-------|
| MovingToBasePosition | JA | `highlightColor` |
| MovingToWorkPosition | JA | `highlightColor` |
| Error (gS = 3) | JA | `errorColor` |
| Alle anderen | NEIN | - |

### Laufzeitmessung

Berechnung über MQTT Timestamp (`t`-Feld):

```typescript
// Bei Statuswechsel zu "MovingTo..."
moveStartTime = parseMqttTimestamp(payload.t);

// Bei Statuswechsel zu "IsIn..."
moveEndTime = parseMqttTimestamp(payload.t);
duration = moveEndTime - moveStartTime;

// Speichern je nach Richtung
if (previousState === 'MovingToWorkPosition') {
  lastDurationGstToAst = duration;
} else if (previousState === 'MovingToBasePosition') {
  lastDurationAstToGst = duration;
}
```

---

## 6. Konfiguration

### Global Config (manifest.json)

```json
{
  "config": {
    "global": {
      "schema": {
        "type": "object",
        "properties": {
          "mqttSource": {
            "type": "string",
            "title": "MQTT Broker",
            "x-source-type": "mqtt"
          },
          "mqttFormat": {
            "type": "string",
            "title": "MQTT Format",
            "enum": ["release8", "release9", "release10", "release11"],
            "default": "release10"
          },
          "mainTopic": {
            "type": "string",
            "title": "MQTT Ventil Topic",
            "default": "machine/valves"
          },
          "errorTopic": {
            "type": "string",
            "title": "MQTT Error Topic",
            "default": "machine/errors"
          },
          "httpBaseUrl": {
            "type": "string",
            "title": "HTTP Basis-URL",
            "description": "z.B. http://192.168.1.100:3021",
            "default": "http://localhost:3021"
          },
          "highlightColor": {
            "type": "string",
            "title": "Highlight Farbe (Move)",
            "format": "color",
            "default": "#00aaff"
          },
          "highlightIntensity": {
            "type": "number",
            "title": "Highlight Intensität",
            "default": 0.6,
            "minimum": 0,
            "maximum": 1
          },
          "errorColor": {
            "type": "string",
            "title": "Error Farbe",
            "format": "color",
            "default": "#ff0000"
          }
        }
      }
    }
  }
}
```

### Instance Config (pro Node)

```json
{
  "config": {
    "instance": {
      "schema": {
        "type": "object",
        "properties": {
          "valveName": {
            "type": "string",
            "title": "Ventilname",
            "description": "Name aus MQTT Payload zum Filtern"
          },
          "functionNo": {
            "type": "integer",
            "title": "Funktionsnummer",
            "description": "Function Number für HTTP Calls"
          },
          "astPosX": {
            "type": "number",
            "title": "AST Position X",
            "default": 0
          },
          "astPosY": {
            "type": "number",
            "title": "AST Position Y",
            "default": 0
          },
          "astPosZ": {
            "type": "number",
            "title": "AST Position Z",
            "default": 0
          },
          "astRotX": {
            "type": "number",
            "title": "AST Rotation X (rad)",
            "default": 0
          },
          "astRotY": {
            "type": "number",
            "title": "AST Rotation Y (rad)",
            "default": 0
          },
          "astRotZ": {
            "type": "number",
            "title": "AST Rotation Z (rad)",
            "default": 0
          },
          "durationMoveAST": {
            "type": "integer",
            "title": "Animation AST (ms)",
            "description": "Dauer der Animation zu AST",
            "default": 500
          },
          "durationMoveGST": {
            "type": "integer",
            "title": "Animation GST (ms)",
            "description": "Dauer der Animation zu GST",
            "default": 500
          }
        },
        "required": ["valveName", "functionNo"]
      }
    }
  }
}
```

---

## 7. Datenstrukturen (TypeScript)

### Enums

```typescript
enum GenericState {
  Unknown = -1,
  Idle = 0,
  Executing = 1,
  Done = 2,
  Error = 3,
  Pausing = 4,
  Paused = 5,
  Aborting = 6,
  Aborted = 7,
  Resetting = 8,
  Preparing = 9,
  Initialising = 10,
}

enum ValvePosition {
  IsPressureFree = 0,
  MovingToBasePosition = 1,
  MovingToWorkPosition = 2,
  IsInBasePosition = 3,
  IsInWorkPosition = 4,
  IsInUndefinedPosition = 5,
}

enum FunctionCommand {
  MoveToBasePosition = 0,
  MoveToWorkPosition = 1,
  TogglePosition = 2,
  SwitchToPressureFree = 3,
  SwitchToOptionMonostable = 50,
  SwitchToOptionBistablePulsed = 51,
  SwitchToOptionBistablePermanent = 52,
  SwitchToOptionBistableMiddlePositionOpen = 53,
}
```

### Node State

```typescript
interface NodeState {
  nodeId: string;
  valveName: string;
  functionNo: number;
  subscriptions: Unsubscribe[];

  // Status
  genericState: GenericState;
  specificState: ValvePosition;
  previousSpecificState: ValvePosition;

  // Laufzeitmessung
  moveStartTimestamp: number | null;
  lastDurationGstToAst: number | null;  // ms
  lastDurationAstToGst: number | null;  // ms

  // Errors
  errors: ErrorEntry[];
  lastUpdate: Date | null;
}
```

---

## 8. Implementierungsplan

### Phase 1: Grundstruktur

1. Plugin-Scaffold mit `npm run new:plugin -- valve -t sandbox`
2. Manifest mit allen Configs
3. PluginState Klasse
4. MQTT Subscription + Parsing

### Phase 2: Status-Anzeige

1. ValveDetailsPopup Komponente
2. Tab-Navigation (Status, Bedienung, Errors)
3. Status-Tab mit gS/sS Anzeige
4. Error-Tab mit Acknowledge

### Phase 3: Node-Visualisierung

1. Highlighting bei Moving-States
2. Position-Animation bei Statuswechsel
3. Laufzeitmessung implementieren

### Phase 4: Bedienung

1. HTTP Function Call Wrapper
2. Hauptbedienungs-Buttons
3. Modi-Toggle-Buttons

### Phase 5: Feinschliff

1. Error Handling
2. Notifications
3. Tests
4. Dokumentation

---

## 9. Dateien

```
plugins/valve/
├── manifest.json
├── package.json
├── src/
│   ├── index.ts              # Plugin-Hauptdatei
│   ├── types.ts              # TypeScript Interfaces
│   ├── utils.ts              # Hex-Parsing, Timestamp
│   └── components/
│       └── ValveDetailsPopup.tsx
├── dist/
│   ├── index.js
│   └── manifest.json
└── README.md
```

---

## 10. Berechtigungen

```json
{
  "permissions": [
    "mqtt:subscribe",
    "http:fetch",
    "nodes:read",
    "nodes:write",
    "ui:popup",
    "state:persist"
  ]
}
```

---

## 11. Klärungen

| Frage | Antwort |
|-------|---------|
| Release 11 Format | Valve nutzt weiterhin `pack[]` (nicht `data[]` wie Axis R11) |
| Aktueller Modus via MQTT | Nein - Modi-Buttons zeigen nur Auswahl, kein Feedback vom PLC |
| Error-Topic Format | Identisch mit Axis (utc, lvl, src, typ, msg) |

---

## Änderungshistorie

| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0 | 2025-01-XX | Initiales Konzept |
