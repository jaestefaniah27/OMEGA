// OMEGA — Design tokens. Tema oscuro minimalista, naming plano.
// Base neutra + un acento por dominio para identificar de un vistazo.

export const colors = {
    // Superficies
    bg: '#0B0B0F',
    surface: '#15151B',
    surfaceAlt: '#1C1C24',
    surfaceHigh: '#23232D',
    border: '#2A2A33',
    borderStrong: '#3A3A46',

    // Texto
    text: '#F4F4F6',
    textMuted: '#9A9AA5',
    textFaint: '#6A6A75',
    onAccent: '#0B0B0F',

    // Acento neutro (acciones primarias)
    accent: '#6E8BFF',
    accentSoft: 'rgba(110,139,255,0.14)',

    // Acentos por dominio
    study: '#5B8DEF',
    gym: '#E5564B',
    projects: '#9B6BF2',
    health: '#3FB984',
    leisure: '#E0A23C',

    // Estado
    success: '#3FB984',
    danger: '#E5564B',
    warning: '#E0A23C',
    info: '#5B8DEF',

    // Utilidades
    overlay: 'rgba(0,0,0,0.6)',
    transparent: 'transparent',
} as const;

export const space = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
} as const;

export const font = {
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 28,
        xxl: 36,
    },
    weight: {
        regular: '400' as const,
        medium: '600' as const,
        bold: '700' as const,
    },
    // Monospace para timers / números grandes
    mono: undefined as undefined | string, // se resuelve por plataforma en TimerDisplay
} as const;

// Color por dominio (para mapear pantalla -> acento)
export type Domain = 'study' | 'gym' | 'projects' | 'health' | 'leisure' | 'neutral';
export const domainColor = (d: Domain): string => {
    switch (d) {
        case 'study': return colors.study;
        case 'gym': return colors.gym;
        case 'projects': return colors.projects;
        case 'health': return colors.health;
        case 'leisure': return colors.leisure;
        default: return colors.accent;
    }
};

export const theme = { colors, space, radius, font };
export default theme;
