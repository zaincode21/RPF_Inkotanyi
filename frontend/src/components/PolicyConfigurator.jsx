import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, Users, Vote } from 'lucide-react';

// Sample data
const lineData = [
  { name: 'Jan', value: 400, value2: 240, value3: 200 },
  { name: 'Feb', value: 300, value2: 139, value3: 380 },
  { name: 'Mar', value: 600, value2: 980, value3: 390 },
  { name: 'Apr', value: 800, value2: 390, value3: 480 },
  { name: 'May', value: 500, value2: 480, value3: 380 },
  { name: 'Jun', value: 700, value2: 380, value3: 430 },
];

const pieData = [
  { name: 'Education', value: 35 },
  { name: 'Healthcare', value: 25 },
  { name: 'Infrastructure', value: 20 },
  { name: 'Security', value: 12 },
  { name: 'Other', value: 8 },
];

const barData = [
  { name: 'North', supporters: 4200, volunteers: 240 },
  { name: 'South', supporters: 3800, volunteers: 180 },
  { name: 'East', supporters: 5100, volunteers: 320 },
  { name: 'West', supporters: 2900, volunteers: 150 },
  { name: 'Central', supporters: 6700, volunteers: 410 },
];

const COLORS = ['#030213', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

const policies = [
  {
    id: 1,
    title: 'Education Reform',
    checked: true,
    description: 'Increase funding for public schools, reduce classroom sizes, and implement modern teaching methods to improve learning outcomes nationwide.',
  },
  {
    id: 2,
    title: 'Healthcare Access',
    checked: true,
    description: 'Expand healthcare coverage to all citizens, reduce prescription drug prices, and invest in rural medical facilities.',
  },
  {
    id: 3,
    title: 'Infrastructure Development',
    checked: false,
    description: 'Modernize transportation networks, upgrade water and energy systems, and create jobs through public works programs.',
  },
  {
    id: 4,
    title: 'Environmental Protection',
    checked: true,
    description: 'Promote renewable energy, reduce carbon emissions, and protect natural resources for future generations.',
  },
  {
    id: 5,
    title: 'Economic Growth',
    checked: false,
    description: 'Support small businesses, attract foreign investment, and provide tax incentives for job-creating enterprises.',
  },
];

export function PolicyConfigurator() {
  const [activeTab, setActiveTab] = useState('line');
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [selectedPolicies, setSelectedPolicies] = useState(
    policies.reduce((acc, p) => ({ ...acc, [p.id]: p.checked }), {})
  );

  const togglePolicy = (id) => {
    setSelectedPolicies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id) => {
    setExpandedPolicy(expandedPolicy === id ? null : id);
  };

  const stats = [
    { label: 'Policies Selected', value: Object.values(selectedPolicies).filter(Boolean).length, icon: Vote },
    { label: 'Supporters Reached', value: '22.5K', icon: Users },
    { label: 'Engagement Rate', value: '94%', icon: TrendingUp },
  ];

  return (
    <section id="policy" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-track/10 text-track px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Policy Platform
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-track mb-6">
            Customize Your Vision
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select the policies that matter most to you and see how they shape our collective future.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Toggles */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h3 className="text-xl font-bold text-track mb-6">Select Policies</h3>

              {/* Track Motif Separator */}
              <div className="h-px bg-track-light mb-6" />

              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleExpand(policy.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePolicy(policy.id);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedPolicies[policy.id]
                              ? 'bg-track border-track'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPolicies[policy.id] && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`font-medium text-left ${!selectedPolicies[policy.id] ? 'text-gray-400' : 'text-track'}`}>
                          {policy.title}
                        </span>
                      </div>
                      {expandedPolicy === policy.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedPolicy === policy.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                            {policy.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'line', label: 'Growth Trends', icon: TrendingUp },
                  { id: 'pie', label: 'Policy Focus', icon: Users },
                  { id: 'bar', label: 'Regional Support', icon: Vote },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-track text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chart Display */}
              <div className="h-80">
                <AnimatePresence mode="wait">
                  {activeTab === 'line' && (
                    <motion.div
                      key="line"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#030213" strokeWidth={3} name="Policy A" />
                          <Line type="monotone" dataKey="value2" stroke="#6366f1" strokeWidth={3} name="Policy B" />
                          <Line type="monotone" dataKey="value3" stroke="#8b5cf6" strokeWidth={3} name="Policy C" />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {activeTab === 'pie' && (
                    <motion.div
                      key="pie"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex items-center justify-center"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {activeTab === 'bar' && (
                    <motion.div
                      key="bar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="supporters" fill="#030213" name="Supporters" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="volunteers" fill="#6366f1" name="Volunteers" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4"
            >
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-track" />
                  <div className="text-3xl font-bold text-track mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
