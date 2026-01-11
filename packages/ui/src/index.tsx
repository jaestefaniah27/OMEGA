// Basic components for cross-platform compatibility
// In a real scenario, we'd use react-native-web or better aliasing
import { Text, View, StyleSheet } from 'react-native';

export const MedievalButton = ({ title }: { title: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#3d2b1f',
    borderColor: '#ffd700',
    borderWidth: 2,
    borderRadius: 5,
  },
  text: {
    color: '#f5e6c6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
