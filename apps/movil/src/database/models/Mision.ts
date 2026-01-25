import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type Grimorio from './Grimorio';

export default class Mision extends Model {
    static table = 'misiones';

    static associations = {
        grimorios: { type: 'belongs_to' as const, key: 'grimorio_id' },
    };

    @field('user_id') userId!: string;
    @field('grimorio_id') grimorioId?: string;
    @field('titulo') titulo!: string;
    @field('descripcion') descripcion?: string;
    @field('dificultad') dificultad?: string;
    @field('rama') rama?: string;
    @field('completada') completada!: boolean;
    @field('oro_recompensa') oroRecompensa!: number;
    @field('xp_recompensa') xpRecompensa!: number;
    @date('due_at') dueAt?: Date;

    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @date('synced_at') syncedAt?: Date;

    @relation('grimorios', 'grimorio_id') grimorio?: Grimorio;
}
