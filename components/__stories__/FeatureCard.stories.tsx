// @ts-nocheck
/**
 * FeatureCard Stories
 *
 * Interactive documentation for the FeatureCard component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, Alert } from 'react-native';
import { FeatureCard } from '../FeatureCard';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    description: {
      control: 'text',
      description: 'Card description',
    },
    icon: {
      control: 'text',
      description: 'Icon name from Lucide',
    },
    variant: {
      control: 'select',
      options: ['default', 'highlighted', 'premium'],
      description: 'Card style variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction',
    },
  },
  parameters: {
    notes: `
# FeatureCard

A card component for displaying app features with icon, title, and description.

## Usage

\`\`\`tsx
import { FeatureCard } from '@/components/FeatureCard';

<FeatureCard
  title="Hızlı Analiz"
  description="Çocuğunuzun çizimlerini analiz edin"
  icon="Sparkles"
  onPress={() => router.push('/analysis')}
/>
\`\`\`

## Variants

- **default**: Standard feature card
- **highlighted**: Emphasized card with gradient border
- **premium**: Premium feature with special styling
    `,
  },
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

// Default story
export const Default: Story = {
  args: {
    title: 'Hızlı Analiz',
    description: 'Çocuğunuzun çizimlerini yapay zeka ile analiz edin',
    icon: 'Sparkles',
    onPress: () => Alert.alert('Card Pressed!'),
  },
};

// Highlighted variant
export const Highlighted: Story = {
  args: {
    title: 'Öne Çıkan Özellik',
    description: 'Bu hafta en popüler özelliğimiz',
    icon: 'Star',
    variant: 'highlighted',
    onPress: () => Alert.alert('Highlighted Pressed!'),
  },
};

// Premium variant
export const Premium: Story = {
  args: {
    title: 'Premium Özellik',
    description: 'Profesyonel analiz ve raporlama',
    icon: 'Crown',
    variant: 'premium',
    onPress: () => Alert.alert('Premium Pressed!'),
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    title: 'Yakında',
    description: 'Bu özellik çok yakında aktif olacak',
    icon: 'Lock',
    disabled: true,
    onPress: () => {},
  },
};

// Feature grid example
export const FeatureGrid: Story = {
  render: () => (
    <View style={styles.grid}>
      <FeatureCard
        title="Hızlı Analiz"
        description="AI destekli çizim analizi"
        icon="Sparkles"
        onPress={() => {}}
      />
      <FeatureCard
        title="Hikayeler"
        description="İnteraktif hikaye okuma"
        icon="BookOpen"
        onPress={() => {}}
      />
      <FeatureCard
        title="Boyama"
        description="Yaratıcı boyama aktiviteleri"
        icon="Palette"
        onPress={() => {}}
      />
      <FeatureCard
        title="Profil"
        description="Çocuk profili yönetimi"
        icon="User"
        onPress={() => {}}
      />
    </View>
  ),
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <View style={styles.column}>
      <FeatureCard
        title="Default"
        description="Standard feature card"
        icon="Box"
        onPress={() => {}}
      />
      <FeatureCard
        title="Highlighted"
        description="Emphasized feature card"
        icon="Star"
        variant="highlighted"
        onPress={() => {}}
      />
      <FeatureCard
        title="Premium"
        description="Premium feature card"
        icon="Crown"
        variant="premium"
        onPress={() => {}}
      />
      <FeatureCard
        title="Disabled"
        description="Disabled feature card"
        icon="Lock"
        disabled
        onPress={() => {}}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  column: {
    gap: 12,
  },
});
