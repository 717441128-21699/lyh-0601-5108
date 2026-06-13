import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { formatTime } from '@/utils';
import { Challenge, Medal, ChallengeParticipant } from '@/types';
import useAppStore from '@/store';

const targetOptions = [
  { label: '轻松 · 120分钟', value: 120 },
  { label: '标准 · 300分钟', value: 300 },
  { label: '进阶 · 500分钟', value: 500 },
  { label: '硬核 · 840分钟', value: 840 },
];

const ChallengePage: React.FC = () => {
  const challenges = useAppStore((s) => s.challenges);
  const medals = useAppStore((s) => s.medals);
  const friends = useAppStore((s) => s.friends);
  const readingRecords = useAppStore((s) => s.readingRecords);
  const createChallenge = useAppStore((s) => s.createChallenge);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(300);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');

  useDidShow(() => {});

  const ongoingChallenges = challenges.filter((c) => c.status === 'ongoing');
  const historyChallenges = challenges.filter((c) => c.status === 'finished');
  const obtainedMedals = medals.filter((m) => m.isObtained);

  const activeDays = readingRecords.filter((r) => r.minutes > 0).length;

  const getDaysLeft = (endTime: number) => {
    const diff = Math.max(0, endTime - Date.now());
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const getProgressPercent = (challenge: Challenge, userId: string) => {
    const p = challenge.participants.find((pp) => pp.userId === userId);
    if (!p) return 0;
    return Math.min(100, Math.round((p.readingMinutes / challenge.targetMinutes) * 100));
  };

  const handleCreateChallenge = () => {
    setShowCreateModal(true);
    if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].userId);
    }
  };

  const handleConfirmCreate = () => {
    if (!selectedFriendId) {
      Taro.showToast({ title: '请选择挑战对手', icon: 'none' });
      return;
    }
    const newCh = createChallenge(selectedTarget, selectedFriendId);
    setShowCreateModal(false);
    Taro.showToast({ title: '挑战已发起！', icon: 'success' });
    console.log('[Challenge] 创建成功:', newCh.id);
  };

  const handleChallengeDetail = (challenge: Challenge) => {
    const myP = challenge.participants.find((p) => p.userId === 'me');
    const foe = challenge.participants.find((p) => p.userId !== 'me');
    const myPct = getProgressPercent(challenge, 'me');
    const foePct = foe ? getProgressPercent(challenge, foe.userId) : 0;
    const daysLeft = getDaysLeft(challenge.endTime);
    const winner = challenge.participants.find((p) => p.isWinner);

    let msg = `目标：${formatTime(challenge.targetMinutes)}\n`;
    msg += `剩余：${daysLeft}天\n\n`;
    msg += `我：${myP ? formatTime(myP.readingMinutes) : '0分钟'}（${myPct}%）\n`;
    msg += `${foe?.userName || '对手'}：${foe ? formatTime(foe.readingMinutes) : '0分钟'}（${foePct}%）`;
    if (challenge.status === 'finished') {
      msg += `\n\n🏆 胜者：${winner ? winner.userName : '无'}`;
    }
    Taro.showModal({
      title: challenge.title,
      content: msg,
      showCancel: false,
    });
  };

  const handleGoRead = () => {
    Taro.switchTab({ url: '/pages/bookshelf/index' });
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
            <Text className={styles.statValue}>{activeDays}</Text>
            <Text className={styles.statLabel}>活跃天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🔥 进行中的挑战</Text>
          </View>

          {ongoingChallenges.length > 0 ? (
            ongoingChallenges.map((challenge) => {
              const myP = challenge.participants.find((p) => p.userId === 'me');
              const foe = challenge.participants.find((p) => p.userId !== 'me');
              const myPct = getProgressPercent(challenge, 'me');
              return (
                <View
                  key={challenge.id}
                  className={styles.challengeCard}
                  onClick={() => handleChallengeDetail(challenge)}
                >
                  <Text className={styles.challengeTitle}>{challenge.title}</Text>
                  <Text className={styles.challengeMeta}>
                    目标：{formatTime(challenge.targetMinutes)} · 剩余 {getDaysLeft(challenge.endTime)} 天
                  </Text>

                  <View className={styles.vsSection}>
                    <View className={styles.participant}>
                      <Image
                        className={styles.participantAvatar}
                        src={myP?.userAvatar || 'https://picsum.photos/id/64/100/100'}
                        mode="aspectFill"
                      />
                      <Text className={styles.participantName}>{myP?.userName || '我'}</Text>
                      <Text className={styles.participantTime}>
                        {formatTime(myP?.readingMinutes || 0)}
                      </Text>
                    </View>

                    <Text className={styles.vsText}>VS</Text>

                    <View className={styles.participant}>
                      <Image
                        className={styles.participantAvatar}
                        src={foe?.userAvatar || 'https://picsum.photos/id/91/100/100'}
                        mode="aspectFill"
                      />
                      <Text className={styles.participantName}>{foe?.userName || '好友'}</Text>
                      <Text className={styles.participantTime}>
                        {formatTime(foe?.readingMinutes || 0)}
                      </Text>
                    </View>
                  </View>

                  <View className={styles.progressSection}>
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{ width: `${myPct}%` }}
                      />
                    </View>
                    <View className={styles.progressInfo}>
                      <Text className={styles.progressLabel}>我的进度 {myPct}%</Text>
                      <Text className={styles.targetText}>
                        目标 {formatTime(challenge.targetMinutes)}
                      </Text>
                    </View>
                  </View>

                  <View className={styles.challengeActions}>
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation?.();
                        handleChallengeDetail(challenge);
                      }}
                    >
                      查看详情
                    </Button>
                    <Button
                      className={styles.primaryBtn}
                      onClick={(e) => {
                        e.stopPropagation?.();
                        handleGoRead();
                      }}
                    >
                      去阅读
                    </Button>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎯</Text>
              <Text className={styles.emptyText}>暂无进行中的挑战</Text>
              <Button
                className={styles.primaryBtn}
                style={{ marginTop: 20 }}
                onClick={handleCreateChallenge}
              >
                发起挑战
              </Button>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🏆 我的勋章</Text>
            <Text className={styles.moreLink}>
              {obtainedMedals.length}/{medals.length}
            </Text>
          </View>
          <View className={styles.medalSection}>
            <View className={styles.medalGrid}>
              {medals.length > 0 ? (
                medals.map((medal) => (
                  <View key={medal.id} className={styles.medalItem}>
                    <View
                      className={`${styles.medalIcon} ${!medal.isObtained && styles.medalLocked}`}
                    >
                      {medal.icon}
                    </View>
                    <Text className={styles.medalName}>{medal.name}</Text>
                  </View>
                ))
              ) : (
                <View style={{ gridColumn: '1/-1', padding: '40rpx 0', textAlign: 'center' }}>
                  <Text style={{ color: '#86909C' }}>暂无勋章，加油挑战获取吧～</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📜 历史挑战</Text>
          </View>
          {historyChallenges.length > 0 ? (
            historyChallenges.map((challenge) => {
              const winner = challenge.participants.find((p) => p.isWinner);
              const isWin = winner?.userId === 'me';
              return (
                <View
                  key={challenge.id}
                  className={styles.challengeCard}
                  style={{ opacity: 0.85 }}
                  onClick={() => handleChallengeDetail(challenge)}
                >
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text className={styles.challengeTitle}>{challenge.title}</Text>
                    <View
                      style={{
                        padding: '4rpx 16rpx',
                        borderRadius: 16,
                        background: isWin ? '#FFF3E6' : '#F2F3F5',
                        color: isWin ? '#FF9A3C' : '#86909C',
                        fontSize: 22,
                        fontWeight: 600,
                      }}
                    >
                      {isWin ? '🏆 胜利' : '未获胜'}
                    </View>
                  </View>
                  <Text className={styles.challengeMeta}>
                    目标 {formatTime(challenge.targetMinutes)} · 胜者：{winner?.userName || '无'}
                  </Text>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📚</Text>
              <Text className={styles.emptyText}>暂无历史挑战记录</Text>
            </View>
          )}
        </View>
      </View>

      <Button className={styles.createBtn} onClick={handleCreateChallenge}>
        ⚔️ 发起挑战
      </Button>

      {showCreateModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalBox}>
            <Text className={styles.modalTitle}>发起一周挑战</Text>
            <Text className={styles.modalSubtitle}>选择目标时长，和好友PK一下吧</Text>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>挑战目标</Text>
              <View className={styles.targetGrid}>
                {targetOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={`${styles.targetItem} ${selectedTarget === opt.value ? styles.targetItemActive : ''}`}
                    onClick={() => setSelectedTarget(opt.value)}
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>挑战对手</Text>
              <ScrollView className={styles.friendScroll} scrollX enhanced showScrollbar={false}>
                <View className={styles.friendList}>
                  {friends.map((f) => (
                    <View
                      key={f.userId}
                      className={`${styles.friendItem} ${selectedFriendId === f.userId ? styles.friendItemActive : ''}`}
                      onClick={() => setSelectedFriendId(f.userId)}
                    >
                      <Image className={styles.friendAvatar} src={f.userAvatar} mode="aspectFill" />
                      <Text className={styles.friendName}>{f.userName}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className={styles.modalActions}>
              <Button
                className={styles.modalCancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </Button>
              <Button className={styles.modalConfirmBtn} onClick={handleConfirmCreate}>
                发起挑战
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ChallengePage;
