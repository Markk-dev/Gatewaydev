import pathfindingData from './PathFinding.json'

export interface Node {
    id: string
    name: string
    floor: string
    floorLevel: number
    type: string
    fullName?: string
    description?: string
}

export interface PathResult {
    path: Node[]
    distance: number
    directions: string[]
    floorChanges: number
    usesStairs: boolean
    estimatedTimeMinutes: number
    accessibilityFriendly: boolean
}

export interface SearchResults {
    locations: Array<{
        name: string
        fullName?: string
        floor: string
        type: string
        description?: string
    }>
    faculty: any[]
    departments: Array<{
        name: string
        floor: string
    }>
    services: any[]
}

class CampusNavigator {
    private graph: Map<string, Array<[string, number]>> = new Map()
    private nodes: Map<string, Node> = new Map()
    private locationIndex: Map<string, string> = new Map()
    private facultyIndex: Map<string, any> = new Map()
    private departmentIndex: Map<string, string> = new Map()
    private serviceIndex: Map<string, any> = new Map()
    private restrictedRooms: Set<string> = new Set()
    private accessibilityMode: boolean

    constructor(accessibilityMode: boolean = false) {
        this.accessibilityMode = accessibilityMode
        this.buildGraph()
        this.buildIndexes()
    }

    private buildGraph() {
        const floors = pathfindingData.floors

        // Create nodes for all locations
        for (const [floorKey, floorData] of Object.entries(floors)) {
            for (const location of floorData.locations) {
                const node: Node = {
                    id: location.id,
                    name: location.name,
                    floor: floorData.name,
                    floorLevel: floorData.level,
                    type: location.type,
                    fullName: 'fullName' in location ? location.fullName : undefined,
                    description: 'description' in location ? location.description : undefined
                }
                this.nodes.set(location.id, node)
                this.graph.set(location.id, [])
            }
        }

        // Add floor connections
        this.addFloorConnections()

        // Add stair connections
        if (!this.accessibilityMode) {
            this.addStairConnections()
        }
    }

    private addFloorConnections() {
        // Ground Floor
        const ground = ['sps-org-chart', 'student-welfare', 'student-development', 'institutional-programs', 'mis']
        this.connectSequential(ground, 1)

        // First Floor
        const first = ['comlab1', 'stairs-1f', 'registrar', 'accounting', 'cashier', 'avr']
        this.connectSequential(first, 1)

        // Second Floor
        const second = ['comlab2', 'stairs-2f', 'physical-therapy', 'library', 'comfort-room-2f']
        this.connectSequential(second, 1)

        // Third Floor
        const third = ['deans-office', 'faculty-office', 'stairs-3f', 'mb301', 'mb302', 'mb303', 'comfort-room-3f']
        this.connectSequential(third, 1)
    }

    private connectSequential(locations: string[], weight: number) {
        for (let i = 0; i < locations.length - 1; i++) {
            const loc1 = locations[i]
            const loc2 = locations[i + 1]
            if (this.graph.has(loc1) && this.graph.has(loc2)) {
                this.graph.get(loc1)!.push([loc2, weight])
                this.graph.get(loc2)!.push([loc1, weight])
            }
        }
    }

    private addStairConnections() {
        const stairConnections: Array<[string, string, number]> = [
            ['stairs-1f', 'mis', 2],
            ['stairs-1f', 'stairs-2f', 3],
            ['stairs-2f', 'stairs-3f', 3]
        ]

        for (const [stair1, stair2, weight] of stairConnections) {
            if (this.graph.has(stair1) && this.graph.has(stair2)) {
                this.graph.get(stair1)!.push([stair2, weight])
                this.graph.get(stair2)!.push([stair1, weight])
            }
        }
    }

