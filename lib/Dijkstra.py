import json
import heapq
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class DayOfWeek(Enum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6

@dataclass
class Node:
    id: str
    name: str
    floor: str
    floor_level: int
    type: str
    full_name: Optional[str] = None
    description: Optional[str] = None
    
@dataclass
class PathResult:
    path: List[Node]
    distance: int
    directions: List[str]
    floor_changes: int
    uses_stairs: bool
    estimated_time_minutes: float
    accessibility_friendly: bool

class CampusNavigator:
    def __init__(self, json_file_path: str, accessibility_mode: bool = False):
        with open(json_file_path, 'r') as f:
            self.data = json.load(f)
        
        self.graph = {}  
        self.nodes = {}  
        self.location_index = {}  
        self.faculty_index = {}  
        self.department_index = {}  
        self.service_index = {}  
        self.accessibility_mode = accessibility_mode
        self.restricted_rooms = set()  
        
        self._build_graph()
        self._build_indexes()
    
    def _build_graph(self):
        floors = self.data['floors']
        
        
        for floor_key, floor_data in floors.items():
            floor_name = floor_data['name']
            floor_level = floor_data['level']
            
            for location in floor_data['locations']:
                node_id = location['id']
                node = Node(
                    id=node_id,
                    name=location['name'],
                    floor=floor_name,
                    floor_level=floor_level,
                    type=location['type'],
                    full_name=location.get('fullName'),
                    description=location.get('description')
                )
                self.nodes[node_id] = node
                self.graph[node_id] = []
        
        
        self._add_floor_connections()
        
        
        if not self.accessibility_mode:
            self._add_stair_connections()
        
        
        if self.accessibility_mode:
            self._add_elevator_connections()
    
    def _add_floor_connections(self):
        
        ground_locations = ['sps-org-chart', 'student-welfare', 'student-development', 
                           'institutional-programs', 'mis']
        self._connect_sequential(ground_locations, weight=1)
        
        
        first_floor = ['comlab1', 'stairs-1f', 'registrar', 'accounting', 'cashier', 'avr']
        self._connect_sequential(first_floor, weight=1)
        
        
        second_floor = ['comlab2', 'stairs-2f', 'physical-therapy', 'library', 'comfort-room-2f']
        self._connect_sequential(second_floor, weight=1)
        
        
        third_floor = ['deans-office', 'faculty-office', 'stairs-3f', 'mb301', 'mb302', 'mb303', 'comfort-room-3f']
        self._connect_sequential(third_floor, weight=1)
    
    def _connect_sequential(self, locations: List[str], weight: int = 1):
        for i in range(len(locations) - 1):
            if locations[i] in self.graph and locations[i + 1] in self.graph:
                self.graph[locations[i]].append((locations[i + 1], weight))
                self.graph[locations[i + 1]].append((locations[i], weight))
    
    def _add_stair_connections(self):
        
        stair_connections = [
            ('stairs-1f', 'mis', 2),  
            ('stairs-1f', 'stairs-2f', 3),  
            ('stairs-2f', 'stairs-3f', 3),  
        ]
        
        for stair1, stair2, weight in stair_connections:
            if stair1 in self.graph and stair2 in self.graph:
                self.graph[stair1].append((stair2, weight))
                self.graph[stair2].append((stair1, weight))
    
    def _add_elevator_connections(self):
        
        
        
        pass
    
    def _build_indexes(self):
        
        for node_id, node in self.nodes.items():
            name_lower = node.name.lower()
            self.location_index[name_lower] = node_id
            
            
            if node.full_name:
                full_name_lower = node.full_name.lower()
                self.location_index[full_name_lower] = node_id
        
        
        for faculty in self.data.get('faculty', []):
            name_lower = faculty['name'].lower()
            self.faculty_index[name_lower] = faculty
        
        
        for floor_key, floor_data in self.data['floors'].items():
            for location in floor_data['locations']:
                
                if location['type'] == 'department':
                    dept_name = location['name'].lower()
                    self.department_index[dept_name] = location['id']
                    
                    
                    if 'services' in location:
                        for service in location['services']:
                            service_name = service['name'].lower()
                            self.service_index[service_name] = {
                                'department_id': location['id'],
                                'service': service
                            }
    
    def dijkstra(self, start_id: str, end_id: str) -> Optional[PathResult]:
        if start_id not in self.graph or end_id not in self.graph:
            return None
        
        
        if end_id in self.restricted_rooms:
            print(f"Warning: {self.nodes[end_id].name} is currently restricted or busy.")
        
        
        pq = [(0, start_id, [start_id])]
        visited = set()
        distances = {node_id: float('inf') for node_id in self.graph}
        distances[start_id] = 0
        
        while pq:
            current_dist, current_node, path = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            
            if current_node == end_id:
                nodes = [self.nodes[node_id] for node_id in path]
                directions = self._generate_directions(nodes)
                floor_changes = self._count_floor_changes(nodes)
                uses_stairs = self._uses_stairs(nodes)
                estimated_time = self._estimate_time(current_dist, floor_changes)
                accessibility_friendly = not uses_stairs or self.accessibility_mode
                
                return PathResult(
                    path=nodes,
                    distance=current_dist,
                    directions=directions,
                    floor_changes=floor_changes,
                    uses_stairs=uses_stairs,
                    estimated_time_minutes=estimated_time,
                    accessibility_friendly=accessibility_friendly
                )
            
            
            for neighbor, weight in self.graph[current_node]:
                if neighbor not in visited:
                    
                    if neighbor in self.restricted_rooms and neighbor != end_id:
                        continue
                    
                    new_dist = current_dist + weight
                    if new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        heapq.heappush(pq, (new_dist, neighbor, path + [neighbor]))
        
        return None
    
    def _count_floor_changes(self, nodes: List[Node]) -> int:
        changes = 0
        for i in range(1, len(nodes)):
            if nodes[i].floor_level != nodes[i-1].floor_level:
                changes += 1
        return changes
    
    def _uses_stairs(self, nodes: List[Node]) -> bool:
        return any(node.type == 'navigation' and 'stairs' in node.id.lower() for node in nodes)
    
    def _estimate_time(self, distance: int, floor_changes: int) -> float:
        
        
        base_time = distance * 0.5
        floor_time = floor_changes * 1.0
        return round(base_time + floor_time, 1)
    
    def _generate_directions(self, nodes: List[Node]) -> List[str]:
        if len(nodes) <= 1:
            return ["You are already at your destination."]
        
        directions = []
        current_floor = nodes[0].floor_level
        
        
        start_desc = nodes[0].full_name or nodes[0].name
        directions.append(f"📍 Start at {start_desc} ({nodes[0].floor})")
        
        for i in range(1, len(nodes)):
            prev_node = nodes[i - 1]
            curr_node = nodes[i]
            
            
            if curr_node.floor_level != current_floor:
                floor_diff = curr_node.floor_level - current_floor
                direction = "up" if floor_diff > 0 else "down"
                
                if curr_node.type == 'navigation':
                    if self.accessibility_mode:
                        directions.append(f"🛗 Take the elevator {direction} to {curr_node.floor}")
                    else:
                        directions.append(f"🪜 Take the stairs {direction} to {curr_node.floor}")
                current_floor = curr_node.floor_level
            else:
                
                if curr_node.type == 'navigation':
                    directions.append(f"➡️  Head to the stairs")
                elif i == len(nodes) - 1:
                    
                    curr_desc = curr_node.full_name or curr_node.name
                    directions.append(f"➡️  Walk to {curr_desc}")
                else:
                    directions.append(f"➡️  Pass by {curr_node.name}")
        
        
        dest_desc = nodes[-1].full_name or nodes[-1].name
        directions.append(f"🎯 Arrive at {dest_desc} ({nodes[-1].floor})")
        
        if nodes[-1].description:
            directions.append(f"   ℹ️  {nodes[-1].description}")
        
        return directions
    
    def find_location(self, query: str) -> Optional[str]:
        query_lower = query.lower()
        
        
        if query_lower in self.location_index:
            return self.location_index[query_lower]
        
        
        if query_lower in self.department_index:
            return self.department_index[query_lower]
        
        
        if query_lower in self.service_index:
            return self.service_index[query_lower]['department_id']
        
        
        for name, node_id in self.location_index.items():
            if query_lower in name or name in query_lower:
                return node_id
        
        
        for dept_name, dept_id in self.department_index.items():
            if query_lower in dept_name:
                return dept_id
        
        
        for service_name, service_data in self.service_index.items():
            if query_lower in service_name:
                return service_data['department_id']
        
        return None
    
    def find_faculty(self, query: str) -> Optional[Dict]:
        query_lower = query.lower()
        
        
        if query_lower in self.faculty_index:
            return self.faculty_index[query_lower]
        
        
        for name, faculty_data in self.faculty_index.items():
            if query_lower in name:
                return faculty_data
        
        return None
    
    def get_faculty_locations(self, faculty_name: str, current_day: Optional[DayOfWeek] = None) -> List[Tuple[str, str, str]]:
        faculty = self.find_faculty(faculty_name)
        if not faculty:
            return []
        
        locations = []
        availability = faculty.get('availability', 'Regular weekdays')
        schedule = faculty.get('schedule', 'Regular weekdays')
        
        
        is_available = self._check_faculty_availability(faculty, current_day)
        
        
        if 'primaryLocation' in faculty:
            loc = faculty['primaryLocation']
            floor_key = loc['floor']
            room_id = loc['room']
            locations.append((room_id, self.data['floors'][floor_key]['name'], schedule))
        
        
        if 'locations' in faculty:
            for loc in faculty['locations']:
                floor_key = loc['floor']
                room_id = loc['room']
                locations.append((room_id, self.data['floors'][floor_key]['name'], schedule))
        
        return locations
    
    def _check_faculty_availability(self, faculty: Dict, current_day: Optional[DayOfWeek]) -> bool:
        if not current_day:
            return True
        
        availability = faculty.get('availability', '').lower()
        
        if 'saturday' in availability and current_day == DayOfWeek.SATURDAY:
            return True
        elif 'saturday only' in availability and current_day != DayOfWeek.SATURDAY:
            return False
        elif current_day in [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                             DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]:
            return 'saturday only' not in availability
        
        return True
    
    def mark_room_restricted(self, room_name: str, restricted: bool = True):
        room_id = self.find_location(room_name)
        if room_id:
            if restricted:
                self.restricted_rooms.add(room_id)
            else:
                self.restricted_rooms.discard(room_id)
    
    def search_all(self, query: str) -> Dict[str, List]:
        query_lower = query.lower()
        results = {
            'locations': [],
            'faculty': [],
            'departments': [],
            'services': []
        }
        
        
        for name, node_id in self.location_index.items():
            if query_lower in name:
                node = self.nodes[node_id]
                results['locations'].append({
                    'name': node.name,
                    'full_name': node.full_name,
                    'floor': node.floor,
                    'type': node.type,
                    'description': node.description
                })
        
        
        for name, faculty_data in self.faculty_index.items():
            if query_lower in name:
                results['faculty'].append(faculty_data)
        
        
        for dept_name, dept_id in self.department_index.items():
            if query_lower in dept_name:
                node = self.nodes[dept_id]
                results['departments'].append({
                    'name': node.name,
                    'floor': node.floor
                })
        
        
        for service_name, service_data in self.service_index.items():
            if query_lower in service_name:
                results['services'].append(service_data['service'])
        
        return results
    
    def navigate(self, start: str, destination: str) -> Optional[PathResult]:
        start_id = self.find_location(start)
        dest_id = self.find_location(destination)
        
        if not start_id:
            print(f"Could not find starting location: {start}")
            return None
        
        if not dest_id:
            print(f"Could not find destination: {destination}")
            return None
        
        return self.dijkstra(start_id, dest_id)
    
    def navigate_to_faculty(self, start: str, faculty_name: str, current_day: Optional[DayOfWeek] = None) -> Optional[PathResult]:
        start_id = self.find_location(start)
        if not start_id:
            print(f"Could not find starting location: {start}")
            return None
        
        faculty = self.find_faculty(faculty_name)
        if not faculty:
            print(f"Could not find faculty: {faculty_name}")
            return None
        
        
        is_available = self._check_faculty_availability(faculty, current_day)
        if not is_available:
            print(f"⚠️  {faculty['name']} is typically not available on this day.")
            print(f"   Schedule: {faculty.get('schedule', 'N/A')}")
        
        locations = self.get_faculty_locations(faculty_name, current_day)
        if not locations:
            print(f"Could not find location for faculty: {faculty_name}")
            return None
        
        
        best_result = None
        best_distance = float('inf')
        
        for room_id, floor_name, schedule in locations:
            result = self.dijkstra(start_id, room_id)
            if result and result.distance < best_distance:
                best_distance = result.distance
                best_result = result
        
        if best_result and faculty.get('role'):
            print(f"ℹ️  {faculty['name']} - {faculty['role']}")
        
        return best_result
    
    def print_path(self, result: PathResult):
        if not result:
            print("❌ No path found!")
            return
        
        print(f"\n{'='*70}")
        print(f"✅ ROUTE FOUND")
        print(f"{'='*70}")
        print(f"📏 Distance: {result.distance} units")
        print(f"⏱️  Estimated Time: {result.estimated_time_minutes} minutes")
        print(f"🏢 Floor Changes: {result.floor_changes}")
        print(f"♿ Accessibility: {'✅ Yes' if result.accessibility_friendly else '⚠️  Uses stairs'}")
        print(f"{'='*70}\n")
        
        print("📍 PATH OVERVIEW:")
        for i, node in enumerate(result.path, 1):
            icon = "🏁" if i == len(result.path) else "📌" if i == 1 else "  "
            floor_indicator = f"[{node.floor}]"
            print(f"  {icon} {i}. {node.name:30} {floor_indicator}")
        
        print(f"\n{'='*70}")
        print("🗺️  STEP-BY-STEP DIRECTIONS:")
        print(f"{'='*70}\n")
        
        for i, direction in enumerate(result.directions, 1):
            print(f"  {direction}")
        
        print(f"\n{'='*70}\n")



if __name__ == "__main__":
    print("🎓 CAMPUS NAVIGATION SYSTEM")
    print("=" * 70)
    
    
    print("\n📍 Example 1: Navigate from MIS to Library")
    print("-" * 70)
    navigator = CampusNavigator('lib/PathFinding.json')
    result = navigator.navigate("MIS", "Library")
    if result:
        navigator.print_path(result)
    
    
    print("\n👨‍🏫 Example 2: Find Ma'am Jennifer Magbanlac from Comlab1 (Weekday)")
    print("-" * 70)
    result = navigator.navigate_to_faculty("Comlab1", "Jennifer Magbanlac", DayOfWeek.MONDAY)
    if result:
        navigator.print_path(result)
    
    
    print("\n🏢 Example 3: Navigate to Scholarship Services from Comlab2")
    print("-" * 70)
    result = navigator.navigate("Comlab2", "Scholarship and Financial Assistance")
    if result:
        navigator.print_path(result)
    
    
    print("\n♿ Example 4: Accessible Route from Ground Floor to Third Floor")
    print("-" * 70)
    print("Note: Accessibility mode enabled (elevator preference)")
    accessible_navigator = CampusNavigator('lib/PathFinding.json', accessibility_mode=True)
    result = accessible_navigator.navigate("MIS", "Dean's Office")
    if result:
        accessible_navigator.print_path(result)
    else:
        print("⚠️  No accessible route available. Building may need elevator access.")
    
    
    print("\n🚫 Example 5: Navigate with Room Restrictions")
    print("-" * 70)
    navigator.mark_room_restricted("Comlab1", restricted=True)
    print("Comlab1 marked as busy/restricted")
    result = navigator.navigate("Registrar", "Comlab1")
    if result:
        navigator.print_path(result)
    
    
    print("\n🔍 Example 6: Search for 'guidance'")
    print("-" * 70)
    search_results = navigator.search_all("guidance")
    
    if search_results['services']:
        print("\n📋 Services found:")
        for service in search_results['services']:
            print(f"  • {service['name']}: {service['description']}")
    
    if search_results['locations']:
        print("\n📍 Locations found:")
        for loc in search_results['locations']:
            print(f"  • {loc['name']} ({loc['floor']})")
    
    
    print("\n📅 Example 7: Find Sir Mark Valencia on Saturday")
    print("-" * 70)
    result = navigator.navigate_to_faculty("Library", "Mark Valencia", DayOfWeek.SATURDAY)
    if result:
        navigator.print_path(result)
    
    
    print("\n⚡ Example 8: Quick Access - Where to print?")
    print("-" * 70)
    quick_access = navigator.data.get('quickAccess', {})
    if 'printing' in quick_access:
        printing_info = quick_access['printing']
        print(f"🖨️  Printing available at: {printing_info['location']} ({printing_info['floor']})")
        result = navigator.navigate("Comlab2", printing_info['location'])
        if result:
            navigator.print_path(result)
    
    print("\n" + "=" * 70)
    print("✅ Navigation System Demo Complete!")
    print("=" * 70)
