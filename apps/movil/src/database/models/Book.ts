import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import type StudySession from './StudySession';

export default class Book extends Model {
    static table = 'books';

    static associations = {
        study_sessions: { type: 'has_many' as const, foreignKey: 'book_id' },
    };

    @field('user_id') userId!: string;
    @field('title') title!: string;
    @field('author') author?: string;
    @field('total_pages') totalPages!: number;
    @field('current_page') currentPage!: number;
    @field('cover_color') coverColor!: string;
    @field('is_finished') isFinished!: boolean;
    @date('finished_at') finishedAt?: Date;
    @field('saga') saga?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @children('study_sessions') studySessions!: StudySession[];
}
