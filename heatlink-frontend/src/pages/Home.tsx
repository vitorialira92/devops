import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Home.css';

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

interface CheckResponse {
    source: 'cache' | 'queued';
    result?: BackendCheckResult;
    message?: string;
}

interface RankingEntry {
    id: number;
    url: string;
    queryCount: number;
}

type FrontendStatus = 'fast' | 'slow' | 'down' | 'unknown';

interface SearchResult {
    url: string;
    status: FrontendStatus;
    latency: number;
    httpStatusCode: number | null;
    errorMessage: string | null;
    checkedAt: string;
    fromCache: boolean;
}

function mapStatus(backendStatus: BackendStatus): FrontendStatus {
    switch (backendStatus) {
        case 'ONLINE':      return 'fast';
        case 'SLOW':        return 'slow';
        case 'DEGRADED':    return 'slow';
        case 'OFFLINE':     return 'down';
        case 'UNREACHABLE': return 'down';
        case 'UNKNOWN':
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

const POLL_INTERVAL_MS  = 2000;
const POLL_MAX_ATTEMPTS = 15;

export default function Home() {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [loading, setLoading]           = useState(false);
    const [polling, setPolling]           = useState(false);
    const [pollAttempts, setPollAttempts] = useState(0);
    const [showResult, setShowResult]     = useState(false);
    const [error, setError]               = useState<string | null>(null);

    const [ranking, setRanking]         = useState<RankingEntry[]>([]);
    const [rankingLoading, setRankingLoading] = useState(true);

    const pollTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUrlRef = useRef<string | null>(null);
    const attemptsRef   = useRef(0);

    const fetchRanking = useCallback(async () => {
        try {
            const res = await fetch('/api/ranking');
            if (!res.ok) throw new Error('ranking fetch failed');
            const data: RankingEntry[] = await res.json();
            setRanking(data);
        } catch {
        } finally {
            setRankingLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRanking();
    }, [fetchRanking]);

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        setPolling(false);
    }, []);

    const applyResult = useCallback((data: BackendCheckResult, fromCache: boolean) => {
        setSearchResult({
            url:           data.url,
            status:        mapStatus(data.status),
            latency:       data.responseTimeMs ?? 0,
            httpStatusCode: data.httpStatusCode,
            errorMessage:  data.errorMessage,
            checkedAt:     data.checkedAt,
            fromCache,
        });
        setShowResult(true);
        stopPolling();
        setLoading(false);

        fetchRanking();
    }, [stopPolling, fetchRanking]);

    const pollOnce = useCallback(async (url: string) => {
        attemptsRef.current += 1;
        setPollAttempts(attemptsRef.current);

        try {
            const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('poll failed');

            const data: CheckResponse = await res.json();

            if (data.source === 'cache' && data.result) {
                applyResult(data.result, false);
                return;
            }
        } catch {
            // continua tentando
        }

        if (attemptsRef.current >= POLL_MAX_ATTEMPTS) {
            setError('O worker está demorando mais que o esperado. Tente novamente em instantes.');
            stopPolling();
            setLoading(false);
            return;
        }

        pollTimerRef.current = setTimeout(() => pollOnce(url), POLL_INTERVAL_MS);
    }, [applyResult, stopPolling]);

    const handleSearch = useCallback(async (rawUrl: string) => {
        stopPolling();
        setLoading(true);
        setShowResult(false);
        setError(null);
        setSearchResult(null);
        setPollAttempts(0);
        attemptsRef.current = 0;

        const url = normalizeUrl(rawUrl);
        pendingUrlRef.current = url;

        try {
            const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: CheckResponse = await res.json();

            if (data.source === 'cache' && data.result) {
                applyResult(data.result, true);
            } else {
                setPolling(true);
                pollTimerRef.current = setTimeout(() => pollOnce(url), POLL_INTERVAL_MS);
            }
        } catch (err) {
            setError('Não foi possível conectar à API. Verifique se o backend está rodando.');
            setLoading(false);
        }
    }, [applyResult, pollOnce, stopPolling]);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    return (
        <div className="home-page">
            <Header currentPage="home" />

            <main className="home-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Check Website Status</h1>
                        <p className="hero-subtitle">
                            Monitor the speed and availability of any website in real-time
                        </p>

                        <SearchBar onSearch={handleSearch} loading={loading} />
                    </div>
                </section>

                {polling && !showResult && (
                    <section className="result-section">
                        <div className="result-card vista-card processing-card">
                            <div className="processing-indicator">
                                <span className="processing-spinner" />
                                <p className="processing-text">
                                    Checking URL… attempt {pollAttempts}/{POLL_MAX_ATTEMPTS}
                                </p>
                            </div>
                            <p className="processing-sub">
                                The worker is running the check. Results will appear automatically.
                            </p>
                        </div>
                    </section>
                )}

                {error && (
                    <section className="result-section">
                        <div className="result-card vista-card error-card">
                            <span className="error-icon">⚠️</span>
                            <p className="error-message">{error}</p>
                        </div>
                    </section>
                )}

                {showResult && searchResult && (
                    <section className="result-section">
                        <div className="result-card vista-card">
                            <div className="result-header">
                                <h2 className="result-url">{displayUrl(searchResult.url)}</h2>
                                <StatusBadge
                                    status={searchResult.status}
                                    latency={searchResult.latency}
                                />
                            </div>

                            <div className="result-details">
                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">
                                        {searchResult.status.charAt(0).toUpperCase() +
                                            searchResult.status.slice(1)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Latency</span>
                                    <span className="detail-value">
                                        {searchResult.latency > 0 ? `${searchResult.latency}ms` : '—'}
                                    </span>
                                </div>
                                {searchResult.httpStatusCode && (
                                    <div className="detail-item">
                                        <span className="detail-label">HTTP</span>
                                        <span className="detail-value">
                                            {searchResult.httpStatusCode}
                                        </span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <span className="detail-label">Source</span>
                                    <span className={`detail-value source-badge ${searchResult.fromCache ? 'source-cache' : 'source-live'}`}>
                                        {searchResult.fromCache ? 'cache' : 'live'}
                                    </span>
                                </div>
                            </div>

                            {searchResult.errorMessage && (
                                <div className="error-detail">
                                    <span className="detail-label">Error</span>
                                    <span className="error-detail-msg">{searchResult.errorMessage}</span>
                                </div>
                            )}

                            <button
                                className="view-history-btn"
                                onClick={() => {
                                    window.location.href = `/history?url=${encodeURIComponent(searchResult.url)}`;
                                }}
                            >
                                View Full History
                            </button>
                        </div>
                    </section>
                )}

                <section className="top-websites-section">
                    <div className="section-header">
                        <h2 className="section-title">Top 10 Most Searched Websites</h2>
                        <p className="section-subtitle">Ranked by total number of checks</p>
                    </div>

                    {rankingLoading ? (
                        <div className="ranking-loading">Loading ranking…</div>
                    ) : ranking.length === 0 ? (
                        <div className="ranking-empty">
                            No data yet. Be the first to check a URL!
                        </div>
                    ) : (
                        <div className="websites-grid">
                            {ranking.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className="website-card vista-card hover-lift"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleSearch(entry.url)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(entry.url)}
                                    title={`Check ${entry.url} again`}
                                >
                                    <div className="website-rank">#{index + 1}</div>
                                    <h3 className="website-name">{displayUrl(entry.url)}</h3>
                                    <div className="website-meta">
                                        <span className="website-checks">
                                            {entry.queryCount.toLocaleString('pt-BR')} checks
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}