import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { useState, useEffect, useCallback } from 'react';
import './History.css';

type BackendStatus = 'ONLINE' | 'SLOW' | 'DEGRADED' | 'OFFLINE' | 'UNREACHABLE' | 'UNKNOWN';

interface BackendCheckResult {
    id: number;
    url: string;
    status: BackendStatus;
    responseTimeMs: number | null;
    httpStatusCode: number | null;
    errorMessage: string | null;
    checkedAt: string;
}

type FrontendStatus = 'fast' | 'slow' | 'down' | 'unknown';

interface HistoryRecord {
    id: number;
    timestamp: string;
    status: FrontendStatus;
    latency: number;
    httpStatusCode: number | null;
    errorMessage: string | null;
}

interface HistoryData {
    url: string;
    records: HistoryRecord[];
    averageLatency: number;
    uptime: number;
    totalChecks: number;
}


function mapStatus(s: BackendStatus): FrontendStatus {
    switch (s) {
        case 'ONLINE':      return 'fast';
        case 'SLOW':
        case 'DEGRADED':    return 'slow';
        case 'OFFLINE':
        case 'UNREACHABLE': return 'down';
        default:            return 'unknown';
    }
}

function normalizeUrl(raw: string): string {
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
        return 'https://' + raw;
    }
    return raw;
}

function displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

function buildHistoryData(url: string, raw: BackendCheckResult[]): HistoryData {
    const records: HistoryRecord[] = raw.map(r => ({
        id:            r.id,
        timestamp:     formatTimestamp(r.checkedAt),
        status:        mapStatus(r.status),
        latency:       r.responseTimeMs ?? 0,
        httpStatusCode: r.httpStatusCode,
        errorMessage:  r.errorMessage,
    }));

    const withLatency   = records.filter(r => r.latency > 0);
    const averageLatency = withLatency.length
        ? Math.round(withLatency.reduce((s, r) => s + r.latency, 0) / withLatency.length)
        : 0;

    const onlineCount = records.filter(r => r.status === 'fast' || r.status === 'slow').length;
    const uptime      = records.length
        ? Math.round((onlineCount / records.length) * 1000) / 10
        : 0;

    return { url, records, averageLatency, uptime, totalChecks: records.length };
}

export default function History() {
    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [loading, setLoading]         = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [error, setError]             = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get('url');
        if (urlParam) {
            fetchHistory(urlParam);
        }
    }, []);

    const fetchHistory = useCallback(async (rawUrl: string) => {
        setLoading(true);
        setShowHistory(false);
        setError(null);
        setHistoryData(null);

        const url = normalizeUrl(rawUrl);

        try {
            const res = await fetch(`/api/results/url?url=${encodeURIComponent(url)}`);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: BackendCheckResult[] = await res.json();

            if (data.length === 0) {
                setError(`Nenhum histórico encontrado para ${displayUrl(url)}. Faça uma checagem primeiro.`);
            } else {
                setHistoryData(buildHistoryData(url, data));
                setShowHistory(true);
            }
        } catch {
            setError('Não foi possível carregar o histórico. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (url: string) => fetchHistory(url);

    const statusDistribution = (records: HistoryRecord[]) =>
        (['fast', 'slow', 'down', 'unknown'] as FrontendStatus[])
            .map(status => ({
                status,
                count:      records.filter(r => r.status === status).length,
                percentage: records.length
                    ? Math.round((records.filter(r => r.status === status).length / records.length) * 100)
                    : 0,
            }))
            .filter(d => d.count > 0);

    return (
        <div className="history-page">
            <Header currentPage="history" />

            <main className="history-main">
                <section className="history-hero">
                    <div className="hero-content">
                        <h1 className="hero-title">Website History</h1>
                        <p className="hero-subtitle">View complete historical data and performance metrics</p>
                        <SearchBar onSearch={handleSearch} placeholder="Search for a website..." loading={loading} />
                    </div>
                </section>

                {/* ── erro ── */}
                {error && (
                    <section className="history-results">
                        <div className="summary-card vista-card error-card">
                            <span className="error-icon">⚠️</span>
                            <p className="error-message">{error}</p>
                        </div>
                    </section>
                )}

                {showHistory && historyData && (
                    <section className="history-results">

                        <div className="summary-card vista-card">
                            <h2 className="summary-title">{displayUrl(historyData.url)}</h2>

                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-label">Average Latency</span>
                                    <span className="metric-value">
                                        {historyData.averageLatency > 0 ? `${historyData.averageLatency}ms` : '—'}
                                    </span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Uptime</span>
                                    <span className="metric-value">{historyData.uptime}%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Total Checks</span>
                                    <span className="metric-value">
                                        {historyData.totalChecks.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Last Check</span>
                                    <StatusBadge
                                        status={historyData.records[0]?.status ?? 'unknown'}
                                        latency={historyData.records[0]?.latency}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="metrics-section">
                            <div className="metric-card vista-card hover-lift">
                                <h4 className="metric-card-title">Performance</h4>
                                <div className="metric-chart">
                                    <div className="chart-bar">
                                        <div
                                            className="bar-fill"
                                            style={{ width: `${historyData.uptime}%` }}
                                        />
                                    </div>
                                    <span className="chart-label">{historyData.uptime}% Uptime</span>
                                </div>
                            </div>

                            <div className="metric-card vista-card hover-lift">
                                <h4 className="metric-card-title">Response Time</h4>
                                <div className="response-time">
                                    <span className="time-value">
                                        {historyData.averageLatency > 0 ? `${historyData.averageLatency}ms` : '—'}
                                    </span>
                                    <span className="time-label">Average</span>
                                </div>
                            </div>

                            <div className="metric-card vista-card hover-lift">
                                <h4 className="metric-card-title">Status Distribution</h4>
                                <div className="status-distribution">
                                    {statusDistribution(historyData.records).map(({ status, percentage }) => (
                                        <div key={status} className="distribution-item">
                                            <span className="distribution-label">{status}</span>
                                            <span className="distribution-value">{percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="history-table-container vista-card">
                            <h3 className="table-title">
                                Historical Records
                                <span className="table-count">{historyData.totalChecks} entries</span>
                            </h3>

                            <div className="table-wrapper">
                                <table className="history-table">
                                    <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Status</th>
                                        <th>Latency</th>
                                        <th>HTTP</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {historyData.records.map(record => (
                                        <tr key={record.id} className="table-row">
                                            <td className="cell-timestamp">{record.timestamp}</td>
                                            <td className="cell-status">
                                                <StatusBadge status={record.status} latency={record.latency} />
                                            </td>
                                            <td className="cell-latency">
                                                {record.latency > 0 ? `${record.latency}ms` : '—'}
                                            </td>
                                            <td className="cell-http">
                                                {record.httpStatusCode
                                                    ? <span className={`http-code http-${Math.floor(record.httpStatusCode / 100)}xx`}>
                                                            {record.httpStatusCode}
                                                          </span>
                                                    : <span className="cell-empty">—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </section>
                )}
            </main>
        </div>
    );
}