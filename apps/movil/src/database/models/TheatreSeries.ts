import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import type TheatreSeason from './TheatreSeason';

export default class TheatreSeries extends Model {
    static table = 'theatre_series';

    static associations = {
        theatre_seasons: { type: 'has_many' as const, foreignKey: 'series_id' },
    };

    @field('user_id') userId!: string;
    @field('title') title!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @children('theatre_seasons') seasons!: TheatreSeason[];
}
