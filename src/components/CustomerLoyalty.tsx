import React, { useState } from "react";
import { Award, Users, Zap, TrendingUp, Crown, Gift, Share2, CheckCircle2, Copy, AlertCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface LoyaltyCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalPoints: number;
  availablePoints: number;
  totalSpent: number;
  totalOrders: number;
  referralCode: string;
  membershipDate: string;
}

interface LoyaltyStats {
  totalMembers: number;
  activeCoupons: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  tierDistribution: Record<string, number>;
}

const DEMO_CUSTOMERS: LoyaltyCustomer[] = [
  {
    _id: "cust1",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "+971501234567",
    currentTier: "Gold",
    totalPoints: 5250,
    availablePoints: 3500,
    totalSpent: 12500,
    totalOrders: 45,
    referralCode: "AHMED2025",
    membershipDate: "2023-06-15",
  },
  {
    _id: "cust2",
    name: "Fatima Al-Mansouri",
    email: "fatima@example.com",
    phone: "+971509876543",
    currentTier: "Platinum",
    totalPoints: 8750,
    availablePoints: 6200,
    totalSpent: 28900,
    totalOrders: 89,
    referralCode: "FATIMA2025",
    membershipDate: "2022-01-10",
  },
  {
    _id: "cust3",
    name: "Mohammed Ali",
    email: "mohammed@example.com",
    phone: "+971555555555",
    currentTier: "Silver",
    totalPoints: 2100,
    availablePoints: 1800,
    totalSpent: 4200,
    totalOrders: 18,
    referralCode: "MOHAMM2025",
    membershipDate: "2023-11-20",
  },
];

const DEMO_STATS: LoyaltyStats = {
  totalMembers: 156,
  activeCoupons: 12,
  totalPointsIssued: 45000,
  totalPointsRedeemed: 15000,
  tierDistribution: {
    Bronze: 45,
    Silver: 52,
    Gold: 38,
    Platinum: 21,
  },
};

