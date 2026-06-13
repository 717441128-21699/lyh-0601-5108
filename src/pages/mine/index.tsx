import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { formatTime } from '@/utils';
import useAppStore from '@/store';

const menuItems = [
  { icon: '📊', label: '月度报告', type: 'menuIcon1', action: 'monthly-report' },
  { icon: '🏆', label: '我的勋章', type: 'menuIcon2', action: 'medal' },
  { icon: '⚔️', label: '阅读挑战', type: 'menuIcon3', action: 'challenge' },
  { icon: '📚', label: '我的书单', type: 'menuIcon4', action: 'booklist' },
  { icon: '✍️', label: '我的笔记', type: 'menuIcon5', action: 'notes' },
  { icon: '👥', label: '我的好友', type: 'menuIcon6', action: 'friends' },
  { icon: '🔔', label: '消息通知', type: 'menuIcon7', action: 'notification' },
  { icon: '⚙️', label: '设置', type: 'menuIcon8', action: 'setting' },
];

const settingItems = [
  { icon: '📖', label: '阅读偏好设置' },
  { icon: '🎨', label: '主题设置' },
  { icon: '📱', label: '关于我们' },
  { icon: '💬', label: '意见反馈' },
];

const MinePage: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const books = useAppStore((state) => state.books);
  const notes = useAppStore((state) => state.notes);
  const medals = useAppStore((state) => state.medals);
  const readingRecords = useAppStore((state) => state.readingRecords);

  useDidShow(() => {
    console.log('[Mine] 页面显示');
  });

  const stats = useMemo(() => {
    const totalReadingTime = readingRecords.reduce((sum, r) => sum + r.minutes, 0);
    const finishedCount = books.filter((b) => b.status === 'finished').length;
    const readingCount = books.filter((b) => b.status === 'reading').length;
    return {
      totalReadingTime: user.totalReadingTime || totalReadingTime,
      bookCount: user.bookCount || books.length,
      finishedCount,
      readingCount,
    };
  }, [user, books, readingRecords]);

  const totalReadingTime = stats.totalReadingTime;
  const bookCount = stats.bookCount;
  const noteCount = notes.length;
  const obtainedMedals = medals.filter((m) => m.isObtained);

  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'monthly-report':
        Taro.navigateTo({ url: '/pages/monthly-report/index' });
        break;
      case 'challenge':
        Taro.navigateTo({ url: '/pages/challenge/index' });
        break;
      case 'booklist':
        Taro.showToast({ title: '我的书单', icon: 'none' });
        break;
      case 'medal':
        Taro.showToast({ title: '勋章墙', icon: 'none' });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleItemClick = (label: string) => {
    Taro.showToast({ title: `${label}功能开发中`, icon: 'none' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.profile}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode="aspectFill"
          />
          <View className={styles.profileInfo}>
            <Text className={styles.nickname}>{user.name}</Text>
            <View className={styles.levelBadge}>
              <Text className={styles.levelIcon}>⭐</Text>
              <Text className={styles.levelText}>Lv.{user.level} 阅读达人</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatTime(totalReadingTime)}</Text>
            <Text className={styles.statLabel}>累计阅读</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{bookCount}</Text>
            <Text className={styles.statLabel}>书籍总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{noteCount}</Text>
            <Text className={styles.statLabel}>笔记数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.menuGrid}>
            {menuItems.map((item) => (
              <View
                key={item.action}
                className={styles.menuItem}
                onClick={() => handleMenuClick(item.action)}
              >
                <View className={`${styles.menuIcon} ${styles[item.type]}`}>{item.icon}</View>
                <Text className={styles.menuLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的勋章</Text>
            <Text className={styles.moreLink} onClick={() => handleMenuClick('medal')}>
              全部 ({obtainedMedals.length}/{medals.length})
            </Text>
          </View>
          <ScrollView className={styles.medalScroll} scrollX enhanced showScrollbar={false}>
            <View className={styles.medalList}>
              {medals.map((medal) => (
                <View key={medal.id} className={styles.medalItem}>
                  <Text
                    className={`${styles.medalIcon} ${!medal.isObtained && styles.medalLocked}`}
                  >
                    {medal.icon}
                  </Text>
                  <Text className={styles.medalName}>{medal.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>更多设置</Text>
          </View>
          <View className={styles.listCard}>
            {settingItems.map((item, index) => (
              <View
                key={index}
                className={styles.listItem}
                onClick={() => handleItemClick(item.label)}
              >
                <View className={styles.listItemLeft}>
                  <Text className={styles.listItemIcon}>{item.icon}</Text>
                  <Text className={styles.listItemText}>{item.label}</Text>
                </View>
                <Text className={styles.listItemArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
