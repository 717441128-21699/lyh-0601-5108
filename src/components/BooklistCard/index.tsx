import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../Tag';
import { Booklist } from '@/types';
import { formatNumber } from '@/utils';

interface BooklistCardProps {
  booklist: Booklist;
  type?: 'large' | 'small';
}

const BooklistCard: React.FC<BooklistCardProps> = ({ booklist, type = 'large' }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/booklist-detail/index?id=${booklist.id}`,
    });
  };

  if (type === 'small') {
    return (
      <View className={styles.smallCard} onClick={handleClick}>
        <Image className={styles.smallCover} src={booklist.cover} mode="aspectFill" />
        <View className={styles.smallInfo}>
          <Text className={styles.smallTitle}>{booklist.title}</Text>
          <Text className={styles.smallMeta}>{booklist.bookCount}本书 · {formatNumber(booklist.likes)}赞</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.cover} src={booklist.cover} mode="aspectFill" />
      <View className={styles.content}>
        <Text className={styles.title}>{booklist.title}</Text>
        <Text className={styles.description}>{booklist.description}</Text>
        <View className={styles.tags}>
          {booklist.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} text={tag} type="primary" size="small" />
          ))}
        </View>
        <View className={styles.footer}>
          <View className={styles.author}>
            <Image className={styles.avatar} src={booklist.authorAvatar} mode="aspectFill" />
            <Text className={styles.authorName}>{booklist.authorName}</Text>
          </View>
          <View className={styles.stats}>
            <Text className={styles.statItem}>❤ {formatNumber(booklist.likes)}</Text>
            <Text className={styles.statItem}>⭐ {formatNumber(booklist.collections)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BooklistCard;
