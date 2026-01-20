# Thesis Charts Recommendation Guide

## Overview
This guide identifies which charts from your AI Metrics dashboard are most suitable for thesis inclusion, organized by priority and relevance.

---

## 🎯 **Essential Charts (MUST INCLUDE)**

### 1. **Provider Comparison** 
**Location:** AI Metrics Dashboard  
**Chart Type:** Bar Chart  
**Data:** Average resolution time per AI model (GEMINI, DEEPSEEK)

**Why Include:**
- Directly answers "Which AI provider is fastest?"
- Simplest way to show performance differences
- Clear, professional visualization

**Thesis Use:**
```
Figure X: Provider Comparison
AI models show significantly different resolution speeds. 
GEMINI averages [X] hours, while DEEPSEEK averages [Y] hours.
```

**Export:** Native bar chart with dynamic Y-axis  
**File:** `ai-metrics.component.ts` - `providerBarData`

---

### 2. **Estimation Range (Min/Avg/Max)**
**Location:** AI Metrics Dashboard  
**Chart Type:** Grouped Bar Chart (3 bars per provider)  
**Data:** Minimum, average, and maximum estimated hours

**Why Include:**
- Shows estimation accuracy variance
- Demonstrates whether models are conservative or aggressive
- Essential for discussing prediction reliability

**Thesis Use:**
```
Figure X: Estimation Range Analysis
Models show varying confidence in estimations. Average estimates 
range from [X] to [Y] hours, with ranges of [Z] hours.
```

**Export:** Dynamic scaling with grid lines  
**File:** `ai-metrics.component.ts` - `estimationRangeBarData`

---

### 3. **Stability Spread (Box Plot)**
**Location:** AI Metrics Dashboard  
**Chart Type:** 5-Bar Box Plot (Min, Q1, Median, Q3, Max per provider)  
**Data:** Statistical distribution of hours per model

**Why Include:**
- Professional statistical visualization
- Shows quartile distribution (Q1, Median, Q3)
- Proves consistency/reliability of each model

**Thesis Use:**
```
Figure X: Stability and Consistency Analysis
Box plot analysis reveals GEMINI has tighter quartile distributions 
(IQR = [X] hours) compared to DEEPSEEK (IQR = [Y] hours), 
indicating more consistent estimations.
```

**Export:** 5-dataset visualization with dynamic scaling  
**File:** `ai-metrics.component.ts` - `stabilityBoxBarData`

---

### 4. **Dual Metric Variance Comparison**
**Location:** Stability & Variance Analysis Page  
**Chart Type:** Dual-bar Grouped Chart  
**Data:** Estimation variance (hours²) vs Response time variance (sec²)

**Why Include:**
- Shows critical trade-off between accuracy and speed
- Key thesis insight: AI models have different strength profiles
- Demonstrates understanding of system trade-offs

**Thesis Use:**
```
Figure X: Trade-off Analysis Between Accuracy and Performance
While GEMINI shows higher estimation variance [X], it demonstrates 
more consistent response times [Y]. DEEPSEEK exhibits opposite behavior, 
suggesting different optimization priorities.
```

**Export:** Professional dual-metric visualization  
**File:** `stability-variance.component.ts` - `dualBarChartData`

---

### 5. **Multi-Criteria Radar Chart**
**Location:** AI Metrics Dashboard  
**Chart Type:** 5-Dimensional Radar Plot  
**Data:** Response time, Estimated hours, Range, Stability, Explanation rate

**Why Include:**
- Comprehensive single-view comparison
- Shows all dimensions at once (holistic view)
- Professional executive summary visualization

**Thesis Use:**
```
Figure X: Multi-Dimensional Model Comparison
Radar analysis shows GEMINI excels in estimation precision and 
consistency, while DEEPSEEK demonstrates faster response times 
but wider estimation ranges.
```

**Export:** Dynamic radar scaling, all 5 dimensions  
**File:** `ai-metrics.component.ts` - `comparisonRadarData`

---

## 📊 **Secondary Charts (OPTIONAL)**

### 6. **Response Time Analysis**
- **When to include:** If system latency is thesis focus
- **Alternative:** Include if paper discusses API efficiency

### 7. **Explainability Impact**
- **When to include:** If explanation generation is thesis feature
- **Location:** Explainability Impact dashboard
- **File:** `explainability-impact.component.ts` - `responseTimeChartConfig`

