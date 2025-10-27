# Health Insight System

This directory contains the health insight explanation system that provides contextual health status explanations and related conditions information.

## Components

### HealthInsightCard
A comprehensive card component that displays detailed health analysis including:
- Overall health status (Good, Moderate, Unhealthy, At Risk)
- Primary contributing factors
- Trending analysis
- Related health conditions with risk levels
- Personalized recommendations
- Actionable advice categorized by priority

### HealthStatus Levels

1. **Good (ดีมาก)** 🎉
   - Health score ≥ 80
   - Consistent logging (≥14 meals/week)
   - High vegetable intake (≥40% of meals)
   - Green color scheme

2. **Moderate (ปานกลาง)** 😊
   - Health score ≥ 60
   - Some consistency in logging
   - Moderate vegetable intake (≥30% of meals)
   - Yellow color scheme

3. **Unhealthy (ควรปรับปรุง)** 😐
   - Health score ≥ 40
   - Inconsistent patterns
   - Low vegetable intake
   - Orange color scheme

4. **At Risk (เสี่ยง)** 😟
   - Health score < 40
   - Risky eating behaviors
   - Very low vegetable intake
   - Red color scheme

## Related Health Conditions

The system can identify potential risks for:
- **Obesity** (โรคอ้วน) - Based on low health scores and low vegetable intake
- **Diabetes** (เบาหวาน) - Based on poor food choices and low health scores
- **Kidney Disease** (โรคไต) - Based on very low health scores
- **Heart Disease** (โรคหัวใจ) - Based on moderate to low health scores
- **Hypertension** (ความดันโลหิตสูง) - Based on low health scores

## Usage

```tsx
import { useHealthInsights } from '../../hooks/useHealthInsights';
import { HealthInsightCard } from './HealthInsightCard';

function MyComponent() {
  const { explanation } = useHealthInsights(logs);

  return (
    <HealthInsightCard explanation={explanation} />
  );
}
```

## Integration

The health insight system is integrated into:
- `OptimizedHealthSummary.tsx` - As a new "วิเคราะห์สุขภาพ" tab
- Health score card shows the overall status label
- Provides comprehensive health analysis beyond basic scores

## Files

- `HealthInsightCard.tsx` - Main card component
- `../../utils/healthInsightSystem.ts` - Core logic and data structures
- `../../hooks/useHealthInsights.ts` - React hooks for easy integration
- `OptimizedHealthSummary.tsx` - Integration with main health dashboard