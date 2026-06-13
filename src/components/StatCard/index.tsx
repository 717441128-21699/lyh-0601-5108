import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, accent = false }) => {
  return (
    <View className={styles.card}>
      <Text className={`${styles.value} ${accent ? styles.accent : ''}`}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