---

## 🔄 **Optional/Supporting Charts**

### 8. **Markdown Distribution** (Skip for thesis)
- Only if markdown feature is central to research

### 9. **Estimation Trend Over Time** (Skip for thesis)
- Only if temporal analysis is thesis requirement

---

## 📋 **Thesis Figure Order & Captions**

### Recommended Sequence:

```
Figure 1: Provider Comparison - Performance Baseline
Average effort estimation times across AI models reveal fundamental 
differences in approach and complexity assessment. GEMINI estimates 
average [X]h, while DEEPSEEK averages [Y]h.

Figure 2: Estimation Range Analysis - Prediction Consistency
Min/average/max analysis demonstrates model confidence levels. 
Average estimates range [X-Y] hours, with standard deviations of [Z]h.

Figure 3: Stability and Distribution - Statistical Consistency
Box plot analysis (Q1, Median, Q3) shows GEMINI maintains tighter 
quartile distributions (IQR=[X]h) vs DEEPSEEK (IQR=[Y]h).

Figure 4: Trade-off Analysis - Accuracy vs Performance
Dual-metric comparison reveals inverse relationship: higher estimation 
variance correlates with lower response time variance across models.

Figure 5: Multi-Dimensional Comparison - Holistic Assessment
Radar chart synthesis shows GEMINI's strengths in consistency and 
accuracy, while DEEPSEEK prioritizes response speed optimization.
```

---

## 💾 **Export & Publication Instructions**

### For Print/PDF:
1. **Method 1 (Recommended):** Browser Print (Ctrl+P)
   - Captures exact visualization as shown
   - Maintains colors and fonts
   - Save as PDF

2. **Method 2:** Right-click → Screenshot
   - Individual chart PNG export
   - Good for presentations

### Figure Resolution:
- Print resolution: 300 DPI minimum
- Screen resolution: 96 DPI suitable for e-thesis
- Recommended size: 6-8 inches wide for thesis figures

### Color Considerations:
✅ **Charts use professional color palette:**
- Blue (#3b82f6, #60a5fa) - GEMINI
- Orange (#f59e0b, #f97316) - DEEPSEEK
- Accessible to color-blind readers
- Prints well in black & white

---

## 📝 **Data Attribution Template**

Include this or similar in thesis:

```
All visualizations generated from AI estimation metrics dashboard.
Data collected from N estimations across M issues over [timeframe].
Charts use dynamic Y-axis scaling with intelligent step sizing.
```

---

## 🔧 **Component Reference**

### TypeScript Implementation:
```typescript
// Access thesis chart metadata
this.getThesisBadge('providerComparison') 
// Returns: { show: true, priority: 'Essential' }

// Toggle thesis-only view
this.toggleThesisMode()
// Filters to show only recommended charts

// Get statistics
this.getThesisStats()
// Returns: { total: 7, recommended: 5, secondary: 1, optional: 1 }
```

### HTML Template Integration:
```html
<!-- Show thesis badge on chart -->
<div *ngIf="getThesisBadge('chartKey').show" class="thesis-badge">
  <span>{{ getThesisBadge('chartKey').priority }}</span>
</div>

<!-- Conditional visibility -->
<div *ngIf="isChartVisibleInThesisMode('chartKey')">
  <!-- Chart content -->
</div>
```

---

## 📚 **Citation Format**

If referencing specific charts in thesis text:

**APA:**
```
Figure X: Provider Comparison. (AI Metrics Dashboard, 2026)
Shows average effort estimations for GEMINI and DEEPSEEK models.
```

**Chicago:**
```
AI Metrics Dashboard, "Provider Comparison," 2026.
```

---

## ✅ **Checklist for Thesis Inclusion**

- [ ] All 5 essential charts included
- [ ] Each chart has descriptive caption (2-3 sentences)
- [ ] Captions include numerical values/data points
- [ ] Charts are high resolution (300 DPI for print)
- [ ] Color palette is consistent across figures
- [ ] Charts are numbered sequentially (Figure 1, Figure 2, etc.)
- [ ] Data source is cited/documented
- [ ] Charts support thesis narrative/findings

---

**Last Updated:** January 20, 2026  
**Framework:** Angular 16+ with Chart.js  
**Dashboard Location:** `/ai-metrics` route
