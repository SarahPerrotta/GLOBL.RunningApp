import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const CARD_H_PADDING = 16;
const CARD_WIDTH = width - CARD_H_PADDING * 2;

// Card component for each trail
function TrailCard({ title, subtitle, images = [] }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goTo = (i) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(i, images.length - 1));
    scrollRef.current.scrollTo({ x: clamped * CARD_WIDTH, animated: true });
    setIndex(clamped);
  };

  const onMomentumEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setIndex(newIndex);
  };

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ width: CARD_WIDTH, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        {images.map((src, i) => (
          <Image
            key={i}
            source={src}
            style={{ width: CARD_WIDTH, height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* toggle between pictures */}
      <View style={styles.segmentWrap}>
        {images.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goTo(i)}
            style={[styles.segment, index === i && styles.segmentActive]}
          >
            <View style={[styles.dot, index === i && styles.dotActive]} />
            <Text style={[styles.segmentLabel, index === i && styles.segmentLabelActive]}>
              {i === 0 ? 'Scenary' : 'Trail View'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* caption */}
      <View style={styles.captionWrap}>
        <Text style={styles.captionText}>
          {title} <Text style={styles.captionSub}>{subtitle}</Text>
        </Text>
      </View>
    </View>
  );
}

export default function PinnedTrailsScreen({ navigation }) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#DE1E26" />
          </Pressable>
          <Text style={styles.headerTitle}>Pinned Trails</Text>
          <View style={{ width: 40 }} /> {/* spacer */}
        </View>

      {/* Subtitle */}
      <View style={styles.subhead}>
        <Text style={styles.star}>★</Text>
        <Text style={styles.subheadText}>Your Favourite Running Trails</Text>
      </View>

      {/* trail cards */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <TrailCard
          title="West Highland Way Trail"
          subtitle="– 19km"
          images={[
            require('../assets/WestHighlandWay.jpeg'),
            require('../assets/TrailWestHighlandWay.jpeg'),
          ]}
        />

        <TrailCard
          title="Lennox Castle Trail"
          subtitle="– 7km"
          images={[
            require('../assets/LennoxCastle.jpeg'),
            require('../assets/TrailLennoxCastle.jpeg'),
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DE1E26',
  }, 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subhead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  star: { color: '#FFD11A', fontSize: 22, marginRight: 8 },
  subheadText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: CARD_H_PADDING,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  segmentWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
  },
  segmentActive: {
    backgroundColor: '#DE1E26',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDBDBD',
    marginRight: 6,
  },
  dotActive: { backgroundColor: '#fff' },
  segmentLabel: { fontSize: 12, color: '#444', fontWeight: '600' },
  segmentLabelActive: { color: '#fff' },

  captionWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    alignItems: 'center',
  },
  captionText: { fontSize: 16, fontWeight: '700', color: '#111' },
  captionSub: { fontWeight: '600', color: '#111' },
});
