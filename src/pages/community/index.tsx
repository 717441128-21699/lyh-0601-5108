import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import BooklistCard from '@/components/BooklistCard';
import { formatNumber } from '@/utils';
import useAppStore from '@/store';

const tags = ['全部', '认知升级', '成长', '文学', '科幻', '商业', '心理学', '历史'];

const CommunityPage: React.FC = () => {
  const [activeTag, setActiveTag] = useState('全部');
  const booklists = useAppStore((state) => state.booklists);

  const hotBooklists = useMemo(() => {
    return [...booklists]
      .sort((a, b) => (b.likes + b.collections) - (a.likes + a.collections))
      .slice(0, 3);
  }, [booklists]);

  const filteredBooklists = useMemo(() => {
    if (activeTag === '全部') return booklists;
    return booklists.filter((bl) => bl.tags.includes(activeTag));
  }, [booklists, activeTag]);

  useDidShow(() => {
    console.log('[Community] 页面显示');
  });

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index?type=booklist' });
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/create-booklist/index' });
  };

  const handleBooklistClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/booklist-detail/index?id=${id}` });
  };

  return (
    <ScrollView className={styles.page} scrollY enableBackToTop>
      <View className={styles.header}>
        <Text className={styles.title}>书单社区</Text>
        <Button className={styles.iconBtn} onClick={handleSearch}>
          🔍
        </Button>
      </View>

      <View className={styles.hotSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🔥 热门榜单</Text>
          <Text className={styles.moreLink}>查看更多</Text>
        </View>
        <ScrollView className={styles.hotScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.hotList}>
            {hotBooklists.map((booklist, index) => (
              <View
                key={booklist.id}
                className={styles.hotItem}
                onClick={() => handleBooklistClick(booklist.id)}
              >
                <View className={styles.hotRank}>{index + 1}</View>
                <View className={styles.hotCard}>
                  <Image className={styles.hotCover} src={booklist.cover} mode="aspectFill" />
                  <View className={styles.hotOverlay}>
                    <Text className={styles.hotTitle}>{booklist.title}</Text>
                    <Text className={styles.hotMeta}>
                      ❤ {formatNumber(booklist.likes)} · {booklist.bookCount}本书
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.tagSection}>
        <ScrollView className={styles.tagScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.tagList}>
            {tags.map((tag) => (
              <View
                key={tag}
                className={classnames(styles.tagItem, activeTag === tag && styles.activeTag)}
                onClick={() => setActiveTag(tag)}
              >
                <Text>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.booklistSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>精选书单</Text>
        </View>
        <View className={styles.booklistList}>
          {filteredBooklists.map((booklist) => (
            <BooklistCard key={booklist.id} booklist={booklist} type="large" />
          ))}
        </View>
      </View>

      <Button className={styles.createBtn} onClick={handleCreate}>
        ✏️ 创建书单
      </Button>
    </ScrollView>
  );
};

export default CommunityPage;
