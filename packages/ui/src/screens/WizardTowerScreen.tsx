import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    FlatList
} from 'react-native';
import { MedievalButton, ParchmentCard, ManualColorPicker } from '..';
import { useMageTower } from '@omega/logic';
import {
    Sparkles, Code, Cpu, Book, PenTool, Plus, X, Zap,
    FlaskConical, FlaskRound, Music, Palette, Hammer,
    Sword, Shield, Scroll, Map, Flame, Droplet, Star,
    Moon, Sun, Heart, Trophy, Target, Rocket, Settings
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ALL_ICONS: Record<string, any> = {
    Code, Cpu, Book, PenTool, FlaskConical, FlaskRound, Music, Palette,
    Hammer, Sword, Shield, Scroll, Map, Zap, Flame, Droplet,
    Star, Moon, Sun, Heart, Trophy, Target, Rocket, Sparkles
};

const IconRenderer = ({ name, size = 18, color = "#4834d4" }: { name: string, size?: number, color?: string }) => {
    const IconComponent = ALL_ICONS[name] || Sparkles;
    return <IconComponent size={size} color={color} />;
};

export const WizardTowerScreen: React.FC = () => {
    const { projects, themes, createProject, updateProject, deleteProject, archiveProject, createTheme, deleteTheme, loading } = useMageTower();

    // Project Modal State
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Theme Editor State
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemeSymbol, setNewThemeSymbol] = useState('Sparkles');
    const [newThemeColor, setNewThemeColor] = useState('#4834d4');
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

    const handleSaveProject = async () => {
        if (!projectName || !selectedThemeId) {
            Alert.alert("Error", "Debes nombrar tu artefacto y seleccionar un ámbito de poder.");
            return;
        }

        if (editingProject) {
            await updateProject(editingProject.id, { name: projectName, theme_id: selectedThemeId });
        } else {
            await createProject(projectName, selectedThemeId);
        }

        setProjectModalVisible(false);
        setProjectName('');
        setSelectedThemeId(null);
        setEditingProject(null);
    };

    const handleLongPressProject = (project: any) => {
        Alert.alert(
            "Gestión de Artefacto",
            `¿Qué deseas hacer con "${project.name}"?`,
            [
                {
                    text: "Editar", onPress: () => {
                        setEditingProject(project);
                        setProjectName(project.name);
                        setSelectedThemeId(project.theme_id);
                        setProjectModalVisible(true);
                    }
                },
                { text: "Archivar", onPress: () => archiveProject(project.id), style: 'default' },
                {
                    text: "Eliminar", onPress: () => {
                        Alert.alert("Destruir Artefacto", "¿Estás seguro de destruir este artefacto para siempre?", [
                            { text: "Cancelar", style: 'cancel' },
                            { text: "Destruir", onPress: () => deleteProject(project.id), style: 'destructive' }
                        ]);
                    }, style: 'destructive'
                },
                { text: "Cancelar", style: 'cancel' }
            ]
        );
    };

    const handleCreateTheme = async () => {
        if (!newThemeName) {
            Alert.alert("Error", "El tema debe tener un nombre.");
            return;
        }
        await createTheme(newThemeName, newThemeSymbol, newThemeColor);
        setNewThemeName('');
        setThemeModalVisible(false);
    };

    const renderProject = (project: any) => {
        const theme = themes.find(t => t.id === project.theme_id);
        const iconName = theme?.symbol || 'Sparkles';
        const color = theme?.color || '#4834d4';

        return (
            <TouchableOpacity
                key={project.id}
                style={styles.projectItem}
                onLongPress={() => handleLongPressProject(project)}
                activeOpacity={0.7}
            >
                <View style={styles.projectInfo}>
                    <View style={styles.projectNameSection}>
                        <IconRenderer name={iconName} color={color} />
                        <View style={styles.textColumn}>
                            <Text style={styles.projectName}>{project.name}</Text>
                            <Text style={styles.projectScope}>{theme?.name || 'Ámbito Desconocido'}</Text>
                        </View>
                    </View>
                    <View style={styles.manaSection}>
                        <Zap size={14} color="#ffd700" />
                        <Text style={styles.manaText}>{project.mana_amount} Mana</Text>
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '10%', backgroundColor: color }]} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>🧙‍♂️ TORRE DE HECHICERÍA</Text>
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => setThemeModalVisible(true)}
                        >
                            <Settings size={22} color="#FFD700" />
                        </TouchableOpacity>
                    </View>

                    <ParchmentCard style={styles.introCard}>
                        <Text style={styles.introText}>
                            Aquí es donde los sueños se forjan en realidad. Canaliza el maná de tus esfuerzos diarios para crear artefactos mágicos de conocimiento y poder.
                        </Text>
                    </ParchmentCard>

                    <ParchmentCard style={styles.projectCard}>
                        <View style={styles.cardHeader}>
                            <Sparkles size={20} color="#3d2b1f" />
                            <Text style={styles.cardTitle}>GRIMORIO DE PROYECTOS</Text>
                        </View>

                        {projects.length === 0 ? (
                            <Text style={styles.emptyText}>No hay proyectos activos en tu grimorio. Comienza una nueva investigación.</Text>
                        ) : (
                            projects.map(renderProject)
                        )}

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setEditingProject(null);
                                setProjectName('');
                                setSelectedThemeId(null);
                                setProjectModalVisible(true);
                            }}
                        >
                            <Plus size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Nueva Investigación</Text>
                        </TouchableOpacity>
                    </ParchmentCard>

                    <MedievalButton
                        title="⚡ SINCRONIZAR CON EL DRAGÓN"
                        onPress={() => Alert.alert("Sincronización", "El dragón (tu ordenador) está preparándose para canalizar maná a esta torre próximamente.")}
                        style={styles.manaButton}
                    />

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* Modal para Nuevo Proyecto */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={projectModalVisible}
                onRequestClose={() => setProjectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingProject ? 'REFORJAR ARTEFACTO' : 'NUEVA INVESTIGACIÓN'}</Text>
                            <TouchableOpacity onPress={() => setProjectModalVisible(false)}>
                                <X size={24} color="#3d2b1f" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>NOMBRE DEL ARTEFACTO</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Proyecto Omega, Mi Libro..."
                            value={projectName}
                            onChangeText={setProjectName}
                            placeholderTextColor="rgba(61, 43, 31, 0.4)"
                        />

                        <Text style={styles.inputLabel}>ÁMBITO DE PODER</Text>
                        {themes.length === 0 ? (
                            <View style={styles.noThemesBox}>
                                <Text style={styles.noThemesText}>Aún no has definido ámbitos de poder (temas).</Text>
                                <TouchableOpacity onPress={() => { setProjectModalVisible(false); setThemeModalVisible(true); }}>
                                    <Text style={styles.createThemeLink}>Crear Primer Ámbito</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.themeGrid}>
                                {themes.map(t => (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[styles.themeBtn, selectedThemeId === t.id && { borderColor: t.color, backgroundColor: t.color + '20' }]}
                                        onPress={() => setSelectedThemeId(t.id)}
                                    >
                                        <IconRenderer name={t.symbol} color={t.color} size={16} />
                                        <Text style={[styles.themeBtnText, selectedThemeId === t.id && { color: t.color, fontWeight: 'bold' }]}>
                                            {t.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[styles.themeBtn, { borderStyle: 'dashed', borderColor: '#3d2b1f' }]}
                                    onPress={() => {
                                        setProjectModalVisible(false);
                                        setTimeout(() => setThemeModalVisible(true), 400);
                                    }}
                                >
                                    <Plus size={14} color="#3d2b1f" />
                                    <Text style={styles.themeBtnText}>Nuevo</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <MedievalButton
                            title={editingProject ? "GUARDAR CAMBIOS" : "COMENZAR RITO"}
                            onPress={handleSaveProject}
                            variant="primary"
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal para Themes / Ámbitos */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>EDITOR DE ÁMBITOS</Text>
                            <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                                <X size={24} color="#3d2b1f" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text style={styles.inputLabel}>NUEVO ÁMBITO DE INVESTIGACIÓN</Text>
                            <View style={styles.newThemeRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Nombre del tema..."
                                    value={newThemeName}
                                    onChangeText={setNewThemeName}
                                    placeholderTextColor="rgba(61, 43, 31, 0.4)"
                                />
                                <TouchableOpacity
                                    style={[styles.colorIndicator, { backgroundColor: newThemeColor }]}
                                    onPress={() => {
                                        setThemeModalVisible(false);
                                        setTimeout(() => setIsColorPickerVisible(true), 400);
                                    }}
                                />
                            </View>

                            <Text style={styles.inputLabel}>SÍMBOLO SAGRADO</Text>
                            <View style={styles.iconSelectionGrid}>
                                {Object.keys(ALL_ICONS).map(iconName => (
                                    <TouchableOpacity
                                        key={iconName}
                                        style={[styles.iconBox, newThemeSymbol === iconName && styles.iconBoxActive]}
                                        onPress={() => setNewThemeSymbol(iconName)}
                                    >
                                        <IconRenderer name={iconName} color={newThemeSymbol === iconName ? '#fff' : '#3d2b1f'} size={20} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <MedievalButton
                                title="AÑADIR ÁMBITO"
                                onPress={handleCreateTheme}
                                style={{ marginVertical: 15 }}
                            />

                            <View style={styles.existingThemesSection}>
                                <Text style={styles.inputLabel}>ÁMBITOS EXISTENTES</Text>
                                {themes.map(t => (
                                    <View key={t.id} style={styles.existingThemeItem}>
                                        <View style={styles.themeItemLeft}>
                                            <IconRenderer name={t.symbol} color={t.color} />
                                            <Text style={styles.themeItemName}>{t.name}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => deleteTheme(t.id)}>
                                            <X size={18} color="#c0392b" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <ManualColorPicker
                visible={isColorPickerVisible}
                onClose={() => {
                    setIsColorPickerVisible(false);
                    setTimeout(() => setThemeModalVisible(true), 400);
                }}
                onColorSelect={(color) => {
                    setNewThemeColor(color);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundPlaceholder: {
        flex: 1,
        backgroundColor: '#1a0d2d',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 40,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    settingsBtn: {
        position: 'absolute',
        right: 0,
        padding: 10,
    },
    introCard: {
        width: width * 0.9,
        marginBottom: 20,
        backgroundColor: 'rgba(156, 39, 176, 0.05)',
    },
    introText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#5d4037',
        textAlign: 'center',
        lineHeight: 20,
    },
    projectCard: {
        width: width * 0.9,
        marginBottom: 30,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontStyle: 'italic',
        marginVertical: 20,
    },
    projectItem: {
        marginBottom: 20,
    },
    projectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    projectNameSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textColumn: {
        marginLeft: 12,
    },
    projectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    projectScope: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    manaSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    manaText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#c0a200',
        marginLeft: 4,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(61, 43, 31, 0.15)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4834d4',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    manaButton: {
        width: width * 0.9,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: '#f4ede4',
        borderRadius: 15,
        padding: 20,
        borderWidth: 2,
        borderColor: '#3d2b1f',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        letterSpacing: 1,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginBottom: 8,
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
        borderRadius: 8,
        padding: 12,
        color: '#3d2b1f',
        fontSize: 16,
        marginBottom: 20,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    themeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    themeBtnText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#3d2b1f',
    },
    newThemeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    colorIndicator: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 2,
        borderColor: '#3d2b1f',
    },
    iconSelectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.1)',
    },
    iconBoxActive: {
        backgroundColor: '#4834d4',
        borderColor: '#4834d4',
    },
    existingThemesSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
        paddingTop: 15,
    },
    existingThemeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    themeItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeItemName: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    noThemesBox: {
        padding: 15,
        alignItems: 'center',
        backgroundColor: 'rgba(61, 43, 31, 0.05)',
        borderRadius: 10,
    },
    noThemesText: {
        fontSize: 12,
        color: '#7f8c8d',
        fontStyle: 'italic',
    },
    createThemeLink: {
        color: '#4834d4',
        fontWeight: 'bold',
        marginTop: 5,
        textDecorationLine: 'underline',
    },
    colorPickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPickerContainer: {
        width: width * 0.9,
        backgroundColor: '#f4ede4',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    closePickerBtn: {
        marginTop: 20,
        padding: 10,
    },
    closePickerText: {
        color: '#c0392b',
        fontWeight: 'bold',
    }
});
