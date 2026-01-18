import { useEffect, useRef } from 'react';
import { DiagnosticStore } from '../debug/DiagnosticStore';

export function useWhyDidYouUpdate(name: string, props: any) {
    const previousProps = useRef<any>();

    useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changes: string[] = [];

            allKeys.forEach((key) => {
                if (previousProps.current[key] !== props[key]) {
                    const from = previousProps.current[key];
                    const to = props[key];

                    console.log(`[Render Update] Prop '${key}' changed.`, { from, to });
                    changes.push(key);
                }
            });

            if (changes.length > 0) {
                DiagnosticStore.update({
                    lastRenderReason: `${name}: ${changes.join(', ')}`
                });
            }
        }
        previousProps.current = props;
    });
}
