import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { Book } from '@/types';

type AddMode = 'search' | 'manual';

const categories = ['文学', '历史', '科幻', '成长', '心理', '商业', '小说', '其他'];
const defaultTags = ['经典', '必读', '推荐', '治愈', '思维', '认知'];

const AddBookPage: React.FC = () => {
  const books = useAppStore((state) => state.books);
  const addBook = useAppStore((state) => state.addBook);
  const generateRecommendBooks = useAppStore((state) => state.generateRecommendBooks);

  const [mode, setMode] = useState<AddMode>('search');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const recommendBooks = useMemo(() => generateRecommendBooks(), [generateRecommendBooks]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    category: '',
    totalPages: '',
    description: '',
    isbn: '',
    publisher: '',
    publishDate: '',
    tags: [] as string[],
  });

  useDidShow(() => {
    console.log('[AddBook] 页面显示');
  });

  const handleSearch = () => {
    if (!keyword.trim()) return;

    const kw = keyword.trim().toLowerCase();
    const existingTitles = new Set(books.map((b) => b.title));
    const allSearchable = [...books, ...recommendBooks];
    const seen = new Set<string>();
    const results: Book[] = [];
    for (const b of allSearchable) {
      if (seen.has(b.title)) continue;
      const matches =
        b.title.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw) ||
        (b.isbn && b.isbn.includes(kw));
      if (matches) {
        seen.add(b.title);
        results.push(b);
      }
    }
    setSearchResults(results.filter((b) => !existingTitles.has(b.title)));
    setHasSearched(true);
  };

  const handleAddBook = (book: Book) => {
    Taro.showModal({
      title: '添加书籍',
      content: `确定要将《${book.title}》添加到书架吗？`,
      success: (res) => {
        if (res.confirm) {
          addBook({
            title: book.title,
            author: book.author,
            cover: book.cover,
            category: book.category,
            tags: book.tags,
            totalPages: book.totalPages,
            description: book.description,
            isbn: book.isbn,
            publisher: book.publisher,
            publishDate: book.publishDate,
            rating: book.rating,
          });
          Taro.showToast({ title: '已添加到书架', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      },
    });
  };

  const handleAddFromRecommend = (book: Book) => {
    addBook({
      title: book.title,
      author: book.author,
      cover: book.cover,
      category: book.category,
      tags: book.tags,
      totalPages: book.totalPages,
      description: book.description,
      isbn: book.isbn,
      publisher: book.publisher,
      publishDate: book.publishDate,
      rating: book.rating,
    });
    Taro.showToast({ title: '已添加到书架', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (cat: string) => {
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      }
      if (prev.tags.length < 5) {
        return { ...prev, tags: [...prev.tags, tag] };
      }
      Taro.showToast({ title: '最多选择5个标签', icon: 'none' });
      return prev;
    });
  };

  const handleCoverUpload = () => {
    Taro.showToast({ title: '上传封面功能开发中', icon: 'none' });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入书名', icon: 'none' });
      return;
    }
    if (!formData.author.trim()) {
      Taro.showToast({ title: '请输入作者', icon: 'none' });
      return;
    }
    addBook({
      title: formData.title,
      author: formData.author,
      cover: formData.cover || undefined,
      category: formData.category || undefined,
      totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
      description: formData.description || undefined,
      isbn: formData.isbn || undefined,
      publisher: formData.publisher || undefined,
      publishDate: formData.publishDate || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });
    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.modeTabs}>
        <View
          className={classnames(styles.modeTab, mode === 'search' && styles.modeTabActive)}
          onClick={() => setMode('search')}
        >
          <Text className={styles.modeIcon}>🔍</Text>
          <Text>搜索添加</Text>
        </View>
        <View
          className={classnames(styles.modeTab, mode === 'manual' && styles.modeTabActive)}
          onClick={() => setMode('manual')}
        >
          <Text className={styles.modeIcon}>✏️</Text>
          <Text>手动录入</Text>
        </View>
      </View>

      {mode === 'search' && (
        <ScrollView className={styles.content} scrollY>
          <View className={styles.searchSection}>
            <View className={styles.searchBox}>
              <Text className={styles.searchIcon}>🔍</Text>
              <Input
                className={styles.searchInput}
                placeholder="搜索书名、作者或ISBN"
                value={keyword}
                onInput={(e) => setKeyword(e.detail.value)}
                onConfirm={handleSearch}
                confirmType="search"
              />
            </View>
            <Button className={styles.searchBtn} onClick={handleSearch}>
              搜索
            </Button>
          </View>

          {!hasSearched && (
            <View className={styles.searchTips}>
              <Text className={styles.tipsTitle}>快捷添加</Text>
              <View className={styles.recommendList}>
                {recommendBooks.map((book) => (
                  <View key={book.id} className={styles.recommendItem}>
                    <Image
                      className={styles.recommendCover}
                      src={book.cover}
                      mode="aspectFill"
                    />
                    <Text className={styles.recommendTitle}>{book.title}</Text>
                    <Button
                      className={styles.addBtn}
                      onClick={() => handleAddFromRecommend(book)}
                    >
                      + 添加
                    </Button>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hasSearched && (
            <View className={styles.resultsSection}>
              <Text className={styles.resultsTitle}>
                搜索结果（{searchResults.length}）
              </Text>
              {searchResults.length > 0 ? (
                <View className={styles.resultList}>
                  {searchResults.map((book) => (
                    <View key={book.id} className={styles.resultItem}>
                      <Image
                        className={styles.resultCover}
                        src={book.cover}
                        mode="aspectFill"
                      />
                      <View className={styles.resultInfo}>
                        <Text className={styles.resultTitle}>{book.title}</Text>
                        <Text className={styles.resultAuthor}>{book.author}</Text>
                        {book.publisher && (
                          <Text className={styles.resultMeta}>{book.publisher}</Text>
                        )}
                        <View className={styles.resultTags}>
                          <Text className={styles.resultTag}>{book.category}</Text>
                          {book.rating && (
                            <Text className={styles.resultRating}>⭐ {book.rating}</Text>
                          )}
                        </View>
                      </View>
                      <Button
                        className={styles.addBtn}
                        onClick={() => handleAddBook(book)}
                      >
                        + 添加
                      </Button>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>📚</Text>
                  <Text className={styles.emptyText}>没有找到相关书籍</Text>
                  <Text className={styles.emptyHint}>试试手动录入吧~</Text>
                  <Button
                    className={styles.manualBtn}
                    onClick={() => setMode('manual')}
                  >
                    手动录入
                  </Button>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {mode === 'manual' && (
        <ScrollView className={styles.content} scrollY>
          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>书籍封面</Text>
            </View>
            <View className={styles.coverUpload} onClick={handleCoverUpload}>
              <View className={styles.coverPlaceholder}>
                <Text className={styles.coverIcon}>📷</Text>
                <Text className={styles.coverText}>上传封面</Text>
              </View>
            </View>
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>书名</Text>
              <Text className={styles.required}>*</Text>
            </View>
            <Input
              className={styles.input}
              placeholder="请输入书名"
              value={formData.title}
              onInput={(e) => handleInputChange('title', e.detail.value)}
            />
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>作者</Text>
              <Text className={styles.required}>*</Text>
            </View>
            <Input
              className={styles.input}
              placeholder="请输入作者名"
              value={formData.author}
              onInput={(e) => handleInputChange('author', e.detail.value)}
            />
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>分类</Text>
            </View>
            <View className={styles.categoryList}>
              {categories.map((cat) => (
                <View
                  key={cat}
                  className={classnames(
                    styles.categoryItem,
                    formData.category === cat && styles.categoryItemActive
                  )}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <Text>{cat}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>总页数</Text>
            </View>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入总页数"
              value={formData.totalPages}
              onInput={(e) => handleInputChange('totalPages', e.detail.value)}
            />
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>标签</Text>
              <Text className={styles.hint}>(最多5个)</Text>
            </View>
            <View className={styles.tagList}>
              {defaultTags.map((tag) => (
                <View
                  key={tag}
                  className={classnames(
                    styles.tagItem,
                    formData.tags.includes(tag) && styles.tagItemActive
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>简介</Text>
            </View>
            <Textarea
              className={styles.textarea}
              placeholder="输入书籍简介..."
              value={formData.description}
              onInput={(e) => handleInputChange('description', e.detail.value)}
              maxlength={500}
              autoHeight
            />
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>更多信息</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>ISBN</Text>
              <Input
                className={styles.infoInput}
                placeholder="选填"
                value={formData.isbn}
                onInput={(e) => handleInputChange('isbn', e.detail.value)}
              />
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>出版社</Text>
              <Input
                className={styles.infoInput}
                placeholder="选填"
                value={formData.publisher}
                onInput={(e) => handleInputChange('publisher', e.detail.value)}
              />
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>出版日期</Text>
              <Input
                className={styles.infoInput}
                placeholder="选填，如 2024-01"
                value={formData.publishDate}
                onInput={(e) => handleInputChange('publishDate', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.bottomSpace} />
        </ScrollView>
      )}

      {mode === 'manual' && (
        <View className={styles.bottomBar}>
          <Button className={styles.submitBtn} onClick={handleSubmit}>
            添加到书架
          </Button>
        </View>
      )}
    </View>
  );
};

export default AddBookPage;
