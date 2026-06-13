import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import BooklistCard from '@/components/BooklistCard';
import BookCard from '@/components/BookCard';
import { formatTime } from '@/utils';
import { Book, DailyPlan } from '@/types';
import useAppStore from '@/store';

const HomePage: React.FC = () => {
  const books = useAppStore((s) => s.books);
  const readingRecords = useAppStore((s) => s.readingRecords);
  const booklists = useAppStore((s) => s.booklists);
  const generateDailyPlans = useAppStore((s) => s.generateDailyPlans);
  const generateRecommendBooks = useAppStore((s) => s.generateRecommendBooks);

  const [todayPlans, setTodayPlans] = useState<DailyPlan[]>([]);
  const [recommendBooks, setRecommendBooks] = useState<Array<{ book: Book; reason: string }>>([]);

  const toRecommendItems = (raw: any): Array<{ book: Book; reason: string }> => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((item: any) => {
      if (item && item.book) return item as { book: Book; reason: string };
      return { book: item as Book, reason: '基于你的阅读偏好推荐' };
    });
  };

  useDidShow(() => {
    setTodayPlans(generateDailyPlans());
    setRecommendBooks(toRecommendItems(generateRecommendBooks()));
  });

  const readingBooks = books.filter((b) => b.status === 'reading');
  const totalReadingTime = readingRecords.reduce((sum, r) => sum + r.minutes, 0);
  const finishedBooks = books.filter((b) => b.status === 'finished').length;

  const activeDays = readingRecords.filter((r) => r.minutes > 0).length;
  const streakDays = activeDays > 0 ? activeDays : 0;

  const hotBooklists = [...booklists]
    .sort((a, b) => b.likes + b.collections * 2 - (a.likes + a.collections * 2))
    .slice(0, 3);

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
        } else {
          Taro.showToast({ title: '先去添加书籍吧', icon: 'none' });
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

  const handleRefreshRecommend = () => {
    setRecommendBooks(toRecommendItems(generateRecommendBooks()));
    Taro.showToast({ title: '已刷新', icon: 'none' });
  };

  const onPullDownRefresh = useCallback(() => {
    setTodayPlans(generateDailyPlans());
    setRecommendBooks(toRecommendItems(generateRecommendBooks()));
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  }, [generateDailyPlans, generateRecommendBooks]);

  const todayPlan = todayPlans[0];
  const todayBook = todayPlan ? books.find((b) => b.id === todayPlan.bookId) : readingBooks[0];

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
            <Text className={styles.statLabel}>活跃天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日阅读计划</Text>
            <Text className={styles.moreLink}>{todayPlans.length}项</Text>
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
                          (todayPlan.completedPages / Math.max(todayPlan.targetPages, 1)) * 100,
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
            <View className={styles.emptyState}>
              <Text style={{ fontSize: 60 }}>📚</Text>
              <Text style={{ marginTop: 16 }}>暂无阅读计划</Text>
              <Button
                className={styles.startReadBtn}
                style={{ marginTop: 20 }}
                onClick={() => handleQuickAction('add')}
              >
                去添加书籍
              </Button>
            </View>
          )}

          {todayPlans.length > 1 && (
            <View style={{ marginTop: 20 }}>
              {todayPlans.slice(1).map((plan) => {
                const bk = books.find((b) => b.id === plan.bookId);
                if (!bk) return null;
                return (
                  <View key={plan.bookId} style={{ display: 'flex', alignItems: 'center', padding: '16rpx 0', borderTop: '1rpx solid #f2f3f5' }}>
                    <Image src={bk.cover} style={{ width: 60, height: 80, borderRadius: 6 }} mode="aspectFill" />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={{ fontSize: 26, fontWeight: 500, color: '#1D2129' }}>{bk.title}</Text>
                      <Text style={{ fontSize: 22, color: '#86909C', marginTop: 4 }}>
                        目标 {plan.targetMinutes} 分钟 · 已完成 {plan.completedMinutes} 分钟
                      </Text>
                    </View>
                    <Button
                      className={styles.startReadBtn}
                      style={{ width: 120, height: 56, fontSize: 22 }}
                      onClick={() => handleStartRead(bk.id)}
                    >
                      阅读
                    </Button>
                  </View>
                );
              })}
            </View>
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
            <Text className={styles.moreLink} onClick={handleRefreshRecommend}>
              换一批 ↻
            </Text>
          </View>
          <View className={styles.recommendList}>
            {recommendBooks.map((item) => (
              <View key={item.book.id}>
                <BookCard book={item.book} type="horizontal" />
                <Text style={{ fontSize: 22, color: '#86909C', marginTop: 4, paddingLeft: 8 }}>{item.reason}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
