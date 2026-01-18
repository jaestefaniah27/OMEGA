import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DiagnosticStore, DiagMetrics } from '@omega/logic';

export const PerformanceMonitor: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const [metrics, setMetrics] = useState<DiagMetrics>(DiagnosticStore.getMetrics());

    useEffect(() => {
        return DiagnosticStore.subscribe(setMetrics);
    }, []);

    // Only show in development
    if (!__DEV__) return null;

    return (
        <View style={styles.outerContainer} pointerEvents="box-none">
            <TouchableOpacity
                style={[styles.floatingButton, expanded && styles.expandedContainer]}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.9}
            >
                {!expanded ? (
                    <Text style={styles.iconText}>🔬</Text>
                ) : (
                    <View style={styles.monitorContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>🔬 MONITOR OMEGA</Text>
                            <TouchableOpacity onPress={() => setExpanded(false)}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <MetricRow label="Canales Supabase" value={metrics.activeChannels} highlight={metrics.activeChannels > 5} />
                        <MetricRow label="Intervalos BIOS" value={metrics.activeIntervals} highlight={metrics.activeIntervals > 10} />
                        <MetricRow label="Peso del Alma" value={`${metrics.stateSizeKB} KB`} highlight={metrics.stateSizeKB > 500} />

                        <View style={styles.divider} />

                        <Text style={styles.reasonLabel}>Render Trigger:</Text>
                        <Text style={styles.reasonValue} numberOfLines={2}>
                            {metrics.lastRenderReason || 'Waiting for signal...'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const MetricRow = ({ label, value, highlight }: { label: string, value: any, highlight: boolean }) => (
    <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{label}:</Text>
        <Text style={[styles.metricValue, highlight && styles.highlightText]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a0f0a',
        borderWidth: 1,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    expandedContainer: {
        width: 260,
        height: 180,
        borderRadius: 12,
        padding: 12,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    iconText: {
        fontSize: 20,
    },
    monitorContent: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 215, 0, 0.2)',
        paddingBottom: 4,
    },
    title: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    closeText: {
        color: '#FFD700',
        fontSize: 16,
        paddingHorizontal: 4,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    metricLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
    },
    metricValue: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    highlightText: {
        color: '#ff4444',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 8,
    },
    reasonLabel: {
        color: '#FFD700',
        fontSize: 10,
        opacity: 0.6,
        marginBottom: 2,
    },
    reasonValue: {
        color: '#aaa',
        fontSize: 10,
        fontStyle: 'italic',
    }
});
