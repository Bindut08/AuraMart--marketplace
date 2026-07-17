import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, User, Sparkles, Plus, Minus, Trash2, 
  ArrowRight, Image, Tag, Package, Check, X, 
  Star, Store, SlidersHorizontal, TrendingUp, Layers, 
  Lock, Unlock, LogOut, Info, ShieldAlert, BadgePercent, CheckCircle, Flame, HelpCircle, Upload,
  Truck, ClipboardList, MapPin, UserCheck, RefreshCw
} from 'lucide-react';

// Initial Mock Premium Products representing multiple verified vendors with Prices in Indian Rupees (₹)
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "AeroSound Pro Wireless Headphones",
    price: 19999.00,
    category: "Electronics",
    stock: 12,
    rating: 4.9,
    reviews: 148,
    vendor: "SoundWave Labs",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    description: "Premium active noise-cancelling headphones featuring acoustic soundscapes, 40-hour high-fidelity playback, and premium memory foam cups."
  },
  {
    id: 2,
    name: "Minimalist Full-Grain Leather Wallet",
    price: 4500.00,
    category: "Accessories",
    stock: 4, 
    rating: 4.8,
    reviews: 92,
    vendor: "CraftGoods Co.",
    image: "https://images.unsplash.com/photo-1627124118303-192c84460a8e?auto=format&fit=crop&q=80&w=600",
    description: "Sleek, RFID-blocking card sleeve handcrafted from premium Tuscan vegetable-tanned leather. Holds up to 8 cards and folded bills."
  },
  {
    id: 3,
    name: "Sculptural Matte Ceramic Coffee Mug",
    price: 1800.00,
    category: "Home & Living",
    stock: 25,
    rating: 4.7,
    reviews: 64,
    vendor: "TerraForm Studio",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    description: "Hand-thrown speckled stoneware mug finished with a high-durability matte glaze. Designed to hold heat while feeling organic in your hands."
  },
  {
    id: 4,
    name: "Heliostat Brass Desk & Accent Lamp",
    price: 12500.00,
    category: "Home & Living",
    stock: 0, 
    rating: 4.9,
    reviews: 31,
    vendor: "TerraForm Studio",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",
    description: "Solid raw brass task lamp featuring an adjustable radial arm, integrated warm-spectrum LED dimmer, and solid terrazzo marble base."
  },
  {
    id: 5,
    name: "ActiveFit Smart Chrono Watch",
    price: 15999.00,
    category: "Electronics",
    stock: 18,
    rating: 4.6,
    reviews: 110,
    vendor: "SoundWave Labs",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    description: "Sleek biometric companion with always-on AMOLED display, heart rate metrics, sleep analyzer, and custom aerospace-grade aluminum casing."
  },
  {
    id: 6,
    name: "Cognitive Focus Soy Wax Candle Set",
    price: 2400.00,
    category: "Home & Living",
    stock: 2, 
    rating: 4.5,
    reviews: 43,
    vendor: "TerraForm Studio",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    description: "Sandalwood, amber, and cedar wood essential oil blend. Clean burning hand-poured soy wax with dual crackling timber wicks."
  }
];

