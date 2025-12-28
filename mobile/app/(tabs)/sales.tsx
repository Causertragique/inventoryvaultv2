import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const highlights = [
  'Gérer vos ventes, onglets et paiements en temps réel',
  'Consulter les rapports de vente et les tickets ouverts',
  'Créer rapidement de nouveaux produits/service à vendre',
];

export default function SalesScreen() {
  const scheme = useColorScheme() ?? 'light';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Sales
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Enregistrez des ventes, suivez vos tabs ouverts et envoyez des reçus en quelques tapotements.
      </ThemedText>
      <ThemedView
        style={[
          styles.card,
          {
            borderColor: Colors[scheme].tint,
            backgroundColor: scheme === 'dark' ? '#0f1519' : '#fff',
          },
        ]}>
        {highlights.map((item) => (
          <ThemedText key={item} style={styles.bulletText}>
            • {item}
          </ThemedText>
        ))}
      </ThemedView>
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Pour des fonctionnalités avancées (rapports détaillés, automatisations) montez en gamme dans
          l’onglet « Settings ».
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  heading: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bulletText: {
    fontSize: 15,
  },
  footer: {
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
});
