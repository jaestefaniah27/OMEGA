import React, { useState, useRef, useEffect } from 'react';
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
    FlatList,
    Animated,
    DeviceEventEmitter,
    Platform
} from 'react-native';
import { MedievalButton, ParchmentCard, ManualColorPicker, AuraChannelingModal } from '..';
import { useMageTower } from '@omega/logic';
import {
    Sparkles, Code, Cpu, Book, PenTool, Plus, X, Zap,
    FlaskConical, FlaskRound, Music, Palette, Hammer,
    Sword, Shield, Scroll, Map, Flame, Droplet, Star,
    Moon, Sun, Heart, Trophy, Target, Rocket, Settings, Monitor
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
    const {
        projects, themes, createProject, updateProject, deleteProject,
        archiveProject, createTheme, deleteTheme, loading,
        unhandledAuraByTheme, canalizeAura, mappings, deleteMapping
    } = useMageTower();

    // Project Modal State
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [selectedProjectForMenu, setSelectedProjectForMenu] = useState<any>(null);

    // Theme Editor State
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemeSymbol, setNewThemeSymbol] = useState('Sparkles');
    const [newThemeColor, setNewThemeColor] = useState('#4834d4');
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [auraModalVisible, setAuraModalVisible] = useState(false);

    // Tab State
    const [viewMode, setViewMode] = useState<'LABORATORIO' | 'REGISTROS'>('LABORATORIO');

    // Calculate total aura from all themes
    const totalAura = Object.values(unhandledAuraByTheme || {}).reduce((acc, val) => acc + val, 0);

    const horizontalScrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    // Zero Aura Bubble State
    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const [bubbleVisible, setBubbleVisible] = useState(false);

    const showZeroAuraBubble = () => {
        setBubbleVisible(true);
        bubbleOpacity.setValue(0);
        Animated.sequence([
            Animated.timing(bubbleOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(1200),
            Animated.timing(bubbleOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start(() => setBubbleVisible(false));
    };

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('QUICK_ADD_PRESSED', () => {
            if (viewMode === 'LABORATORIO') {
                setEditingProject(null);
                setProjectName('');
                setSelectedThemeId(null);
                setProjectModalVisible(true);
            } else {
                setNewThemeName('');
                setThemeModalVisible(true);
            }
        });
        return () => sub.remove();
    }, [viewMode]);

    // Custom Alert State
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertTitle, setCustomAlertTitle] = useState('');
    const [customAlertMessage, setCustomAlertMessage] = useState('');
    const [customAlertButtons, setCustomAlertButtons] = useState<any[]>([]);

    const showCustomAlert = (title: string, message: string, buttons: any[] = [{ text: 'ENTENDIDO' }]) => {
        setCustomAlertTitle(title);
        setCustomAlertMessage(message);
        setCustomAlertButtons(buttons);
        setCustomAlertVisible(true);
    };

    const handleSaveProject = async () => {
        if (!projectName || !selectedThemeId) {
            showCustomAlert("Error", "Debes nombrar tu artefacto y seleccionar un ámbito de poder.");
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
        setSelectedProjectForMenu(project);
        setActionMenuVisible(true);
    };

    const handleCreateTheme = async () => {
        if (!newThemeName) {
            showCustomAlert("Error", "El tema debe tener un nombre.");
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
        const projectAura = theme ? (unhandledAuraByTheme[theme.id] || 0) : 0;

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
                        {projectAura > 0 && (
                            <TouchableOpacity
                                style={styles.projectAuraBadge}
                                onPress={() => canalizeAura(project.id, theme!.id)}
                            >
                                <Zap size={14} color="#FFD700" />
                                <Text style={styles.projectAuraText}>+{projectAura}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.manaSection}>
                        <Zap size={14} color="#ffd700" />
                        <Text style={styles.manaText}>{project.mana_amount} Mana</Text>
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: project.mana_amount > 0 ? `${Math.min(project.mana_amount, 100)}%` : '0%', backgroundColor: color }]} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <View style={styles.topHeader}>
                    <Text style={styles.headerTitle}>TORRE DE HECHICERÍA</Text>
                    <Text style={styles.headerSubtitle}>"Donde la voluntad se transmuta en realidad"</Text>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabSelector}>
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            {
                                transform: [{
                                    translateX: scrollX.interpolate({
                                        inputRange: [0, width],
                                        outputRange: [4, ((width - 38) / 2) + 4]
                                    })
                                }],
                                width: (width - 38) / 2
                            }
                        ]}
                    />

                    <TouchableOpacity
                        style={styles.tabBtn}
                        onPress={() => horizontalScrollRef.current?.scrollTo({ x: 0, animated: true })}
                    >
                        <FlaskConical size={18} color={viewMode === 'LABORATORIO' ? '#FFD700' : '#8b4513'} />
                        <Text style={[styles.tabBtnText, { color: viewMode === 'LABORATORIO' ? '#FFD700' : '#8b4513' }]}>LABORATORIO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabBtn}
                        onPress={() => horizontalScrollRef.current?.scrollTo({ x: width, animated: true })}
                    >
                        <Scroll size={18} color={viewMode === 'REGISTROS' ? '#FFD700' : '#8b4513'} />
                        <Text style={[styles.tabBtnText, { color: viewMode === 'REGISTROS' ? '#FFD700' : '#8b4513' }]}>REGISTROS</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                        const offsetX = e.nativeEvent.contentOffset.x;
                        setViewMode(offsetX >= width / 2 ? 'REGISTROS' : 'LABORATORIO');
                    }}
                >
                    {/* --- TAB 1: LABORATORIO D'ALQUIMIA --- */}
                    <View style={{ width }}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                                <Sparkles size={18} color="#FFD700" />
                                <Text style={styles.sectionTitle}>INVESTIGACIONES ACTIVAS</Text>
                            </View>

                            {projects.filter(p => p.status !== 'ARCHIVED').length === 0 ? (
                                <ParchmentCard style={styles.emptyCard}>
                                    <Text style={styles.emptyText}>No hay proyectos activos. Usa el botón (+) para iniciar una nueva investigación.</Text>
                                </ParchmentCard>
                            ) : (
                                projects.filter(p => p.status !== 'ARCHIVED').map(renderProject)
                            )}

                            <View style={{ height: 200 }} />
                        </ScrollView>

                        {/* Footer Fijo de Aura */}
                        <View style={styles.auraFixedFooter}>
                            {bubbleVisible && (
                                <Animated.View style={[styles.bubbleContainer, { opacity: bubbleOpacity }]}>
                                    <View style={styles.bubbleContent}>
                                        <Text style={styles.bubbleText}>No hay energía latente... Realiza tus ritos diarios.</Text>
                                    </View>
                                    <View style={styles.bubbleArrow} />
                                </Animated.View>
                            )}

                            <View style={styles.auraInfoRow}>
                                <View style={styles.auraLabelGroup}>
                                    <Flame size={20} color="#FFD700" />
                                    <Text style={styles.auraLabel}>AURA LATENTE TOTAL</Text>
                                </View>
                                <View style={styles.auraValueGroup}>
                                    <Text style={styles.auraValue}>{totalAura}</Text>
                                    <Text style={styles.auraUnit}>Mana</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.canalizeBtn, totalAura === 0 && styles.canalizeBtnDisabled]}
                                onPress={() => {
                                    if (totalAura > 0) {
                                        showCustomAlert("Canalizar Energía", "Elige una investigación vinculada para transmutar su aura específica.");
                                    } else {
                                        showZeroAuraBubble();
                                    }
                                }}
                            >
                                <Zap size={16} color={totalAura === 0 ? "#7f8c8d" : "#FFD700"} />
                                <Text style={[styles.canalizeBtnText, totalAura === 0 && { color: '#7f8c8d' }]}>
                                    CANALIZAR ARTEFACTOS
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- TAB 2: SALA DE REGISTROS --- */}
                    <ScrollView style={{ width }} contentContainerStyle={styles.scrollContent}>
                        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                            <Book size={18} color="#7f8c8d" />
                            <Text style={[styles.sectionTitle, { color: '#7f8c8d' }]}>ARCHIVOS SACROS</Text>
                        </View>

                        {projects.filter(p => p.status === 'ARCHIVED').length === 0 ? (
                            <Text style={styles.emptyTextArchived}>Los archivos están vacíos por ahora.</Text>
                        ) : (
                            projects.filter(p => p.status === 'ARCHIVED').map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={styles.archivedItem}
                                    onLongPress={() => handleLongPressProject(p)}
                                >
                                    <View style={styles.archivedLeft}>
                                        <IconRenderer name={themes.find(t => t.id === p.theme_id)?.symbol || 'Scroll'} color="#7f8c8d" size={16} />
                                        <Text style={styles.archivedName}>{p.name}</Text>
                                    </View>
                                    <Text style={styles.archivedMana}>{p.mana_amount} Mana</Text>
                                </TouchableOpacity>
                            ))
                        )}

                        <ParchmentCard style={{ ...styles.managementCard, marginTop: 30 }}>
                            <View style={styles.cardHeader}>
                                <Settings size={20} color="#3d2b1f" />
                                <Text style={styles.cardTitle}>MAESTRÍA DE ÁMBITOS</Text>
                            </View>
                            <Text style={styles.cardDesc}>Define los pilares de tu poder y canaliza energía de tus herramientas.</Text>

                            {/* --- MAPPINGS LIST --- */}
                            {mappings && mappings.length > 0 && (
                                <View style={styles.mappingsList}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <Text style={styles.subHeader}>CANALIZACIONES ACTIVAS</Text>
                                        <View style={{ backgroundColor: '#4CAF50', width: 8, height: 8, borderRadius: 4, marginLeft: 6 }} />
                                    </View>

                                    {mappings.map(m => {
                                        const theme = themes.find(t => t.id === m.theme_id);
                                        return (
                                            <TouchableOpacity
                                                key={m.id}
                                                style={[styles.mappingItem, { borderLeftColor: theme?.color || '#ccc' }]}
                                                onLongPress={() => {
                                                    showCustomAlert(
                                                        "Gestionar Canalización",
                                                        `¿Qué deseas hacer con la conexión de "${m.process_name}"?`,
                                                        [
                                                            { text: "Cancelar", style: "cancel", onPress: () => setCustomAlertVisible(false) },
                                                            {
                                                                text: "Romper Vínculo",
                                                                style: "destructive",
                                                                onPress: () => {
                                                                    deleteMapping(m.id!);
                                                                    setCustomAlertVisible(false);
                                                                }
                                                            }
                                                        ]
                                                    )
                                                }}
                                            >
                                                <View style={styles.mappingLeft}>
                                                    <Monitor size={14} color="#3d2b1f" />
                                                    <Text style={styles.mappingApp}>{m.process_name}</Text>
                                                </View>
                                                <View style={styles.mappingArrow}>
                                                    <Zap size={10} color="rgba(61,43,31,0.3)" />
                                                </View>
                                                <View style={styles.mappingRight}>
                                                    <IconRenderer name={theme?.symbol || 'Sparkles'} color={theme?.color} size={14} />
                                                    <Text style={[styles.mappingTheme, { color: theme?.color }]}>{theme?.name}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}

                            <MedievalButton
                                title={mappings.length > 0 ? "AÑADIR NUEVA CONEXIÓN" : "CONFIGURAR CANALIZACIÓN"}
                                onPress={() => setAuraModalVisible(true)}
                                variant="secondary"
                                icon={<Zap size={16} color="#FFD700" />}
                                style={{ marginTop: 15, alignSelf: 'flex-start' }}
                            />
                        </ParchmentCard>

                        <View style={{ height: 120 }} />
                    </ScrollView>
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

            {/* In-App Action Menu (Immersive) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={actionMenuVisible}
                onRequestClose={() => setActionMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setActionMenuVisible(false)}
                >
                    <View style={styles.actionMenuContent}>
                        <ParchmentCard style={styles.actionCard}>
                            <Text style={styles.actionTitle}>GESTIÓN DE ARTEFACTO</Text>
                            <Text style={styles.actionSubtitle}>{selectedProjectForMenu?.name}</Text>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        setActionMenuVisible(false);
                                        setEditingProject(selectedProjectForMenu);
                                        setProjectName(selectedProjectForMenu.name);
                                        setSelectedThemeId(selectedProjectForMenu.theme_id);
                                        setProjectModalVisible(true);
                                    }}
                                >
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#3498db' }]}>
                                        <PenTool size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.actionText}>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        archiveProject(selectedProjectForMenu.id);
                                        setActionMenuVisible(false);
                                    }}
                                >
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#95a5a6' }]}>
                                        <Book size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.actionText}>Archivar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        showCustomAlert(
                                            "Destruir Artefacto",
                                            "¿Confirmas la destrucción total de este estudio?",
                                            [
                                                { text: "Mantener", style: 'cancel', onPress: () => setCustomAlertVisible(false) },
                                                {
                                                    text: "Destruir", onPress: () => {
                                                        deleteProject(selectedProjectForMenu.id);
                                                        setActionMenuVisible(false);
                                                        setCustomAlertVisible(false);
                                                    }, style: 'destructive'
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#e74c3c' }]}>
                                        <X size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.actionText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeActionBtn}
                                onPress={() => setActionMenuVisible(false)}
                            >
                                <Text style={styles.closeActionText}>CERRAR</Text>
                            </TouchableOpacity>
                        </ParchmentCard>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Immersive Custom Alert */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={customAlertVisible}
                onRequestClose={() => setCustomAlertVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ParchmentCard style={styles.alertCard}>
                        <Text style={styles.alertTitle}>{customAlertTitle}</Text>
                        <Text style={styles.alertMessage}>{customAlertMessage}</Text>
                        <View style={styles.alertButtonsCol}>
                            {customAlertButtons.map((btn, idx) => (
                                <MedievalButton
                                    key={idx}
                                    title={btn.text}
                                    variant={btn.style === 'destructive' ? 'danger' : 'primary'}
                                    onPress={() => {
                                        if (btn.onPress) {
                                            btn.onPress();
                                        } else {
                                            setCustomAlertVisible(false);
                                        }
                                    }}
                                    style={{ marginTop: 10, width: '100%' }}
                                />
                            ))}
                            {!customAlertButtons.some(b => b.style === 'cancel' || b.text === 'ENTENDIDO') && customAlertButtons.length === 1 && (
                                <TouchableOpacity onPress={() => setCustomAlertVisible(false)} style={{ marginTop: 15 }}>
                                    <Text style={styles.closeActionText}>CERRAR</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ParchmentCard>
                </View>
            </Modal>


            <AuraChannelingModal
                visible={auraModalVisible}
                onClose={() => setAuraModalVisible(false)}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0f0a',
    },
    backgroundPlaceholder: {
        flex: 1,
    },
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#1c110b',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#d4af37',
        fontStyle: 'italic',
        marginTop: 4,
        opacity: 0.8,
    },
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: '#2c1a12',
        padding: 4,
        margin: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4d2b1a',
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: '#3d2b1f',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    introCard: {
        marginBottom: 20,
    },
    introText: {
        fontSize: 14,
        color: '#3d2b1f',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 35,
        backgroundColor: 'rgba(255, 215, 0, 0.03)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
        marginBottom: 25,
        position: 'relative',
        overflow: 'hidden',
    },
    heroDecoration: {
        position: 'absolute',
        top: -15,
        right: -15,
        opacity: 0.2,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 2,
        marginBottom: 20,
    },
    heroButton: {
        width: width * 0.7,
    },
    manaActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    manaActionText: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 8,
        letterSpacing: 1,
    },
    managementCard: {
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    cardDesc: {
        fontSize: 12,
        color: 'rgba(61, 43, 31, 0.7)',
        marginBottom: 15,
        lineHeight: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingLeft: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: 10,
        letterSpacing: 1,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    mappingsList: {
        marginTop: 15,
        marginBottom: 10
    },
    subHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(61,43,31,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    mappingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(61,43,31,0.03)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61,43,31,0.05)',
        borderLeftWidth: 3,
        marginBottom: 8,
        borderRadius: 4
    },
    mappingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    mappingApp: {
        fontSize: 13,
        color: '#3d2b1f',
        marginLeft: 8,
        fontWeight: '600'
    },
    mappingArrow: {
        paddingHorizontal: 10
    },
    mappingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end'
    },
    mappingTheme: {
        fontSize: 12,
        marginLeft: 6,
        fontWeight: 'bold'
    },
    emptyCard: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    emptyTextArchived: {
        fontSize: 12,
        color: 'rgba(127, 140, 141, 0.5)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    projectItem: {
        backgroundColor: 'rgba(255, 247, 230, 0.95)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#d4af37',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    projectInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
        fontSize: 11,
        color: '#7f8c8d',
        marginTop: 2,
    },
    manaSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    manaText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    archivedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(127, 140, 141, 0.2)',
    },
    archivedLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    archivedName: {
        marginLeft: 10,
        fontSize: 13,
        color: '#7f8c8d',
    },
    archivedMana: {
        fontSize: 11,
        color: 'rgba(127, 140, 141, 0.7)',
        fontWeight: 'bold',
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
    },
    actionMenuContent: {
        width: width * 0.9,
    },
    actionCard: {
        padding: 24,
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
        letterSpacing: 2,
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#7f8c8d',
        fontStyle: 'italic',
        marginBottom: 20,
        marginTop: 4,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 10,
    },
    actionItem: {
        alignItems: 'center',
        width: 70,
    },
    actionIconCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    actionText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3d2b1f',
        textTransform: 'uppercase',
    },
    closeActionBtn: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: 'rgba(61, 43, 31, 0.2)',
        borderRadius: 20,
    },
    closeActionText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7f8c8d',
        letterSpacing: 1,
    },
    alertCard: {
        width: width * 0.8,
        padding: 24,
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c0392b',
        letterSpacing: 2,
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 14,
        color: '#3d2b1f',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    alertButtonsCol: {
        width: '100%',
        alignItems: 'center',
    },
    settingsBtn: {
        position: 'absolute',
        right: 0,
        padding: 10,
    },
    auraFixedFooter: {
        backgroundColor: '#1c110b',
        borderTopWidth: 2,
        borderTopColor: '#FFD700',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 120 : 110,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    auraInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    auraLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    auraLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: 10,
        letterSpacing: 1,
    },
    auraValueGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    auraValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textShadowColor: 'rgba(255, 215, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    auraUnit: {
        fontSize: 10,
        color: '#d4af37',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    canalizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
        marginBottom: 12,
    },
    canalizeBtnDisabled: {
        borderColor: '#4d2b1a',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    canalizeBtnText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 1,
    },
    auraFooterDesc: {
        fontSize: 11,
        color: 'rgba(212, 175, 55, 0.6)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    bubbleContainer: {
        position: 'absolute',
        top: -45,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    bubbleContent: {
        backgroundColor: 'rgba(61, 43, 31, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d4af37',
    },
    bubbleText: {
        color: '#f4ede4',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bubbleArrow: {
        width: 10,
        height: 10,
        backgroundColor: 'rgba(61, 43, 31, 0.9)',
        transform: [{ rotate: '45deg' }],
        marginTop: -5,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#d4af37',
    },
    projectAuraBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    projectAuraText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    }
});
