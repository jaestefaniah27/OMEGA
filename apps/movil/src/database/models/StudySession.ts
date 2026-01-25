import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type Subject from './Subject';
import type Book from './Book';
import type TheatreActivity from './TheatreActivity';

export default class StudySession extends Model {
    static table = 'study_sessions';

    static associations = {
        subjects: { type: 'belongs_to' as const, key: 'subject_id' },
        books: { type: 'belongs_to' as const, key: 'book_id' },
        theatre_activities: { type: 'belongs_to' as const, key: 'activity_id' },
    };

    @field('user_id') userId!: string;
    @field('subject_id') subjectId?: string;
    @field('book_id') bookId?: string;
    @field('activity_id') activityId?: string;
    @date('start_time') startTime!: Date;
    @date('end_time') endTime?: Date;
    @field('duration_minutes') durationMinutes!: number;
    @field('mode') mode?: string;
    @field('notes') notes?: string;
    @field('status') status!: string;
    @field('difficulty') difficulty!: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @relation('subjects', 'subject_id') subject?: Subject;
    @relation('books', 'book_id') book?: Book;
    @relation('theatre_activities', 'activity_id') activity?: TheatreActivity;
}
