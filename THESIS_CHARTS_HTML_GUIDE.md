<!-- ====================================================
     THESIS CHARTS - HTML Template Integration Guide
     ==================================================== -->

<!-- 
STEP 1: Add this to the top of your ai-metrics.component.html
to include the CSS styles
-->
<link rel="stylesheet" href="./thesis-charts.css">

<!-- ====================================================
     THESIS MODE CONTROL SECTION
     ==================================================== -->

<!-- Add this section at the top of your dashboard -->
<div class="thesis-mode-container">
  <button 
    class="thesis-mode-toggle"
    [class.active]="showThesisOnly"
    (click)="toggleThesisMode()">
    {{ showThesisOnly ? '✓ Thesis Mode: ON' : 'Thesis Mode: OFF' }}
  </button>
  
  <div class="thesis-stats">
    Total Charts: <strong>{{ getThesisStats().total }}</strong> |
    Recommended: <strong>{{ getThesisStats().recommended }}</strong> |
    Secondary: <strong>{{ getThesisStats().secondary }}</strong> |
    Optional: <strong>{{ getThesisStats().optional }}</strong>
  </div>

  <button class="thesis-export-btn" (click)="exportThesisCharts()">
    📥 Export Charts (Print/PDF)
  </button>
</div>

<!-- Thesis Info Panel -->
<div class="thesis-info-panel" *ngIf="showThesisOnly">
  <h4>Thesis Mode Active</h4>
  <p>Showing only <strong>5 recommended charts</strong> for thesis inclusion.</p>
  <ul>
    <li><strong>Provider Comparison:</strong> AI performance baseline</li>
    <li><strong>Estimation Range:</strong> Prediction consistency</li>
    <li><strong>Stability Spread:</strong> Statistical distribution</li>
    <li><strong>Dual Metric Variance:</strong> Trade-off analysis</li>
    <li><strong>Multi-Criteria Radar:</strong> Holistic comparison</li>
  </ul>
</div>

<!-- ====================================================
     THESIS STATS CARD (Optional - for visual summary)
     ==================================================== -->

<div class="thesis-stats-card">
  <div class="stat-item essential">
    <span class="stat-number">{{ getThesisStats().recommended }}</span>
    <span class="stat-label">Essential Charts</span>
  </div>
  <div class="stat-item secondary">
    <span class="stat-number">{{ getThesisStats().secondary }}</span>
    <span class="stat-label">Secondary</span>
  </div>
  <div class="stat-item optional">
    <span class="stat-number">{{ getThesisStats().optional }}</span>
    <span class="stat-label">Optional</span>
  </div>
</div>

<!-- ====================================================
     CHART WRAPPER EXAMPLES
     ==================================================== -->

<!-- 
STEP 2: Wrap each chart with the thesis wrapper.
Replace 'chartKey' with the actual key from thesisCharts object:
- providerComparison
- estimationRange
- stabilityBox
- dualMetricVariance (for Stability page)
- comparisonRadar
- responseTime
- markdownPie
-->

<!-- EXAMPLE 1: Provider Comparison Chart -->
<div class="thesis-chart-wrapper"
     [class.hidden-thesis-mode]="!isChartVisibleInThesisMode('providerComparison')">
  
  <!-- Thesis Badge -->
  <div class="thesis-badge" 
       [class]="getThesisBadge('providerComparison').priority.toLowerCase()"
       *ngIf="getThesisBadge('providerComparison').show">
    {{ getThesisBadge('providerComparison').priority }}
  </div>

  <!-- Your existing chart code here -->
  <div class="chart-card">
    <h3>Provider Comparison</h3>
    <canvas baseChart
      [data]="providerBarData"
      [options]="providerBarOptions"
      [type]="providerBarType">
    </canvas>
  </div>

  <!-- Thesis Caption -->
  <div class="thesis-chart-caption">
    <strong>Figure 1:</strong> Provider Comparison. Average effort estimation times 
    across AI models reveal fundamental differences in approach and complexity assessment.
  </div>
</div>

<!-- EXAMPLE 2: Estimation Range Chart -->
<div class="thesis-chart-wrapper"
     [class.hidden-thesis-mode]="!isChartVisibleInThesisMode('estimationRange')">
  
  <div class="thesis-badge" 
       [class]="getThesisBadge('estimationRange').priority.toLowerCase()"
       *ngIf="getThesisBadge('estimationRange').show">
    {{ getThesisBadge('estimationRange').priority }}
  </div>

  <div class="chart-card">
    <h3>Estimation Range Analysis</h3>
    <canvas baseChart
      [data]="estimationRangeBarData"
      [options]="estimationRangeBarOptions"
      [type]="estimationRangeBarType">
    </canvas>
  </div>

  <div class="thesis-chart-caption">
    <strong>Figure 2:</strong> Estimation Range. Min/average/max analysis demonstrates 
    model confidence levels and estimation variance.
  </div>
