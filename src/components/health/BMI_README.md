# BMI Input and Health Analysis System

This comprehensive BMI (Body Mass Index) system allows users to input their physical measurements and receive personalized health insights based on their BMI and eating patterns.

## Features

### 📊 BMI Calculation and Categorization
- **Automatic BMI calculation** from height (cm) and weight (kg)
- **5 BMI categories** with Thai language support:
  - น้ำหนักน้อยกว่าเกณฑ์ (Underweight) - BMI < 18.5
  - น้ำหนักปกติ (Normal) - BMI 18.5-24.9
  - น้ำหนักเกิน (Overweight) - BMI 25-29.9
  - อ้วน (Obese) - BMI 30-34.9
  - อ้วนรุนแรง (Severely Obese) - BMI ≥ 35

### 📝 Comprehensive User Profile
- **Height** (cm) - 100-250 range validation
- **Weight** (kg) - 20-300 range validation
- **Age** (years) - 10-120 range validation
- **Gender** - Male, Female, Other options
- **Activity Level** - 5 levels from sedentary to extremely active

### 🎯 Smart Health Insights
- **BMI-aware health status determination** - BMI significantly affects overall health assessment
- **Personalized recommendations** based on BMI category
- **Health risk assessment** specific to each BMI category
- **Daily calorie calculation** using Harris-Benedict equation
- **Ideal weight range** calculation based on height

### 🔗 Integration with Health System
- **Enhanced health insights** that consider BMI alongside eating patterns
- **Related health conditions** updated based on BMI status
- **Actionable advice** tailored to BMI category
- **Real-time BMI updates** in health summary dashboard

## Components

### BMIInputCard (`/src/components/health/BMIInputCard.tsx`)
Main component for BMI data input and display:
- **Edit mode**: Form inputs for all profile data
- **Display mode**: Shows current BMI, category, and health information
- **Validation**: Input validation with error messages
- **Health risks**: Lists specific risks for current BMI category
- **Recommendations**: Personalized advice for BMI improvement

### BMI Calculator (`/src/utils/bmiCalculator.ts`)
Core BMI calculation utilities:
- `calculateBMI()` - Calculate BMI from height/weight
- `getBMIInfo()` - Get comprehensive BMI category information
- `getIdealWeightRange()` - Calculate healthy weight range
- `calculateDailyCalories()` - Calculate daily calorie needs
- `validateProfile()` - Validate profile data
- Storage functions for profile persistence

### BMI Hook (`/src/hooks/useBMI.ts`)
React hook for BMI state management:
- Profile data loading/saving
- BMI calculation caching
- Real-time BMI updates
- Integration with local storage

## Usage Examples

### Basic BMI Input Component
```tsx
import { BMIInputCard } from './components/health/BMIInputCard';

function MyComponent() {
  return (
    <BMIInputCard
      userId="user123"
      onProfileUpdate={(profile) => console.log('Updated:', profile)}
    />
  );
}
```

### Using BMI Hook
```tsx
import { useBMI } from './hooks/useBMI';

function MyComponent() {
  const { profile, bmiInfo, updateProfile } = useBMI('user123');

  return (
    <div>
      {bmiInfo && (
        <p>BMI: {bmiInfo.value} ({bmiInfo.categoryTH})</p>
      )}
    </div>
  );
}
```

### Integration with Health Insights
```tsx
import { useHealthInsights } from './hooks/useHealthInsights';

function HealthAnalysis() {
  const { explanation } = useHealthInsights(logs, bmiProfile);

  return (
    <HealthInsightCard explanation={explanation} />
  );
}
```

## BMI Categories and Health Implications

### 🟢 Underweight (BMI < 18.5)
**Health Risks:**
- ภาวะโภชนาการบกพร่อง
- ภูมิคุ้มกันต่ำ
- ระบบน้ำเหลืองอ่อนแอ

**Recommendations:**
- เพิ่มปริมาณอาหารโปรตีนสูง
- ทานอาหารครบ 5 หมู่
- เพิ่มน้ำหนักอย่าง gradual

### 🟡 Normal (BMI 18.5-24.9)
**Health Status:**
- อยู่ในเกณฑ์สุขภาพที่ดี
- ความเสี่ยงต่ำต่อโรคเรื้อรัง

**Recommendations:**
- รักษาน้ำหนักปัจจุบัน
- กินอาหารหลากหลาย
- ออกกำลังกายสม่ำเสมอ

### 🟠 Overweight (BMI 25-29.9)
**Health Risks:**
- เสี่ยงต่อโรคเบาหวานชนิดที่ 2
- เสี่ยงต่อความดันโลหิตสูง
- เสี่ยงต่อไขมันในเลือดสูง

**Recommendations:**
- ลดอาหารแปรรูปและของหวาน
- เพิ่มผักและผลไม้
- ออกกำลังกาย 150 นาที/สัปดาห์

### 🔴 Obese (BMI 30-34.9)
**Health Risks:**
- โรคเบาหวานชนิดที่ 2
- ความดันโลหิตสูง
- โรคหัวใจและหลอดเลือด
- โรคไต
- ภาวะหยุดหายใจขณะหลับ

**Recommendations:**
- ปรึกษาแพทย์เพื่อวางแผนการลดน้ำหนัก
- ลดแคลอรี่ 500-1000 กิโลแคลอรี่/วัน
- ออกกำลังกาย 300 นาที/สัปดาห์

### 🆘 Severely Obese (BMI ≥ 35)
**Health Risks:**
- โรคเบาหวานชนิดที่ 2 (ความเสี่ยงสูงมาก)
- ความดันโลหิตสูงรุนแรง
- โรคหัวใจและหลอดเลือด
- โรคไตวายเรื้อรัง
- โรคตับอ้วน
- มะเร็งบางชนิด

**Recommendations:**
- ต้องได้รับการรักษาจากแพทย์ทันที
- โปรแกรมลดน้ำหนักภายใต้การดูแลของแพทย์
- อาจต้องได้รับการรักษาแบบหลายสาขา

## Data Storage

Profile data is stored in browser's localStorage for demo purposes:
- Key: `user_profile_${userId}`
- Includes: height, weight, age, gender, activityLevel, updatedAt
- Auto-saves on profile update
- Loads on component mount

## Integration Points

1. **Health Dashboard** - BMI card in key metrics
2. **Health Analysis Tab** - Full BMI input and insights
3. **Health Insights System** - BMI-aware recommendations
4. **User Profile** - Extended with BMI data structure

## Technical Implementation

- **TypeScript** with full type safety
- **React Hooks** for state management
- **LocalStorage** for data persistence
- **Responsive Design** with Tailwind CSS
- **Thai Language** support throughout
- **Real-time Updates** without page refresh
- **Input Validation** with user-friendly error messages

## Future Enhancements

- [ ] Backend API integration for data persistence
- [ ] BMI trend tracking over time
- [ ] Integration with fitness trackers
- [ ] Goal setting and progress tracking
- [ ] Social features for BMI challenges
- [ ] Advanced health metrics (body fat percentage, etc.)