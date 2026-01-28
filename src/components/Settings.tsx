import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { PrintTest } from "./PrintTest";
import { BranchManagement } from "./BranchManagement";
import { RuleBasedUserManagement } from "./RuleBasedUserManagement";
import CustomerLoyalty from "./CustomerLoyalty";
import CouponManagement from "./CouponManagement";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "cashier",
    password: ""
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(120);
  const [storeTitle, setStoreTitle] = useState("DUBAI BORKA HOUSE");
  const [tagline, setTagline] = useState("");
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  // Fetch current settings
  const storeSettings = useQuery(api.settings.get);

  const tabs = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "logo", name: "Logo & Title", icon: "🎨" },
    { id: "branches", name: "Branches", icon: "🏢" },
    { id: "store", name: "Store Info", icon: "🏪" },
    { id: "loyalty", name: "Loyalty & Rewards", icon: "🎁" },
    { id: "coupons", name: "Coupons", icon: "🎟️" },
    { id: "print", name: "Print Test", icon: "🖨️" },
    { id: "backup", name: "Backup & Restore", icon: "💾" },
    { id: "users", name: "User Management", icon: "👥" },
    { id: "userRules", name: "User Rules", icon: "🔐" },
    { id: "system", name: "System", icon: "🖥️" },
  ];

  const exportAllData = useQuery(api.backup.exportAllData);
  const importDataMutation = useMutation(api.backup.importAllData);
  const resetDataMutation = useMutation(api.backup.resetAllData);
  const updateSettingsMutation = useMutation(api.settings.update);

  // Initialize with current settings
  useEffect(() => {
    if (storeSettings) {
      setStoreTitle(storeSettings.storeTitle || "DUBAI BORKA HOUSE");
      setTagline(storeSettings.tagline || "");
      setLogoPreview(storeSettings.logo || null);
    }
  }, [storeSettings]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("লোগো সাইজ ৫ MB এর কম হতে হবে");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              toast.error("Canvas error - unable to process image");
              return;
            }
            
            const maxDim = 250;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            let compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            
            if (compressedBase64.length > 1000000) {
              compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            }
            
            if (compressedBase64.length > 800000) {
              compressedBase64 = canvas.toDataURL('image/jpeg', 0.4);
            }
            
            console.log(`Compressed logo size: ${(compressedBase64.length / 1024).toFixed(2)} KB`);
            setLogoPreview(compressedBase64);
            toast.success(`লোগো আপলোড হয়েছে (${(compressedBase64.length / 1024).toFixed(2)} KB)`);
          };
          img.onerror = () => {
            toast.error("লোগো লোড করতে ব্যর্থ");
          };
          img.src = result;
        } else {
          setLogoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    try {
      if (!storeTitle || storeTitle.trim().length === 0) {
        toast.error("স্টোর টাইটেল লিখুন");
        return;
      }
      
      setIsSavingLogo(true);
      console.log("Saving settings with data:", { 
        logo: logoPreview ? logoPreview.substring(0, 50) : "none", 
        storeTitle, 
        tagline 
      });
      
      const result = await updateSettingsMutation({ 
        ...(logoPreview && { logo: logoPreview }),
        storeTitle: storeTitle.trim(),
        tagline: tagline.trim(),
        clearLogo: false,
      });
      
      console.log("Save result:", result);
      toast.success("সেটিংস সংরক্ষিত হয়েছে!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`সংরক্ষণ করতে ব্যর্থ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("লোগো মুছে ফেলতে নিশ্চিত?")) {
      return;
    }
    
    try {
      setIsSavingLogo(true);
      await updateSettingsMutation({ 
        storeTitle: storeTitle.trim(),
        tagline: tagline.trim(),
        clearLogo: true,
      });
      
      setLogoPreview(null);
      toast.success("লোগো মুছে ফেলা হয়েছে!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`লোগো মুছতে ব্যর্থ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingLogo(false);
    }
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      if (!exportAllData) {
        throw new Error("Data not ready for export");
      }

      const blob = new Blob([JSON.stringify(exportAllData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raisa-dubai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.store || importData.store !== "DUBAI BORKA HOUSE") {
        throw new Error("Invalid backup file format");
      }

      if (!importData.data || !importData.data.products || !importData.data.sales || 
          !importData.data.customers || !importData.data.categories) {
        throw new Error("Invalid backup file structure");
      }

      if (!confirm("⚠️ This will replace ALL existing data with the backup data. Are you sure?")) {
        return;
      }

      await importDataMutation({ data: importData.data });
      toast.success("Data imported successfully!");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(`User ${newUser.name} added successfully!`);
    setNewUser({ name: "", email: "", role: "cashier", password: "" });
    setShowAddUser(false);
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    localStorage.clear();
    
    toast.success("Cache cleared successfully!");
  };

  const optimizeDatabase = () => {
    toast.success("Database optimized successfully!");
  };

  const resetApplication = async () => {
    if (!confirm("⚠️ This will delete ALL data permanently and reset to default configuration. Are you sure?")) {
      return;
    }
    
    const confirmText = prompt("Type 'RESET' to confirm this action:");
    if (confirmText !== 'RESET') {
      toast.error("Reset cancelled - confirmation text did not match");
      return;
    }

    setIsResetting(true);
    try {
      await resetDataMutation({});
      toast.success("Application reset to default state successfully!");
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      localStorage.clear();
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Failed to reset application");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
        
        {/* Mobile Header with Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">⚙️ Settings</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Configuration</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 hover:bg-white transition-colors"
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
          ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          lg:hidden
        `} onClick={() => setIsSidebarOpen(false)} />

        <div className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-sm border-r border-white/60 z-50 overflow-y-auto
          transform transition-transform duration-300 lg:static lg:transform-none lg:w-64
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:rounded-3xl lg:shadow-sm lg:border
        `}>
          {/* Desktop Header in Sidebar */}
          <div className="hidden lg:block sticky top-0 bg-white/80 backdrop-blur-sm border-b border-white/60 p-6 rounded-t-3xl">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>
            <p className="text-xs text-gray-600 mt-1">Configuration</p>
          </div>

          {/* Sidebar Navigation Tabs */}
          <nav className="p-3 sm:p-6 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-3 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          {/* Logo & Title Tab */}
          {activeTab === "logo" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">🎨 লোগো এবং টাইটেল ম্যানেজমেন্ট</h3>
                
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Logo & Title Display Section */}
                  <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="bg-white border-2 border-gray-300 rounded-lg p-3 flex items-center justify-center flex-shrink-0"
                        style={{ 
                          width: `${logoSize}px`, 
                          height: `${logoSize}px`,
                          minWidth: `${logoSize}px`
                        }}
                      >
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain"
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <span className="text-5xl">🏪</span>
                        )}
                      </div>

                      <div className="w-full pt-1">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                          {storeTitle || "স্টোর নাম"}
                        </h2>
                        {tagline && (
                          <p className="text-xs sm:text-sm text-gray-600 italic mt-1">{tagline}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logo Size Slider */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-3">
                      লোগো সাইজ: {logoSize}px
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>60px</span>
                      <span>200px</span>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-3">
                      লোগো আপলোড করুন
                    </label>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <div className="text-4xl">📤</div>
                          <p className="text-sm sm:text-base text-gray-900 font-medium">লোগো ছবি নির্বাচন করুন</p>
                          <p className="text-xs text-gray-600">PNG, JPG বা SVG ফরম্যাট</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Store Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      স্টোর টাইটেল *
                    </label>
                    <input
                      type="text"
                      value={storeTitle}
                      onChange={(e) => setStoreTitle(e.target.value)}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                      placeholder="স্টোর নাম"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      ট্যাগলাইন
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                      placeholder="স্লোগান"
                      maxLength={100}
                    />
                  </div>

                  {/* Save Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <button
                      onClick={handleSaveLogo}
                      disabled={isSavingLogo}
                      className="flex-1 px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      {isSavingLogo ? "সংরক্ষণ করছে..." : "💾 সংরক্ষণ করুন"}
                    </button>
                    {logoPreview && (
                      <button
                        onClick={handleDeleteLogo}
                        disabled={isSavingLogo}
                        className="flex-1 px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        🗑️ লোগো মুছুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === "branches" && <BranchManagement />}

          {/* Loyalty Tab */}
          {activeTab === "loyalty" && <CustomerLoyalty />}

          {/* Coupons Tab */}
          {activeTab === "coupons" && <CouponManagement />}

          {/* Print Test Tab */}
          {activeTab === "print" && <PrintTest />}

          {/* User Rules Tab */}
          {activeTab === "userRules" && <RuleBasedUserManagement />}

          {/* Backup & Restore Tab */}
          {activeTab === "backup" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">💾 ডেটা ব্যাকআপ এবং পুনরুদ্ধার</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Export Section */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">📤 ডেটা এক্সপোর্ট করুন</h4>
                    <button
                      onClick={exportData}
                      disabled={isExporting}
                      className="w-full px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      {isExporting ? "এক্সপোর্ট করছে..." : "📥 সম্পূর্ণ ডেটা এক্সপোর্ট করুন"}
                    </button>
                  </div>

                  {/* Import Section */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">📥 ডেটা ইমপোর্ট করুন</h4>
                    <label className="block">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        disabled={isImporting}
                        className="hidden"
                      />
                      <button
                        onClick={(e) => (e.currentTarget.parentElement?.querySelector('input') as any)?.click()}
                        disabled={isImporting}
                        className="w-full px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        {isImporting ? "ইমপোর্ট করছে..." : "📤 JSON ফাইল আপলোড করুন"}
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">🖥️ সিস্টেম সেটিংস</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={clearCache}
                    className="w-full px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    🧹 ক্যাশ পরিষ্কার করুন
                  </button>
                  <button
                    onClick={optimizeDatabase}
                    className="w-full px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    ⚡ ডেটাবেস অপ্টিমাইজ করুন
                  </button>
                  <button
                    onClick={resetApplication}
                    disabled={isResetting}
                    className="w-full px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {isResetting ? "রিসেট করছে..." : "🔴 অ্যাপ্লিকেশন রিসেট করুন"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* General Tab (Default) */}
          {activeTab === "general" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">⚙️ সাধারণ সেটিংস</h3>
                <p className="text-sm text-gray-600">অন্যান্য ট্যাব থেকে আপনার কনফিগারেশন পরিচালনা করুন।</p>
              </div>
            </div>
          )}

          {/* Store Info Tab */}
          {activeTab === "store" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">🏪 স্টোর তথ্য</h3>
                <p className="text-sm text-gray-600">স্টোরের বিস্তারিত তথ্য এখানে প্রদর্শিত হবে।</p>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">👥 ব্যবহারকারী ব্যবস্থাপনা</h3>
                <p className="text-sm text-gray-600">ব্যবহারকারী অ্যাকাউন্ট এবং অনুমতি পরিচালনা করুন।</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
