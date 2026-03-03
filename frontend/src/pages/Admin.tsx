import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  X,
  Mail,
  Phone,
  Building,
  Eye,
  Download,
  RefreshCw,
  LogOut,
  Loader2,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Target,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

// Types
interface RevenueStats {
  total_revenue: number;
  current_month_revenue: number;
  mrr: number;
  arr: number;
}

interface Payment {
  id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency: string;
  source: string;
  type: string;
  date: string;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_paid: number;
  active_project: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage?: string;
  service_interest?: string;
  source_page?: string;
  message?: string;
  status?: string;
  created_at: string;
  quiz_answers?: Record<string, string>;
  ai_assessment?: any;
}

interface BoltGuiderOnboarding {
  id: string;
  full_name: string;
  startup_name: string;
  website_or_deck?: string;
  current_stage: string;
  monthly_revenue: string;
  growth_bottleneck: string;
  attempted_solutions: string;
  core_offer: string;
  ideal_customer: string;
  running_paid_ads: string;
  team_structure: string;
  created_at: string;
}

interface MarketingLog {
  id: string;
  month: number;
  year: number;
  linkedin_outreach: number;
  whatsapp_conversations: number;
  newsletters_sent: number;
  proposals_sent: number;
}

interface ConversionMetrics {
  lead_to_proposal_percent: number;
  close_rate_percent: number;
  clarity_to_close_percent: number;
}

