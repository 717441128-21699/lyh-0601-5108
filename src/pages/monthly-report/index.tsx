import React, { useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatTime } from '@/utils';
import useAppStore from '@/store';

const MonthlyReportPage: React.FC = () => {
  const getMonthlyReport = useAppStore((state) => state.getMonthlyReport);
  const exportMonthlyReportPDF = useAppStore((state) => state.exportMonthlyReportPDF);
  const readingRecords = useAppStore((state) => state.readingRecords);
  const notes = useAppStore((state) => state.notes);
  const books = useAppStore((state) => state.books);

  const report = useMemo(() => getMonthlyReport(), [getMonthlyReport]);

  const categories = useMemo(() => {
    const maxCount = Math.max(...report.categories.map((c) => c.count), 1);
    return report.categories.map((c) => ({
      name: c.category,
      count: c.count,
      percent: Math.round((c.count / maxCount) * 100),
    }));
  }, [report.categories]);

  const highlights = useMemo(() => [
    { icon: '🏆', text: '日均阅读时长', value: `${report.dailyAverage}分钟` },
    { icon: '📖', text: '本月读完书籍', value: `${report.finishedBooks}本` },
    { icon: '✍️', text: '新增笔记数量', value: `${report.noteCount}条` },
    { icon: '🔥', text: '完成率', value: `${report.completionRate}%` },
  ], [report]);

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleExport = async () => {
    Taro.showLoading({ title: '生成中...' });
    try {
      await exportMonthlyReportPDF();
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: '导出失败，请重试', icon: 'none' });
    }
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const chartData = readingRecords.slice(-28);
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 1);

  const totalMinutes = report.totalReadingTime;
  const finishedBooks = report.finishedBooks;
  const noteCount = report.noteCount;
  const completionRate = report.completionRate;
  const readingDays = Math.round((report.completionRate / 100) * new Date().getDate());

  const now = new Date();
  const monthStr = report.month;
  const [year, month] = monthStr.split('-');

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.month}>{parseInt(month, 10)}月阅读报告</Text>
        <Text className={styles.subtitle}>{year}年{month}月1日 - {month}月{new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate()}日</Text>

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
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#4A7BFD' }}>{noteCount}</Text>
              <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>总笔记数</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FF9A3C' }}>文字</Text>
              <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>笔记类型</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#00B42A' }}>{report.bookCount}本</Text>
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
