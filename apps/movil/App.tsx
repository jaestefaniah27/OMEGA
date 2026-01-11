import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MedievalButton } from '@omega/ui';
import { supabase } from '@omega/db';

export default function App() {
  const [dbStatus, setDbStatus] = useState<string>('Esperando...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count');
        if (error) throw error;
        setDbStatus('✅ Conectado a Supabase');
      } catch (err) {
        setDbStatus('❌ Error de conexión (revisa el .env)');
      }
    };
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Text style={{ marginTop: 10 }}>Base de Datos: {dbStatus}</Text>
      <View style={{ marginTop: 20 }}>
        <MedievalButton title="Hola desde Móvil RPG!" />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
