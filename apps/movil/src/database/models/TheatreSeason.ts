import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type TheatreSeries from './TheatreSeries';

export default class TheatreSeason extends Model {
    static table = 'theatre_seasons';

    static associations = {
        theatre_series: { type: 'belongs_to' as const, key: 'series_id' },
    };

    @field('series_id') seriesId!: string;
    @field('season_number') seasonNumber!: number;
    @field('episodes_count') episodesCount?: number;
    @field('comment') comment?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @relation('theatre_series', 'series_id') series!: TheatreSeries;
}