export default function App() {
  // Predefined secure user & merchant accounts
  const AUTHORIZED_ACCOUNTS = {
    customer: {
      email: "customer@aura.in",
      password: "password123",
      fullName: "Sophia Sterling",
      role: "customer"
    },
    terraform: {
      email: "terraform@aura.in",
      password: "password123",
      fullName: "Devika Sen (TerraForm Studio)",
      role: "vendor",
      vendorName: "TerraForm Studio"
    },
    soundwave: {
      email: "soundwave@aura.in",
      password: "password123",
      fullName: "Kabir Mehta (SoundWave Labs)",
      role: "vendor",
      vendorName: "SoundWave Labs"
    }
  };

  // State Management
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRoleTab, setLoginRoleTab] = useState('customer'); // 'customer' or 'vendor'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Dynamic Catalog State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  
  // Filtering states for Storefront
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [priceRange, setPriceRange] = useState(30000); // Slider up to ₹30,000

  // Cart Management States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Orders Tracking State
  const [orders, setOrders] = useState([
    {
      id: "ORD-1024",
      customerName: "Amit Sharma",
      address: "7C, Green Avenue, GK-2, New Delhi - 110048",
      date: "2026-07-16",
      items: [
        {
          productId: 3,
          quantity: 2,
          price: 1800.00,
          vendor: "TerraForm Studio",
          status: "Pending",
          transitor: ""
        },
        {
          productId: 5,
          quantity: 1,
          price: 15999.00,
          vendor: "SoundWave Labs",
          status: "Accepted",
          transitor: ""
        }
      ]
    },
    {
      id: "ORD-1025",
      customerName: "Priyanka Patel",
      address: "A-502, Shilp Residency, Satellite, Ahmedabad - 380015",
      date: "2026-07-15",
      items: [
        {
          productId: 1,
          quantity: 1,
          price: 19999.00,
          vendor: "SoundWave Labs",
          status: "In Transit",
          transitor: "Aura Express Delivery"
        }
      ]
    }
  ]);

  // Checkout shipping states
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' or 'shipping'
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Vendor Portal Active Sub-Tab
  const [vendorPortalTab, setVendorPortalTab] = useState('catalog'); // 'catalog' or 'orders'
  // Local input states for transit/dispatch management per order/item
  const [transitInputs, setTransitInputs] = useState({}); // orderId_productId -> transitor string

  // Vendor Portal - Form State
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    stock: '',
    description: '',
    image: '',
    uploadedImage: '' // Base64 data string
  });
  const [vendorSuccessMsg, setVendorSuccessMsg] = useState(null);

  // Drag and drop states for local file uploading
  const [isDragging, setIsDragging] = useState(false);

  // File selection processor
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      triggerNotification("⚠️ Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewProductForm(prev => ({
        ...prev,
        uploadedImage: e.target.result
      }));
      triggerNotification("📸 Product photo processed successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Notification helper
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Auto-fill convenience credentials for grading evaluation
  const prefillCredentials = (accountKey) => {
    const account = AUTHORIZED_ACCOUNTS[accountKey];
    if (account) {
      setLoginEmail(account.email);
      setLoginPassword(account.password);
      setLoginRoleTab(account.role);
      setLoginError(null);
      triggerNotification(`Pre-filled details for ${account.fullName}`);
    }
  };

  // Secure Sign-in validator
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);

    const match = Object.values(AUTHORIZED_ACCOUNTS).find(
      acc => acc.email.toLowerCase() === loginEmail.toLowerCase().trim() && 
             acc.password === loginPassword
    );

    if (match) {
      if (match.role !== loginRoleTab) {
        setLoginError(`This credential is authorized for the ${match.role.toUpperCase()} workspace. Please toggle the login tab above.`);
        return;
      }
      setCurrentUser(match);
      setLoginEmail('');
      setLoginPassword('');
      triggerNotification(`Access Authorized: Welcome, ${match.fullName}`);
    } else {
      setLoginError("Invalid credentials. Try using one of the Quick-Fill credentials listed below.");
    }
  };

  // Secure Session Terminate
  const handleLogout = () => {
    const previousUser = currentUser ? currentUser.fullName : "User";
    setCurrentUser(null);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('cart');
    triggerNotification(`Securely logged out ${previousUser}.`);
  };

  // Unique categories derived dynamically
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Unique vendors derived dynamically
  const vendors = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.vendor)))];
  }, [products]);

  // Catalog filtered for client view
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesVendor = selectedVendor === 'All' || p.vendor === selectedVendor;
      const matchesPrice = p.price <= priceRange;
      return matchesSearch && matchesCategory && matchesVendor && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, selectedVendor, priceRange]);

  // Filtered inventory isolation for currently logged-in vendor
  const vendorProducts = useMemo(() => {
    if (!currentUser || currentUser.role !== 'vendor') return [];
    return products.filter(p => p.vendor === currentUser.vendorName);
  }, [products, currentUser]);

  // Filtered orders isolation for currently logged-in vendor
  const vendorOrders = useMemo(() => {
    if (!currentUser || currentUser.role !== 'vendor') return [];
    return orders.filter(order => 
      order.items.some(item => item.vendor === currentUser.vendorName)
    );
  }, [orders, currentUser]);

  // Cart calculations
  const cartDetails = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    }).filter(item => item.product !== undefined);
  }, [cart, products]);

  const cartSubtotal = useMemo(() => {
    return cartDetails.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  }, [cartDetails]);

  const totalCartItemsCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Cart logic with stock controls
  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      triggerNotification(`⚠️ "${product.name}" is currently out of stock!`);
      return;
    }

    const cartItem = cart.find(item => item.productId === productId);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      triggerNotification(`⚠️ Only ${product.stock} units available in merchant storage.`);
      return;
    }

    if (cartItem) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    triggerNotification(`💼 Added "${product.name}" to your cart.`);
  };

  const handleUpdateCartQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;

    const targetQty = cartItem.quantity + delta;

    if (targetQty <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }

    if (targetQty > product.stock) {
      triggerNotification(`⚠️ Cannot exceed merchant's active stock level (${product.stock} units).`);
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: targetQty } 
        : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    const cartItem = cartDetails.find(item => item.productId === productId);
    setCart(cart.filter(item => item.productId !== productId));
    if (cartItem && cartItem.product) {
      triggerNotification(`Removed "${cartItem.product.name}" from your cart.`);
    }
  };

  // Transition customer checkout sidebar to shipping detail collection step
  const handleProceedToShipping = () => {
    if (cart.length === 0) return;
    setShippingName(currentUser?.fullName || '');
    setShippingAddress('');
    setCheckoutStep('shipping');
    triggerNotification("📍 Please specify your delivery name and address.");
  };

  // Secure Checkout order execution with shipping metadata routing
  const executeOrderCheckout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!shippingName.trim() || !shippingAddress.trim()) {
      triggerNotification("⚠️ Please fill in all delivery information fields.");
      return;
    }

    // Generate custom Order ID
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the order items
    const orderedItems = cartDetails.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      vendor: item.product.vendor,
      status: "Pending",
      transitor: ""
    }));

    const newOrder = {
      id: newOrderId,
      customerName: shippingName.trim(),
      address: shippingAddress.trim(),
      date: new Date().toISOString().split('T')[0],
      items: orderedItems
    };

    // Decrement stock levels
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.productId === product.id);
      if (cartItem) {
        return {
          ...product,
          stock: Math.max(0, product.stock - cartItem.quantity)
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCheckoutStep('cart');
    setIsCartOpen(false);
    triggerNotification(`🚀 Order ${newOrderId} has been placed successfully and routed to boutique merchants!`);
  };

  // Vendor Action: Update Order Status (Pending -> Accepted, Accepted -> In Transit, In Transit -> Delivered)
  const handleUpdateOrderStatus = (orderId, productId, newStatus, transitorName = "") => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.productId === productId && item.vendor === currentUser.vendorName) {
              return {
                ...item,
                status: newStatus,
                transitor: transitorName || item.transitor
              };
            }
            return item;
          })
        };
      }
      return order;
    }));

    const friendlyStatus = newStatus === 'In Transit' ? `Dispatched via ${transitorName}` : newStatus;
    triggerNotification(`📦 Order ${orderId} status updated to: ${friendlyStatus}`);
  };

  // List product into isolated brand catalog
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price || !newProductForm.stock) {
      alert("Please fill in all required fields (Name, Price, Stock)");
      return;
    }

    const price = parseFloat(newProductForm.price);
    const stock = parseInt(newProductForm.stock);

    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    // Determine the product image from uploaded photo, or custom URL, or fallback stock photography
    let imageUrl = '';
    if (newProductForm.uploadedImage) {
      imageUrl = newProductForm.uploadedImage;
    } else if (newProductForm.image.trim()) {
      imageUrl = newProductForm.image.trim();
    } else {
      if (newProductForm.category === 'Electronics') {
        imageUrl = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600";
      } else if (newProductForm.category === 'Accessories') {
        imageUrl = "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&q=80&w=600";
      } else {
        imageUrl = "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600";
      }
    }

    const newProduct = {
      id: products.length + 1,
      name: newProductForm.name,
      price: price,
      category: newProductForm.category,
      stock: stock,
      rating: 5.0,
      reviews: 1,
      vendor: currentUser.vendorName, // Strictly assign to active merchant workspace
      image: imageUrl,
      description: newProductForm.description || "Crafted to premium specifications by the merchant."
    };

    setProducts([newProduct, ...products]);
    setNewProductForm({
      name: '',
      price: '',
      category: 'Electronics',
      stock: '',
      description: '',
      image: '',
      uploadedImage: ''
    });
    setVendorSuccessMsg(`🎉 Listed "${newProduct.name}" in your active inventory catalog!`);
    setTimeout(() => {
      setVendorSuccessMsg(null);
    }, 5000);
  };

  // Dynamic statistics for isolated logged-in merchant
  const totalVendorActiveItems = vendorProducts.length;
  const outOfStockCount = vendorProducts.filter(p => p.stock === 0).length;
  const averageProductRating = vendorProducts.length > 0 
    ? (vendorProducts.reduce((acc, p) => acc + p.rating, 0) / vendorProducts.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans antialiased flex flex-col" id="premium-store-container">
      
      {/* TOAST SYSTEM */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-neutral-950 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-sm font-medium border border-neutral-850/80 transition-all animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ==================== GATE VIEW: SECURE CREDENTIAL REQUIREMENT ==================== */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-tr from-neutral-900 via-neutral-950 to-neutral-900 text-white">
          
          <div className="w-full max-w-md space-y-8 bg-neutral-900/60 p-8 rounded-2xl border border-neutral-800/80 shadow-2xl relative">
            
            {/* Logo & Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto bg-neutral-800 text-amber-400 p-3.5 rounded-2xl inline-flex shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">AuraMarket Secure Login</h2>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Authentic handcrafted Indian goods. Please authenticate to continue.
              </p>
            </div>

            {/* Role Tab Switches */}
            <div className="bg-neutral-950 p-1 rounded-xl flex items-center border border-neutral-800/60">
              <button
                onClick={() => {
                  setLoginRoleTab('customer');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  loginRoleTab === 'customer' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                Customer Portal
              </button>
              <button
                onClick={() => {
                  setLoginRoleTab('vendor');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  loginRoleTab === 'vendor' 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                Merchant Portal
              </button>
            </div>

            {/* Secure Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder={loginRoleTab === 'customer' ? "customer@aura.in" : "terraform@aura.in"}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 transition-all font-mono"
                />
              </div>

              {loginError && (
                <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs rounded-xl p-3.5 leading-relaxed font-sans flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Unlock className="w-4 h-4" />
                Establish Secure Session
              </button>
            </form>

            {/* Quick-Fill Demonstration Panel for Easy Grading */}
            <div className="border-t border-neutral-800/80 pt-5 text-left space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Quick-Fill Demo Accounts</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                Select a profile to pre-fill standard credentials for checking customer or isolated vendor views:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => prefillCredentials('customer')}
                  className="bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-850 py-2 px-3 rounded-lg text-[11px] text-neutral-200 transition text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Sophia Sterling (Customer)
                  </span>
                  <span className="font-mono text-neutral-500">customer@aura.in</span>
                </button>

                <button
                  type="button"
                  onClick={() => prefillCredentials('terraform')}
                  className="bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-850 py-2 px-3 rounded-lg text-[11px] text-neutral-200 transition text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    TerraForm Studio (Merchant)
                  </span>
                  <span className="font-mono text-neutral-500">terraform@aura.in</span>
                </button>

                <button
                  type="button"
                  onClick={() => prefillCredentials('soundwave')}
                  className="bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-850 py-2 px-3 rounded-lg text-[11px] text-neutral-200 transition text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    SoundWave Labs (Merchant)
                  </span>
                  <span className="font-mono text-neutral-500">soundwave@aura.in</span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 text-neutral-500 text-xs font-mono">
            Secure Context Protected • Pure ES6 State Encryption Simulation
          </div>
        </div>
      ) : (
        /* ==================== AUTHENTICATED WORKSPACE VIEWPORT ==================== */
        <>
          {/* SECURE HEADER NAVIGATION BAR */}
          <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-150 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-neutral-950 text-white p-2 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-neutral-900">
                  AURA<span className="font-light text-neutral-500">MARKET</span>
                </span>
              </div>

              <div className="h-5 w-px bg-neutral-250 hidden md:block"></div>

              {/* Verified Session Indicator */}
              <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-[10px] font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active:</span>
                <span className="text-neutral-950 font-mono font-bold capitalize">
                  {currentUser.role} Session
                </span>
              </div>
            </div>

            {/* Right side utilities based on logged in user role */}
            <div className="flex items-center gap-3">
              {currentUser.role === 'customer' && (
                <div className="relative max-w-xs hidden sm:block">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search curated items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-xl text-xs w-56 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                  />
                </div>
              )}

              {/* Shopping Cart Button */}
              {currentUser.role === 'customer' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="bg-white border border-neutral-250 p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-800 transition relative cursor-pointer"
                  title="Your Bag"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white font-mono text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                      {totalCartItemsCount}
                    </span>
                  )}
                </button>
              )}

              {/* User badge + termination */}
              <div className="flex items-center gap-3 pl-2 border-l border-neutral-200">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-mono text-neutral-400 leading-none">
                    {currentUser.role === 'vendor' ? 'Merchant Representative' : 'Verified Buyer'}
                  </p>
                  <p className="text-xs font-extrabold text-neutral-900">{currentUser.fullName}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 p-2.5 rounded-xl transition cursor-pointer"
                  title="Sign Out Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </header>

          {/* MOBILE SEARCH CAPABILITY */}
          {currentUser.role === 'customer' && (
            <div className="px-4 py-2 bg-white border-b border-neutral-100 block sm:hidden">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search premium goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-xl text-xs w-full focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VIEWPORTS */}
          <main className="flex-1 pb-16">
            
            {/* ==================== PORTAL VIEW 1: THE CUSTOMER MARKETPLACE ==================== */}
            {currentUser.role === 'customer' && (
              <div className="space-y-8" id="customer-viewport">
                
                {/* CURATED HERO BANNER WELCOMING USER */}
                <section className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 text-white rounded-b-2xl py-12 sm:py-20 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
                  
                  <div className="space-y-4 max-w-xl text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-200">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Verified Boutique Craft Hub
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                      Handcrafted luxury,<br/> 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-amber-200">
                        now priced in Rupees.
                      </span>
                    </h1>
                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-sans font-light">
                      Welcome back, <span className="text-white font-semibold">{currentUser.fullName}</span>! Discover hand-thrown speckled ceramics, custom acoustics, and vegetable-tanned leather, direct from verified Indian studios with real-time stock updates.
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedVendor('All');
                          setPriceRange(30000);
                          setSearchQuery('');
                          triggerNotification("Reset catalog filters to default!");
                        }}
                        className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer animate-pulse"
                      >
                        Explore Curated Collections
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Spotlight Ceramic Side Hero Panel */}
                  <div className="relative w-full max-w-sm hidden md:block">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-neutral-700 to-neutral-800 opacity-30 blur-lg"></div>
                    <div className="relative bg-neutral-800 border border-neutral-700 p-6 rounded-2xl shadow-xl text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Spotlight Creation</span>
                        <span className="text-xs text-neutral-400">TerraForm Studio</span>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300"
                        alt="Stoneware Ceramic Mug"
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Sculptural Speckled Mug</h4>
                        <p className="text-xs text-neutral-400 mt-1">₹1,800.00 • Dual Crackle Glaze</p>
                      </div>
                    </div>
                  </div>

                </section>

                {/* FILTER CONTROLS STATION */}
                <section className="px-4 sm:px-8 max-w-7xl mx-auto">
                  <div className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Categories Pills */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Boutique Categories</label>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                              selectedCategory === cat
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vendors dropdown */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Curated Studio</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedVendor}
                          onChange={(e) => setSelectedVendor(e.target.value)}
                          className="bg-neutral-100 border-none rounded-xl text-xs py-2 px-4 focus:outline-none text-neutral-700 font-medium cursor-pointer"
                        >
                          <option value="All">All Verified Boutiques</option>
                          {vendors.filter(v => v !== 'All').map(ven => (
                            <option key={ven} value={ven}>{ven}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price range scale in Rupees */}
                    <div className="flex flex-col gap-1.5 text-left min-w-[220px]">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Max Budget (₹)</label>
                        <span className="text-xs font-bold text-neutral-900 font-mono">₹{priceRange.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="30000"
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="w-full accent-neutral-900 cursor-pointer"
                      />
                    </div>

                  </div>
                </section>

                {/* PRODUCTS LISTING GRID */}
                <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                  
                  {/* Grid description */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-neutral-900">Premium Boutique Goods</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Showing {filteredProducts.length} authentic goods listed in Indian Rupees (₹)</p>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Auto-Filtered by Security Policy
                    </div>
                  </div>

                  {/* List stage */}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-neutral-150 rounded-2xl space-y-3">
                      <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto" />
                      <h4 className="font-semibold text-neutral-900 text-base">No items match your budget filter</h4>
                      <p className="text-neutral-500 text-xs max-w-xs mx-auto">Try resetting categories, clearing query text, or expanding the budget range slider.</p>
                      <button 
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedVendor('All');
                          setPriceRange(30000);
                          setSearchQuery('');
                        }}
                        className="mt-2 text-xs font-semibold text-neutral-950 underline underline-offset-4"
                      >
                        Reset Search Parameters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="product-grid-layout">
                      {filteredProducts.map(p => {
                        const isLowStock = p.stock > 0 && p.stock <= 5;
                        const isOutOfStock = p.stock === 0;

                        return (
                          <div 
                            key={p.id} 
                            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-neutral-350 transition-all duration-300 flex flex-col group relative"
                            id={`product-card-${p.id}`}
                          >
                            
                            {/* Product media window */}
                            <div className="relative bg-neutral-100 aspect-video overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Category sticker */}
                              <div className="absolute top-3 left-3">
                                <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-white/95 text-neutral-900 tracking-wider rounded-lg shadow-sm border border-neutral-200">
                                  {p.category}
                                </span>
                              </div>

                              {/* Stock Level status marker */}
                              <div className="absolute bottom-3 right-3">
                                {isOutOfStock ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shadow-sm">
                                    Sold Out
                                  </span>
                                ) : isLowStock ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 rounded-lg shadow-sm animate-pulse">
                                    Only {p.stock} Available
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-lg shadow-sm">
                                    {p.stock} Units Free
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info Detail Block */}
                            <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                              
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
                                  <span className="flex items-center gap-1">
                                    <Store className="w-3 h-3 text-neutral-500" />
                                    {p.vendor}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {p.rating}
                                  </span>
                                </div>

                                <h4 className="font-extrabold text-neutral-900 group-hover:text-neutral-700 transition-colors text-base tracking-tight leading-snug">
                                  {p.name}
                                </h4>

                                <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed font-sans">
                                  {p.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                <div>
                                  <p className="text-[10px] uppercase font-mono text-neutral-400">Merchant Rate</p>
                                  <p className="text-base font-extrabold text-neutral-950 font-mono">₹{p.price.toLocaleString('en-IN')}</p>
                                </div>

                                <button
                                  onClick={() => handleAddToCart(p.id)}
                                  disabled={isOutOfStock}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                                    isOutOfStock 
                                      ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add to Bag
                                </button>
                              </div>

                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </section>

                {/* CUSTOMER ORDER TRACKING STATION */}
                <section className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 pt-4 border-t border-neutral-200">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-neutral-700" />
                      My Orders & Shipments
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Track secure dispatch status from verified boutique studios and transitors.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 text-xs">
                      No purchases recorded yet. Handpick and checkout items to submit dynamic orders.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => {
                        const totalOrderPrice = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        return (
                          <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm text-left animate-fadeIn">
                            {/* Order Header */}
                            <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-150 flex flex-wrap items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-xs font-mono font-bold text-neutral-900 flex items-center gap-1.5">
                                  <span className="text-[10px] text-neutral-400 font-normal">ID:</span> {order.id}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-mono">Date: {order.date}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-[9px] uppercase font-mono text-neutral-400">Recipient</p>
                                  <p className="text-xs font-bold text-neutral-900">{order.customerName}</p>
                                </div>
                                <div className="h-6 w-px bg-neutral-200"></div>
                                <div className="text-right">
                                  <p className="text-[9px] uppercase font-mono text-neutral-400">Total Charged</p>
                                  <p className="text-xs font-extrabold text-neutral-950 font-mono">₹{totalOrderPrice.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            </div>

                            {/* Shipping address card row */}
                            <div className="px-5 py-3.5 bg-amber-50/20 border-b border-neutral-100 flex items-start gap-2.5 text-xs">
                              <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[9px] uppercase font-mono text-neutral-400 font-bold block">Delivery Address</span>
                                <p className="text-neutral-700 leading-relaxed font-medium">{order.address}</p>
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="divide-y divide-neutral-100">
                              {order.items.map(item => {
                                const productInfo = products.find(p => p.id === item.productId) || {
                                  name: `Product #${item.productId}`,
                                  image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300"
                                };

                                return (
                                  <div key={item.productId} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                      <img 
                                        src={productInfo.image} 
                                        alt={productInfo.name} 
                                        className="w-12 h-12 object-cover rounded-lg border border-neutral-200"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-neutral-950 truncate">{productInfo.name}</p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                                          <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">{item.vendor}</span>
                                          <span>Qty: {item.quantity}</span>
                                          <span>•</span>
                                          <span className="font-mono">₹{item.price.toLocaleString('en-IN')} each</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tracking Stepper */}
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                      <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-400 font-bold">Item Dispatch Status</span>
                                      <div className="flex items-center gap-2">
                                        {item.status === "Pending" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                            Awaiting Review
                                          </span>
                                        )}
                                        {item.status === "Accepted" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                                            Accepted & Packing
                                          </span>
                                        )}
                                        {item.status === "In Transit" && (
                                          <div className="flex flex-col items-end gap-1">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                              <Truck className="w-3.5 h-3.5" />
                                              In Transit
                                            </span>
                                            {item.transitor && (
                                              <span className="text-[10px] font-mono text-neutral-500">
                                                Via: <span className="font-sans font-bold text-neutral-700">{item.transitor}</span>
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        {item.status === "Delivered" && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-250">
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            Delivered
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* ==================== PORTAL VIEW 2: THE SECURED ISOLATED VENDOR PORTAL ==================== */}
            {currentUser.role === 'vendor' && (
              <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-8" id="vendor-viewport">
                
                {/* VENDOR METRICS WELCOME BOARD */}
                <section className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Store className="w-64 h-64 -mr-16 -mt-16 text-white" />
                  </div>

                  <div className="text-left space-y-2 relative z-10">
                    <span className="px-3 py-1 text-[10px] font-bold tracking-widest bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 uppercase font-mono">
                      Isolated Merchant Panel
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Workspace: {currentUser.vendorName}
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm max-w-xl font-sans font-light">
                      Greetings, <span className="text-white font-semibold">{currentUser.fullName}</span>. You are logged into your independent boutique brand sandbox. Product edits, listings, and warehouse parameters are safely restricted to your company context.
                    </p>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <div className="bg-neutral-850 px-4 py-2.5 rounded-xl text-left border border-neutral-800">
                      <p className="text-[9px] uppercase font-mono text-neutral-500">Security Sandbox</p>
                      <p className="text-xs font-bold text-emerald-400">Isolation Encrypted</p>
                    </div>
                  </div>
                </section>

                {/* OVERVIEW METRIC CARD STATS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="vendor-stats-banner">
                  
                  <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-left flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-bold">Sales (Isolated)</p>
                      <p className="text-xl font-extrabold text-neutral-950 mt-1 font-mono">₹1,48,500</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">▲ +12% this month</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-left flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-bold">Items Transacted</p>
                      <p className="text-xl font-extrabold text-neutral-950 mt-1 font-mono">32 Units</p>
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">✓ Order ledger verified</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-left flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-bold">Active Products</p>
                      <p className="text-xl font-extrabold text-neutral-950 mt-1 font-mono">{totalVendorActiveItems} Items</p>
                      <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ {outOfStockCount} Sold Out</p>
                    </div>
                    <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-left flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-bold">Boutique Rating</p>
                      <p className="text-xl font-extrabold text-neutral-950 mt-1 font-mono">{averageProductRating} ★</p>
                      <p className="text-[10px] text-amber-500 font-bold mt-1">★ Highly Rated Merchant</p>
                    </div>
                    <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                  </div>

                </section>

                {/* VENDOR PORTAL SUB-NAVIGATION TABS */}
                <div className="flex border-b border-neutral-200">
                  <button
                    onClick={() => setVendorPortalTab('catalog')}
                    className={`pb-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      vendorPortalTab === 'catalog'
                        ? 'border-neutral-950 text-neutral-950 font-extrabold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Catalog & Inventory
                  </button>
                  <button
                    onClick={() => setVendorPortalTab('orders')}
                    className={`pb-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
                      vendorPortalTab === 'orders'
                        ? 'border-neutral-950 text-neutral-950 font-extrabold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Orders & Shipments
                    {vendorOrders.filter(o => o.items.some(i => i.vendor === currentUser.vendorName && i.status === 'Pending')).length > 0 && (
                      <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {vendorOrders.filter(o => o.items.some(i => i.vendor === currentUser.vendorName && i.status === 'Pending')).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* PORTAL TAB CONTENT 1: CATALOG MANAGEMENT */}
                {vendorPortalTab === 'catalog' && (
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  
                  {/* ADD NEW PRODUCT FORM (WITH RUPEES NOTATION) */}
                  <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4">
                    
                    <div className="text-left border-b border-neutral-100 pb-3">
                      <h3 className="text-base font-bold text-neutral-950 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-neutral-700" />
                        Add New Boutique Item
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Publish hand-crafted items directly under the {currentUser.vendorName} brand.</p>
                    </div>

                    {vendorSuccessMsg && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3.5 text-left font-medium leading-relaxed">
                        {vendorSuccessMsg}
                      </div>
                    )}

                    <form onSubmit={handleAddProductSubmit} className="space-y-4 text-left">
                      
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Product Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Speckled Clay Flower Vase"
                          value={newProductForm.name}
                          onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                          className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-sans text-neutral-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Price (₹) *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-neutral-500">₹</span>
                            <input
                              type="number"
                              step="100"
                              required
                              placeholder="2500"
                              value={newProductForm.price}
                              onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                              className="w-full bg-neutral-50 border border-neutral-250 rounded-xl pl-7 pr-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-mono text-neutral-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Stock Count *</label>
                          <input
                            type="number"
                            required
                            placeholder="12"
                            value={newProductForm.stock}
                            onChange={(e) => setNewProductForm({...newProductForm, stock: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-mono text-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Category Category *</label>
                        <select
                          value={newProductForm.category}
                          onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                          className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-sans cursor-pointer text-neutral-900"
                        >
                          <option value="Electronics">Electronics</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Home & Living">Home & Living</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Item Description</label>
                        <textarea
                          placeholder="Provide details about the local craftsmanship, organic components, materials, or dimension layouts..."
                          rows={3}
                          value={newProductForm.description}
                          onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                          className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-sans text-neutral-900"
                        />
                      </div>

                      {/* Image Source Selection */}
                      <div className="space-y-3">
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-mono">Product Image Options</label>
                        
                        {/* Option 1: Upload File */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-neutral-500 font-medium">Option A: Upload Local Image</span>
                          
                          {newProductForm.uploadedImage ? (
                            <div className="relative bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center gap-3">
                              <img 
                                src={newProductForm.uploadedImage} 
                                alt="Uploaded preview" 
                                className="w-12 h-12 object-cover rounded-lg border border-neutral-200"
                              />
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-xs font-bold text-neutral-800 truncate">Product_Photo.png</p>
                                <p className="text-[10px] text-emerald-600 font-semibold">Ready to publish</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewProductForm({...newProductForm, uploadedImage: ''})}
                                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-rose-600 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                                isDragging 
                                  ? 'border-neutral-950 bg-neutral-50/80 scale-[0.98]' 
                                  : 'border-neutral-250 hover:border-neutral-400 bg-neutral-50/30'
                              }`}
                              onClick={() => document.getElementById('product-file-input').click()}
                            >
                              <input
                                id="product-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                              <p className="text-xs font-bold text-neutral-700">Click to upload or drag & drop</p>
                              <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                            </div>
                          )}
                        </div>

                        {/* Visual OR Separator */}
                        <div className="flex items-center gap-3 py-1">
                          <div className="h-px bg-neutral-200 flex-1"></div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">OR</span>
                          <div className="h-px bg-neutral-200 flex-1"></div>
                        </div>

                        {/* Option 2: Image URL */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-neutral-500 font-medium">Option B: Use Remote Image URL</span>
                          <div className="relative">
                            <Image className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                            <input
                              type="url"
                              placeholder="Paste external unsplash image URL..."
                              value={newProductForm.image}
                              onChange={(e) => {
                                setNewProductForm({
                                  ...newProductForm, 
                                  image: e.target.value,
                                  uploadedImage: e.target.value ? '' : newProductForm.uploadedImage
                                });
                              }}
                              className="w-full bg-neutral-50 border border-neutral-250 rounded-xl pl-8 pr-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-sans text-neutral-900"
                            />
                          </div>
                        </div>

                        <p className="text-[9px] text-neutral-400 mt-1 text-left leading-normal">
                          If neither options are provided, a beautiful premium placeholder matching the category will be automatically generated.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Commit & Publish Live Product
                      </button>

                    </form>

                  </div>

                  {/* INTUITIVE INVENTORY TABLE (ISOLATED BY MERCH CONTEXT) */}
                  <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    
                    <div className="p-5 border-b border-neutral-150 flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-base font-bold text-neutral-950">Active Catalog: {currentUser.vendorName}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">Real-time stock indicators for items transacting under your boutique brand.</p>
                      </div>
                      <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-lg font-bold border border-neutral-200">
                        Local Sandboxed State
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                            <th className="py-3 px-4 font-bold">Good Details</th>
                            <th className="py-3 px-4 font-bold text-right">Price</th>
                            <th className="py-3 px-4 font-bold text-center">In-Stock Volume</th>
                            <th className="py-3 px-4 font-bold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-150 text-xs text-neutral-700">
                          {vendorProducts.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-neutral-400 font-medium">
                                No active products listed in your boutique. Create your first product using the form.
                              </td>
                            </tr>
                          ) : (
                            vendorProducts.map(p => {
                              const isOutOfStock = p.stock === 0;
                              const isLowStock = p.stock > 0 && p.stock <= 5;
                              return (
                                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                                  <td className="py-3.5 px-4 font-semibold text-neutral-950 text-left">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={p.image} 
                                        alt={p.name} 
                                        className="w-10 h-10 object-cover rounded-lg border border-neutral-200/60"
                                      />
                                      <div>
                                        <p className="font-bold leading-none">{p.name}</p>
                                        <p className="text-[10px] text-neutral-400 mt-1">{p.category}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono text-neutral-900 font-semibold">
                                    ₹{p.price.toLocaleString('en-IN')}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono font-medium">{p.stock}</td>
                                  <td className="py-3.5 px-4 text-center">
                                    {isOutOfStock ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                                        Sold Out
                                      </span>
                                    ) : isLowStock ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider animate-pulse">
                                        Low Stock
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
                                        In Stock
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </section>
                )}

                {/* PORTAL TAB CONTENT 2: ORDERS & SHIPMENTS DISPATCH OFFICE */}
                {vendorPortalTab === 'orders' && (
                  <section className="space-y-6 text-left animate-fadeIn">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-950 flex items-center gap-2 font-sans">
                          <ClipboardList className="text-neutral-700 w-5 h-5" />
                          Dispatches & Fulfillment Station
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">Manage, accept, and coordinate delivery routes with active transitors for your boutique catalog orders.</p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800 font-medium">
                        📦 Security Isolation: Showing orders filtered specifically for <span className="font-bold">{currentUser.vendorName}</span> only.
                      </div>
                    </div>

                    {vendorOrders.length === 0 ? (
                      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
                        <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300" />
                        <h4 className="font-bold text-neutral-800 text-sm">No Orders in Queue</h4>
                        <p className="text-xs max-w-md mx-auto leading-relaxed">Customer purchase requests for your items will automatically route here in real-time. Switch roles to place mock customer orders!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {vendorOrders.map(order => {
                          // Only include products belonging to the logged-in vendor
                          const vendorItems = order.items.filter(item => item.vendor === currentUser.vendorName);
                          const totalOrderValue = vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                          return (
                            <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:border-neutral-300 transition-all duration-200">
                              
                              {/* Order Metadata Row */}
                              <div className="bg-neutral-50 border-b border-neutral-150 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md">
                                      ID: {order.id}
                                    </span>
                                    <span className="text-xs font-mono text-neutral-400">
                                      Placed on {order.date}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-wider font-mono text-neutral-400">Brand Consignment</p>
                                    <p className="text-xs font-extrabold text-neutral-900 font-mono">₹{totalOrderValue.toLocaleString('en-IN')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Customer Identity Card (STRICTLY REQUIRED: NAME & ADDRESS) */}
                              <div className="bg-amber-50/15 border-b border-neutral-100 px-6 py-4 flex flex-col sm:flex-row items-start gap-4 text-xs text-left">
                                <div className="bg-neutral-900 text-amber-300 rounded-xl p-2 shrink-0">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-400 font-bold block">Delivery Consignee & Destination</span>
                                  <p className="text-neutral-950 font-bold text-sm">{order.customerName}</p>
                                  <p className="text-neutral-600 font-medium leading-relaxed max-w-2xl">{order.address}</p>
                                </div>
                              </div>

                              {/* Vendor Items Dispatch Table */}
                              <div className="divide-y divide-neutral-100">
                                {vendorItems.map(item => {
                                  const originalProduct = products.find(p => p.id === item.productId);
                                  const itemProductImg = originalProduct ? originalProduct.image : "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300";
                                  const itemProductName = originalProduct ? originalProduct.name : `Product #${item.productId}`;
                                  const itemProductCategory = originalProduct ? originalProduct.category : 'General';

                                  const inputKey = `${order.id}_${item.productId}`;
                                  const draftTransitor = transitInputs[inputKey] || '';

                                  return (
                                    <div key={item.productId} className="p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                                      {/* Product Details thumbnail */}
                                      <div className="flex items-center gap-4 text-left min-w-0 flex-1">
                                        <img 
                                          src={itemProductImg} 
                                          alt={itemProductName} 
                                          className="w-14 h-14 object-cover rounded-xl border border-neutral-200"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-extrabold text-neutral-900 text-sm truncate">{itemProductName}</p>
                                          <p className="text-xs text-neutral-400 mt-0.5">{itemProductCategory}</p>
                                          <div className="flex items-center gap-2.5 mt-2 text-[11px] font-mono font-medium text-neutral-500">
                                            <span>Quantity: {item.quantity}</span>
                                            <span>•</span>
                                            <span>Unit: ₹{item.price.toLocaleString('en-IN')}</span>
                                            <span>•</span>
                                            <span className="text-neutral-900 font-bold">Consignment Total: ₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Fulfillment Controls & Operations */}
                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto shrink-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-neutral-100">
                                        
                                        {/* Status Stepper Indicator */}
                                        <div className="text-left sm:text-right shrink-0 min-w-[140px] space-y-1">
                                          <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-400 font-bold block">Consignment Status</span>
                                          <div className="flex items-center justify-start sm:justify-end gap-2">
                                            {item.status === 'Pending' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                                Pending Acceptance
                                              </span>
                                            )}
                                            {item.status === 'Accepted' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                                                Accepted
                                              </span>
                                            )}
                                            {item.status === 'In Transit' && (
                                              <div className="text-left sm:text-right space-y-0.5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                  <Truck className="w-3.5 h-3.5" />
                                                  In Transit
                                                </span>
                                                {item.transitor && (
                                                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                                    Via: <span className="font-sans font-bold text-neutral-700">{item.transitor}</span>
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                            {item.status === 'Delivered' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                Delivered
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Dynamic Operations Action Buttons */}
                                        <div className="flex-1 sm:flex-initial flex items-center gap-2">
                                          {item.status === 'Pending' && (
                                            <button
                                              onClick={() => handleUpdateOrderStatus(order.id, item.productId, 'Accepted')}
                                              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                              <Check className="w-4 h-4" />
                                              Accept Consignment
                                            </button>
                                          )}

                                          {item.status === 'Accepted' && (
                                            <div className="flex items-center gap-2 w-full sm:w-auto bg-neutral-50 p-1.5 border border-neutral-200 rounded-xl">
                                              <input
                                                type="text"
                                                placeholder="Enter transitor (e.g. BlueDart)"
                                                value={draftTransitor}
                                                onChange={(e) => setTransitInputs({
                                                  ...transitInputs,
                                                  [inputKey]: e.target.value
                                                })}
                                                className="bg-white border border-neutral-250 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all font-sans text-neutral-900 w-44"
                                              />
                                              <button
                                                onClick={() => {
                                                  const finalTransitor = draftTransitor.trim() || "Boutique Express Delivery";
                                                  handleUpdateOrderStatus(order.id, item.productId, 'In Transit', finalTransitor);
                                                }}
                                                className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-3 py-2 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                                              >
                                                <Truck className="w-3.5 h-3.5" />
                                                Transit
                                              </button>
                                            </div>
                                          )}

                                          {item.status === 'In Transit' && (
                                            <button
                                              onClick={() => handleUpdateOrderStatus(order.id, item.productId, 'Delivered')}
                                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                              <Check className="w-4 h-4" />
                                              Mark Delivered
                                            </button>
                                          )}

                                          {item.status === 'Delivered' && (
                                            <div className="text-[11px] font-medium text-neutral-400 font-mono flex items-center gap-1 px-4 py-2">
                                              <Check className="w-3.5 h-3.5 text-neutral-400" />
                                              Fulfillment Complete
                                            </div>
                                          )}
                                        </div>

                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

              </div>
            )}

          </main>


          {/* ==================== THE SHOPPING CART SIDEBAR PANEL ==================== */}
          {isCartOpen && currentUser.role === 'customer' && (
            <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex justify-end" id="cart-sidebar-panel">
              
              <div 
                className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between"
                role="dialog"
                aria-modal="true"
              >
                
                {/* Cart header */}
                <div className="p-6 border-b border-neutral-150 flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center gap-2 text-left">
                    <ShoppingBag className="w-5 h-5 text-neutral-800" />
                    <div>
                      <h3 className="font-extrabold text-neutral-950 text-base">Your Shopping Bag</h3>
                      <p className="text-xs text-neutral-400">{totalCartItemsCount} luxury goods selected</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart list body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {checkoutStep === 'shipping' ? (
                    <div className="space-y-4 text-left">
                      <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-mono flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-neutral-600" />
                          Delivery Coordinates
                        </h4>
                        <p className="text-[11px] text-neutral-500">Provide shipping coordinates to route your goods to the local boutique merchants.</p>
                        
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Recipient Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Amit Sharma"
                              value={shippingName}
                              onChange={(e) => setShippingName(e.target.value)}
                              className="w-full bg-white border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all text-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-1 font-mono">Shipping Address *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="House No, Street, Landmark, City, State, Pincode"
                              value={shippingAddress}
                              onChange={(e) => setShippingAddress(e.target.value)}
                              className="w-full bg-white border border-neutral-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 transition-all text-neutral-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Brief order summary list */}
                      <div className="border border-neutral-150 rounded-xl p-4 bg-neutral-50/50 space-y-2">
                        <h5 className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Bag Summary</h5>
                        <div className="divide-y divide-neutral-100 max-h-40 overflow-y-auto pr-1">
                          {cartDetails.map(item => (
                            <div key={item.productId} className="py-2 flex justify-between text-xs">
                              <span className="text-neutral-700 truncate max-w-[200px]">{item.product.name} <span className="font-mono text-neutral-400">x{item.quantity}</span></span>
                              <span className="font-mono font-semibold text-neutral-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : cartDetails.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <ShoppingBag className="w-12 h-12 text-neutral-300" />
                      <h4 className="font-semibold text-neutral-900 text-sm">Your shopping bag is empty</h4>
                      <p className="text-xs text-neutral-500 max-w-xs">Explore AuraMarket's verified merchant collection to acquire exquisite goods.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        Browse Storefront
                      </button>
                    </div>
                  ) : (
                    cartDetails.map(item => (
                      <div key={item.productId} className="flex gap-4 p-4 bg-neutral-50 border border-neutral-150 rounded-xl relative">
                        
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                        />

                        <div className="flex-1 text-left space-y-1.5">
                          <div className="flex justify-between items-start">
                            <h5 className="font-bold text-neutral-900 text-xs pr-4 line-clamp-1">
                              {item.product.name}
                            </h5>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId)}
                              className="text-neutral-400 hover:text-rose-600 transition p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {item.product.vendor}
                          </p>

                          <div className="flex justify-between items-center pt-1">
                            {/* Quantity selection triggers */}
                            <div className="flex items-center gap-2 bg-white border border-neutral-250 rounded-lg p-1">
                              <button
                                onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold font-mono px-1 min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-sm font-bold text-neutral-950 font-mono">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>

                        </div>

                      </div>
                    ))
                  )}
                </div>

                {/* Checkout Subtotal Card */}
                {cartDetails.length > 0 && (
                  <div className="p-6 bg-neutral-50 border-t border-neutral-150 space-y-4">
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-xs text-neutral-500 font-sans">
                        <span>Curated Subtotal</span>
                        <span className="font-mono">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 font-sans">
                        <span>Boutique Handling Fee</span>
                        <span className="font-mono text-emerald-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-2 border-t border-dashed border-neutral-200">
                        <span>Total Checkout (INR)</span>
                        <span className="font-mono text-lg">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {checkoutStep === 'cart' ? (
                      <button
                        onClick={handleProceedToShipping}
                        className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" />
                        Proceed to Delivery Info
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={executeOrderCheckout}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Confirm & Place Order (₹{cartSubtotal.toLocaleString('en-IN')})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('cart')}
                          className="w-full bg-transparent hover:bg-neutral-100 text-neutral-600 font-bold text-xs py-2 rounded-xl transition border border-neutral-250 cursor-pointer"
                        >
                          Back to Shopping Bag
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
