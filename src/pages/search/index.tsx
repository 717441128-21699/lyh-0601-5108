import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import BookCard from '@/components/BookCard';
import BooklistCard from '@/components/BooklistCard';
import { mockBooks } from '@/data/books';
import { mockBooklists } from '@/data/booklists';
import { Book, Booklist } from '@/types';

const hotKeywords = ['人类简史', '三体', '心理学', '成长', '科幻', '商业思维', '日本文学'];
const historyKeywords = ['原子习惯', '深度工作', '百年孤独'];

type SearchType = 'book' | 'booklist';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const initialType = (router.params.type as SearchType) || 'book';

  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [keyword, setKeyword] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(historyKeywords);
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [booklistResults, setBooklistResults] = useState<Booklist[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useDidShow(() => {
    console.log('[Search] 页面显示');
  });

  const handleSearch = () => {
    if (!keyword.trim()) return;

    const kw = keyword.trim().toLowerCase();

    const books = mockBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw) ||
        b.tags.some((t) => t.toLowerCase().includes(kw))
    );
    setBookResults(books);

    const booklists = mockBooklists.filter(
      (b) =>
        b.title.toLowerCase().includes(kw) ||
        b.description.toLowerCase().includes(kw) ||
        b.tags.some((t) => t.toLowerCase().includes(kw))
    );
    setBooklistResults(booklists);

    if (!searchHistory.includes(keyword.trim())) {
      const newHistory = [keyword.trim(), ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
    }

    setHasSearched(true);
  };

  const handleKeywordClick = (kw: string) => {
    setKeyword(kw);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([]);
        }
      },
    });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const renderEmptyState = () => (
    <View className={styles.emptyState}>
      <Text className={styles.emptyIcon}>🔍</Text>
      <Text className={styles.emptyText}>
        {hasSearched ? '没有找到相关内容' : '输入关键词开始搜索吧'}
      </Text>
    </View>
  );

  return (
    <View className={styles.page}>
      <View className={styles.searchHeader}>
        <Button className={styles.backBtn} onClick={handleBack}>
          ←
        </Button>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索书籍、书单..."
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
            autoFocus
          />
          {keyword && (
            <Button className={styles.clearBtn} onClick={() => setKeyword('')}>
              ×
            </Button>
          )}
        </View>
        <Button className={styles.searchBtn} onClick={handleSearch}>
          搜索
        </Button>
      </View>

      <View className={styles.typeTabs}>
        <View
          className={classnames(styles.typeTab, searchType === 'book' && styles.typeTabActive)}
          onClick={() => setSearchType('book')}
        >
          <Text>书籍</Text>
        </View>
        <View
          className={classnames(styles.typeTab, searchType === 'booklist' && styles.typeTabActive)}
          onClick={() => setSearchType('booklist')}
        >
          <Text>书单</Text>
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {!hasSearched && (
          <View>
            {searchHistory.length > 0 && (
              <View className={styles.section}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>搜索历史</Text>
                  <Button className={styles.clearHistoryBtn} onClick={handleClearHistory}>
                    清空
                  </Button>
                </View>
                <View className={styles.keywordList}>
                  {searchHistory.map((kw) => (
                    <View
                      key={kw}
                      className={styles.keywordTag}
                      onClick={() => handleKeywordClick(kw)}
                    >
                      <Text>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>热门搜索</Text>
              <View className={styles.keywordList}>
                {hotKeywords.map((kw, index) => (
                  <View
                    key={kw}
                    className={styles.keywordTag}
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {index < 3 && <Text className={styles.hotRank}>{index + 1}</Text>}
                    <Text>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {hasSearched && searchType === 'book' && (
          <View className={styles.resultsSection}>
            {bookResults.length > 0 ? (
              <View className={styles.resultList}>
                {bookResults.map((book) => (
                  <BookCard key={book.id} book={book} type="horizontal" />
                ))}
              </View>
            ) : (
              renderEmptyState()
            )}
          </View>
        )}

        {hasSearched && searchType === 'booklist' && (
          <View className={styles.resultsSection}>
            {booklistResults.length > 0 ? (
              <View className={styles.resultList}>
                {booklistResults.map((booklist) => (
                  <BooklistCard key={booklist.id} booklist={booklist} type="large" />
                ))}
              </View>
            ) : (
              renderEmptyState()
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchPage;
