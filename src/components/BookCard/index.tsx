import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../Tag';
import { Book } from '@/types';
import { calculateReadingProgress } from '@/utils';

interface BookCardProps {
  book: Book;
  showProgress?: boolean;
  type?: 'horizontal' | 'vertical';
}

const BookCard: React.FC<BookCardProps> = ({ book, showProgress = true, type = 'horizontal' }) => {
  const progress = calculateReadingProgress(book.currentPage, book.totalPages);

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/book-detail/index?id=${book.id}`,
    });
  };

  if (type === 'vertical') {
    return (
      <View className={styles.verticalCard} onClick={handleClick}>
        <View className={styles.coverWrapper}>
          <Image className={styles.cover} src={book.cover} mode="aspectFill" />
          {showProgress && book.status === 'reading' && (
            <View className={styles.progressBarVertical}>
              <View
                className={styles.progressFillVertical}
                style={{ width: `${progress}%` }}
              />
            </View>
          )}
        </View>
        <View className={styles.infoVertical}>
          <Text className={styles.title}>{book.title}</Text>
          <Text className={styles.author}>{book.author}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.horizontalCard} onClick={handleClick}>
      <Image className={styles.coverH} src={book.cover} mode="aspectFill" />
      <View className={styles.info}>
        <Text className={styles.titleH}>{book.title}</Text>
        <Text className={styles.authorH}>{book.author}</Text>
        <View className={styles.tags}>
          {book.tags.slice(0, 2).map((tag) => (
            <Tag key={tag} text={tag} size="small" />
          ))}
        </View>
        {showProgress && book.status === 'reading' && (
          <View className={styles.progressSection}>
            <View className={styles.progressBar}>
              <View
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className={styles.progressText}>{progress}%</Text>
          </View>
        )}
        {book.status === 'finished' && (
          <View className={styles.finishedBadge}>
            <Tag text="已读完" type="success" size="small" />
          </View>
        )}
      </View>
    </View>
  );
};

export default BookCard;
