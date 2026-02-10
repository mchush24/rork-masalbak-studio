// @ts-nocheck
/**
 * Input Stories
 *
 * Interactive documentation for the Input component
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Input label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    secureTextEntry: {
      control: 'boolean',
      description: 'Password input mode',
    },
  },
  parameters: {
    notes: `
# Input

A styled text input component with label, error states, and animations.

## Usage

\`\`\`tsx
import { Input } from '@/components/Input';

<Input
  label="E-posta"
  placeholder="ornek@email.com"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
/>
\`\`\`

## Features

- Floating label animation
- Error state with shake animation
- Password visibility toggle
- Accessibility support
- Focus state styling
    `,
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Interactive wrapper for controlled input
const ControlledInput = (props: React.ComponentProps<typeof Input>) => {
  const [value, setValue] = useState('');
  return <Input {...props} value={value} onChangeText={setValue} />;
};

// Default story
export const Default: Story = {
  render: args => <ControlledInput {...args} />,
  args: {
    label: 'E-posta',
    placeholder: 'ornek@email.com',
  },
};

// With error
export const WithError: Story = {
  render: args => <ControlledInput {...args} />,
  args: {
    label: 'E-posta',
    placeholder: 'ornek@email.com',
    error: 'Geçerli bir e-posta adresi girin',
  },
};

// Password input
export const Password: Story = {
  render: args => <ControlledInput {...args} />,
  args: {
    label: 'Şifre',
    placeholder: '••••••••',
    secureTextEntry: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    value: 'Disabled value',
    disabled: true,
  },
};

// With value
export const WithValue: Story = {
  args: {
    label: 'İsim',
    value: 'Ahmet Yılmaz',
  },
};

// Form example
function FormExampleRender() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  return (
    <View style={styles.form}>
      <Input label="Ad Soyad" placeholder="Adınızı girin" value={name} onChangeText={setName} />
      <Input
        label="E-posta"
        placeholder="ornek@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Şifre"
        placeholder="En az 6 karakter"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>
  );
}

export const FormExample: Story = {
  render: () => <FormExampleRender />,
};

// All states
export const AllStates: Story = {
  render: () => (
    <View style={styles.column}>
      <Input label="Normal" placeholder="Normal input" />
      <Input label="With Value" value="Some value" />
      <Input label="With Error" error="This field is required" />
      <Input label="Disabled" disabled value="Cannot edit" />
      <Input label="Password" secureTextEntry placeholder="••••••" />
    </View>
  ),
};

const styles = StyleSheet.create({
  column: {
    gap: 16,
  },
  form: {
    gap: 12,
  },
});
