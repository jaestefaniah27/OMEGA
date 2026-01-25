import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import type StudySession from './StudySession';

export default class TheatreActivity extends Model {
    static table = 'theatre_activities';

    static associations = {
        study_sessions: { type: 'has_many' as const, foreignKey: 'activity_id' },
    };

    @field('user_id') userId!: string;
    @field('name') name!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @children('study_sessions') studySessions!: StudySession[];
}
