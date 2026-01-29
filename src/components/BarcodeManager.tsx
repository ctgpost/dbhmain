import { useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import JsBarcode from "jsbarcode";

export default function BarcodeManager() {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedProducts, setSelectedProducts] = useState<Id<"products">[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | undefined>();
  const [printSettings, setPrintSettings] = useState({
    printerType: "pos", // pos or regular
    stickerWidth: 1.5, // inches
    stickerHeight: 1.0, // inches
    gapBetweenStickers: 10, // pixels
    fontSize: 8,
    includePrice: true,
    includeName: true,
    includeSize: false,
    includeMadeBy: true,
    stickersPerRow: 2,
    paperWidth: 4, // inches for POS printer
  });

  const products = useQuery(api.products.list, { 
    categoryId: selectedCategory,
    searchTerm: searchTerm || undefined 
  });
  const categories = useQuery(api.categories.list);

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return selectedProducts.length === 0 
      ? products 
      : products.filter(product => selectedProducts.includes(product._id));
  }, [products, selectedProducts]);

  // Optimized callback functions
  const toggleProductSelection = useCallback((productId: Id<"products">) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const selectAllProducts = useCallback(() => {
    if (products) {
      setSelectedProducts(products.map(p => p._id));
    }
  }, [products]);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  // Memoized barcode generation with caching
  const barcodeCache = useRef(new Map<string, string>());
  
  const generateBarcode = useCallback((text: string): string => {
    if (barcodeCache.current.has(text)) {
      return barcodeCache.current.get(text)!;
    }

    try {
      const canvas = document.createElement('canvas');
      
      JsBarcode(canvas, text, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000"
      });
      
      const dataUrl = canvas.toDataURL();
      barcodeCache.current.set(text, dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error generating barcode:', error);
      return generateFallbackBarcode(text);
    }
  }, []);

  const generateFallbackBarcode = useCallback((text: string): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 150;
    canvas.height = 40;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    const barWidth = 1.5;
    let x = 5;
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const pattern = charCode % 4;
      
      for (let j = 0; j < 4; j++) {
        if ((pattern >> j) & 1) {
          ctx.fillRect(x, 5, barWidth, 25);
        }
        x += barWidth;
      }
    }
    
    return canvas.toDataURL();
  }, []);

  const printBarcodes = useCallback(() => {
    if (!products) return;
    
    const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
    
    if (selectedProductsData.length === 0) {
      toast.error("Please select products to print");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print barcodes");
      return;
    }

    // Convert inches to pixels (96 DPI standard)
    const stickerWidthPx = printSettings.stickerWidth * 96;
    const stickerHeightPx = printSettings.stickerHeight * 96;
    const paperWidthPx = printSettings.paperWidth * 96;
    const gap = printSettings.gapBetweenStickers;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Barcode Labels - DUBAI BORKA HOUSE</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: ${printSettings.paperWidth}in auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 5px;
              background: white;
              width: ${paperWidthPx}px;
            }
            .stickers-container {
              display: flex;
              flex-direction: column;
              gap: ${gap}px;
              width: 100%;
            }
            .sticker-row {
              display: flex;
              justify-content: flex-start;
              gap: ${gap}px;
              width: 100%;
            }
            .sticker {
              width: ${stickerWidthPx}px;
              height: ${stickerHeightPx}px;
              border: 1px solid #000;
              padding: 4px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              text-align: center;
              page-break-inside: avoid;
              background: white;
              position: relative;
              overflow: hidden;
              font-family: 'Arial', 'Helvetica', sans-serif;
            }
            .store-name {
              font-weight: bold;
              font-size: ${printSettings.fontSize}px;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.1;
              margin-bottom: 3px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              text-align: center;
            }
            .barcode-image {
              max-width: 95%;
              height: auto;
              max-height: 35px;
              margin: 2px 0;
            }
            .product-name {
              font-weight: normal;
              font-size: 10px;
              margin: 2px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 100%;
              line-height: 1.1;
              text-align: center;
              color: #000;
            }
            .bottom-info {
              display: flex;
              justify-content: flex-end;
              width: 100%;
              margin-top: auto;
            }
            .product-price {
              color: #000;
              font-size: ${printSettings.fontSize + 1}px;
              font-weight: bold;
              margin: 2px 0;
              text-align: center;
              width: 100%;
            }
            .made-by {
              color: #666;
              font-size: 10px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              text-align: right;
              margin-top: auto;
            }
            .product-size {
              font-size: ${printSettings.fontSize - 3}px;
              color: #333;
              margin: 1px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
            .print-controls {
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 1000;
              background: white;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .print-btn {
              padding: 10px 20px;
              margin: 0 5px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
            }
            .print-btn.primary {
              background: #7c3aed;
              color: white;
            }
            .print-btn.secondary {
              background: #6c757d;
              color: white;
            }
            .print-btn:hover {
              opacity: 0.8;
            }
            @media print {
              .print-controls { 
                display: none !important; 
              }
              body {
                padding: 0;
                margin: 0;
              }
              .stickers-container {
                gap: ${gap}px;
              }
              .sticker-row {
                gap: ${gap}px;
              }
              .sticker {
                border: 1px solid #000 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-controls">
            <button class="print-btn primary" onclick="window.print()">🖨️ Print Labels</button>
            <button class="print-btn secondary" onclick="window.close()">✖️ Close</button>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
              ${selectedProductsData.length} labels | ${printSettings.stickerWidth}"×${printSettings.stickerHeight}" stickers
            </div>
          </div>
          <div class="stickers-container">
    `;

    // Group stickers into rows
    const stickersPerRow = Math.floor(paperWidthPx / (stickerWidthPx + gap));
    const actualStickersPerRow = Math.min(stickersPerRow, printSettings.stickersPerRow);

    for (let i = 0; i < selectedProductsData.length; i += actualStickersPerRow) {
      htmlContent += '<div class="sticker-row">';
      
      for (let j = 0; j < actualStickersPerRow && (i + j) < selectedProductsData.length; j++) {
        const product = selectedProductsData[i + j];
        const barcodeImage = generateBarcode(product.barcode);
        
        htmlContent += `
          <div class="sticker">
            <div class="store-name">DUBAI BORKA HOUSE</div>
            ${printSettings.includeName ? `<div class="product-name">${product.name}</div>` : ''}
            ${printSettings.includePrice ? `<div class="product-price">৳${product.sellingPrice.toLocaleString('en-BD')}</div>` : ''}
            <img src="${barcodeImage}" alt="Barcode" class="barcode-image" />
            ${printSettings.includeSize && product.sizes && product.sizes.length > 0 ? `<div class="product-size">${product.sizes.slice(0, 3).join(',')}</div>` : ''}
            <div class="bottom-info">
              ${printSettings.includeMadeBy && product.madeBy ? `<div class="made-by">${product.madeBy}</div>` : '<div></div>'}
            </div>
          </div>
        `;
      }
      
      htmlContent += '</div>';
    }

    htmlContent += `
          </div>
          <script>
            window.focus();
            // Auto-print after 1 second for POS printers
            setTimeout(() => {
              if (confirm('Ready to print ${selectedProductsData.length} barcode labels?')) {
                window.print();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    toast.success(`Generated ${selectedProductsData.length} POS barcode labels`);
  }, [products, selectedProducts, printSettings, generateBarcode]);

  const printSingleBarcode = useCallback((product: any) => {
    setSelectedProducts([product._id]);
    setTimeout(() => printBarcodes(), 100);
  }, [printBarcodes]);

  const tabs = useMemo(() => [
    { id: "generate", name: "Generate Barcodes", icon: "🏷️" },
    { id: "existing", name: "Existing Barcodes", icon: "📋" },
    { id: "settings", name: "Print Settings", icon: "⚙️" },
  ], []);

  if (!products || !categories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">🏷️ POS Barcode Manager</h2>
        <div className="text-sm text-gray-500">
          Selected: {selectedProducts.length} products | POS Printer Ready
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Products for POS Barcode Printing</h3>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value as Id<"categories"> || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={selectAllProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Select All ({products.length})
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={printBarcodes}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                🖨️ Print POS Labels ({selectedProducts.length})
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {products.map((product: any) => {
                const isSelected = selectedProducts.includes(product._id);
                const category = categories.find((c: any) => c._id === product.categoryId);
                
                return (
                  <div
                    key={product._id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected 
                        ? "border-purple-500 bg-purple-50 shadow-md" 
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => toggleProductSelection(product._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.brand} - {product.color}</p>
                        <p className="text-xs text-purple-600">৳{product.sellingPrice.toLocaleString('en-BD')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product._id)}
                        className="ml-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 py-0.5 rounded">
                        {product.barcode}
                      </p>
                      {product.sizes && product.sizes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Sizes: {product.sizes.join(', ')}</p>
                      )}
                      {product.madeBy && (
                        <p className="text-xs text-gray-500">Made by: {product.madeBy}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{ 
                          backgroundColor: category?.color + '20',
                          color: category?.color 
                        }}
                      >
                        {category?.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printSingleBarcode(product);
                        }}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-medium transition-colors"
                      >
                        🖨️ Print
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 opacity-50">📦</div>
                <p className="text-gray-500">No products found</p>
                <p className="text-xs text-gray-400 mt-1">Add products in the Inventory section first</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "existing" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Product Barcodes</h3>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Barcode List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map((product: any) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.brand} - {product.color}</p>
                          <p className="text-sm text-purple-600">৳{product.sellingPrice.toLocaleString('en-BD')}</p>
                          {product.madeBy && (
                            <p className="text-xs text-gray-500">Made by: {product.madeBy}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                            {product.barcode}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Stock: {product.currentStock}</p>
                        </div>
                      </div>
                      
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Available Sizes: {product.sizes.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => printSingleBarcode(product)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                      >
                        🖨️ Print POS
                      </button>
                      <button
                        onClick={() => toggleProductSelection(product._id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          selectedProducts.includes(product._id)
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {selectedProducts.includes(product._id) ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 opacity-50">🏷️</div>
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">POS Printer Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Printer Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Printer Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Printer Type
                    </label>
                    <select
                      value={printSettings.printerType}
                      onChange={(e) => setPrintSettings({...printSettings, printerType: e.target.value as "pos" | "regular"})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="pos">POS Thermal Printer</option>
                      <option value="regular">Regular Printer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paper Width (inches)
                    </label>
                    <select
                      value={printSettings.paperWidth}
                      onChange={(e) => setPrintSettings({...printSettings, paperWidth: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value={2}>2" (Small POS)</option>
                      <option value={3}>3" (Medium POS)</option>
                      <option value={4}>4" (Large POS)</option>
                      <option value={8.5}>8.5" (A4 Paper)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stickers Per Row
                    </label>
                    <select
                      value={printSettings.stickersPerRow}
                      onChange={(e) => setPrintSettings({...printSettings, stickersPerRow: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sticker Dimensions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sticker Dimensions</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sticker Width (inches)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="4"
                      step="0.1"
                      value={printSettings.stickerWidth}
                      onChange={(e) => setPrintSettings({...printSettings, stickerWidth: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sticker Height (inches)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={printSettings.stickerHeight}
                      onChange={(e) => setPrintSettings({...printSettings, stickerHeight: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gap Between Stickers (pixels)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={printSettings.gapBetweenStickers}
                      onChange={(e) => setPrintSettings({...printSettings, gapBetweenStickers: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Content Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Label Content</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size (px)
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="16"
                      value={printSettings.fontSize}
                      onChange={(e) => setPrintSettings({...printSettings, fontSize: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printSettings.includeName}
                        onChange={(e) => setPrintSettings({...printSettings, includeName: e.target.checked})}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Product Name</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printSettings.includePrice}
                        onChange={(e) => setPrintSettings({...printSettings, includePrice: e.target.checked})}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Price</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printSettings.includeSize}
                        onChange={(e) => setPrintSettings({...printSettings, includeSize: e.target.checked})}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Size (if available)</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={printSettings.includeMadeBy}
                        onChange={(e) => setPrintSettings({...printSettings, includeMadeBy: e.target.checked})}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Made By</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sticker Preview</h4>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div 
                    className="border border-gray-400 bg-white p-2 text-center flex flex-col mx-auto"
                    style={{
                      width: `${printSettings.stickerWidth * 60}px`,
                      height: `${printSettings.stickerHeight * 60}px`,
                      fontSize: `${printSettings.fontSize}px`,
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    <div className="font-bold text-xs" style={{ fontSize: `${printSettings.fontSize}px` }}>
                      DUBAI BORKA HOUSE
                    </div>
                    {printSettings.includeName && (
                      <div className="truncate" style={{ fontSize: '10px', margin: '2px 0' }}>
                        Sample Abaya
                      </div>
                    )}
                    {printSettings.includePrice && (
                      <div className="font-bold" style={{ fontSize: `${printSettings.fontSize + 1}px`, margin: '2px 0' }}>
                        ৳2,500
                      </div>
                    )}
                    <div className="my-1">
                      <div className="bg-black h-6 w-full mb-1"></div>
                    </div>
                    {printSettings.includeSize && (
                      <div style={{ fontSize: `${printSettings.fontSize - 3}px`, margin: '1px 0' }}>M,L,XL</div>
                    )}
                    <div className="flex justify-end w-full mt-auto">
                      {printSettings.includeMadeBy && (
                        <div className="text-gray-600 text-right" style={{ fontSize: '10px' }}>
                          Dubai
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-500">
                    {printSettings.stickerWidth}" × {printSettings.stickerHeight}" | Gap: {printSettings.gapBetweenStickers}px
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">POS Printer Presets</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPrintSettings({
                    printerType: "pos",
                    stickerWidth: 1.5,
                    stickerHeight: 1.0,
                    gapBetweenStickers: 10,
                    fontSize: 8,
                    includePrice: true,
                    includeName: true,
                    includeSize: false,
                    includeMadeBy: true,
                    stickersPerRow: 2,
                    paperWidth: 4,
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  🏷️ Standard POS (1.5"×1")
                </button>
                <button
                  onClick={() => setPrintSettings({
                    printerType: "pos",
                    stickerWidth: 1.0,
                    stickerHeight: 0.75,
                    gapBetweenStickers: 8,
                    fontSize: 6,
                    includePrice: true,
                    includeName: false,
                    includeSize: false,
                    includeMadeBy: false,
                    stickersPerRow: 3,
                    paperWidth: 4,
                  })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  🏷️ Small POS (1"×0.75")
                </button>
                <button
                  onClick={() => setPrintSettings({
                    printerType: "pos",
                    stickerWidth: 2.0,
                    stickerHeight: 1.25,
                    gapBetweenStickers: 12,
                    fontSize: 10,
                    includePrice: true,
                    includeName: true,
                    includeSize: true,
                    includeMadeBy: true,
                    stickersPerRow: 2,
                    paperWidth: 4,
                  })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                >
                  🏷️ Large POS (2"×1.25")
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
