import React from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockChallenges, mockMedals } from '@/data/challenges';
import { formatTime } from '@/utils';
import { Challenge, Medal } from '@/types';

const ChallengePage: React.FC = () => {
  const ongoingChallenges = mockChallenges.filter((c) => c.status === 'ongoing');
  const obtainedMedals = mockMedals.filter((m) => m.isObtained);

  const handleCreateChallenge = () => {
    Taro.showToast({ title: '发起挑战功能开发中', icon: 'none' });
  };

  const handleChallengeDetail = (id: string) => {
    console.log('[Challenge] 查看挑战详情:', id);
  };

  const handleGoRead = () => {
    const readingBooks = ongoingChallenges[0]?.participants?.[0];
    if (readingBooks) {
      Taro.switchTab({ url: '/pages/bookshelf/index' });
    }
  };

  const handleViewAllMedals = () => {
    Taro.showToast({ title: '勋章墙开发中', icon: 'none' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>阅读挑战</Text>
        <Text className={styles.subtitle}>和好友一起，养成阅读好习惯</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{ongoingChallenges.length}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{obtainedMedals.length}</Text>
            <Text className={styles.statLabel}>获得勋章</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>7</Text>
            <Text className={styles.statLabel}>连续天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🔥 进行中的挑战</Text>
          </View>

          {ongoingChallenges.length > 0 ? (
            ongoingChallenges.map((challenge) => (
              <View
                key={challenge.id}
                className={styles.challengeCard}
                onClick={() => handleChallengeDetail(challenge.id)}
              >
                <Text className={styles.challengeTitle}>{challenge.title}</Text>
                <Text className={styles.challengeMeta}>
                  目标：{formatTime(challenge.targetMinutes)} · 剩余 5 天
                </Text>

                <View className={styles.vsSection}>
                  <View className={styles.participant}>
                    <Image
                      className={styles.participantAvatar}
                      src={challenge.participants[0]?.userAvatar || 'https://picsum.photos/id/64/100/100'}
                      mode="aspectFill"
                    />
                    <Text className={styles.participantName}>
                      {challenge.participants[0]?.userName || '我'}
                    </Text>
                    <Text className={styles.participantTime}>
                      {formatTime(challenge.participants[0]?.readingMinutes || 0)}
                    </Text>
                  </View>

                  <Text className={styles.vsText}>VS</Text>

                  <View className={styles.participant}>
                    <Image
                      className={styles.participantAvatar}
                      src={challenge.participants[1]?.userAvatar || 'https://picsum.photos/id/91/100/100'}
                      mode="aspectFill"
                    />
                    <Text className={styles.participantName}>
                      {challenge.participants[1]?.userName || '好友'}
                    </Text>
                    <Text className={styles.participantTime}>
                      {formatTime(challenge.participants[1]?.readingMinutes || 0)}
                    </Text>
                  </View>
                </View>

                <View className={styles.progressSection}>
                  <View className={styles.progressBar}>
                    <View
                      className={styles.progressFill}
                      style={{ width: `${challenge.myProgress}%` }}
                    />
                  </View>
                  <View className={styles.progressInfo}>
                    <Text className={styles.progressLabel}>
                      我的进度 {challenge.myProgress}%
                    </Text>
                    <Text className={styles.targetText}>
                      目标 {formatTime(challenge.targetMinutes)}
                    </Text>
                  </View>
                </View>

                <View className={styles.challengeActions}>
                  <Button className={styles.actionBtn} onClick={handleChallengeDetail}>
                    查看详情
                  </Button>
                  <Button className={styles.primaryBtn} onClick={handleGoRead}>
                    去阅读
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎯</Text>
              <Text className={styles.emptyText}>暂无进行中的挑战</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🏆 我的勋章</Text>
            <Text className={styles.moreLink} onClick={handleViewAllMedals}>
              全部 →
            </Text>
          </View>
          <View className={styles.medalSection}>
            <View className={styles.medalGrid}>
              {mockMedals.slice(0, 8).map((medal) => (
                <View key={medal.id} className={styles.medalItem}>
                  <View
                    className={`${styles.medalIcon} ${!medal.isObtained && styles.medalLocked}`}
                  >
                    {medal.icon}
                  </View>
                  <Text className={styles.medalName}>{medal.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📜 历史挑战</Text>
          </View>
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📚</Text>
            <Text className={styles.emptyText}>暂无历史挑战记录</Text>
          </View>
        </View>
      </View>

      <Button className={styles.createBtn} onClick={handleCreateChallenge}>
        ⚔️ 发起挑战
      </Button>
    </ScrollView>
  );
};

export default ChallengePage;
