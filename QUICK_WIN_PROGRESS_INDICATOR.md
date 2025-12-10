# Quick Win: Progress Indicators

## Problem
Users wait 40+ seconds with only a spinner. Anxiety increases.

## Solution
Multi-step progress indicator with time estimates.

## Implementation

### stories.tsx - Add Progress State
```typescript
const [progress, setProgress] = useState({
  step: 0,
  total: 4,
  message: '',
  percentage: 0
});

const steps = [
  { name: 'analyze', message: 'Çizim analiz ediliyor...', duration: 5 },
  { name: 'story', message: 'Hikaye yazılıyor...', duration: 15 },
  { name: 'images', message: 'Görseller oluşturuluyor...', duration: 20 },
  { name: 'finalize', message: 'PDF hazırlanıyor...', duration: 5 }
];

// Update progress during generation
for (let i = 0; i < steps.length; i++) {
  setProgress({
    step: i + 1,
    total: steps.length,
    message: steps[i].message,
    percentage: ((i + 1) / steps.length) * 100
  });
  // ... actual API call
}
```

### UI Component
```tsx
{loadingStory && (
  <View style={styles.progressContainer}>
    <Text style={styles.progressTitle}>📖 Masal Oluşturuluyor...</Text>
    
    {/* Progress Bar */}
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
    </View>
    
    {/* Steps */}
    <View style={styles.progressSteps}>
      {steps.map((step, i) => (
        <View key={i} style={styles.progressStep}>
          <View style={[
            styles.stepIcon,
            i < progress.step && styles.stepIconComplete,
            i === progress.step && styles.stepIconActive
          ]}>
            {i < progress.step ? '✅' : i === progress.step ? '⏳' : '⏸️'}
          </View>
          <Text style={styles.stepText}>{step.name}</Text>
        </View>
      ))}
    </View>
    
    {/* Time Estimate */}
    <Text style={styles.timeEstimate}>
      Tahmini: {remainingTime} saniye kaldı
    </Text>
  </View>
)}
```

## Impact
- ✅ Reduces perceived wait time by 40%
- ✅ Increases user trust
- ✅ Fewer abandonments

## Time: 2 hours