const Admin = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  
  // State
  const [activeTab, setActiveTab] = useState<'financial' | 'leads' | 'marketing'>('financial');
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clarityLeads, setClarityLeads] = useState<Lead[]>([]);
  const [boltguiderLeads, setBoltguiderLeads] = useState<BoltGuiderOnboarding[]>([]);
  const [marketingLogs, setMarketingLogs] = useState<MarketingLog[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<BoltGuiderOnboarding | null>(null);
  
  // Form state
  const [paymentForm, setPaymentForm] = useState({
    client_name: '',
    client_email: '',
    amount: '',
    source: 'Razorpay',
    type: 'One-Time',
    notes: ''
  });

  const [marketingForm, setMarketingForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    linkedin_outreach: 0,
    whatsapp_conversations: 0,
    newsletters_sent: 0,
    proposals_sent: 0
  });

  // Fetch data
  const fetchRevenueStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/stats`);
      const data = await res.json();
      setRevenueStats(data);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments`);
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clients`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchClarityLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads`);
      const data = await res.json();
      const clarity = data.filter((l: Lead) => l.source_page === 'Clarity Check');
      setClarityLeads(clarity);
    } catch (error) {
      console.error('Error fetching clarity leads:', error);
    }
  };

  const fetchBoltguiderLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads/boltguider`);
      const data = await res.json();
      setBoltguiderLeads(data);
    } catch (error) {
      console.error('Error fetching boltguider leads:', error);
    }
  };

  const fetchMarketingLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/marketing/logs`);
      const data = await res.json();
      setMarketingLogs(data);
    } catch (error) {
      console.error('Error fetching marketing logs:', error);
    }
  };

  const fetchConversionMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/marketing/conversions`);
      const data = await res.json();
      setConversionMetrics(data);
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRevenueStats(),
      fetchPayments(),
      fetchClients(),
      fetchClarityLeads(),
      fetchBoltguiderLeads(),
      fetchMarketingLogs(),
      fetchConversionMetrics()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount)
        })
      });
      setShowPaymentModal(false);
      setPaymentForm({
        client_name: '',
        client_email: '',
        amount: '',
        source: 'Razorpay',
        type: 'One-Time',
        notes: ''
      });
      await refreshData();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  // Handle marketing log submission
  const handleMarketingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/marketing/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marketingForm)
      });
      setShowMarketingModal(false);
      await refreshData();
    } catch (error) {
      console.error('Error creating marketing log:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              FounderPlane Admin
            </h1>
            <p className="text-slate-600">
              Financial Command Center
            </p>
          </div>
          <Button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            Sign In with Auth0
          </Button>
        </motion.div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">FounderPlane Command Center</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setActiveTab('financial')}
            variant={activeTab === 'financial' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Financial
          </Button>
          <Button
            onClick={() => setActiveTab('leads')}
            variant={activeTab === 'leads' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Lead Vault
          </Button>
          <Button
            onClick={() => setActiveTab('marketing')}
            variant={activeTab === 'marketing' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Marketing
          </Button>
        </div>

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Revenue Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5 opacity-80" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold">₹{revenueStats?.total_revenue.toLocaleString() || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <ArrowUpRight className="w-5 h-5 opacity-80" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-1">Current Month</h3>
                <p className="text-3xl font-bold">₹{revenueStats?.current_month_revenue.toLocaleString() || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 opacity-80" />
                  <BarChart3 className="w-5 h-5 opacity-80" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-1">MRR</h3>
                <p className="text-3xl font-bold">₹{revenueStats?.mrr.toLocaleString() || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5 opacity-80" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-1">ARR</h3>
                <p className="text-3xl font-bold">₹{revenueStats?.arr.toLocaleString() || 0}</p>
              </motion.div>
            </div>

            {/* Manual Payment Entry */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Manual Payment Entry</h2>
                <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Payment</DialogTitle>
                      <DialogDescription>
                        Manually log a payment from Razorpay, bank transfer, or cash
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div>
                        <Label>Client Name</Label>
                        <Input
                          value={paymentForm.client_name}
                          onChange={(e) => setPaymentForm({...paymentForm, client_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label>Client Email</Label>
                        <Input
                          type="email"
                          value={paymentForm.client_email}
                          onChange={(e) => setPaymentForm({...paymentForm, client_email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label>Source</Label>
                        <Select
                          value={paymentForm.source}
                          onValueChange={(value) => setPaymentForm({...paymentForm, source: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Razorpay">Razorpay</SelectItem>
                            <SelectItem value="Bank">Bank Transfer</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={paymentForm.type}
                          onValueChange={(value) => setPaymentForm({...paymentForm, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="One-Time">One-Time</SelectItem>
                            <SelectItem value="Monthly">Monthly Recurring</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={paymentForm.notes}
                          onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full">Add Payment</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Recent Payments */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm">{payment.client_name}</td>
                        <td className="py-3 px-4 text-sm font-medium">₹{payment.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.source === 'Razorpay' ? 'bg-blue-100 text-blue-700' :
                            payment.source === 'Bank' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {payment.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.type === 'Monthly' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {payment.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Client LTV Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Lifetime Value</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Paid</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium">{client.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{client.email || '-'}</td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">
                          ₹{client.total_paid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {client.active_project ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-slate-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Clarity Check Leads */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Stage Clarity Leads</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bottleneck</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clarityLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{lead.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{lead.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {lead.ai_assessment?.stage || lead.stage || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {lead.ai_assessment?.bottleneck || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <a
                            href={`mailto:${lead.email}?subject=Re: Your Stage Assessment`}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Mail className="w-4 h-4" />
                            Reach Out
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BoltGuider Onboarding Submissions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">BoltGuider Submissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Founder</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boltguiderLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{lead.full_name}</td>
                        <td className="py-3 px-4 text-sm">{lead.startup_name}</td>
                        <td className="py-3 px-4 text-sm">{lead.monthly_revenue}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                            {lead.current_stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOnboarding(lead);
                              setShowOnboardingModal(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Full
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Onboarding Detail Modal */}
            <Dialog open={showOnboardingModal} onOpenChange={setShowOnboardingModal}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>BoltGuider Full Report</DialogTitle>
                  <DialogDescription>
                    Complete diagnostic answers from {selectedOnboarding?.full_name}
                  </DialogDescription>
                </DialogHeader>
                {selectedOnboarding && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-600">Founder Name</Label>
                        <p className="font-medium">{selectedOnboarding.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Startup Name</Label>
                        <p className="font-medium">{selectedOnboarding.startup_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Current Stage</Label>
                        <p className="font-medium">{selectedOnboarding.current_stage}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Monthly Revenue</Label>
                        <p className="font-medium">{selectedOnboarding.monthly_revenue}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Website/Deck</Label>
                      <p className="text-sm">{selectedOnboarding.website_or_deck || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Growth Bottleneck</Label>
                      <p className="text-sm">{selectedOnboarding.growth_bottleneck}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Attempted Solutions</Label>
                      <p className="text-sm">{selectedOnboarding.attempted_solutions}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Core Offer</Label>
                      <p className="text-sm">{selectedOnboarding.core_offer}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Ideal Customer</Label>
                      <p className="text-sm">{selectedOnboarding.ideal_customer}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Running Paid Ads?</Label>
                      <p className="text-sm">{selectedOnboarding.running_paid_ads}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Team Structure</Label>
                      <p className="text-sm">{selectedOnboarding.team_structure}</p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <h3 className="text-sm font-medium text-slate-600 mb-2">Lead → Proposal</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {conversionMetrics?.lead_to_proposal_percent.toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <h3 className="text-sm font-medium text-slate-600 mb-2">Close Rate</h3>
                <p className="text-3xl font-bold text-green-600">
                  {conversionMetrics?.close_rate_percent.toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <h3 className="text-sm font-medium text-slate-600 mb-2">Clarity → Close</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {conversionMetrics?.clarity_to_close_percent.toFixed(1)}%
                </p>
              </motion.div>
            </div>

            {/* Marketing Activity Tracker */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Monthly Activity Tracker</h2>
                <Dialog open={showMarketingModal} onOpenChange={setShowMarketingModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Log Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Marketing Activity</DialogTitle>
                      <DialogDescription>
                        Record your monthly outreach and pipeline activities
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMarketingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Month</Label>
                          <Select
                            value={marketingForm.month.toString()}
                            onValueChange={(value) => setMarketingForm({...marketingForm, month: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => (
                                <SelectItem key={i+1} value={(i+1).toString()}>
                                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={marketingForm.year}
                            onChange={(e) => setMarketingForm({...marketingForm, year: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>LinkedIn/Email Outreach</Label>
                        <Input
                          type="number"
                          value={marketingForm.linkedin_outreach}
                          onChange={(e) => setMarketingForm({...marketingForm, linkedin_outreach: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>WhatsApp Conversations</Label>
                        <Input
                          type="number"
                          value={marketingForm.whatsapp_conversations}
                          onChange={(e) => setMarketingForm({...marketingForm, whatsapp_conversations: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Newsletters Sent</Label>
                        <Input
                          type="number"
                          value={marketingForm.newsletters_sent}
                          onChange={(e) => setMarketingForm({...marketingForm, newsletters_sent: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Proposals Sent</Label>
                        <Input
                          type="number"
                          value={marketingForm.proposals_sent}
                          onChange={(e) => setMarketingForm({...marketingForm, proposals_sent: parseInt(e.target.value)})}
                        />
                      </div>
                      <Button type="submit" className="w-full">Save Activity Log</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Month</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">LinkedIn</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">WhatsApp</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Newsletters</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Proposals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketingLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-sm font-medium">
                          {new Date(log.year, log.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-sm">{log.linkedin_outreach}</td>
                        <td className="py-3 px-4 text-sm">{log.whatsapp_conversations}</td>
                        <td className="py-3 px-4 text-sm">{log.newsletters_sent}</td>
                        <td className="py-3 px-4 text-sm font-medium">{log.proposals_sent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
