import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import BooklistCard from '@/components/BooklistCard';
import BookCard from '@/components/BookCard';
import { mockBooks, mockDailyPlans, mockReadingRecords } from '@/data/books';
import { hotBooklists } from '@/data/booklists';
import { formatTime } from '@/utils';
import { Book, DailyPlan } from '@/types';

const HomePage: React.FC = () => {
  const [readingBooks, setReadingBooks] = useState<Book[]>(
    mockBooks.filter((b) => b.status === 'reading')
  );
  const [todayPlans, setTodayPlans] = useState<DailyPlan[]>(mockDailyPlans);
  const [recommendBooks] = useState<Book[]>(mockBooks.slice(0, 4));

  useDidShow(() => {
    console.log('[Home] 页面显示');
  });

  const totalReadingTime = mockReadingRecords.reduce((sum, r) => sum + r.minutes, 0);
  const finishedBooks = mockBooks.filter((b) => b.status === 'finished').length;
  const streakDays = 7;

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleStartRead = (bookId: string) => {
    Taro.navigateTo({ url: `/pages/reader/index?bookId=${bookId}` });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'read':
        if (readingBooks.length > 0) {
          Taro.navigateTo({ url: `/pages/reader/index?bookId=${readingBooks[0].id}` });
        }
        break;
      case 'add':
        Taro.navigateTo({ url: '/pages/add-book/index' });
        break;
      case 'challenge':
        Taro.navigateTo({ url: '/pages/challenge/index' });
        break;
      case 'report':
        Taro.navigateTo({ url: '/pages/monthly-report/index' });
        break;
    }
  };

  const handleMoreBooklists = () => {
    Taro.switchTab({ url: '/pages/community/index' });
  };

  const onPullDownRefresh = useCallback(() => {
    console.log('[Home] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const todayPlan = todayPlans[0];
  const todayBook = readingBooks[0];

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresherRefresh={onPullDownRefresh}
    >
      <View className={styles.header}>
        <View className={styles.greeting}>
          <View className={styles.greetingText}>
            <Text className={styles.greetingTitle}>早上好，读书人</Text>
            <Text className={styles.greetingSub}>今天也要坚持阅读哦～</Text>
          </View>
          <Button className={styles.searchBtn} onClick={handleSearch}>
            🔍
          </Button>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatTime(totalReadingTime)}</Text>
            <Text className={styles.statLabel}>累计阅读</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{finishedBooks}本</Text>
            <Text className={styles.statLabel}>已读完</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{streakDays}天</Text>
            <Text className={styles.statLabel}>连续阅读</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日阅读计划</Text>
            <Text className={styles.moreLink}>查看全部</Text>
          </View>

          {todayPlan && todayBook ? (
            <View className={styles.todayCard}>
              <Image className={styles.todayBookCover} src={todayBook.cover} mode="aspectFill" />
              <View className={styles.todayInfo}>
                <Text className={styles.todayLabel}>今日必读</Text>
                <Text className={styles.todayTitle}>{todayBook.title}</Text>
                <Text className={styles.todayAuthor}>{todayBook.author}</Text>
                <View className={styles.todayProgress}>
                  <View className={styles.progressRow}>
                    <Text className={styles.progressText}>
                      今日目标 {todayPlan.targetPages} 页
                    </Text>
                    <Text className={styles.progressValue}>
                      {todayPlan.completedPages}/{todayPlan.targetPages}
                    </Text>
                  </View>
                  <View className={styles.progressBar}>
                    <View
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(
                          (todayPlan.completedPages / todayPlan.targetPages) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </View>
                </View>
                <Button
                  className={styles.startReadBtn}
                  onClick={() => handleStartRead(todayBook.id)}
                >
                  开始阅读
                </Button>
              </View>
            </View>
          ) : (
            <View className={styles.emptyState}>暂无阅读计划，去添加一本书吧~</View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.quickGrid}>
            <View className={styles.quickItem} onClick={() => handleQuickAction('read')}>
              <View className={`${styles.quickIcon} ${styles.quickIcon1}`}>📖</View>
              <Text className={styles.quickLabel}>开始阅读</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleQuickAction('add')}>
              <View className={`${styles.quickIcon} ${styles.quickIcon2}`}>➕</View>
              <Text className={styles.quickLabel}>添加书籍</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleQuickAction('challenge')}>
              <View className={`${styles.quickIcon} ${styles.quickIcon3}`}>🏆</View>
              <Text className={styles.quickLabel}>阅读挑战</Text>
            </View>
            <View className={styles.quickItem} onClick={() => handleQuickAction('report')}>
              <View className={`${styles.quickIcon} ${styles.quickIcon4}`}>📊</View>
              <Text className={styles.quickLabel}>月度报告</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>热门书单</Text>
            <Text className={styles.moreLink} onClick={handleMoreBooklists}>
              更多 →
            </Text>
          </View>
          <ScrollView className={styles.booklistScroll} scrollX enhanced showScrollbar={false}>
            <View className={styles.booklistList}>
              {hotBooklists.map((booklist) => (
                <View key={booklist.id} className={styles.booklistItem}>
                  <BooklistCard booklist={booklist} type="large" />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>为你推荐</Text>
            <Text className={styles.moreLink}>换一批</Text>
          </View>
          <View className={styles.recommendList}>
            {recommendBooks.map((book) => (
              <BookCard key={book.id} book={book} type="horizontal" />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