    private buildIndexes() {
        // Index locations
        for (const [nodeId, node] of this.nodes) {
            this.locationIndex.set(node.name.toLowerCase(), nodeId)
            if (node.fullName) {
                this.locationIndex.set(node.fullName.toLowerCase(), nodeId)
            }
        }

        // Index faculty
        for (const faculty of pathfindingData.faculty) {
            this.facultyIndex.set(faculty.name.toLowerCase(), faculty)
        }

        // Index departments and services
        for (const floorData of Object.values(pathfindingData.floors)) {
            for (const location of floorData.locations) {
                if (location.type === 'department') {
                    this.departmentIndex.set(location.name.toLowerCase(), location.id)

                    if ('services' in location && Array.isArray(location.services)) {
                        for (const service of location.services) {
                            if (typeof service === 'object' && service !== null && 'name' in service) {
                                this.serviceIndex.set(service.name.toLowerCase(), {
                                    departmentId: location.id,
                                    service
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    findLocation(query: string): string | null {
        const queryLower = query.toLowerCase()

        // Exact match
        if (this.locationIndex.has(queryLower)) {
            return this.locationIndex.get(queryLower)!
        }

        // Check departments
        if (this.departmentIndex.has(queryLower)) {
            return this.departmentIndex.get(queryLower)!
        }

        // Check services
        if (this.serviceIndex.has(queryLower)) {
            return this.serviceIndex.get(queryLower)!.departmentId
        }

        // Partial match
        for (const [name, nodeId] of this.locationIndex) {
            if (name.includes(queryLower) || queryLower.includes(name)) {
                return nodeId
            }
        }

        return null
    }

    findFaculty(query: string): any | null {
        const queryLower = query.toLowerCase()

        if (this.facultyIndex.has(queryLower)) {
            return this.facultyIndex.get(queryLower)!
        }

        for (const [name, faculty] of this.facultyIndex) {
            if (name.includes(queryLower)) {
                return faculty
            }
        }

        return null
    }

    dijkstra(startId: string, endId: string): PathResult | null {
        if (!this.graph.has(startId) || !this.graph.has(endId)) {
            return null
        }

        const distances = new Map<string, number>()
        const previous = new Map<string, string>()
        const pq: Array<[number, string]> = [[0, startId]]
        const visited = new Set<string>()

        for (const nodeId of this.graph.keys()) {
            distances.set(nodeId, Infinity)
        }
        distances.set(startId, 0)

        while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0])
            const [currentDist, currentNode] = pq.shift()!

            if (visited.has(currentNode)) continue
            visited.add(currentNode)

            if (currentNode === endId) {
                // Reconstruct path
                const path: string[] = []
                let current = endId
                while (current) {
                    path.unshift(current)
                    current = previous.get(current)!
                }

                const nodes = path.map(id => this.nodes.get(id)!)
                const directions = this.generateDirections(nodes)
                const floorChanges = this.countFloorChanges(nodes)
                const usesStairs = this.usesStairs(nodes)
                const estimatedTime = this.estimateTime(currentDist, floorChanges)

                return {
                    path: nodes,
                    distance: currentDist,
                    directions,
                    floorChanges,
                    usesStairs,
                    estimatedTimeMinutes: estimatedTime,
                    accessibilityFriendly: !usesStairs || this.accessibilityMode
                }
            }

            const neighbors = this.graph.get(currentNode) || []
            for (const [neighbor, weight] of neighbors) {
                if (visited.has(neighbor)) continue
                if (this.restrictedRooms.has(neighbor) && neighbor !== endId) continue

                const newDist = currentDist + weight
                if (newDist < distances.get(neighbor)!) {
                    distances.set(neighbor, newDist)
                    previous.set(neighbor, currentNode)
                    pq.push([newDist, neighbor])
                }
            }
        }

        return null
    }

    private generateDirections(nodes: Node[]): string[] {
        if (nodes.length <= 1) return ['You are already at your destination.']

        const directions: string[] = []
        let currentFloor = nodes[0].floorLevel

        const startDesc = nodes[0].fullName || nodes[0].name
        directions.push(`📍 Start at ${startDesc} (${nodes[0].floor})`)

        for (let i = 1; i < nodes.length; i++) {
            const prevNode = nodes[i - 1]
            const currNode = nodes[i]

            if (currNode.floorLevel !== currentFloor) {
                const floorDiff = currNode.floorLevel - currentFloor
                const direction = floorDiff > 0 ? 'up' : 'down'

                if (currNode.type === 'navigation') {
                    if (this.accessibilityMode) {
                        directions.push(`🛗 Take the elevator ${direction} to ${currNode.floor}`)
                    } else {
                        directions.push(`🪜 Take the stairs ${direction} to ${currNode.floor}`)
                    }
                }
                currentFloor = currNode.floorLevel
            } else {
                if (currNode.type === 'navigation') {
                    directions.push(`➡️  Head to the stairs`)
                } else if (i === nodes.length - 1) {
                    const currDesc = currNode.fullName || currNode.name
                    directions.push(`➡️  Walk to ${currDesc}`)
                } else {
                    directions.push(`➡️  Pass by ${currNode.name}`)
                }
            }
        }

        const destDesc = nodes[nodes.length - 1].fullName || nodes[nodes.length - 1].name
        directions.push(`🎯 Arrive at ${destDesc} (${nodes[nodes.length - 1].floor})`)

        if (nodes[nodes.length - 1].description) {
            directions.push(`   ℹ️  ${nodes[nodes.length - 1].description}`)
        }

        return directions
    }

    private countFloorChanges(nodes: Node[]): number {
        let changes = 0
        for (let i = 1; i < nodes.length; i++) {
            if (nodes[i].floorLevel !== nodes[i - 1].floorLevel) {
                changes++
            }
        }
        return changes
    }

    private usesStairs(nodes: Node[]): boolean {
        return nodes.some(node => node.type === 'navigation' && node.id.includes('stairs'))
    }

    private estimateTime(distance: number, floorChanges: number): number {
        const baseTime = distance * 0.5
        const floorTime = floorChanges * 1.0
        return Math.round((baseTime + floorTime) * 10) / 10
    }

    navigate(start: string, destination: string): PathResult | null {
        const startId = this.findLocation(start)
        const destId = this.findLocation(destination)

        if (!startId || !destId) {
            return null
        }

        return this.dijkstra(startId, destId)
    }

    navigateToFaculty(start: string, facultyName: string): PathResult | null {
        const startId = this.findLocation(start)
        if (!startId) return null

        const faculty = this.findFaculty(facultyName)
        if (!faculty) return null

        const locations: string[] = []

        if (faculty.primaryLocation) {
            const roomId = faculty.primaryLocation.room
            locations.push(roomId)
        }

        if (faculty.locations) {
            for (const loc of faculty.locations) {
                locations.push(loc.room)
            }
        }

        let bestResult: PathResult | null = null
        let bestDistance = Infinity

        for (const roomId of locations) {
            const result = this.dijkstra(startId, roomId)
            if (result && result.distance < bestDistance) {
                bestDistance = result.distance
                bestResult = result
            }
        }

        return bestResult
    }

    searchAll(query: string): SearchResults {
        const queryLower = query.toLowerCase()
        const results: SearchResults = {
            locations: [],
            faculty: [],
            departments: [],
            services: []
        }

        // Search locations
        for (const [name, nodeId] of this.locationIndex) {
            if (name.includes(queryLower)) {
                const node = this.nodes.get(nodeId)!
                results.locations.push({
                    name: node.name,
                    fullName: node.fullName,
                    floor: node.floor,
                    type: node.type,
                    description: node.description
                })
            }
        }

        // Search faculty
        for (const [name, faculty] of this.facultyIndex) {
            if (name.includes(queryLower)) {
                results.faculty.push(faculty)
            }
        }

        // Search departments
        for (const [deptName, deptId] of this.departmentIndex) {
            if (deptName.includes(queryLower)) {
                const node = this.nodes.get(deptId)!
                results.departments.push({
                    name: node.name,
                    floor: node.floor
                })
            }
        }

        // Search services
        for (const [serviceName, serviceData] of this.serviceIndex) {
            if (serviceName.includes(queryLower)) {
                results.services.push(serviceData.service)
            }
        }

        return results
    }

    markRoomRestricted(roomName: string, restricted: boolean = true) {
        const roomId = this.findLocation(roomName)
        if (roomId) {
            if (restricted) {
                this.restrictedRooms.add(roomId)
            } else {
                this.restrictedRooms.delete(roomId)
            }
        }
    }
}

// Export singleton instance
export const navigator = new CampusNavigator()

// Export class for custom instances
export { CampusNavigator }
