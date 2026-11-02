import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

import { Button } from './ui/button';
import { AppText } from './ui/text';

type Slide = {
  key: string;
  image: number;
  alt: string;
  // Horizontal focus of the photo, so the person stays in frame on narrow screens.
  focusX: `${number}%`;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: Href;
};

const SLIDES: Slide[] = [
  {
    key: 'collection',
    image: require('@/assets/images/hero/01-neck-spray.jpg'),
    alt: 'Frau mit Spitzenkopftuch sprüht sich Parfum an den Hals',
    focusX: '50%',
    eyebrow: 'Neue Kollektion',
    title: 'Düfte mit Geschichte.',
    text: 'Handverlesene Parfums und Attar-Öle mit Oud, Rose und Safran.',
    cta: 'Kollektion entdecken',
    href: '/shop',
  },
  {
    key: 'finder',
    image: require('@/assets/images/hero/02-mist.jpg'),
    alt: 'Feiner Duftnebel am Hals einer Frau',
    focusX: '55%',
    eyebrow: 'Duftfinder · 1 Minute',
    title: 'Finde den Duft, der zu dir passt.',
    text: 'Fünf kurze Fragen, drei persönliche Empfehlungen – mit Begründung.',
    cta: 'Duftfinder starten',
    href: '/finder',
  },
  {
    key: 'attar',
    image: require('@/assets/images/hero/03-attar.jpg'),
    alt: 'Hände öffnen ein kleines Fläschchen Attar-Öl',
    focusX: '62%',
    eyebrow: 'Attar-Öle',
    title: 'Tradition zum Auftupfen.',
    text: 'Konzentrierte Duftöle ohne Alkohol – dezent und lange haltbar.',
    cta: 'Attar-Öle ansehen',
    href: { pathname: '/shop', params: { format: 'attar' } },
  },
  {
    key: 'evening',
    image: require('@/assets/images/hero/04-evening.jpg'),
    alt: 'Mann im Anzug sprüht Parfum am Fenster',
    focusX: '12%',
    eyebrow: 'Für den Abend',
    title: 'Holzig. Würzig. Unvergesslich.',
    text: 'Oud, Leder und Zeder für Momente, die bleiben.',
    cta: 'Holzige Düfte',
    href: { pathname: '/shop', params: { family: 'woody' } },
  },
];

// The tab bar floats over the bottom of the hero, so text and dots keep clear of it.
const TAB_BAR_CLEARANCE = Platform.OS === 'web' ? 104 : 84;

export function HeroCarousel() {
  const { width: windowWidth, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const width = Math.min(windowWidth, MaxContentWidth);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [active, setActive] = useState(0);
  const bottom = insets.bottom + TAB_BAR_CLEARANCE;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== active) setActive(index);
  };

  return (
    <View style={[styles.root, { width, height }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}>
        {SLIDES.map((slide) => (
          <View key={slide.key} style={{ width, height }}>
            <Image
              source={slide.image}
              accessibilityLabel={slide.alt}
              contentFit="cover"
              contentPosition={{ top: '50%', left: slide.focusX }}
              transition={300}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.78)']}
              locations={[0, 0.2, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.copy, { paddingBottom: bottom + Spacing.five }]}>
              <AppText variant="label" style={styles.eyebrow}>
                {slide.eyebrow}
              </AppText>
              <AppText variant="display" style={styles.title}>
                {slide.title}
              </AppText>
              <AppText variant="body" style={styles.text}>
                {slide.text}
              </AppText>
              <Button
                label={slide.cta}
                variant="inverse"
                onPress={() => router.navigate(slide.href)}
                style={styles.cta}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.brand, { top: insets.top + Spacing.three }]} pointerEvents="none">
        <AppText variant="label" style={styles.brandText}>
          The Fragrance Courtyard
        </AppText>
      </View>

      <View style={[styles.dots, { bottom: bottom + Spacing.two }]}>
        {SLIDES.map((slide, index) => (
          <Pressable
            key={slide.key}
            accessibilityRole="button"
            accessibilityLabel={`Bild ${index + 1} von ${SLIDES.length}`}
            accessibilityState={{ selected: index === active }}
            hitSlop={10}
            onPress={() => scrollRef.current?.scrollTo({ x: index * width, animated: true })}
            style={[styles.dot, index === active && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'center',
    backgroundColor: '#1A1410',
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  eyebrow: {
    color: '#FFFFFF',
    opacity: 0.85,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 46,
  },
  text: {
    color: '#FFFFFF',
    opacity: 0.88,
    maxWidth: 380,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
  },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandText: {
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  dots: {
    position: 'absolute',
    left: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
});
