import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockReadingRecords, mockBooks, mockNotes } from '@/data/books';
import { formatTime } from '@/utils';

const categories = [
  { name: '文学', count: 4, percent: 40 },
  { name: '历史', count: 2, percent: 20 },
  { name: '成长', count: 2, percent: 20 },
  { name: '心理', count: 1, percent: 10 },
  { name: '科幻', count: 1, percent: 10 },
];

const highlights = [
  { icon: '🏆', text: '本月最长单次阅读', value: '120分钟' },
  { icon: '📖', text: '本月读完书籍', value: '2本' },
  { icon: '✍️', text: '新增笔记数量', value: '5条' },
  { icon: '🔥', text: '连续阅读天数', value: '7天' },
];

const MonthlyReportPage: React.FC = () => {
  const totalMinutes = mockReadingRecords.reduce((sum, r) => sum + r.minutes, 0);
  const finishedBooks = mockBooks.filter((b) => b.status === 'finished').length;
  const readingDays = mockReadingRecords.filter((r) => r.minutes > 0).length;
  const completionRate = Math.round((readingDays / 30) * 100);

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleExport = () => {
    Taro.showLoading({ title: '生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '报告已生成', icon: 'success' });
      console.log('[MonthlyReport] 导出月度报告');
    }, 1500);
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const chartData = mockReadingRecords.slice(-28);
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes));

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.month}>6月阅读报告</Text>
        <Text className={styles.subtitle}>2024年6月1日 - 6月30日</Text>

        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{formatTime(totalMinutes)}</Text>
            <Text className={styles.statLabel}>总阅读时长</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{readingDays}天</Text>
            <Text className={styles.statLabel}>阅读天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{finishedBooks}本</Text>
            <Text className={styles.statLabel}>读完书籍</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{completionRate}%</Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>阅读趋势</Text>
          <View className={styles.chartSection}>
            <View className={styles.chartBars}>
              {chartData.map((day, index) => {
                const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                return (
                  <View key={index} className={styles.chartBar}>
                    <View
                      className={styles.chartBarFill}
                      style={{ height: `${height}%` }}
                    />
                  </View>
                );
              })}
            </View>
            <View className={styles.chartLabels}>
              {weekDays.map((day, i) => (
                <Text key={i} className={styles.chartLabel}>
                  {day}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>阅读分类</Text>
          <View className={styles.categoryList}>
            {categories.map((cat, index) => (
              <View key={index} className={styles.categoryItem}>
                <Text className={styles.categoryName}>{cat.name}</Text>
                <View className={styles.categoryBar}>
                  <View
                    className={styles.categoryFill}
                    style={{ width: `${cat.percent}%` }}
                  />
                </View>
                <Text className={styles.categoryCount}>{cat.count}本</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>本月亮点</Text>
          <View className={styles.highlights}>
            {highlights.map((item, index) => (
              <View key={index} className={styles.highlightItem}>
                <Text className={styles.highlightIcon}>{item.icon}</Text>
                <Text className={styles.highlightText}>{item.text}</Text>
                <Text className={styles.highlightValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>笔记统计</Text>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#4A7BFD' }}>{mockNotes.length}</Text>
              <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>总笔记数</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FF9A3C' }}>文字</Text>
              <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>笔记类型</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#00B42A' }}>3本</Text>
              <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>涉及书籍</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.shareBtn} onClick={handleShare}>
          分享报告
        </Button>
        <Button className={styles.exportBtn} onClick={handleExport}>
          导出PDF
        </Button>
      </View>
    </ScrollView>
  );
};

export default MonthlyReportPage;
