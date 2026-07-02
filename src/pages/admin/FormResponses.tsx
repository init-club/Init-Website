import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, Download, Table, BarChart3, Search, Calendar,
  MessageSquare, Star, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import useSWR from 'swr';
import { fetchFormById, fetchFormResponses } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import { exportResponsesAsCsv } from '../../utils/formUtils';

export default function FormResponsesPage() {
  const { formId } = useParams<{ formId: string }>();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Load Form Metadata and responses
  const { data: form, error: formError } = useSWR(
    isAdmin && formId ? `form:${formId}` : null,
    () => fetchFormById(formId!)
  );

  const { data: responses, error: responsesError, mutate } = useSWR(
    isAdmin && formId ? `form_responses:${formId}` : null,
    () => fetchFormResponses(formId!)
  );

  // UI States
  const [activeTab, setActiveTab] = useState<'analytics' | 'responses'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthLoading, navigate]);

  // Compute Timeline chart data
  const timelineData = useMemo(() => {
    if (!responses || responses.length === 0) return [];
    
    // Group by Date YYYY-MM-DD
    const groups: Record<string, number> = {};
    
    // Generate last 15 days placeholders
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      groups[dateStr] = 0;
    }

    responses.forEach((r: any) => {
      const dateStr = new Date(r.submitted_at).toISOString().split('T')[0];
      if (groups[dateStr] !== undefined) {
        groups[dateStr] += 1;
      } else {
        // Just in case it's older than 15 days, we still track it if within scope
        groups[dateStr] = (groups[dateStr] || 0) + 1;
      }
    });

    return Object.keys(groups)
      .sort()
      .map(date => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        return {
          date: formattedDate,
          submissions: groups[date]
        };
      });
  }, [responses]);

  // General counts
  const stats = useMemo(() => {
    if (!responses) return { total: 0, today: 0, thisWeek: 0 };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    return {
      total: responses.length,
      today: responses.filter((r: any) => new Date(r.submitted_at).getTime() >= startOfToday).length,
      thisWeek: responses.filter((r: any) => new Date(r.submitted_at).getTime() >= oneWeekAgo).length
    };
  }, [responses]);

  // Parse questions & fields
  const formFields = useMemo(() => {
    if (!form || !Array.isArray(form.fields)) return [];
    return [...form.fields].sort((a, b) => a.order - b.order);
  }, [form]);

  // Filter out dividers for responses
  const inputFields = useMemo(() => {
    return formFields.filter(f => f.type !== 'section');
  }, [formFields]);

  // Compute aggregate stats per field choice
  const fieldAnalytics = useMemo(() => {
    if (!responses || !form) return {};
    
    const analytics: Record<string, any> = {};

    inputFields.forEach(field => {
      const answersList = responses.map((r: any) => r.answers[field.id]).filter(v => v !== undefined && v !== null);

      if (['select', 'radio', 'multiselect'].includes(field.type)) {
        const optionCounts: Record<string, number> = {};
        // Initialize options
        (field.options || []).forEach((opt: string) => {
          optionCounts[opt] = 0;
        });

        answersList.forEach(ans => {
          if (Array.isArray(ans)) {
            ans.forEach((opt: string) => {
              optionCounts[opt] = (optionCounts[opt] || 0) + 1;
            });
          } else if (typeof ans === 'string') {
            optionCounts[ans] = (optionCounts[ans] || 0) + 1;
          }
        });

        analytics[field.id] = Object.keys(optionCounts).map(opt => ({
          name: opt,
          count: optionCounts[opt]
        }));
      }

      if (field.type === 'checkbox') {
        let yes = 0;
        let no = 0;
        answersList.forEach(ans => {
          if (ans === true) yes++;
          else no++;
        });
        analytics[field.id] = [
          { name: 'Checked', count: yes, color: '#06b6d4' },
          { name: 'Unchecked', count: no, color: '#27272a' }
        ];
      }

      if (field.type === 'rating') {
        const scale = field.scale || 5;
        const counts: Record<number, number> = {};
        for (let i = 1; i <= scale; i++) counts[i] = 0;

        let sum = 0;
        answersList.forEach(ans => {
          const num = Number(ans);
          if (!isNaN(num)) {
            counts[num] = (counts[num] || 0) + 1;
            sum += num;
          }
        });

        const avg = answersList.length > 0 ? (sum / answersList.length).toFixed(1) : '0';

        analytics[field.id] = {
          average: avg,
          distribution: Object.keys(counts).map(num => ({
            rating: `${num}★`,
            count: counts[Number(num)]
          }))
        };
      }

      if (['text', 'textarea', 'email', 'date', 'number'].includes(field.type)) {
        // Return 10 most recent answers as samples
        analytics[field.id] = answersList.slice(0, 10);
      }
    });

    return analytics;
  }, [responses, form, inputFields]);

  // Client-side search filtering for responses table
  const filteredResponses = useMemo(() => {
    if (!responses) return [];
    if (!searchQuery.trim()) return responses;

    const query = searchQuery.toLowerCase().trim();
    return responses.filter((r: any) => {
      // Search inside respondent details
      if (r.respondent?.name?.toLowerCase().includes(query)) return true;
      if (r.respondent?.email?.toLowerCase().includes(query)) return true;
      
      // Search inside answers
      return Object.values(r.answers).some(val => {
        if (Array.isArray(val)) {
          return val.some(v => String(v).toLowerCase().includes(query));
        }
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [responses, searchQuery]);

  // Pagination bounds
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResponses.slice(start, start + itemsPerPage);
  }, [filteredResponses, currentPage]);

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);

  const handleExport = () => {
    if (!form || !responses) return;
    exportResponsesAsCsv(form, responses);
  };

  const isLoading = isAuthLoading || !form || !responses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-24 pb-16 px-4">
        {/* Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5">
            <div>
              <Link
                to="/admin/forms"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs mb-2 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Form Manager
              </Link>
              <h1 className="text-2xl font-black font-heading tracking-tight">{form.title}</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Responses and analytics summary</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={responses.length === 0}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  responses.length > 0
                    ? 'bg-white hover:bg-zinc-200 text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Download size={14} />
                Export Responses (.csv)
              </button>
            </div>
          </div>

          {/* Quick Summary Counts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 text-center">
              <div className="text-[10px] text-zinc-650 font-mono uppercase tracking-wider">Total Answers</div>
              <div className="text-xl md:text-3xl font-black font-heading text-white mt-1">{stats.total}</div>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 text-center">
              <div className="text-[10px] text-zinc-650 font-mono uppercase tracking-wider">Today</div>
              <div className="text-xl md:text-3xl font-black font-heading text-cyan-400 mt-1">{stats.today}</div>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 text-center">
              <div className="text-[10px] text-zinc-650 font-mono uppercase tracking-wider">This Week</div>
              <div className="text-xl md:text-3xl font-black font-heading text-purple-400 mt-1">{stats.thisWeek}</div>
            </div>
          </div>

          {/* Timeline and Navigation tab selector */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <BarChart3 size={14} />
                  Summary Analytics
                </button>
                <button
                  onClick={() => setActiveTab('responses')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'responses'
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Table size={14} />
                  Raw Submissions
                </button>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                ACTIVE STATUS:{' '}
                <span className="font-bold text-cyan-400 uppercase">{form.status}</span>
              </span>
            </div>

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Timeline Chart */}
                {responses.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-400 font-heading uppercase tracking-wider">
                      Submission Frequency (Last 15 Days)
                    </h3>
                    <div className="h-64 w-full bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                          <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              background: '#09090b',
                              border: '1px solid #27272a',
                              borderRadius: '12px',
                              fontSize: '11px',
                              color: '#fff'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="submissions"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={{ fill: '#06b6d4', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Field-by-Field Breakdown cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 font-heading uppercase tracking-wider">
                    Question Analysis
                  </h3>
                  
                  {responses.length === 0 ? (
                    <div className="text-center py-10 text-zinc-600 text-xs italic">
                      No responses available to analyze.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inputFields.map(field => {
                        const data = fieldAnalytics[field.id];
                        
                        return (
                          <div key={field.id} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-4">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">
                                QUESTION TYPE: {field.type}
                              </span>
                              <h4 className="text-sm font-bold text-zinc-200 line-clamp-2">{field.label}</h4>
                            </div>

                            {/* SELECT / RADIO / MULTISELECT breakdown */}
                            {['select', 'radio', 'multiselect'].includes(field.type) && Array.isArray(data) && (
                              <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={data} layout="vertical">
                                    <XAxis type="number" stroke="#71717a" fontSize={9} />
                                    <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} width={90} />
                                    <Tooltip
                                      contentStyle={{
                                        background: '#09090b',
                                        border: '1px solid #27272a',
                                        borderRadius: '12px',
                                        fontSize: '10px'
                                      }}
                                    />
                                    <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]}>
                                      {data.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#a855f7' : '#06b6d4'} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}

                            {/* CHECKBOX breakdown */}
                            {field.type === 'checkbox' && Array.isArray(data) && (
                              <div className="flex items-center gap-6">
                                <div className="w-28 h-28">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={data}
                                        dataKey="count"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                      >
                                        {data.map((entry, idx) => (
                                          <Cell key={`cell-${idx}`} fill={entry.color} />
                                        ))}
                                      </Pie>
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="space-y-1">
                                  {data.map(d => (
                                    <div key={d.name} className="flex items-center gap-2 text-xs">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                      <span className="text-zinc-400">{d.name}:</span>
                                      <span className="font-bold text-white">{d.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* RATING breakdown */}
                            {field.type === 'rating' && data && (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-black font-heading text-cyan-400">
                                    {data.average}
                                  </span>
                                  <span className="text-xs text-zinc-500 font-mono">AVERAGE STAR SCORE</span>
                                </div>
                                <div className="h-32 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.distribution}>
                                      <XAxis dataKey="rating" stroke="#71717a" fontSize={9} />
                                      <YAxis stroke="#71717a" fontSize={9} width={20} />
                                      <Tooltip
                                        contentStyle={{
                                          background: '#09090b',
                                          border: '1px solid #27272a',
                                          borderRadius: '12px',
                                          fontSize: '10px'
                                        }}
                                      />
                                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}

                            {/* TEXT / TEXTAREA / EMAIL sample answers list */}
                            {['text', 'textarea', 'email', 'date', 'number'].includes(field.type) && Array.isArray(data) && (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {data.map((ans, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded-xl text-xs text-zinc-300 leading-relaxed break-words"
                                  >
                                    {String(ans)}
                                  </div>
                                ))}
                                {data.length === 0 && (
                                  <p className="text-xs text-zinc-600 italic">No responses recorded.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RAW RESPONSES TABLE */}
            {activeTab === 'responses' && (
              <div className="space-y-4">
                {/* Search / Filter Row */}
                <div className="flex items-center gap-2 max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650" size={14} />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Submissions Grid */}
                {filteredResponses.length === 0 ? (
                  <div className="text-center py-12 text-zinc-650 text-xs italic">
                    {searchQuery ? 'No responses match the search query.' : 'No responses submitted yet.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-zinc-900 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-900/40 text-zinc-500 border-b border-zinc-900 font-mono uppercase tracking-widest text-[9px]">
                            <th className="p-4 font-bold">Time Submitted</th>
                            <th className="p-4 font-bold">Respondent</th>
                            {inputFields.slice(0, 3).map(field => (
                              <th key={field.id} className="p-4 font-bold truncate max-w-[150px]">
                                {field.label}
                              </th>
                            ))}
                            {inputFields.length > 3 && <th className="p-4 font-bold">+ More</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/40">
                          {paginatedResponses.map((r: any) => {
                            const submissionTime = new Date(r.submitted_at).toLocaleString();
                            const respondentText = r.respondent?.email || r.respondent?.name || 'Anonymous';
                            
                            return (
                              <tr key={r.id} className="hover:bg-zinc-900/20 text-zinc-300">
                                <td className="p-4 font-mono text-zinc-500 whitespace-nowrap">{submissionTime}</td>
                                <td className="p-4 font-semibold text-zinc-200">{respondentText}</td>
                                {inputFields.slice(0, 3).map(field => {
                                  const ans = r.answers[field.id];
                                  const displayValue = Array.isArray(ans)
                                    ? ans.join('; ')
                                    : ans === true
                                    ? 'Checked'
                                    : ans === false
                                    ? 'Unchecked'
                                    : String(ans || '');
                                  return (
                                    <td key={field.id} className="p-4 truncate max-w-[150px] text-zinc-400">
                                      {displayValue || <span className="text-zinc-700">-</span>}
                                    </td>
                                  );
                                })}
                                {inputFields.length > 3 && (
                                  <td className="p-4 font-mono text-zinc-600">
                                    {inputFields.length - 3} fields
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Page {currentPage} of {totalPages} ({filteredResponses.length} submissions)
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
