import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AiEstimationsService } from '../../../../services/ai/ai-estimations.service';

let pluginsRegistered = false;
if (typeof window !== 'undefined' && !pluginsRegistered) {
    Chart.register(ChartDataLabels);
    pluginsRegistered = true;
}

interface ScoreRow {
    criterion: string;
    gemini: string;
    deepseek: string;
}

@Component({
    selector: 'app-ai-overall-comparison',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './ai-overall-comparison.component.html',
    styleUrls: ['./ai-overall-comparison.component.css']
})
export class AiOverallComparisonComponent implements OnInit {

    isLoading = false;
    error = '';
    rawModels: any[] = [];

    performanceErrorBarData: any;
    estimationGroupedData: any;
    stabilityPieData: any;
    contentBarData: any;
    overallRadarData: any;

    scorecardRows: ScoreRow[] = [];
    insights: string[] = [];

    constructor(private aiService: AiEstimationsService) { }

    ngOnInit(): void {
        this.fetchModels();
    }

    /* ================= OPTIONS ================= */

    performanceErrorBarOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: v => `${Number(v).toFixed(2)}s`
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Response time (s)' }
            }
        }
    };

    /** Estimation Behaviour – SAME RULES as Content Quality */
    estimationGroupedOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: v => `${Number(v).toFixed(2)}h`
            }
        },
        scales: {
            x: {
                grid: { display: false },
                offset: true
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Estimated resolution time (hours)' }
            }
        }
    };

    stabilityPieOptions: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: {
                formatter: v => Number(v).toFixed(2)
            }
        }
    };

    /** Content Quality – reference style */
    contentBarOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: v => Number(v).toFixed(2)
            }
        },
        scales: {
            x: {
                grid: { display: false },
                offset: true
            },
            y: {
                beginAtZero: true,
                max: 3,
                position: 'left',
                title: { display: true, text: 'Engineering relevance score' }
            },
            y1: {
                beginAtZero: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Avg response length (k tokens)' }
            }
        }
    };

    overallRadarOptions: ChartOptions<'radar'> = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: { display: false }
        },
        scales: {
            r: { beginAtZero: true, suggestedMax: 1 }
        }
    };

    /* ================= DATA ================= */

    private fetchModels(): void {
        this.isLoading = true;
        this.error = '';
        this.aiService.getFullModelComparison().subscribe({
            next: raw => {
                this.rawModels = raw ?? [];
                this.buildCharts();
                this.isLoading = false;
            },
            error: () => {
                this.error = 'Failed to load overall comparison.';
                this.isLoading = false;
            }
        });
    }

    private buildCharts(): void {
        if (!this.rawModels.length) return;

        const labels = this.rawModels.map(m => this.prettyName(m.aiProvider));

        /* ---------- Performance ---------- */
        const avgTime = this.rawModels.map(m => +m.avgResponseTimeSec || 0);
        this.performanceErrorBarData = {
            labels,
            datasets: [
                {
                    data: avgTime,
                    backgroundColor: ['#2563eb', '#16a34a'],
                    borderRadius: 10,

                    /* 👇 make bars thinner */
                    categoryPercentage: 0.25,
                    barPercentage: 0.6
                }
            ]
        };


        /* ---------- Estimation Behaviour ---------- */
        const minH = this.rawModels.map(m => +m.minEstimatedHours || 0);
        const avgH = this.rawModels.map(m => +m.avgEstimatedHours || 0);
        const maxH = this.rawModels.map(m => +m.maxEstimatedHours || 0);

        this.estimationGroupedData = {
            labels,
            datasets: [
                {
                    label: 'Min',
                    data: minH,
                    backgroundColor: '#83a2c5',
                    borderRadius: 8,
                    categoryPercentage: 0.55,
                    barPercentage: 0.5
                },
                {
                    label: 'Avg',
                    data: avgH,
                    backgroundColor: '#488337',
                    borderRadius: 8,
                    categoryPercentage: 0.55,
                    barPercentage: 0.5
                },
                {
                    label: 'Max',
                    data: maxH,
                    backgroundColor: '#1642b9',
                    borderRadius: 8,
                    categoryPercentage: 0.55,
                    barPercentage: 0.5
                }
            ]
        };

        /* ---------- Stability ---------- */
        const stability = this.rawModels.map(m => +m.stabilityScore || 0);
        this.stabilityPieData = {
            labels,
            datasets: [
                {
                    data: stability,
                    backgroundColor: ['#0ea5e9', '#f97316']
                }
            ]
        };

        /* ---------- Content Quality ---------- */
        const relevance = this.rawModels.map(m => +m.engineeringRelevanceScore || 0);
        const verbosity = this.rawModels.map(m => (+m.avgResponseLength || 0) / 1000);

        this.contentBarData = {
            labels,
            datasets: [
                {
                    label: 'Engineering relevance score',
                    data: relevance,
                    backgroundColor: '#22c55e',
                    yAxisID: 'y',
                    borderRadius: 8,
                    categoryPercentage: 0.55,
                    barPercentage: 0.5
                },
                {
                    label: 'Avg response length (k tokens)',
                    data: verbosity,
                    backgroundColor: '#0f62fe',
                    yAxisID: 'y1',
                    borderRadius: 8,
                    categoryPercentage: 0.55,
                    barPercentage: 0.5
                }
            ]
        };

        this.buildRadar(avgTime, avgH, stability, relevance, verbosity);
        this.buildScorecard();
        this.buildInsights();
    }

    /* ================= RADAR ================= */

    private buildRadar(
        avgTime: number[],
        avgHours: number[],
        stability: number[],
        relevance: number[],
        lengthK: number[]
    ): void {
        const gem = this.getModel('GEMINI');
        const deep = this.getModel('DEEPSEEK');
        if (!gem || !deep) return;

        const labels = [
            'Response speed',
            'Estimation conservatism',
            'Stability',
            'Engineering relevance',
            'Response verbosity'
        ];

        const gemData = [
            this.normalizeMetric(gem.avgResponseTimeSec, avgTime, true),
            this.normalizeMetric(gem.avgEstimatedHours, avgHours, false),
            this.normalizeMetric(gem.stabilityScore, stability),
            this.normalizeMetric(gem.engineeringRelevanceScore, relevance),
            this.normalizeMetric(gem.avgResponseLength / 1000, lengthK)
        ];

        const deepData = [
            this.normalizeMetric(deep.avgResponseTimeSec, avgTime, true),
            this.normalizeMetric(deep.avgEstimatedHours, avgHours, false),
            this.normalizeMetric(deep.stabilityScore, stability),
            this.normalizeMetric(deep.engineeringRelevanceScore, relevance),
            this.normalizeMetric(deep.avgResponseLength / 1000, lengthK)
        ];

        this.overallRadarData = {
            labels,
            datasets: [
                {
                    label: 'Gemini',
                    data: gemData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.25)',
                    pointBackgroundColor: '#6366f1'
                },
                {
                    label: 'DeepSeek',
                    data: deepData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.25)',
                    pointBackgroundColor: '#10b981'
                }
            ]
        };
    }

    /* ================= SUMMARY ================= */

    private buildScorecard(): void {
        const gem = this.getModel('GEMINI');
        const deep = this.getModel('DEEPSEEK');
        if (!gem || !deep) return;

        this.scorecardRows = [
            { criterion: 'Speed', gemini: `❌ ${gem.avgResponseTimeSec.toFixed(2)}s`, deepseek: `✅ ${deep.avgResponseTimeSec.toFixed(2)}s` },
            { criterion: 'Latency stability', gemini: `❌ σ ${gem.stdDeviationResponseTime.toFixed(2)}s`, deepseek: `✅ σ ${deep.stdDeviationResponseTime.toFixed(2)}s` },
            { criterion: 'Estimation conservatism', gemini: `✅ avg ${gem.avgEstimatedHours.toFixed(1)}h`, deepseek: `⚠️ avg ${deep.avgEstimatedHours.toFixed(1)}h` },
            { criterion: 'Engineering depth', gemini: `✅ ${gem.engineeringRelevanceScore.toFixed(2)}`, deepseek: `⚠️ ${deep.engineeringRelevanceScore.toFixed(2)}` }
        ];
    }

    private buildInsights(): void {
        const gem = this.getModel('GEMINI');
        const deep = this.getModel('DEEPSEEK');
        if (!gem || !deep) return;

        const speedDiff = ((gem.avgResponseTimeSec - deep.avgResponseTimeSec) / gem.avgResponseTimeSec) * 100;
        const estimateSpread = gem.maxEstimatedHours - gem.minEstimatedHours;
        const stabilityGap = deep.stabilityScore - gem.stabilityScore;

        this.insights = [
            `DeepSeek replies about ${speedDiff.toFixed(1)}% faster with tighter latency variance.`,
            `Gemini’s estimation window spans ${estimateSpread.toFixed(1)} hours, supplying conservative planning buffers.`,
            `DeepSeek’s stability score is ${(stabilityGap * 100).toFixed(1)} bps higher, indicating more repeatable behaviour.`,
            'Radar analysis supports a hybrid workflow: DeepSeek for rapid triage, Gemini for deep engineering analysis.'
        ];
    }

    /* ================= HELPERS ================= */

    private normalizeMetric(value: number, values: number[], lowerIsBetter = false): number {
        const finite = values.filter(v => Number.isFinite(v));
        if (!finite.length) return 0;
        const min = Math.min(...finite);
        const max = Math.max(...finite);
        if (max === min) return 1;
        return lowerIsBetter
            ? (max - value) / (max - min)
            : (value - min) / (max - min);
    }

    private prettyName(name: string): string {
        const val = (name ?? '').toUpperCase();
        if (val.includes('GEMINI')) return 'Gemini';
        if (val.includes('DEEP')) return 'DeepSeek';
        return name ?? '';
    }

    private getModel(key: 'GEMINI' | 'DEEPSEEK') {
        return this.rawModels.find(m => (m.aiProvider ?? '').toUpperCase() === key);
    }
}
