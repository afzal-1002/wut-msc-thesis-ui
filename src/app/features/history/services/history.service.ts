import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AIHistoryResult,
  AccuracyTrendResult,
  ModelComparisonResult,
  ExplainabilityHistoryResult,
  HumanInLoopHistoryResult,
  StabilityHistoryResult,
  AIResponseArchive,
  EstimationComparisonData,
  StabilityOverTimeData,
  PerformanceMetricsData,
  ExplanationImpactData,
  PromptImpactData,
  UsageDistributionData,
  FrequencyHeatmapData,
  StabilityVarianceChartData,
  StabilityIndexData,
  StabilityRadarData,
  StabilityScatterPoint
} from '../models/history.models';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private base = `${environment.apiUrl}/api/wut/ai/history`;

  constructor(private http: HttpClient) {}

  getEstimations(params?: Record<string, any>): Observable<AIHistoryResult[]> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http.get<AIHistoryResult[]>(`${this.base}/estimations`, { params: httpParams });
  }

  getAccuracyTrend(provider: string): Observable<AccuracyTrendResult[]> {
    const params = new HttpParams().set('aiProvider', provider);
    return this.http.get<AccuracyTrendResult[]>(`${this.base}/accuracy-trend`, { params });
  }

  getModelComparison(): Observable<ModelComparisonResult[]> {
    return this.http.get<ModelComparisonResult[]>(`${this.base}/model-comparison`);
  }

  getExplainabilityImpact(): Observable<ExplainabilityHistoryResult[]> {
    return this.http.get<ExplainabilityHistoryResult[]>(`${this.base}/explainability-impact`);
  }

  getHumanInLoop(): Observable<HumanInLoopHistoryResult[]> {
    return this.http.get<HumanInLoopHistoryResult[]>(`${this.base}/human-in-loop`);
  }

  getStability(): Observable<StabilityHistoryResult[]> {
    return this.http.get<StabilityHistoryResult[]>(`${this.base}/stability`);
  }

  getRaw(issueKey: string): Observable<AIResponseArchive> {
    return this.http.get<AIResponseArchive>(`${this.base}/raw/${encodeURIComponent(issueKey)}`);
  }

  // Aggregation Methods for Charts
  processEstimationComparison(data: AIHistoryResult[]): EstimationComparisonData[] {
    const grouped = new Map<string, AIHistoryResult[]>();
    data.forEach(item => {
      if (!grouped.has(item.aiProvider)) {
        grouped.set(item.aiProvider, []);
      }
      grouped.get(item.aiProvider)!.push(item);
    });

    return Array.from(grouped.entries()).map(([provider, items]) => {
      const validEstimates = items.filter(i => i.estimatedHours).map(i => i.estimatedHours!);
      return {
        provider,
        avgEstimation: validEstimates.length > 0 ? validEstimates.reduce((a, b) => a + b, 0) / validEstimates.length : 0,
        minEstimation: Math.min(...validEstimates),
        maxEstimation: Math.max(...validEstimates),
        count: items.length
      };
    });
  }

  processStabilityOverTime(data: AIHistoryResult[]): StabilityOverTimeData[] {
    const grouped = new Map<string, AIHistoryResult[]>();
    data.forEach(item => {
      const date = new Date(item.createdAt).toLocaleDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, items]) => {
        const geminiItems = items.filter(i => i.aiProvider === 'GEMINI' && i.estimatedHours);
        const deepseekItems = items.filter(i => i.aiProvider === 'DEEPSEEK' && i.estimatedHours);
        
        return {
          date,
          geminiEstimation: geminiItems.length > 0 ? geminiItems.reduce((a, b) => a + b.estimatedHours!, 0) / geminiItems.length : undefined,
          deepseekEstimation: deepseekItems.length > 0 ? deepseekItems.reduce((a, b) => a + b.estimatedHours!, 0) / deepseekItems.length : undefined,
          geminiTime: geminiItems.length > 0 ? geminiItems.reduce((a, b) => a + (b.analysisTimeSec || 0), 0) / geminiItems.length : undefined,
          deepseekTime: deepseekItems.length > 0 ? deepseekItems.reduce((a, b) => a + (b.analysisTimeSec || 0), 0) / deepseekItems.length : undefined
        };
      });
  }

  processPerformanceMetrics(data: AIHistoryResult[]): PerformanceMetricsData[] {
    const grouped = new Map<string, number[]>();
    data.forEach(item => {
      if (!grouped.has(item.aiProvider)) {
        grouped.set(item.aiProvider, []);
      }
      if (item.analysisTimeSec) {
        grouped.get(item.aiProvider)!.push(item.analysisTimeSec);
      }
    });

    return Array.from(grouped.entries()).map(([provider, times]) => {
      const sorted = times.sort((a, b) => a - b);
      return {
        provider,
        avgAnalysisTime: times.reduce((a, b) => a + b, 0) / times.length,
        minAnalysisTime: Math.min(...times),
        maxAnalysisTime: Math.max(...times),
        medianAnalysisTime: sorted[Math.floor(sorted.length / 2)]
      };
    });
  }

  processExplanationImpact(data: AIHistoryResult[]): ExplanationImpactData[] {
    const result: ExplanationImpactData[] = [];
    const grouped = new Map<string, AIHistoryResult[]>();

    data.forEach(item => {
      const key = `${item.aiProvider}-${item.explanationEnabled}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    grouped.forEach((items, key) => {
      const [provider, explEnabled] = key.split('-');
      const validEstimates = items.filter(i => i.estimatedHours).map(i => i.estimatedHours!);
      result.push({
        explanationEnabled: explEnabled === 'true',
        provider,
        avgEstimation: validEstimates.length > 0 ? validEstimates.reduce((a, b) => a + b, 0) / validEstimates.length : 0,
        count: items.length
      });
    });

    return result;
  }

  processPromptImpact(data: AIHistoryResult[]): PromptImpactData[] {
    const result: PromptImpactData[] = [];
    const grouped = new Map<string, AIHistoryResult[]>();

    data.forEach(item => {
      const key = `${item.aiProvider}-${item.userPromptProvided}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    grouped.forEach((items, key) => {
      const [provider, promptProvided] = key.split('-');
      const validEstimates = items.filter(i => i.estimatedHours).map(i => i.estimatedHours!);
      const times = items.filter(i => i.analysisTimeSec).map(i => i.analysisTimeSec!);
      result.push({
        promptProvided: promptProvided === 'true',
        provider,
        avgEstimation: validEstimates.length > 0 ? validEstimates.reduce((a, b) => a + b, 0) / validEstimates.length : 0,
        avgAnalysisTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
        count: items.length
      });
    });

    return result;
  }

  processUsageDistribution(data: AIHistoryResult[]): UsageDistributionData[] {
    const grouped = new Map<string, number>();
    data.forEach(item => {
      grouped.set(item.aiProvider, (grouped.get(item.aiProvider) || 0) + 1);
    });

    const total = data.length;
    return Array.from(grouped.entries()).map(([provider, count]) => ({
      provider,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  processFrequencyHeatmap(data: AIHistoryResult[]): FrequencyHeatmapData[] {
    const result: FrequencyHeatmapData[] = [];
    const buckets = ['2h', '4h', '8h', '12h', '16h', '20h+'];
    
    const grouped = new Map<string, Map<string, number>>();
    data.forEach(item => {
      if (!item.estimatedHours) return;
      
      if (!grouped.has(item.aiProvider)) {
        grouped.set(item.aiProvider, new Map());
      }

      let bucket = '2h';
      if (item.estimatedHours <= 2) bucket = '2h';
      else if (item.estimatedHours <= 4) bucket = '4h';
      else if (item.estimatedHours <= 8) bucket = '8h';
      else if (item.estimatedHours <= 12) bucket = '12h';
      else if (item.estimatedHours <= 16) bucket = '16h';
      else bucket = '20h+';

      const providerMap = grouped.get(item.aiProvider)!;
      providerMap.set(bucket, (providerMap.get(bucket) || 0) + 1);
    });

    grouped.forEach((bucketMap, provider) => {
      buckets.forEach(bucket => {
        result.push({
          provider,
          estimationRange: bucket,
          frequency: bucketMap.get(bucket) || 0
        });
      });
    });

    return result;
  }

  processExplainabilityImpactChart(data: AIHistoryResult[]): EstimationComparisonData[] {
    // This processes estimation data (fallback if using estimation endpoint)
    const grouped = new Map<string, AIHistoryResult[]>();
    data.forEach(item => {
      if (!grouped.has(item.aiProvider)) {
        grouped.set(item.aiProvider, []);
      }
      grouped.get(item.aiProvider)!.push(item);
    });

    return Array.from(grouped.entries()).map(([provider, items]) => {
      const validEstimates = items.filter(i => i.estimatedHours).map(i => i.estimatedHours!);
      return {
        provider,
        avgEstimation: validEstimates.length > 0 ? validEstimates.reduce((a, b) => a + b, 0) / validEstimates.length : 0,
        minEstimation: Math.min(...validEstimates),
        maxEstimation: Math.max(...validEstimates),
        count: items.length
      };
    });
  }

  processExplainabilityImpactByProvider(data: any[]): any[] {
    // Transform explainability impact API response grouped by provider
    const grouped = new Map<string, any>();

    data.forEach(item => {
      const provider = item.aiProvider;
      if (!grouped.has(provider)) {
        grouped.set(provider, { provider, withExplanation: 0, withoutExplanation: 0 });
      }
      const group = grouped.get(provider);
      
      const responseTime = item.avgResponseTime || item.avgResponseTimeSec || 0;
      
      if (item.explanationEnabled) {
        group.withExplanation = responseTime;
      } else {
        group.withoutExplanation = responseTime;
      }
    });

    // Calculate overhead
    return Array.from(grouped.values()).map(item => ({
      ...item,
      overheadDelta: item.withExplanation - item.withoutExplanation
    }));
  }

  processStabilityVariance(data: StabilityHistoryResult[]): StabilityVarianceChartData[] {
    return data.map(item => ({
      provider: item.aiProvider,
      estimationVariance: parseFloat(item.estimationVariance.toFixed(2)),
      responseTimeVariance: parseFloat(item.responseTimeVariance.toFixed(2)),
      totalVariance: parseFloat((item.estimationVariance + item.responseTimeVariance).toFixed(2))
    }));
  }

  processStabilityIndex(data: StabilityHistoryResult[]): StabilityIndexData[] {
    return data.map(item => {
      const totalVariance = item.estimationVariance + item.responseTimeVariance;
      const stabilityIndex = totalVariance > 0 ? parseFloat((1 / totalVariance).toFixed(4)) : 0;
      return {
        provider: item.aiProvider,
        stabilityIndex,
        estimationVariance: parseFloat(item.estimationVariance.toFixed(2)),
        responseTimeVariance: parseFloat(item.responseTimeVariance.toFixed(2))
      };
    });
  }

  processStabilityRadar(data: StabilityHistoryResult[]): StabilityRadarData[] {
    // Normalize variance to stability (0-10 scale where 10 = most stable)
    // Find max variance for normalization
    const maxEstVar = Math.max(...data.map(d => d.estimationVariance));
    const maxRespVar = Math.max(...data.map(d => d.responseTimeVariance));

    return data.map(item => ({
      provider: item.aiProvider,
      estimationStability: parseFloat((10 - (item.estimationVariance / maxEstVar) * 10).toFixed(2)),
      responseTimeStability: parseFloat((10 - (item.responseTimeVariance / maxRespVar) * 10).toFixed(2))
    }));
  }

  processStabilityScatter(data: StabilityHistoryResult[]): StabilityScatterPoint[] {
    return data.map(item => ({
      provider: item.aiProvider,
      estimationVariance: item.estimationVariance,
      responseTimeVariance: item.responseTimeVariance
    }));
  }
}