export default function CustomerLoyalty() {
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "tiers" | "referral">("overview");
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(DEMO_CUSTOMERS[0]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState({
    referredName: "",
    referredPhone: "",
    bonusPoints: 100,
  });

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Bronze: "from-amber-600 to-amber-700",
      Silver: "from-slate-400 to-slate-500",
      Gold: "from-yellow-500 to-yellow-600",
      Platinum: "from-blue-500 to-purple-600",
    };
    return colors[tier] || "from-gray-400 to-gray-500";
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      Bronze: "bg-amber-100 text-amber-800 border-amber-300",
      Silver: "bg-slate-100 text-slate-800 border-slate-300",
      Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Platinum: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[tier] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCreateReferral = () => {
    if (!referralData.referredName) {
      toast.error("Please fill in customer name");
      return;
    }
    toast.success(`Referral created for ${referralData.referredName}!`);
    setReferralData({ referredName: "", referredPhone: "", bonusPoints: 100 });
    setShowReferralModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Loyalty & Rewards</h1>
        </div>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Members</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{DEMO_STATS.totalMembers}</p>
            </div>
            <Users className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Coupons</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{DEMO_STATS.activeCoupons}</p>
            </div>
            <Gift className="w-8 sm:w-10 h-8 sm:h-10 text-orange-600 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Points Issued</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{(DEMO_STATS.totalPointsIssued / 1000).toFixed(1)}K</p>
            </div>
            <Zap className="w-8 sm:w-10 h-8 sm:h-10 text-yellow-600 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Points Redeemed</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{(DEMO_STATS.totalPointsRedeemed / 1000).toFixed(1)}K</p>
            </div>
            <TrendingUp className="w-8 sm:w-10 h-8 sm:h-10 text-green-600 opacity-20 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Tier Distribution Cards */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-blue-600" />
          Member Tier Distribution
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(DEMO_STATS.tierDistribution).map(([tier, count]) => (
            <div
              key={tier}
              className={`bg-gradient-to-br ${getTierColor(tier)} rounded-lg p-4 sm:p-6 text-white`}
            >
              <p className="text-xs sm:text-sm opacity-90">{tier} Members</p>
              <p className="text-3xl sm:text-4xl font-bold mt-2">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          Select Customer
        </h2>
        <select
          value={selectedCustomer?._id || ""}
          onChange={(e) => {
            const customer = DEMO_CUSTOMERS.find((c) => c._id === e.target.value);
            setSelectedCustomer(customer || null);
          }}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DEMO_CUSTOMERS.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} ({customer.currentTier} - {customer.totalPoints} pts)
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      {selectedCustomer && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 flex flex-wrap">
            {[
              { id: "overview", label: "Overview", icon: "👤" },
              { id: "stats", label: "Statistics", icon: "📊" },
              { id: "tiers", label: "Tier Benefits", icon: "👑" },
              { id: "referral", label: "Referral", icon: "🔗" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Loyalty Card */}
                <div className={`bg-gradient-to-br ${getTierColor(selectedCustomer.currentTier)} rounded-lg p-4 sm:p-8 text-white shadow-lg`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
                    <div>
                      <p className="text-white/80 text-xs sm:text-sm">Loyalty Member</p>
                      <h3 className="text-xl sm:text-2xl font-bold mt-1">{selectedCustomer.name}</h3>
                    </div>
                    <Crown className="w-6 sm:w-8 h-6 sm:h-8 opacity-30 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <p className="text-white/80 text-xs">Current Tier</p>
                      <p className="text-lg sm:text-xl font-semibold mt-1">{selectedCustomer.currentTier}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Total Points</p>
                      <p className="text-lg sm:text-xl font-semibold mt-1">{selectedCustomer.totalPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Available</p>
                      <p className="text-lg sm:text-xl font-semibold mt-1">{selectedCustomer.availablePoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Member Since</p>
                      <p className="text-lg sm:text-xl font-semibold mt-1">{new Date(selectedCustomer.membershipDate).getFullYear()}</p>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <p className="text-white/80 text-xs">Total Spent</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-1">AED {selectedCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Total Orders</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-1">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Referral Code</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs sm:text-sm font-mono font-bold bg-white/20 px-2 py-1 rounded">
                          {selectedCustomer.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedCustomer.referralCode)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowReferralModal(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 sm:w-5 h-4 sm:h-5" />
                    Create Referral
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors">
                    <Gift className="w-4 sm:w-5 h-4 sm:h-5" />
                    Redeem Points
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === "stats" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Points Earned This Month</p>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-700">+450</p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-2">From 3 purchases</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-6 border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-2">Next Tier Requirement</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-700">+2,750</p>
                  <p className="text-xs sm:text-sm text-green-600 mt-2">Points needed for Platinum</p>
                </div>
              </div>
            )}

            {/* Tier Benefits Tab */}
            {activeTab === "tiers" && (
              <div className="space-y-3 sm:space-y-4">
                {["Bronze", "Silver", "Gold", "Platinum"].map((tier) => {
                  const isCurrentTier = tier === selectedCustomer.currentTier;
                  const benefits: Record<string, string[]> = {
                    Bronze: ["5% discount on all purchases", "Birthday bonus"],
                    Silver: ["10% discount on all purchases", "Free shipping on orders", "Priority customer support"],
                    Gold: ["15% discount on all purchases", "Free shipping", "VIP member perks", "Early access to sales"],
                    Platinum: ["20% discount on all purchases", "Free shipping lifetime", "Concierge service", "Exclusive events"],
                  };

                  return (
                    <div
                      key={tier}
                      className={`border rounded-lg p-4 sm:p-6 transition-colors ${
                        isCurrentTier
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTierBadge(tier)} border`}>
                            {tier}
                          </span>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">Min 1000 points</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold text-gray-900">10%+ Discount</p>
                          <p className="text-xs sm:text-sm text-gray-600">2x Points</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Benefits:</p>
                        <ul className="space-y-1">
                          {benefits[tier]?.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Referral Tab */}
            {activeTab === "referral" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 hidden sm:block" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Your Referral Code</p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Share this code with friends to earn 100 bonus points per successful referral
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
                        <code className="text-sm font-mono font-bold bg-white px-3 py-2 rounded border border-blue-300 flex-1">
                          {selectedCustomer.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedCustomer.referralCode)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowReferralModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Create New Referral
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Create Referral</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Referred Person Name *
                </label>
                <input
                  type="text"
                  value={referralData.referredName}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      referredName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={referralData.referredPhone}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      referredPhone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="+971 50 123 4567"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Bonus Points
                </label>
                <input
                  type="number"
                  value={referralData.bonusPoints}
                  onChange={(e) =>
                    setReferralData({
                      ...referralData,
                      bonusPoints: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReferralModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReferral}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

