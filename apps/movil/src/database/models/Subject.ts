import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import type StudySession from './StudySession';

export default class Subject extends Model {
    static table = 'subjects';

    static associations = {
        study_sessions: { type: 'has_many' as const, foreignKey: 'subject_id' },
    };

    @field('user_id') userId!: string;
    @field('name') name!: string;
    @field('color') color!: string;
    @field('course') course?: string;
    @field('is_completed') isCompleted!: boolean;
    @field('total_minutes_studied') totalMinutesStudied!: number;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @children('study_sessions') studySessions!: StudySession[];
}
