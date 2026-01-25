import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';
import type Mision from './Mision';

export default class Grimorio extends Model {
    static table = 'grimorios';

    static associations = {
        misiones: { type: 'has_many' as const, foreignKey: 'grimorio_id' },
    };

    @field('user_id') userId!: string;
    @field('nombre') nombre!: string;
    @field('descripcion') descripcion?: string;
    @field('color') color?: string;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @children('misiones') misiones!: Mision[];
}
