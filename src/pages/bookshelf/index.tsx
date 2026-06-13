import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { calculateReadingProgress } from '@/utils';
import { Book } from '@/types';

const BookshelfPage: React.FC = () => {
  const books = useAppStore((state) => state.books);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats: { key: string; label: string }[] = [{ key: 'all', label: '全部' }];
    const uniqueCategories = Array.from(new Set(books.map((b) => b.category))).filter(Boolean);
    uniqueCategories.forEach((cat) => {
      cats.push({ key: cat, label: cat });
    });
    return cats;
  }, [books]);

  useDidShow(() => {
    console.log('[Bookshelf] 页面显示');
  });

  const filteredBooks = useMemo(() => {
    if (activeCategory === 'all') return books;
    return books.filter((book) => book.category === activeCategory);
  }, [books, activeCategory]);

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index?type=book' });
  };

  const handleAddBook = () => {
    Taro.navigateTo({ url: '/pages/add-book/index' });
  };

  const handleBookClick = (bookId: string) => {
    Taro.navigateTo({ url: `/pages/book-detail/index?id=${bookId}` });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reading':
        return '在读';
      case 'finished':
        return '已读完';
      case 'wish':
        return '想读';
      default:
        return '';
    }
  };

  return (
    <ScrollView className={styles.page} scrollY enableBackToTop>
      <View className={styles.header}>
        <Text className={styles.title}>我的书架</Text>
        <View className={styles.headerActions}>
          <Button className={styles.iconBtn} onClick={handleSearch}>
            🔍
          </Button>
        </View>
      </View>

      <ScrollView className={styles.categoryTabs} scrollX showScrollbar={false} enhanced>
        {categories.map((cat) => (
          <View
            key={cat.key}
            className={classnames(styles.tabItem, activeCategory === cat.key && styles.activeTab)}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {filteredBooks.length > 0 ? (
        <View className={styles.bookGrid}>
          {filteredBooks.map((book) => {
            const progress = calculateReadingProgress(book.currentPage, book.totalPages);
            return (
              <View
                key={book.id}
                className={styles.bookItem}
                onClick={() => handleBookClick(book.id)}
              >
                <View className={styles.coverWrapper}>
                  <Image className={styles.cover} src={book.cover} mode="aspectFill" />
                  {book.status === 'reading' && (
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  )}
                  <View className={styles.statusBadge}>{getStatusText(book.status)}</View>
                </View>
                <View className={styles.bookInfo}>
                  <Text className={styles.bookTitle}>{book.title}</Text>
                  <Text className={styles.bookAuthor}>{book.author}</Text>
                  {book.status === 'reading' && (
                    <Text className={styles.bookProgress}>{progress}% 已读</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📚</Text>
          <Text className={styles.emptyText}>这里还没有书，快去添加吧~</Text>
          <Button className={styles.emptyBtn} onClick={handleAddBook}>
            添加书籍
          </Button>
        </View>
      )}

      <Button className={styles.addBtn} onClick={handleAddBook}>
        +
      </Button>
    </ScrollView>
  );
};

export default BookshelfPage;
