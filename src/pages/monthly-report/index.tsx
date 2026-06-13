import React, { useMemo, useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatTime } from '@/utils';
import useAppStore from '@/store';

const MonthlyReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'annual'>('monthly');
  const getMonthlyReport = useAppStore((state) => state.getMonthlyReport);
  const exportMonthlyReportPDF = useAppStore((state) => state.exportMonthlyReportPDF);
  const readingRecords = useAppStore((state) => state.readingRecords);
  const notes = useAppStore((state) => state.notes);
  const books = useAppStore((state) => state.books);

  const report = useMemo(() => getMonthlyReport(), [getMonthlyReport]);

  const annualReport = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year + 1, 0, 1).getTime();

    const yearRecords = readingRecords.filter((r) => {
      const t = new Date(r.date).getTime();
      return t >= yearStart && t < yearEnd;
    });

    const totalReadingTime = yearRecords.reduce((sum, r) => sum + r.minutes, 0);
    const finishedBooks = books.filter(
      (b) => b.status === 'finished' && b.lastReadTime && b.lastReadTime >= yearStart && b.lastReadTime < yearEnd
    ).length;
    const totalNotes = notes.filter((n) => n.createTime >= yearStart && n.createTime < yearEnd).length;
    const totalActiveDays = yearRecords.filter((r) => r.minutes > 0).length;

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1).getTime();
      const monthEnd = new Date(year, i + 1, 1).getTime();
      const monthRecords = yearRecords.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= monthStart && t < monthEnd;
      });
      const monthMinutes = monthRecords.reduce((sum, r) => sum + r.minutes, 0);
      const monthFinished = books.filter(
        (b) => b.status === 'finished' && b.lastReadTime && b.lastReadTime >= monthStart && b.lastReadTime < monthEnd
      ).length;
      const monthNotes = notes.filter((n) => n.createTime >= monthStart && n.createTime < monthEnd).length;
      return { month: i + 1, minutes: monthMinutes, finished: monthFinished, notes: monthNotes };
    });

    const categoryMap: Record<string, number> = {};
    books.forEach((b) => {
      if (b.category) categoryMap[b.category] = (categoryMap[b.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return {
      year,
      totalReadingTime,
      totalBooks: books.length,
      finishedBooks,
      totalNotes,
      totalActiveDays,
      monthlyData,
      topCategories,
    };
  }, [readingRecords, books, notes]);

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
      if (activeTab === 'annual') {
        const now = new Date();
        const monthParam = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        await exportMonthlyReportPDF(monthParam);
      } else {
        await exportMonthlyReportPDF();
      }
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

  const annualMaxMinutes = Math.max(...annualReport.monthlyData.map((m) => m.minutes), 1);
  const annualTopMax = Math.max(...annualReport.topCategories.map((c) => c.count), 1);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'monthly' ? styles.tabItemActive : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <Text>月度报告</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'annual' ? styles.tabItemActive : ''}`}
          onClick={() => setActiveTab('annual')}
        >
          <Text>年度总结</Text>
        </View>
      </View>

      {activeTab === 'monthly' ? (
        <>
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
        </>
      ) : (
        <>
          <View className={styles.header}>
            <Text className={styles.month}>{annualReport.year}年度总结</Text>
            <Text className={styles.subtitle}>全年阅读数据一览</Text>

            <View className={styles.statsGrid}>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{formatTime(annualReport.totalReadingTime)}</Text>
                <Text className={styles.statLabel}>年度总时长</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{annualReport.finishedBooks}本</Text>
                <Text className={styles.statLabel}>读完本数</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{annualReport.totalNotes}</Text>
                <Text className={styles.statLabel}>笔记数</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{annualReport.totalActiveDays}天</Text>
                <Text className={styles.statLabel}>活跃天数</Text>
              </View>
            </View>
          </View>

          <View className={styles.content}>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>月度阅读趋势</Text>
              <View className={styles.chartSection}>
                <View className={styles.chartBars}>
                  {annualReport.monthlyData.map((m) => {
                    const height = annualMaxMinutes > 0 ? (m.minutes / annualMaxMinutes) * 100 : 0;
                    return (
                      <View key={m.month} className={styles.chartBar}>
                        <View
                          className={styles.chartBarFill}
                          style={{ height: `${height}%` }}
                        />
                      </View>
                    );
                  })}
                </View>
                <View className={styles.chartLabels}>
                  {annualReport.monthlyData.map((m) => (
                    <Text key={m.month} className={styles.chartLabel}>
                      {m.month}月
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>月度明细</Text>
              <View style={{ display: 'flex', padding: '12rpx 0', borderBottom: '1rpx solid #E5E6EB' }}>
                <Text style={{ flex: 1, fontSize: 24, color: '#86909C' }}>月份</Text>
                <Text style={{ flex: 1, fontSize: 24, color: '#86909C', textAlign: 'center' }}>时长</Text>
                <Text style={{ flex: 1, fontSize: 24, color: '#86909C', textAlign: 'center' }}>完本</Text>
                <Text style={{ flex: 1, fontSize: 24, color: '#86909C', textAlign: 'center' }}>笔记</Text>
              </View>
              {annualReport.monthlyData.map((m) => (
                <View key={m.month} style={{ display: 'flex', alignItems: 'center', padding: '16rpx 0', borderBottom: '1rpx solid #F2F3F5' }}>
                  <Text style={{ flex: 1, fontSize: 26, color: '#1D2129', fontWeight: 500 }}>{m.month}月</Text>
                  <Text style={{ flex: 1, fontSize: 26, color: '#4E5969', textAlign: 'center' }}>{formatTime(m.minutes)}</Text>
                  <Text style={{ flex: 1, fontSize: 26, color: '#4E5969', textAlign: 'center' }}>{m.finished}本</Text>
                  <Text style={{ flex: 1, fontSize: 26, color: '#4E5969', textAlign: 'center' }}>{m.notes}条</Text>
                </View>
              ))}
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>最常读分类 Top3</Text>
              <View className={styles.categoryList}>
                {annualReport.topCategories.map((cat, index) => (
                  <View key={index} className={styles.categoryItem}>
                    <Text className={styles.categoryName}>{cat.category}</Text>
                    <View className={styles.categoryBar}>
                      <View
                        className={styles.categoryFill}
                        style={{ width: `${(cat.count / annualTopMax) * 100}%` }}
                      />
                    </View>
                    <Text className={styles.categoryCount}>{cat.count}本</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      )}

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
