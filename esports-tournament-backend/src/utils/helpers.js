/**
 * Generate unique slug from name
 */
export const generateSlug = async (name, Model) => {
    let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check if slug exists
    const existing = await Model.findOne({ where: { slug } });

    if (existing) {
        // Append random string if slug exists
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
    }

    return slug;
};

/**
 * Paginate results
 */
export const paginate = (page = 1, limit = 10) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    return {
        limit: limitNum,
        offset,
        page: pageNum,
    };
};

/**
 * Format pagination response
 */
export const formatPaginationResponse = (data, total, page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return {
        data,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1,
        },
    };
};

/**
 * Calculate points based on placement
 */
export const calculatePlacementPoints = (placement, placementPoints) => {
    return placementPoints[placement] || 0;
};

/**
 * Calculate kill points
 */
export const calculateKillPoints = (kills, killPoints) => {
    if (typeof killPoints === 'object' && killPoints.perKill) {
        return kills * killPoints.perKill;
    }
    return kills * (killPoints || 1);
};

/**
 * Format date to ISO string
 */
export const formatDate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

export default {
    generateSlug,
    paginate,
    formatPaginationResponse,
    calculatePlacementPoints,
    calculateKillPoints,
    formatDate,
    isValidUUID,
};
