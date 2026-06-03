// Query keys centralizados por dominio.
// Cada mutación invalida SOLO su dominio (no fetchAll global).
export const qk = {
    library: ['library'] as const,
    theatre: ['theatre'] as const,
    barracks: ['barracks'] as const,
    castle: ['castle'] as const,
    temple: ['temple'] as const,
    tavern: ['tavern'] as const,
    mage: ['mage'] as const,
    heroStats: ['heroStats'] as const,
    habits: ['habits'] as const,
    muscleFatigue: ['muscleFatigue'] as const,
    records: ['records'] as const,
    profile: ['profile'] as const,
};
