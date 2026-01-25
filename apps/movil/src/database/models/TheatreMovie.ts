import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class TheatreMovie extends Model {
    static table = 'theatre_movies';

    @field('user_id') userId!: string;
    @field('title') title!: string;
    @field('director') director?: string;
    @field('saga') saga?: string;
    @field('comment') comment?: string;
    @field('rating') rating?: number;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;
}
