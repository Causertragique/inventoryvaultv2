import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const plans = [
  {
    label: 'Freemium',
    price: '0 $',
    benefits: [
      '1 employé autorisé',
      '5 requetes mensuelles',
      'Exports PDF restreints',
    ],
  },
  {
    label: 'Pro',
    price: '9,99 $ / mois (99 $ / an)',
    benefits: [
      '5 employés simultanés',
      '50 requetes par mois',
      'Exports PDF/CSV et notifications',
    ],
  },
  {
    label: 'Premium',
    price: '24,99 $ / mois (249 $ / an)',
    benefits: [
      'Employés et requetes illimites',
      'Support prioritaire et integrations',
      'Acces beta + onboarding dedie',
    ],
  },
];

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const [activeTab, setActiveTab] = useState<'settings' | 'plans'>('settings');

  const settingsOptions = [
    {
      label: 'Notifications',
      description: 'Recevez les alertes de ventes, stocks et rapports quotidiens.',
    },
    {
      label: 'Synchronisation',
      description: 'Sauvegarde automatique des donnees et partage equipe.',
    },
    {
      label: 'Support',
      description: 'Contactez-nous directement depuis l’application ou via App Store.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabBar}>
        {[
          { key: 'settings', label: 'Réglages' },
          { key: 'plans', label: 'Plans' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && {
                borderColor: Colors[scheme].tint,
                backgroundColor: Colors[scheme].tint,
              },
            ]}
            onPress={() => setActiveTab(tab.key as 'settings' | 'plans')}>
            <ThemedText
              type="subtitle"
              style={[
                styles.tabLabel,
                activeTab === tab.key && { color: scheme === 'dark' ? '#000' : '#fff' },
              ]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'settings' ? (
        <ThemedView style={styles.sectionCard}>
          {settingsOptions.map((option) => (
            <ThemedView key={option.label} style={styles.settingRow}>
              <ThemedText type="subtitle" style={styles.settingLabel}>
                {option.label}
              </ThemedText>
              <ThemedText style={styles.settingDesc}>{option.description}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : (
        <>
          <ThemedText type="title" style={styles.heading}>
            Plan tarifaire
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Comparez les plans et prenez le niveau supérieur via l’App Store.
          </ThemedText>
          {plans.map((plan) => (
            <ThemedView
              key={plan.label}
              style={[
                styles.card,
                {
                  borderColor: Colors[scheme].tint,
                  backgroundColor: scheme === 'dark' ? '#0f1519' : '#fff',
                },
              ]}>
              <ThemedText type="subtitle" style={styles.planLabel}>
                {plan.label}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.planPrice}>
                {plan.price}
              </ThemedText>
              {plan.benefits.map((benefit) => (
                <ThemedText key={benefit} style={styles.planBenefit}>
                  • {benefit}
                </ThemedText>
              ))}
            </ThemedView>
          ))}
          <ThemedText type="link" style={styles.cta}>
            Gerer mon abonnement dans l’App Store
          </ThemedText>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
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
  planLabel: {
    fontSize: 18,
  },
  planPrice: {
    fontSize: 17,
  },
  planBenefit: {
    fontSize: 15,
  },
  cta: {
    textAlign: 'center',
    marginTop: 12,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
    gap: 12,
  },
  settingRow: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDesc: {
    fontSize: 14,
    color: '#555',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  tabLabel: {
    fontSize: 14,
  },
});
