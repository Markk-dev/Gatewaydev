import { navigator, PathResult, SearchResults } from './pathfinding'

export interface NavigationResponse {
  type: 'route' | 'search' | 'info' | 'error'
  message: string
  pathResult?: PathResult
  searchResults?: SearchResults
}

export function handleNavigationQuery(query: string): NavigationResponse {
  const queryLower = query.toLowerCase()

  // Route finding patterns
  const routePatterns = [
    /(?:how (?:do i|can i) (?:get|go) (?:to|from))|(?:navigate (?:to|from))|(?:directions? (?:to|from))|(?:route (?:to|from))|(?:way to)/i,
    /(?:where is|find|locate)/i,
    /(?:from .+ to .+)/i
  ]

  // Faculty finding patterns
  const facultyPatterns = [
    /(?:where (?:is|can i find)) (?:ma'am|sir|prof|professor|teacher|faculty)/i,
    /(?:find|locate) (?:ma'am|sir|prof|professor)/i
  ]

  // Check for route finding
  if (routePatterns.some(pattern => pattern.test(queryLower))) {
    return handleRouteQuery(query)
  }

  // Check for faculty finding
  if (facultyPatterns.some(pattern => pattern.test(queryLower))) {
    return handleFacultyQuery(query)
  }

  // General search
  return handleSearchQuery(query)
}

function handleRouteQuery(query: string): NavigationResponse {
  // Extract locations from query
  const fromMatch = query.match(/from\s+([a-z0-9\s]+?)(?:\s+to|\s*$)/i)
  const toMatch = query.match(/to\s+([a-z0-9\s]+?)(?:\s+from|\s*$)/i)
  
  // Alternative patterns
  const whereMatch = query.match(/(?:where is|find|locate)\s+([a-z0-9\s]+?)(?:\?|$)/i)
  const getToMatch = query.match(/(?:get to|go to|navigate to|directions? to)\s+([a-z0-9\s]+?)(?:\?|$)/i)

  let start: string | null = null
  let destination: string | null = null

  if (fromMatch && toMatch) {
    start = fromMatch[1].trim()
    destination = toMatch[1].trim()
  } else if (getToMatch || whereMatch) {
    destination = (getToMatch || whereMatch)![1].trim()
    // Default starting point
    start = 'MIS' // You can make this dynamic based on user's current location
  }

  if (!destination) {
    return {
      type: 'error',
      message: "I couldn't understand the destination. Please specify where you want to go. For example: 'How do I get to the Library?' or 'Navigate from MIS to Registrar'"
    }
  }

  const result = navigator.navigate(start || 'MIS', destination)

  if (!result) {
    return {
      type: 'error',
      message: `I couldn't find a route to "${destination}". Please check the location name and try again. You can search for available locations by asking "What locations are available?"`
    }
  }

  const message = formatPathResult(result, start, destination)

  return {
    type: 'route',
    message,
    pathResult: result
  }
}

function handleFacultyQuery(query: string): NavigationResponse {
  // Extract faculty name
  const facultyMatch = query.match(/(?:ma'am|sir|prof(?:essor)?)\s+([a-z\s]+?)(?:\?|$|from|at)/i)
  
  if (!facultyMatch) {
    return {
      type: 'error',
      message: "Please specify the faculty member's name. For example: 'Where is Ma'am Jennifer Magbanlac?'"
    }
  }

  const facultyName = facultyMatch[1].trim()
  const result = navigator.navigateToFaculty('MIS', facultyName)

  if (!result) {
    return {
      type: 'error',
      message: `I couldn't find "${facultyName}". Please check the name and try again.`
    }
  }

  const faculty = navigator.findFaculty(facultyName)
  let message = `**${faculty.name}**\n`
  
  if (faculty.role) {
    message += `*${faculty.role}*\n\n`
  }

  if (faculty.schedule) {
    message += `📅 **Schedule:** ${faculty.schedule}\n\n`
  }

  message += formatPathResult(result, 'MIS', faculty.name)

  return {
    type: 'route',
    message,
    pathResult: result
  }
}

function handleSearchQuery(query: string): NavigationResponse {
  const results = navigator.searchAll(query)

  if (results.locations.length === 0 && results.faculty.length === 0 && 
      results.departments.length === 0 && results.services.length === 0) {
    return {
      type: 'error',
      message: `No results found for "${query}". Try searching for rooms, departments, services, or faculty members.`
    }
  }

  let message = `**Search Results for "${query}":**\n\n`

  if (results.locations.length > 0) {
    message += `📍 **Locations:**\n`
    for (const loc of results.locations.slice(0, 5)) {
      message += `• **${loc.name}** (${loc.floor})`
      if (loc.description) {
        message += ` - ${loc.description}`
      }
      message += `\n`
    }
    message += `\n`
  }

  if (results.faculty.length > 0) {
    message += `👨‍🏫 **Faculty:**\n`
    for (const faculty of results.faculty.slice(0, 5)) {
      message += `• **${faculty.name}**`
      if (faculty.role) {
        message += ` - ${faculty.role}`
      }
      message += `\n`
    }
    message += `\n`
  }

  if (results.services.length > 0) {
    message += `🔧 **Services:**\n`
    for (const service of results.services.slice(0, 5)) {
      message += `• **${service.name}** - ${service.description}\n`
    }
    message += `\n`
  }

  message += `\nWould you like directions to any of these locations?`

  return {
    type: 'search',
    message,
    searchResults: results
  }
}

function formatPathResult(result: PathResult, start: string | null, destination: string): string {
  let message = `## 🗺️ Route Found\n\n`
  
  message += `📏 **Distance:** ${result.distance} units\n`
  message += `⏱️ **Estimated Time:** ${result.estimatedTimeMinutes} minutes\n`
  message += `🏢 **Floor Changes:** ${result.floorChanges}\n`
  message += `♿ **Accessibility:** ${result.accessibilityFriendly ? '✅ Accessible' : '⚠️ Uses stairs'}\n\n`

  message += `### 📍 Step-by-Step Directions:\n\n`
  
  for (let i = 0; i < result.directions.length; i++) {
    message += `${i + 1}. ${result.directions[i]}\n`
  }

  return message
}

// Helper to check if query is navigation-related
export function isNavigationQuery(query: string): boolean {
  const navigationKeywords = [
    'where', 'how', 'get to', 'go to', 'navigate', 'direction', 'route', 'way to',
    'find', 'locate', 'location', 'room', 'floor', 'building',
    'ma\'am', 'sir', 'professor', 'faculty', 'teacher'
  ]

  const queryLower = query.toLowerCase()
  return navigationKeywords.some(keyword => queryLower.includes(keyword))
}
