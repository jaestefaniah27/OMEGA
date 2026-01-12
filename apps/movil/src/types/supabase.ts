export interface Profile {
    id: string;
    username: string | null;
    class: string;
    level: number;
    current_xp: number;
    max_xp: number;
    hp_current: number;
    gold: number;
    current_status: string;
    avatar_url: string | null;
    updated_at: string;
}
