// Game Types
export const GAMES = {
    FREE_FIRE: 'Free Fire',
    PUBG_MOBILE: 'PUBG Mobile',
    COD_MOBILE: 'COD Mobile',
    VALORANT: 'Valorant',
    CSGO: 'CS:GO',
    DOTA2: 'Dota 2',
    LOL: 'League of Legends',
    FORTNITE: 'Fortnite',
    APEX_LEGENDS: 'Apex Legends',
    ROCKET_LEAGUE: 'Rocket League',
};

// Tournament Formats
export const TOURNAMENT_FORMATS = {
    LEAGUE: 'League',
    KNOCKOUT: 'Knockout',
    DOUBLE_ELIMINATION: 'Double Elimination',
    SWISS: 'Swiss',
    ROUND_ROBIN: 'Round Robin',
    BATTLE_ROYALE: 'Battle Royale',
};

// Tournament Status
export const TOURNAMENT_STATUS = {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

// Match Status
export const MATCH_STATUS = {
    SCHEDULED: 'scheduled',
    LIVE: 'live',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    POSTPONED: 'postponed',
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    TEAM_MANAGER: 'team_manager',
    PLAYER: 'player',
    VIEWER: 'viewer',
};

// Team Status
export const TEAM_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISBANDED: 'disbanded',
};

// Points System
export const POINTS_SYSTEMS = {
    KILL_BASED: 'kill_based',
    PLACEMENT_BASED: 'placement_based',
    HYBRID: 'hybrid',
    WIN_LOSS: 'win_loss',
};

// Date Formats
export const DATE_FORMATS = {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    WITH_TIME: 'MMM dd, yyyy hh:mm a',
    TIME_ONLY: 'hh:mm a',
    ISO: "yyyy-MM-dd'T'HH:mm:ss",
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Socket Events
export const SOCKET_EVENTS = {
    TOURNAMENT_UPDATE: 'tournament:update',
    MATCH_UPDATE: 'match:update',
    MATCH_START: 'match:start',
    MATCH_END: 'match:end',
    LEADERBOARD_UPDATE: 'leaderboard:update',
    TEAM_UPDATE: 'team:update',
    NOTIFICATION: 'notification',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
};

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: '/auth',
    TOURNAMENTS: '/tournaments',
    TEAMS: '/teams',
    MATCHES: '/matches',
    LEADERBOARD: '/leaderboard',
    ORGANIZATIONS: '/organizations',
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful!',
    SIGNUP: 'Account created successfully!',
    LOGOUT: 'Logged out successfully',
    CREATE: 'Created successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
};

// Colors for Status
export const STATUS_COLORS = {
    upcoming: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
    ongoing: 'text-green-400 bg-green-500/20 border-green-500/50',
    completed: 'text-gray-400 bg-gray-500/20 border-gray-500/50',
    cancelled: 'text-red-400 bg-red-500/20 border-red-500/50',
    live: 'text-green-400 bg-green-500/20 border-green-500/50 animate-pulse',
    scheduled: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    postponed: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
};

export default {
    GAMES,
    TOURNAMENT_FORMATS,
    TOURNAMENT_STATUS,
    MATCH_STATUS,
    USER_ROLES,
    TEAM_STATUS,
    POINTS_SYSTEMS,
    DATE_FORMATS,
    PAGINATION,
    SOCKET_EVENTS,
    STORAGE_KEYS,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STATUS_COLORS,
};