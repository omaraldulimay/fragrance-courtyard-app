import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart/store';
import { formatMoney } from '@/lib/format';
import {
  MAX_NOTES,
  NOTES,
  QUESTIONS,
  recommend,
  type Answers,
  type Recommendation,
} from '@/lib/scent/finder';
import { useProducts } from '@/lib/shopify/hooks';

const EMPTY: Answers = { notes: [] };
const NOTES_STEP = QUESTIONS.length;
const RESULT_STEP = QUESTIONS.length + 1;

export default function FinderScreen() {
  const theme = useTheme();
  const { data: products, isPending, error, refetch } = useProducts();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);

  const results = useMemo(
    () => (step === RESULT_STEP && products ? recommend(products, answers) : []),
    [step, products, answers],
  );

  const restart = () => {
    setAnswers(EMPTY);
    setStep(0);
  };

  const toggleNote = (id: string) =>
    setAnswers((current) => ({
      ...current,
      notes: current.notes.includes(id)
        ? current.notes.filter((note) => note !== id)
        : current.notes.length < MAX_NOTES
          ? [...current.notes, id]
          : current.notes,
    }));

  if (step === RESULT_STEP) {
    return (
      <Screen>
        <View style={styles.header}>
          <AppText variant="label">Dein Ergebnis</AppText>
          <AppText variant="display">Diese Düfte passen zu dir.</AppText>
        </View>
        {isPending ? <LoadingState label="Wir suchen deine Düfte …" /> : null}
        {error ? <ErrorState message={error.message} onRetry={refetch} /> : null}
        {products && results.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            Wir haben gerade keinen verfügbaren Duft gefunden, der passt. Probier andere Antworten.
          </AppText>
        ) : null}
        {results.map((result, index) => (
          <ResultCard key={result.product.id} result={result} rank={index + 1} />
        ))}
        <Button label="Neu starten" variant="secondary" onPress={restart} />
      </Screen>
    );
  }

  const question = QUESTIONS[step];
  const progress = (step + 1) / (QUESTIONS.length + 1);
  const canContinue = step === NOTES_STEP || answers[question.id] !== undefined;

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          {step > 0 ? (
            <Button
              label="Zurück"
              variant="secondary"
              onPress={() => setStep(step - 1)}
              style={styles.back}
            />
          ) : null}
          <Button
            label={step === NOTES_STEP ? 'Ergebnis zeigen' : 'Weiter'}
            disabled={!canContinue}
            onPress={() => setStep(step + 1)}
            style={styles.next}
          />
        </View>
      }>
      <View style={styles.header}>
        <AppText variant="label">
          Frage {step + 1} von {QUESTIONS.length + 1}
        </AppText>
        <View
          style={[styles.track, { backgroundColor: theme.surfaceMuted }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
          <View
            style={[styles.fill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      {step === NOTES_STEP ? (
        <View style={styles.section}>
          <AppText variant="display">Welche Noten liebst du?</AppText>
          <AppText variant="body" color="textSecondary">
            Wähle bis zu {MAX_NOTES}. Du kannst das auch überspringen.
          </AppText>
          <View style={styles.wrap}>
            {NOTES.map((note) => (
              <Chip
                key={note.id}
                label={note.label}
                selected={answers.notes.includes(note.id)}
                onPress={() => toggleNote(note.id)}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <AppText variant="display">{question.title}</AppText>
          <View style={styles.options} accessibilityRole="radiogroup">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setAnswers({ ...answers, [question.id]: option.id })}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected ? theme.text : theme.surface,
                      borderColor: selected ? theme.text : theme.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <AppText
                    variant="heading"
                    style={{ color: selected ? theme.background : theme.text }}>
                    {option.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: selected ? theme.background : theme.textSecondary }}>
                    {option.hint}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}

function ResultCard({ result, rank }: { result: Recommendation; rank: number }) {
  const theme = useTheme();
  const add = useCart((state) => state.add);
  const pending = useCart((state) => state.pending);
  const [added, setAdded] = useState(false);
  const { product } = result;
  const variant = product.variants.find((candidate) => candidate.available);

  return (
    <View style={[styles.result, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.push({ pathname: '/product/[handle]', params: { handle: product.handle } })
        }
        style={styles.resultTop}>
        <Image
          source={product.imageUrl ?? undefined}
          accessibilityLabel={product.imageAlt ?? product.title}
          contentFit="cover"
          style={[styles.resultImage, { backgroundColor: theme.surfaceMuted }]}
        />
        <View style={styles.resultText}>
          <AppText variant="label" color="accent">
            #{rank} · {result.match} % Match
          </AppText>
          <AppText variant="heading">{product.title}</AppText>
          <AppText variant="caption">ab {formatMoney(product.priceFrom)}</AppText>
        </View>
      </Pressable>
      <View style={styles.reasons}>
        {result.reasons.map((reason) => (
          <AppText key={reason} variant="caption" color="text">
            ✓ {reason}
          </AppText>
        ))}
      </View>
      {variant ? (
        <Button
          label={added ? 'Im Warenkorb ✓' : `${variant.size} in den Warenkorb`}
          variant={added ? 'secondary' : 'primary'}
          loading={pending && !added}
          onPress={async () => {
            if (await add(variant.id)) setAdded(true);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  section: {
    gap: Spacing.three,
  },
  options: {
    gap: Spacing.two + 2,
  },
  option: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  back: {
    flex: 1,
  },
  next: {
    flex: 2,
  },
  result: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  resultTop: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  resultImage: {
    width: 88,
    height: 110,
    borderRadius: Radius.sm,
  },
  resultText: {
    flex: 1,
    gap: Spacing.one,
  },
  reasons: {
    gap: Spacing.one,
  },
});
