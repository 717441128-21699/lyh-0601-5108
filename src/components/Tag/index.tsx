import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'accent' | 'success';
  size?: 'small' | 'medium';
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({ text, type = 'default', size = 'small', onClick }) => {
  return (
    <View className={classnames(styles.tag, styles[type], styles[size])} onClick={onClick}>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default Tag;
