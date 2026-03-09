import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface CardSectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  hasBorder?: boolean;
}

const CardSection: React.FC<CardSectionProps> = ({ children, style, hasBorder = false }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.cardSection,
      hasBorder && styles.withBorder,
      { borderBottomColor: 'rgba(72, 72, 72, 0.2)' },
      style
    ]}>
      {children}
    </View>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> & { Section: typeof CardSection } = ({ children, style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.colors.bgSecondary },
      style
    ]}>
      {children}
    </View>
  );
};

Card.Section = CardSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Ensures borders don't go outside the card
  },
  cardSection: {
    padding: 15,
  },
  withBorder: {
    borderBottomWidth: 1,
  },
});

export default Card;
