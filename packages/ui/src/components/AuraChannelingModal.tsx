import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { MedievalButton } from '../MedievalButton';
import { ParchmentCard } from '../ParchmentCard';
import {
    X, RefreshCw, Link as LinkIcon, Monitor, Check,
    Sparkles, Code, Cpu, Book, PenTool, FlaskConical, FlaskRound, Music, Palette,
    Hammer, Sword, Shield, Scroll, Map, Zap, Flame, Droplet, Star,
    Moon, Sun, Heart, Trophy, Target, Rocket
} from 'lucide-react-native';

const ALL_ICONS: Record<string, any> = {
    Code, Cpu, Book, PenTool, FlaskConical, FlaskRound, Music, Palette,
    Hammer, Sword, Shield, Scroll, Map, Zap, Flame, Droplet,
    Star, Moon, Sun, Heart, Trophy, Target, Rocket, Sparkles
};

const IconRenderer = ({ name, size = 18, color = "#4834d4" }: { name: string, size?: number, color?: string }) => {
    const IconComponent = ALL_ICONS[name] || Sparkles;
    return <IconComponent size={size} color={color} />;
};
import { useWorker, useMageTower, MageTheme } from '@omega/logic';

interface AuraChannelingModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AuraChannelingModal: React.FC<AuraChannelingModalProps> = ({ visible, onClose }) => {
    const { getDetectedApps, loading: workerLoading, linkAppToTheme } = useWorker();
    const { themes } = useMageTower();

    const [scannedApps, setScannedApps] = useState<{ name: string, pid?: number }[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);

    // Initial load
    React.useEffect(() => {
        if (visible) {
            handleRefresh();
        }
    }, [visible]);

    const handleRefresh = async () => {
        try {
            const apps = await getDetectedApps();
            setScannedApps(apps);
            setSelectedApps([]); // Clear selection on refresh
        } catch (e: any) {
            console.error(e);
        }
    };

    const toggleAppSelection = (appName: string) => {
        if (selectedApps.includes(appName)) {
            setSelectedApps(selectedApps.filter(a => a !== appName));
        } else {
            setSelectedApps([...selectedApps, appName]);
        }
    };

    const handleLink = async () => {
        if (selectedApps.length === 0 || !selectedThemeId) return;
        setLinking(true);
        try {
            // Process ALL selected apps
            await Promise.all(selectedApps.map(appName => linkAppToTheme(appName, selectedThemeId)));

            Alert.alert(
                "Conexión Establecida",
                `Se han vinculado ${selectedApps.length} aplicaciones al ámbito seleccionado. El aura fluirá automáticamente.`
            );
            onClose();
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLinking(false);
        }
    };

    const getThemeColor = (id: string) => {
        return themes.find(t => t.id === id)?.color || '#FFD700';
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>CANALIZACIÓN DE AURA</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.description}>
                            Conecta tus herramientas digitales a tus Ámbitos de Magia.
                            El aura fluirá automáticamente mientras trabajas.
                        </Text>

                        {/* STEP 1: SCAN */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>1. SELECCIONAR APPS ({selectedApps.length})</Text>
                                <TouchableOpacity onPress={handleRefresh} disabled={workerLoading}>
                                    {workerLoading ? <ActivityIndicator size="small" color="#FFD700" /> : <RefreshCw size={16} color="#FFD700" />}
                                </TouchableOpacity>
                            </View>

                            {scannedApps.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No se han detectado apps recientes.</Text>
                                    <Text style={styles.emptySubText}>Asegurate de que el Vigilante de Escritorio esté activo y trabajando.</Text>
                                    <MedievalButton
                                        title="ACTUALIZAR LISTA"
                                        onPress={handleRefresh}
                                        variant="secondary"
                                        style={{ marginTop: 15 }}
                                    />
                                </View>
                            ) : (
                                <View style={styles.appListContainer}>
                                    <ScrollView style={styles.appList} nestedScrollEnabled={true}>
                                        {scannedApps.map((app, idx) => {
                                            const isSelected = selectedApps.includes(app.name);
                                            return (
                                                <TouchableOpacity
                                                    key={`${app.name}-${idx}`}
                                                    style={[
                                                        styles.appItem,
                                                        isSelected && styles.appItemSelected
                                                    ]}
                                                    onPress={() => toggleAppSelection(app.name)}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
                                                        <Monitor size={16} color={isSelected ? '#FFD700' : 'rgba(255,255,255,0.5)'} />
                                                        <Text style={[
                                                            styles.appItemText,
                                                            isSelected && styles.appItemTextSelected
                                                        ]}>{app.name}</Text>
                                                    </View>
                                                    {isSelected && <Check size={16} color="#FFD700" />}
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* STEP 2: SELECT THEME */}
                        {scannedApps.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>2. VINCULAR A ÁMBITO</Text>
                                    {selectedThemeId && <Check size={16} color="#4CAF50" />}
                                </View>

                                <View style={styles.themeGrid}>
                                    {themes.map(theme => (
                                        <TouchableOpacity
                                            key={theme.id}
                                            style={[
                                                styles.themeCard,
                                                selectedThemeId === theme.id && { borderColor: theme.color, backgroundColor: `${theme.color}20` }
                                            ]}
                                            onPress={() => setSelectedThemeId(theme.id)}
                                        >
                                            <IconRenderer name={theme.symbol} color={theme.color} />
                                            <Text style={[
                                                styles.themeSymbol,
                                                selectedThemeId === theme.id && { color: theme.color }
                                            ]}>{theme.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* FINAL ACTION */}
                        {selectedApps.length > 0 && selectedThemeId && (
                            <View style={styles.actionContainer}>
                                <MedievalButton
                                    title={linking ? "ESTABLECIENDO VÍNCULOS..." : `VINCULAR ${selectedApps.length} APPS`}
                                    onPress={handleLink}
                                    variant="primary"
                                    disabled={linking}
                                    icon={<LinkIcon size={20} color="#fff" />}
                                />
                            </View>
                        )}

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#111',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
        maxHeight: '80%',
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,215,0,0.2)'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2
    },
    content: {
        padding: 20
    },
    description: {
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    section: {
        marginBottom: 30
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between'
    },
    sectionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    appListContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        height: 200,
        backgroundColor: 'rgba(0,0,0,0.2)',
        overflow: 'hidden'
    },
    appList: {
        flex: 1,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 10
    },
    appItemSelected: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    appItemText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14
    },
    appItemTextSelected: {
        color: '#FFD700',
        fontWeight: 'bold'
    },
    rescanButton: {
        padding: 10,
        alignItems: 'center'
    },
    rescanText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    themeCard: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        flexDirection: 'row',
        alignItems: 'center'
    },
    themeSymbol: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        marginLeft: 8
    },
    actionContainer: {
        marginTop: 10,
        marginBottom: 20
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    emptyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    },
    emptySubText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10
    }
});
