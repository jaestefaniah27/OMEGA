import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TextInput,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { MedievalButton, ParchmentCard } from '@omega/ui';
import { useNavigation } from '@react-navigation/native';
import { Trophy, Activity, Search, BookOpen, Star, Heart, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useExercises, Exercise } from '../hooks/useExercises';

const { width } = Dimensions.get('window');

export const BarracksScreen: React.FC = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyPopular, setOnlyPopular] = useState(false);
    const [libraryExpanded, setLibraryExpanded] = useState(false);

    // We use a third parameter for favorites
    const { exercises, favorites, toggleFavorite, loading } = useExercises(
        searchQuery,
        onlyPopular,
        !searchQuery && !onlyPopular // If no search/popular, target favorites
    );

    const renderExerciseItem = (item: Exercise) => {
        const isFav = favorites.includes(item.id);

        return (
            <View key={item.id || item.name} style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.exerciseName}>{item.name_es || item.name}</Text>
                        {item.name_es && item.name_es !== item.name && (
                            <Text style={styles.exerciseRef}>{item.name}</Text>
                        )}
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => toggleFavorite(item.id)}
                            style={styles.favoriteButton}
                        >
                            <Heart
                                size={18}
                                color={isFav ? '#e74c3c' : '#3d2b1f'}
                                fill={isFav ? '#e74c3c' : 'none'}
                            />
                        </TouchableOpacity>
                        <View style={styles.intensityBadge}>
                            <Activity size={10} color="#8b4513" />
                            <Text style={styles.intensityText}>IF: {item.intensity_factor}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.muscleRow}>
                    <Text style={styles.muscleLabel}>Principales:</Text>
                    {item.primary_muscles && item.primary_muscles.map((m, i) => (
                        <View key={`pm-${i}`} style={styles.muscleTag}>
                            <Text style={styles.muscleText}>{m}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundPlaceholder}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>⚔️ LOS BARRACONES</Text>

                    {/* Search & Favorites Row */}
                    <View style={styles.topControlsRow}>
                        <View style={styles.searchContainer}>
                            <Search size={16} color="#3d2b1f" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar técnica..."
                                placeholderTextColor="rgba(61, 43, 31, 0.5)"
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    if (text.length > 0) setLibraryExpanded(true);
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.popularToggle, onlyPopular && styles.popularToggleActive]}
                            onPress={() => {
                                setOnlyPopular(!onlyPopular);
                                if (!onlyPopular) setLibraryExpanded(true);
                            }}
                        >
                            <Star size={20} color={onlyPopular ? '#FFD700' : '#3d2b1f'} fill={onlyPopular ? '#FFD700' : 'none'} />
                        </TouchableOpacity>
                    </View>

                    {/* Section El Coliseo: Records ALWAYS VISSIBLE */}
                    <ParchmentCard style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Trophy size={20} color="#3d2b1f" />
                            <Text style={styles.sectionTitle}>EL COLISEO (Records)</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <Text style={styles.statLabel}>Peso Muerto:</Text>
                            <Text style={styles.statValue}>-- kg</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <Text style={styles.statLabel}>Sentadilla:</Text>
                            <Text style={styles.statValue}>-- kg</Text>
                        </View>
                    </ParchmentCard>

                    {/* Section La Forja / Biblioteca: COLLAPSIBLE */}
                    <ParchmentCard style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.collapsibleHeader}
                            onPress={() => setLibraryExpanded(!libraryExpanded)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <BookOpen size={20} color="#3d2b1f" />
                                <Text style={styles.sectionTitle}>BIBLIOTECA DE COMBATE</Text>
                            </View>
                            {libraryExpanded ? <ChevronUp size={20} color="#3d2b1f" /> : <ChevronDown size={20} color="#3d2b1f" />}
                        </TouchableOpacity>

                        {libraryExpanded && (
                            <View style={styles.expandedContent}>
                                {searchQuery || onlyPopular ? (
                                    <View style={styles.listContainer}>
                                        <Text style={styles.listSubtitle}>
                                            {onlyPopular ? 'Élite de Combate' : 'Resultados de Búsqueda'}
                                        </Text>
                                        {loading ? (
                                            <ActivityIndicator size="large" color="#8b4513" style={{ marginVertical: 20 }} />
                                        ) : (
                                            <>
                                                {exercises.map(renderExerciseItem)}
                                                {exercises.length === 0 && (
                                                    <Text style={styles.emptyText}>No se encontraron técnicas.</Text>
                                                )}
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.listContainer}>
                                        <Text style={styles.listSubtitle}>Tus Técnicas Favoritas</Text>
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#8b4513" style={{ marginVertical: 10 }} />
                                        ) : (
                                            <>
                                                {exercises.length > 0 ? (
                                                    exercises.map(renderExerciseItem)
                                                ) : (
                                                    <Text style={styles.emptyText}>
                                                        No tienes favoritos aún. Pulsa el corazón en cualquier técnica.
                                                    </Text>
                                                )}
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </ParchmentCard>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
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
        backgroundColor: '#2c3e50',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginTop: 40,
        marginBottom: 30,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    topControlsRow: {
        flexDirection: 'row',
        width: width * 0.9,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 46,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    searchIcon: {
        marginRight: 8,
        opacity: 0.7,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    popularToggle: {
        width: 46,
        height: 46,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    popularToggleActive: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderColor: '#FFD700',
    },
    sectionCard: {
        width: width * 0.9,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.2)',
        paddingBottom: 8,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d2b1f',
        marginLeft: 10,
        letterSpacing: 1,
    },
    expandedContent: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(61, 43, 31, 0.1)',
        paddingTop: 10,
    },
    listSubtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8b4513',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    listContainer: {
        width: '100%',
    },
    exerciseContainer: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(61, 43, 31, 0.1)',
        paddingBottom: 12,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteButton: {
        marginRight: 12,
        padding: 4,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d2b1f',
    },
    exerciseRef: {
        fontSize: 12,
        color: '#3d2b1f',
        opacity: 0.6,
        fontStyle: 'italic',
        marginTop: 2,
    },
    intensityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    intensityText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8b4513',
        marginLeft: 4,
    },
    muscleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 6,
    },
    muscleLabel: {
        fontSize: 12,
        color: '#3d2b1f',
        marginRight: 8,
        fontWeight: '600',
        opacity: 0.8,
    },
    muscleTag: {
        backgroundColor: '#3d2b1f',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    muscleText: {
        fontSize: 11,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 14,
        color: '#3d2b1f',
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 14,
        color: '#8b4513',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 20,
        color: '#3d2b1f',
        opacity: 0.6,
        fontStyle: 'italic',
        fontSize: 13,
    }
});
