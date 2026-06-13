import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow, useDidHide } from '@tarojs/taro';
import styles from './index.module.scss';
import useAppStore from '@/store';
import { calculateReadingProgress, formatTime } from '@/utils';
import { Book, Note } from '@/types';

const ReaderPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.bookId || '1';

  const { books, notes: allNotes, addReadingRecord, addNote } = useAppStore((s) => ({
    books: s.books,
    notes: s.notes,
    addReadingRecord: s.addReadingRecord,
    addNote: s.addNote,
  }));

  const book = useMemo<Book | undefined>(() => books.find((b) => b.id === bookId), [books, bookId]);
  const notes = useMemo<Note[]>(
    () => allNotes.filter((n) => n.bookId === bookId).slice(0, 3),
    [allNotes, bookId]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [notePage, setNotePage] = useState('');

  useDidShow(() => {
    console.log('[Reader] 页面显示，bookId:', bookId);
    if (!isRunning) {
      Taro.setKeepScreenOn({ keepScreenOn: true });
    }
  });

  useDidHide(() => {
    console.log('[Reader] 页面隐藏');
  });

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000) as unknown as number;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const progress = book ? calculateReadingProgress(book.currentPage, book.totalPages) : 0;

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (isRunning) {
      Taro.showModal({
        title: '提示',
        content: '阅读还在进行中，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack();
          }
        },
      });
    } else {
      Taro.navigateBack();
    }
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    console.log('[Reader] 计时切换:', !isRunning);
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置计时',
      content: '确定要重置本次阅读计时吗？',
      success: (res) => {
        if (res.confirm) {
          setElapsedSeconds(0);
          setIsRunning(false);
          console.log('[Reader] 重置计时');
        }
      },
    });
  };

  const askForNewPage = (): Promise<number | undefined> => {
    return new Promise((resolve) => {
      const defaultPage = book?.currentPage || 0;
      Taro.showModal({
        title: '更新阅读进度',
        content: `请输入当前读到的页码（当前：${defaultPage} / ${book?.totalPages || 0}）\n留空则不更新进度`,
        editable: true,
        placeholderText: String(defaultPage),
        success: (res) => {
          if (res.confirm) {
            const input = res.content?.trim();
            if (input && !isNaN(Number(input))) {
              const page = parseInt(input, 10);
              resolve(Math.max(0, page));
            } else {
              resolve(undefined);
            }
          } else {
            resolve(undefined);
          }
        },
        fail: () => resolve(undefined),
      });
    });
  };

  const handleFinish = async () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 1) {
      Taro.showToast({ title: '阅读时间太短啦~', icon: 'none' });
      return;
    }

    const confirmRes = await Taro.showModal({
      title: '结束阅读',
      content: `本次阅读 ${formatTime(minutes)}，确定结束吗？`,
    }).catch(() => ({ confirm: false }));

    if (!confirmRes.confirm) return;

    setIsRunning(false);

    const newPage = await askForNewPage();

    addReadingRecord(bookId, minutes, newPage);

    Taro.showToast({
      title: `已记录 ${formatTime(minutes)}`,
      icon: 'success',
    });
    console.log('[Reader] 结束阅读，时长:', minutes, '分钟, 新页码:', newPage);
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleAddTextNote = () => {
    setShowNoteModal(true);
  };

  const handlePhotoNote = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const imageUrl = res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path;
        addNote({
          bookId,
          content: '拍照笔记',
          type: 'image',
          imageUrl,
        });
        Taro.showToast({ title: '拍照笔记已保存', icon: 'success' });
        console.log('[Reader] 添加拍照笔记');
      },
      fail: (err) => {
        console.error('[Reader] 选择图片失败:', err);
      },
    });
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      Taro.showToast({ title: '请输入笔记内容', icon: 'none' });
      return;
    }

    addNote({
      bookId,
      content: noteContent,
      type: 'text',
      pageNumber: notePage ? parseInt(notePage) : undefined,
    });

    setShowNoteModal(false);
    setNoteContent('');
    setNotePage('');
    Taro.showToast({ title: '笔记已保存', icon: 'success' });
    console.log('[Reader] 保存笔记');
  };

  if (!book) {
    return (
      <View className={styles.page}>
        <Text>书籍不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.navBar}>
        <Button className={styles.backBtn} onClick={handleBack}>
          ←
        </Button>
        <Text className={styles.pageTitle}>阅读中</Text>
        <View className={styles.placeholder} />
      </View>

      <View className={styles.bookInfo}>
        <Image className={styles.cover} src={book.cover} mode="aspectFill" />
        <View className={styles.bookText}>
          <Text className={styles.bookTitle}>{book.title}</Text>
          <Text className={styles.bookAuthor}>{book.author}</Text>
        </View>
      </View>

      <View className={styles.timerSection}>
        <View className={styles.timerDisplay}>
          <Text className={styles.timerValue}>{formatTimer(elapsedSeconds)}</Text>
          <Text className={styles.timerLabel}>
            {isRunning ? '专注阅读中...' : '点击开始阅读'}
          </Text>
        </View>

        <View className={styles.controlBtns}>
          <Button className={styles.secondaryControl} onClick={handleReset}>
            🔄
          </Button>
          <Button className={styles.primaryControl} onClick={handleToggleTimer}>
            {isRunning ? '⏸' : '▶'}
          </Button>
          <Button className={styles.secondaryControl} onClick={handleFinish}>
            ✓
          </Button>
        </View>
      </View>

      {notes.length > 0 && (
        <View className={styles.quickNotes}>
          <Text className={styles.quickNotesTitle}>本次阅读笔记</Text>
          <View className={styles.notesList}>
            {notes.slice(0, 2).map((note) => (
              <View key={note.id} className={styles.noteItem}>
                {note.content}
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.noteSection}>
        <Text className={styles.noteTitle}>添加笔记</Text>
        <View className={styles.noteActions}>
          <Button className={styles.noteActionBtn} onClick={handleAddTextNote}>
            ✏️ 文字笔记
          </Button>
          <Button className={styles.noteActionBtn} onClick={handlePhotoNote}>
            📷 拍照笔记
          </Button>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressRow}>
          <Text className={styles.progressLabel}>阅读进度</Text>
          <Text className={styles.progressValue}>
            {book.currentPage} / {book.totalPages} 页 ({progress}%)
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }} />
        </View>
      </View>

      {showNoteModal && (
        <View className={styles.modalOverlay} onClick={() => setShowNoteModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>写笔记</Text>
              <Text className={styles.modalClose} onClick={() => setShowNoteModal(false)}>
                ✕
              </Text>
            </View>

            <Textarea
              className={styles.textarea}
              placeholder="记录你的想法和感悟..."
              value={noteContent}
              onInput={(e) => setNoteContent(e.detail.value)}
              maxlength={500}
              autoFocus
            />

            <View className={styles.pageInput}>
              <Text className={styles.pageInputLabel}>页码</Text>
              <Input
                className={styles.pageInputField}
                type="number"
                placeholder="可选"
                value={notePage}
                onInput={(e) => setNotePage(e.detail.value)}
              />
            </View>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowNoteModal(false)}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleSaveNote}>
                保存笔记
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReaderPage;
