import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import BookCard from '@/components/BookCard';
import { mockBooks } from '@/data/books';
import { Book } from '@/types';

const availableTags = ['认知升级', '成长', '文学', '科幻', '商业', '心理学', '历史', '小说', '治愈', '经典'];

const CreateBooklistPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [showBookPicker, setShowBookPicker] = useState(false);

  useDidShow(() => {
    console.log('[CreateBooklist] 页面显示');
  });

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      Taro.showToast({ title: '最多选择5个标签', icon: 'none' });
    }
  };

  const handleBookToggle = (book: Book) => {
    if (selectedBooks.find((b) => b.id === book.id)) {
      setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
    } else {
      setSelectedBooks([...selectedBooks, book]);
    }
  };

  const handleCoverUpload = () => {
    Taro.showToast({ title: '上传封面功能开发中', icon: 'none' });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入书单标题', icon: 'none' });
      return;
    }
    if (selectedBooks.length === 0) {
      Taro.showToast({ title: '请至少添加一本书', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '书单创建成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>书单封面</Text>
          <Text className={styles.required}>*</Text>
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
          <Text className={styles.titleText}>书单标题</Text>
          <Text className={styles.required}>*</Text>
        </View>
        <Input
          className={styles.input}
          placeholder="请输入书单标题"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          maxlength={30}
        />
        <Text className={styles.charCount}>{title.length}/30</Text>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>书单简介</Text>
        </View>
        <Textarea
          className={styles.textarea}
          placeholder="介绍一下这个书单吧..."
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={200}
          autoHeight
        />
        <Text className={styles.charCount}>{description.length}/200</Text>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>选择标签</Text>
          <Text className={styles.hint}>(最多5个)</Text>
        </View>
        <View className={styles.tagList}>
          {availableTags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              type={selectedTags.includes(tag) ? 'primary' : 'default'}
              size="medium"
              onClick={() => handleTagToggle(tag)}
            />
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>添加书籍</Text>
          <Text className={styles.required}>*</Text>
        </View>
        <View className={styles.addBookBtn} onClick={() => setShowBookPicker(!showBookPicker)}>
          <Text className={styles.addBookIcon}>+</Text>
          <Text className={styles.addBookText}>
            {showBookPicker ? '收起选择' : '从书架添加书籍'}
          </Text>
        </View>

        {selectedBooks.length > 0 && (
          <View className={styles.selectedBooks}>
            <Text className={styles.selectedTitle}>已选 {selectedBooks.length} 本</Text>
            <View className={styles.selectedBookList}>
              {selectedBooks.map((book) => (
                <View key={book.id} className={styles.selectedBookItem}>
                  <BookCard book={book} type="horizontal" showProgress={false} />
                  <Button
                    className={styles.removeBookBtn}
                    onClick={() => handleBookToggle(book)}
                  >
                    ×
                  </Button>
                </View>
              ))}
            </View>
          </View>
        )}

        {showBookPicker && (
          <View className={styles.bookPicker}>
            <Text className={styles.pickerTitle}>选择书籍</Text>
            <View className={styles.pickerList}>
              {mockBooks.map((book) => {
                const isSelected = selectedBooks.find((b) => b.id === book.id);
                return (
                  <View
                    key={book.id}
                    className={[styles.pickerItem, isSelected && styles.pickerItemSelected].join(' ')}
                    onClick={() => handleBookToggle(book)}
                  >
                    <Image className={styles.pickerCover} src={book.cover} mode="aspectFill" />
                    <View className={styles.pickerInfo}>
                      <Text className={styles.pickerTitleText}>{book.title}</Text>
                      <Text className={styles.pickerAuthor}>{book.author}</Text>
                    </View>
                    <View className={styles.pickerCheck}>
                      {isSelected && <Text className={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomSpace} />

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          发布书单
        </Button>
      </View>
    </ScrollView>
  );
};

export default CreateBooklistPage;
