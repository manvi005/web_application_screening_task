import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import api from '../api';
import { motion } from 'framer-motion';
import { Download, Thermometer, Activity, Database, Zap } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = '"Outfit", sans-serif';

function Dashboard({ datasetId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (datasetId) {
            fetchStats();
        }
    }, [datasetId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get(`datasets/${datasetId}/stats/`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`datasets/${datasetId}/report/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${datasetId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            console.error("Report download failed", e);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
                    />
                    <p className="text-slate-400 font-medium animate-pulse">Computing Analytics...</p>
                </div>
            </div>
        );
    }

    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30">
            <Database className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-lg">Select a dataset to view analytics</p>
        </div>
    );

    const typeData = {
        labels: Object.keys(stats.type_distribution),
        datasets: [
            {
                data: Object.values(stats.type_distribution),
                backgroundColor: [
                    'rgba(6, 182, 212, 0.8)',   // Cyan 500
                    'rgba(139, 92, 246, 0.8)',  // Violet 500
                    'rgba(245, 158, 11, 0.8)',  // Amber 500
                    'rgba(16, 185, 129, 0.8)',  // Emerald 500
                    'rgba(236, 72, 153, 0.8)',  // Pink 500
                ],
                borderColor: 'rgba(15, 23, 42, 1)',
                borderWidth: 2,
                hoverOffset: 15
            },
        ],
    };

    const flowPressureData = {
        labels: stats.data.map(d => d['Equipment Name']),
        datasets: [
            {
                label: 'Flowrate (m³/h)',
                data: stats.data.map(d => d['Flowrate']),
                borderColor: '#22d3ee', // Cyan 400
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)');
                    gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#22d3ee',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#22d3ee',
            },
            {
                label: 'Pressure (bar)',
                data: stats.data.map(d => d['Pressure']),
                borderColor: '#f472b6', // Pink 400
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                borderDash: [5, 5],
                pointBackgroundColor: '#f472b6',
            },
        ]
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="p-6 glass-panel rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Units</h4>
                            <p className="text-4xl font-bold text-white mt-1">{stats.total_count}</p>
                        </div>
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <Database className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-3/4"></div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="p-6 glass-panel rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Avg Temp</h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-4xl font-bold text-white">{stats.average_temperature.toFixed(1)}</p>
                                <span className="text-sm text-slate-400">°C</span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                            <Thermometer className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-1/2"></div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="p-6 glass-panel rounded-2xl border-l-4 border-violet-500 flex flex-col justify-center items-center text-center">
                    <h4 className="text-slate-300 font-medium mb-3">Export Analysis</h4>
                    <button
                        onClick={handleDownloadReport}
                        className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF Report
                    </button>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={item} className="lg:col-span-1 p-6 glass-panel rounded-2xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                        Equipment Types
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <Pie data={typeData} options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                            }
                        }} />
                    </div>
                </motion.div>

                <motion.div variants={item} className="lg:col-span-2 p-6 glass-panel rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                        Process Behavior
                    </h3>
                    <div className="h-80 w-full">
                        <Line data={flowPressureData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            scales: {
                                y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                    title: { display: true, text: 'Flowrate (m³/h)' }
                                },
                                y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    grid: { drawOnChartArea: false },
                                    title: { display: true, text: 'Pressure (bar)' }
                                },
                                x: {
                                    grid: { color: 'rgba(255,255,255,0.05)' }
                                }
                            }
                        }} />
                    </div>
                </motion.div>
            </div>

            {/* Data Table */}
            <motion.div variants={item} className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Live Data Feed
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">LIVE</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/50 uppercase font-semibold text-xs tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Equipment ID</th>
                                <th className="px-6 py-4">Classification</th>
                                <th className="px-6 py-4">Flow</th>
                                <th className="px-6 py-4">Pressure</th>
                                <th className="px-6 py-4">Temperature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.data.map((row, i) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={i}
                                    className="hover:bg-cyan-500/5 transition-colors group cursor-default"
                                >
                                    <td className="px-6 py-4 font-medium text-white group-hover:text-cyan-400 transition-colors">{row['Equipment Name']}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${row['Type'] === 'Pump' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                row['Type'] === 'Valve' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    row['Type'] === 'Reactor' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-slate-700/50 text-slate-300 border-slate-600'}`}>
                                            {row['Type']}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{row['Flowrate']}</td>
                                    <td className="px-6 py-4 font-mono">{row['Pressure']}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <span className={row['Temperature'] > 130 ? 'text-red-400' : 'text-slate-300'}>
                                            {row['Temperature']} °C
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
