import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Profile extends Model {
    static table = 'profiles';

    @field('user_id') userId!: string;
    @field('username') username?: string;
    @field('oro') oro!: number;
    @field('xp_intelecto') xpIntelecto!: number;
    @field('xp_vigor') xpVigor!: number;
    @field('xp_hechiceria') xpHechiceria!: number;
    @field('xp_carisma') xpCarisma!: number;
    @field('xp_destreza') xpDestreza!: number;
    @field('avatar_url') avatarUrl?: string;
    @field('shame_count') shameCount!: number;
    @field('total_study_minutes') totalStudyMinutes!: number;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}
