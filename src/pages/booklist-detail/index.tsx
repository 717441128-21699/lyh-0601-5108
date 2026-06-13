import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import BookCard from '@/components/BookCard';
import { mockBooklists } from '@/data/booklists';
import { mockBooks } from '@/data/books';
import { formatNumber, formatRelativeTime } from '@/utils';
import { Booklist, Book } from '@/types';

const BooklistDetailPage: React.FC = () => {
  const router = useRouter();
  const booklistId = router.params.id || '1';

  const [booklist, setBooklist] = useState<Booklist | undefined>(
    mockBooklists.find((b) => b.id === booklistId)
  );

  const [books, setBooks] = useState<Book[]>([]);

  useDidShow(() => {
    if (booklist) {
      const listBooks = booklist.books
        .map((id) => mockBooks.find((b) => b.id === id))
        .filter(Boolean) as Book[];
      setBooks(listBooks);
    }
  });

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleLike = () => {
    if (!booklist) return;
    setBooklist({
      ...booklist,
      isLiked: !booklist.isLiked,
      likes: booklist.isLiked ? booklist.likes - 1 : booklist.likes + 1,
    });
  };

  const handleCollect = () => {
    if (!booklist) return;
    setBooklist({
      ...booklist,
      isCollected: !booklist.isCollected,
      collections: booklist.isCollected ? booklist.collections - 1 : booklist.collections + 1,
    });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleAddToShelf = () => {
    Taro.showToast({ title: '已加入书架', icon: 'success' });
  };

  if (!booklist) {
    return (
      <View className={styles.page}>
        <Text>书单不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroSection}>
        <Image className={styles.coverBg} src={booklist.cover} mode="aspectFill" />
        <View className={styles.heroOverlay} />
        <View className={styles.navBar}>
          <Button className={styles.backBtn} onClick={handleBack}>
            ←
          </Button>
          <Button className={styles.shareBtn} onClick={handleShare}>
            ⋯
          </Button>
        </View>
        <View className={styles.heroContent}>
          <Text className={styles.title}>{booklist.title}</Text>
          <View className={styles.authorInfo}>
            <Image className={styles.avatar} src={booklist.authorAvatar} mode="aspectFill" />
            <Text className={styles.authorName}>{booklist.authorName}</Text>
            <Text className={styles.createTime}>
              {formatRelativeTime(booklist.createTime)}创建
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{booklist.bookCount}</Text>
            <Text className={styles.statLabel}>本书</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatNumber(booklist.likes)}</Text>
            <Text className={styles.statLabel}>点赞</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatNumber(booklist.collections)}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>书单简介</Text>
          <Text className={styles.description}>{booklist.description}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>书单标签</Text>
          <View className={styles.tags}>
            {booklist.tags.map((tag) => (
              <Tag key={tag} text={tag} size="medium" />
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>书单书籍</Text>
            <Text className={styles.sectionCount}>共 {booklist.bookCount} 本</Text>
          </View>
          <View className={styles.bookList}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} type="horizontal" />
            ))}
            {books.length === 0 && (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无书籍</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.actionBtns}>
          <Button
            className={styles.iconBtn}
            onClick={handleLike}
          >
            <Text className={booklist.isLiked ? styles.iconActive : styles.icon}>
              {booklist.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text className={styles.iconBtnText}>{formatNumber(booklist.likes)}</Text>
          </Button>
          <Button
            className={styles.iconBtn}
            onClick={handleCollect}
          >
            <Text className={booklist.isCollected ? styles.iconActive : styles.icon}>
              {booklist.isCollected ? '⭐' : '☆'}
            </Text>
            <Text className={styles.iconBtnText}>{formatNumber(booklist.collections)}</Text>
          </Button>
        </View>
        <Button className={styles.primaryBtn} onClick={handleAddToShelf}>
          加入书架
        </Button>
      </View>
    </ScrollView>
  );
};

export default BooklistDetailPage;
