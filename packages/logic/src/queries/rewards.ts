import { qk } from './keys';
import { enqueue } from '../offline/outbox';

// Helpers de recompensa reutilizables por las mutaciones de cada dominio.
// Encolan la RPC (offline-first): se aplica al recuperar red e invalida el
// alma del héroe (user_stats) + perfil.
export const awardXp = async (amount: number) => {
    if (amount <= 0) return;
    enqueue({ kind: 'rpc', fn: 'add_xp', args: { amount }, invalidate: qk.heroStats });
};

export const awardGold = async (amount: number) => {
    if (amount <= 0) return;
    enqueue({ kind: 'rpc', fn: 'add_gold', args: { amount }, invalidate: qk.heroStats });
};
