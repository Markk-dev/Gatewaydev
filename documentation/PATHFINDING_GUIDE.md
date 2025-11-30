# Campus Navigation System - Feature Guide

## 🎯 Overview
Advanced pathfinding system using Dijkstra's algorithm with support for multi-floor navigation, accessibility options, and dynamic availability.

## ✨ Features Implemented

### 1. ✅ Shortest Distance & Optimal Route
- **Dijkstra's Algorithm**: Finds the mathematically shortest path
- **Weighted Edges**: 
  - Same floor movement: 1 unit (30 seconds)
  - Stairs between floors: 2-3 units (1-1.5 minutes)
- **Floor Transitions**: Stairs marked as navigation nodes connecting floors
- **Estimated Time**: Calculates walking time based on distance and floor changes

### 2. ✅ Floor Awareness
- **Visual Indicators**: 
  - 📍 Start location
  - 🪜 Stairs usage
  - 🛗 Elevator usage (accessibility mode)
  - 🎯 Destination
- **Floor Change Tracking**: Counts and displays number of floor transitions
- **Direction Indicators**: Shows "up" or "down" for vertical movement
- **Floor Level Display**: Shows current floor for each step

### 3. ✅ Department/Professor/Service Search
- **Multi-Category Search**: Search across:
  - Locations (rooms, labs, offices)
  - Faculty members
  - Departments
  - Services (printing, scholarship, health, etc.)
- **Fuzzy Matching**: Partial name matching for easier search
- **Faculty Locations**: Handles professors with multiple office locations
- **Service Mapping**: Direct navigation to specific services within departments

### 4. ✅ Accessibility Options
- **Accessibility Mode**: `CampusNavigator(json_file, accessibility_mode=True)`
- **Elevator Preference**: Avoids stairs when accessibility mode is enabled
- **Route Indicators**: Shows if route is accessibility-friendly
- **Alternative Routes**: Finds accessible paths when available

### 5. ✅ Dynamic Availability
- **Room Restrictions**: Mark rooms as busy/restricted
  ```python
  navigator.mark_room_restricted("Comlab1", restricted=True)
  ```
- **Faculty Schedule Awareness**: 
  - Checks day-of-week availability
  - Warns if faculty typically unavailable
  - Supports Saturday-only schedules
- **Schedule Integration**: Uses faculty schedule data from JSON
- **Restricted Room Avoidance**: Routes avoid restricted rooms unless destination

## 🚀 Usage Examples

### Basic Navigation
```python
navigator = CampusNavigator('lib/PathFinding.json')
result = navigator.navigate("MIS", "Library")
navigator.print_path(result)
```

### Find Faculty Member
```python
result = navigator.navigate_to_faculty(
    "Comlab1", 
    "Jennifer Magbanlac",
    current_day=DayOfWeek.MONDAY
)
```

### Search for Services
```python
# Navigate to a specific service
result = navigator.navigate("Registrar", "Scholarship and Financial Assistance")

# Search all categories
results = navigator.search_all("guidance")
```

### Accessibility Mode
```python
accessible_nav = CampusNavigator('lib/PathFinding.json', accessibility_mode=True)
result = accessible_nav.navigate("Ground Floor", "Third Floor")
```

### Dynamic Restrictions
```python
# Mark room as busy
navigator.mark_room_restricted("Comlab1", restricted=True)

# Mark as available again
navigator.mark_room_restricted("Comlab1", restricted=False)
```

## 📊 Output Information

Each route provides:
- **Distance**: Total path distance in units
- **Estimated Time**: Walking time in minutes
- **Floor Changes**: Number of floor transitions
- **Accessibility**: Whether route uses stairs
- **Step-by-Step Directions**: Human-readable navigation instructions
- **Path Overview**: List of all nodes in the route

## 🏗️ Graph Structure

### Nodes
- **Rooms**: Offices, classrooms, labs
- **Stairs**: Navigation points between floors
- **Departments**: Service areas
- **Facilities**: Library, AVR, comfort rooms

### Edges (Connections)
```
Ground Floor: MIS <-> Student Welfare <-> Student Development
First Floor: Comlab1 <-> Stairs <-> Registrar <-> Accounting
Vertical: Stairs (Ground) <-> Stairs (First) <-> Stairs (Second)
```

### Weights
- Adjacent rooms (same floor): 1 unit
- Stairs (floor transition): 2-3 units
- Elevators (if available): 2 units

## 🔍 Search Capabilities

### Location Search
- By room name: "Comlab1", "Library", "MIS"
- By full name: "Computer Laboratory 1"
- By department: "Student Development"

### Faculty Search
- By name: "Jennifer Magbanlac"
- Partial match: "Jennifer", "Magbanlac"
- Returns all office locations

### Service Search
- By service name: "Scholarship and Financial Assistance"
- By category: "printing", "guidance", "health"
- Returns department location

## 📅 Schedule Integration

### Day-of-Week Support
```python
from pathfinding import DayOfWeek

# Check faculty availability
result = navigator.navigate_to_faculty(
    "Library",
    "Mark Valencia",
    current_day=DayOfWeek.SATURDAY
)
```

### Faculty Schedules
- Regular weekdays: Monday-Friday
- Saturday only: Special schedules
- Multiple locations: Different offices

## 🎨 Visual Output

Routes include emoji indicators:
- 📍 Starting point
- ➡️  Walking direction
- 🪜 Stairs
- 🛗 Elevator
- 🎯 Destination
- ℹ️  Additional info
- ⚠️  Warnings
- ✅ Success
- ❌ Error

## 🔧 Customization

### Add New Locations
Update `PathFinding.json` with new rooms/floors

### Modify Weights
Adjust edge weights in `_add_floor_connections()` and `_add_stair_connections()`

### Add Elevators
Implement `_add_elevator_connections()` with elevator node data

### Custom Search Indexes
Extend `_build_indexes()` for additional search categories

## 📝 Notes

- **No Elevator Data**: Currently uses stairs only (add elevator nodes to JSON for full accessibility)
- **Static Graph**: Graph built at initialization (rebuild for dynamic changes)
- **Bidirectional Edges**: All connections work both ways
- **Time Estimates**: Based on average walking speed (adjustable)

## 🚀 Future Enhancements

- Real-time room occupancy
- Multiple route options
- Outdoor navigation
- Building-to-building routing
- Mobile app integration
- Voice-guided navigation
- AR wayfinding