</div>

<!-- EXAMPLE 3: Stability Box Plot -->
<div class="thesis-chart-wrapper"
     [class.hidden-thesis-mode]="!isChartVisibleInThesisMode('stabilityBox')">
  
  <div class="thesis-badge" 
       [class]="getThesisBadge('stabilityBox').priority.toLowerCase()"
       *ngIf="getThesisBadge('stabilityBox').show">
    {{ getThesisBadge('stabilityBox').priority }}
  </div>

  <div class="chart-card">
    <h3>Stability and Consistency Analysis</h3>
    <canvas baseChart
      [data]="stabilityBoxBarData"
      [options]="stabilityBoxBarOptions"
      [type]="stabilityBoxBarType">
    </canvas>
  </div>

  <div class="thesis-chart-caption">
    <strong>Figure 3:</strong> Stability Spread. Box plot analysis shows quartile 
    distributions, indicating consistency and reliability of each model.
  </div>
</div>

<!-- EXAMPLE 4: Comparison Radar -->
<div class="thesis-chart-wrapper"
     [class.hidden-thesis-mode]="!isChartVisibleInThesisMode('comparisonRadar')">
  
  <div class="thesis-badge" 
       [class]="getThesisBadge('comparisonRadar').priority.toLowerCase()"
       *ngIf="getThesisBadge('comparisonRadar').show">
    {{ getThesisBadge('comparisonRadar').priority }}
  </div>

  <div class="chart-card">
    <h3>Multi-Dimensional Model Comparison</h3>
    <canvas baseChart
      [data]="comparisonRadarData"
      [options]="comparisonRadarOptions"
      [type]="comparisonRadarType">
    </canvas>
  </div>

  <div class="thesis-chart-caption">
    <strong>Figure 5:</strong> Multi-Criteria Radar. Comprehensive single-view comparison 
    showing all dimensions at once.
  </div>
</div>

<!-- EXAMPLE 5: Response Time (Secondary) -->
<div class="thesis-chart-wrapper"
     [class.hidden-thesis-mode]="!isChartVisibleInThesisMode('responseTime')">
  
  <div class="thesis-badge" 
       [class]="getThesisBadge('responseTime').priority.toLowerCase()"
       *ngIf="getThesisBadge('responseTime').show">
    {{ getThesisBadge('responseTime').priority }}
  </div>

  <div class="chart-card">
    <h3>Response Time Analysis</h3>
    <canvas baseChart
      [data]="responseTimeBarData"
      [options]="responseTimeBarOptions"
      [type]="responseTimeBarType">
    </canvas>
  </div>

  <div class="thesis-chart-caption">
    <strong>Figure 4:</strong> Response Time. System efficiency and latency comparison 
    across AI providers.
  </div>
</div>

<!-- ====================================================
     IMPLEMENTATION CHECKLIST
     ==================================================== -->

<!--
✅ INTEGRATION STEPS:

1. Copy the CSS:
   - Add <link> tag at the top of your template
   - Or import in your component.scss

2. Add Thesis Controls:
   - Copy the "THESIS MODE CONTROL SECTION" above
   - Paste at the top of your dashboard

3. Wrap Charts:
   - For each chart, wrap with <div class="thesis-chart-wrapper">
   - Add the thesis badge element
   - Add the thesis-chart-caption

4. Update CSS Import:
   - Add 'thesis-charts.css' to styleUrls in component.ts:
   
   @Component({
     ...
     styleUrls: ['./ai-metrics.component.css', './thesis-charts.css']
   })

5. Template Binding:
   - Use *ngIf and [class] bindings as shown above
   - All logic is already in the component

6. Test:
   - Click "Thesis Mode: OFF" button
   - Watch charts show/hide based on recommendation
   - Click "Export Charts" button
   - Use Ctrl+P to print as PDF

7. For Production:
   - Test all 5 recommended charts are visible in thesis mode
   - Verify captions are accurate
   - Check PDF export quality
   - Confirm badges display correctly

✅ STYLING CUSTOMIZATION:

If you want to change colors:
- .thesis-badge { background: #2563eb; } // Change essential badge color
- .thesis-mode-toggle { background: #2563eb; } // Change button color
- .thesis-badge.secondary { background: #8b5cf6; } // Change secondary color

For different font sizes:
- Adjust rem/px values in thesis-charts.css

For different layout:
- Modify grid in .thesis-stats-card for responsive columns
-->
