import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import ProgressRing from '@/components/ProgressRing';
import useAppStore from '@/store';
import { calculateReadingProgress, formatTime, formatRelativeTime } from '@/utils';
import { Book, Note } from '@/types';

type FilterType = 'all' | 'text' | 'image';

const BookDetailPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.id || '1';
  const [filterType, setFilterType] = useState<FilterType>('all');

  const { books, notes: allNotes, updateBook } = useAppStore((s) => ({
    books: s.books,
    notes: s.notes,
    updateBook: s.updateBook,
  }));

  const book = useMemo<Book | undefined>(() => books.find((b) => b.id === bookId), [books, bookId]);
  const notes = useMemo<Note[]>(() => {
    const filtered = allNotes.filter((n) => n.bookId === bookId);
    return [...filtered].sort((a, b) => b.createTime - a.createTime);
  }, [allNotes, bookId]);

  const filteredNotes = useMemo<Note[]>(() => {
    if (filterType === 'all') return notes;
    return notes.filter((n) => n.type === filterType);
  }, [notes, filterType]);

  const bookImageUrls = useMemo<string[]>(() => {
    return notes.filter((n) => n.type === 'image' && n.imageUrl).map((n) => n.imageUrl as string);
  }, [notes]);

  const handleRate = (rating: number) => {
    updateBook(bookId, { rating });
  };

  const handleEditReview = () => {
    const currentReview = (book as any)?.review || '';
    Taro.showModal({
      title: '编辑短评',
      editable: true,
      placeholderText: '写下你的读书感受...',
      content: currentReview,
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          updateBook(bookId, { rating: book?.rating || 0, review: res.content } as any);
        }
      },
    });
  };

  useDidShow(() => {
    console.log('[BookDetail] 页面显示，bookId:', bookId);
  });

  const progress = useMemo(() => {
    if (!book) return 0;
    return calculateReadingProgress(book.currentPage, book.totalPages);
  }, [book]);

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleStartRead = () => {
    Taro.navigateTo({ url: `/pages/reader/index?bookId=${bookId}` });
  };

  const handleAddNote = () => {
    Taro.showToast({ title: '添加笔记功能开发中', icon: 'none' });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  if (!book) {
    return (
      <View className={styles.page}>
        <Text>书籍不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerBg} />

      <View className={styles.navBar}>
        <Button className={styles.backBtn} onClick={handleBack}>
          ←
        </Button>
        <View className={styles.actionBtns}>
          <Button className={styles.actionBtn} onClick={handleShare}>
            ⋯
          </Button>
        </View>
      </View>

      <View className={styles.heroSection}>
        <Image className={styles.cover} src={book.cover} mode="aspectFill" />
        <Text className={styles.bookTitle}>{book.title}</Text>
        <Text className={styles.bookAuthor}>{book.author}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.progressSection}>
            <ProgressRing
              progress={progress}
              size={140}
              strokeWidth={10}
              text={`${progress}%`}
              subText="阅读进度"
            />
            <View className={styles.progressInfo}>
              <View className={styles.progressText}>
                <Text className={styles.progressLabel}>当前进度</Text>
                <Text className={styles.progressValue}>
                  {book.currentPage} / {book.totalPages} 页
                </Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </View>
              <View className={styles.progressText} style={{ marginTop: 16 }}>
                <Text className={styles.progressLabel}>累计阅读</Text>
                <Text className={styles.progressValue}>
                  {formatTime(book.totalReadingTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>书籍标签</Text>
          <View className={styles.tags}>
            <Tag text={book.category} type="primary" size="medium" />
            {book.tags.map((tag) => (
              <Tag key={tag} text={tag} size="medium" />
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>书籍信息</Text>
          <View className={styles.metaList}>
            {book.publisher && (
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>出版社</Text>
                <Text className={styles.metaValue}>{book.publisher}</Text>
              </View>
            )}
            {book.publishDate && (
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>出版日期</Text>
                <Text className={styles.metaValue}>{book.publishDate}</Text>
              </View>
            )}
            {book.isbn && (
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>ISBN</Text>
                <Text className={styles.metaValue}>{book.isbn}</Text>
              </View>
            )}
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>评分</Text>
              <View className={styles.ratingSection}>
                <View className={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      className={styles.starBtn}
                      onClick={() => handleRate(star)}
                    >
                      {star <= (book.rating || 0) ? '⭐' : '☆'}
                    </Button>
                  ))}
                </View>
              </View>
            </View>
            {(book as any).review && (
              <View className={styles.reviewText} onClick={handleEditReview}>
                <Text>{(book as any).review}</Text>
              </View>
            )}
            {!(book as any).review && (
              <View className={styles.reviewText} onClick={handleEditReview}>
                <Text style={{ color: '#C9CDD4' }}>点击添加短评...</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>内容简介</Text>
          <Text className={styles.description}>{book.description}</Text>
        </View>

        <View className={styles.section}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text className={styles.sectionTitle}>读书笔记</Text>
            <Text style={{ fontSize: 24, color: '#4A7BFD' }} onClick={handleAddNote}>
              + 添加笔记
            </Text>
          </View>
          <View className={styles.noteFilterTabs}>
            {(['all', 'text', 'image'] as FilterType[]).map((type) => (
              <Button
                key={type}
                className={`${styles.noteFilterTab} ${filterType === type ? styles.noteFilterTabActive : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? '全部' : type === 'text' ? '✏️ 文字' : '📷 拍照'}
              </Button>
            ))}
          </View>
          {filteredNotes.length > 0 ? (
            <View className={styles.notesList}>
              {filteredNotes.map((note) => (
                <View key={note.id} className={styles.noteItem}>
                  {note.type === 'image' && note.imageUrl ? (
                    <>
                      <Image
                        className={styles.noteImage}
                        src={note.imageUrl}
                        mode="widthFix"
                        onClick={() => {
                          Taro.previewImage({
                            urls: bookImageUrls,
                            current: note.imageUrl as string,
                          });
                        }}
                      />
                      {note.content && note.content !== '拍照笔记' ? (
                        <Text className={styles.noteContent}>{note.content}</Text>
                      ) : null}
                    </>
                  ) : (
                    <Text className={styles.noteContent}>{note.content}</Text>
                  )}
                  <View className={styles.noteMeta}>
                    <View style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Text className={styles.noteTypeTag}>
                        {note.type === 'image' ? '📷 拍照笔记' : '✏️ 文字笔记'}
                      </Text>
                      {note.pageNumber ? (
                        <Text className={styles.notePage}>第 {note.pageNumber} 页</Text>
                      ) : null}
                    </View>
                    <Text className={styles.noteTime}>
                      {formatRelativeTime(note.createTime)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ textAlign: 'center', color: '#86909C', padding: '40rpx 0' }}>
              暂无笔记，开始阅读后记录吧~
            </Text>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handleAddNote}>
          写笔记
        </Button>
        <Button className={styles.primaryBtn} onClick={handleStartRead}>
          {book.status === 'reading' ? '继续阅读' : '开始阅读'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default BookDetailPage;
