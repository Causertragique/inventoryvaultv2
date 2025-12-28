// Translation system
export type Language = "en" | "fr" | "es" | "de";

export interface Translations {
  // Layout & Navigation
  Layout: {
    appName: string;
    appSubtitle: string;
    nav: {
      inventory: string;
      sales: string;
      analytics: string;
      users: string;
      settings: string;
    };
  };

  // Inventory page
  inventory: {
    other: string;
    juice: string;
    soda: string;
    beer: string;
    spirits: string;
    wine: string;
    allCategories: string;
    title: string;
    subtitle: string;
    addProduct: string;
    totalInventoryValue: string;
    totalProducts: string;
    lowStockItems: string;
    searchProducts: string;
    noProductsFound: string;
    confirmDelete: string;
    categories: {
      all: string;
      spirits: string;
      wine: string;
      beer: string;
      soda: string;
      juice: string;
      other: string;
    };
      addProductModal: {
        imageSearchTimeout: string;
        title: string;
        description: string;
        name: string;
        category: string;
        subcategory: string;
        origin: string;
        quantity: string;
        pricePerBottle: string;
        bottleSizeInMl: string;
        bottleSizeHint: string;
        inventoryCode: string;
        inventoryCodeHint: string;
        inventoryCodePlaceholder: string;
        qrCode: string;
        generateQR: string;
        downloadQR: string;
        qrCodePlaceholder: string;
        codeLabel: string;
        fillRequiredFields: string;
        imageUrl: string;
        searchImage: string;
        searchingImage: string;
        fillProductName: string;
        imageApiNotConfigured: string;
        imageNotFound: string;
        imageSearchError: string;
        editTitle: string;
        editDescription: string;
        save: string;
        cancel: string;
      categories: {
        other: string;
        soda: string;
        juice: string;
        spirits: string;
        beer: string;
        wine: string;
        aperitif: string;
        champagne: string;
        readyToDrink: string;
        snacks: string;
      };
      subcategories: {
        redWine: string;
        whiteWine: string;
        roseWine: string;
        scotchWhisky: string;
        liqueurCream: string;
        gin: string;
        rum: string;
        vodka: string;
        tequila: string;
        cognacBrandy: string;
      };
      origins: {
        imported: string;
        canadian: string;
        quebec: string;
        spain: string;
        france: string;
        italy: string;
        usa: string;
        australia: string;
        southAfrica: string;
        newZealand: string;
        portugal: string;
        chile: string;
        uk: string;
      };
    };
  };

  // Product Card
  productCard: {
    stockLevel: string;
    lowStock: string;
    add: string;
    remove: string;
    categories: {
      spirits: string;
      wine: string;
      beer: string;
      soda: string;
      juice: string;
      other: string;
    };
  };

  // Sales page
    sales: {
      noSalesPermission: string;
      accessDenied: string;
      title: string;
      subtitle: string;
      orderSummary: string;
      noItemsInCart: string;
      each: string;
      subtotal: string;
      tax: string;
      total: string;
      paymentMethod: string;
      cash: string;
      card: string;
      tab: string;
      openTab: string;
      openNewTab: string;
      selectTab: string;
      tabName: string;
      tabNamePlaceholder: string;
      creditCardNumber: string;
      creditCardInfo: string;
      tabCreated: string;
      tabClosed: string;
      noOpenTabs: string;
      tabs: string;
      closeTab: string;
      payTab: string;
      manageTabs: string;
      tabsManagement: string;
      viewDetails: string;
      hideDetails: string;
      allTabsTotal: string;
      completeSale: string;
      outOfStockLabel: string;
      categories: {
        all: string;
        spirits: string;
        wine: string;
        beer: string;
        soda: string;
        juice: string;
        other: string;
        cocktail: string;
      };
      sellProductCTA: string;
      sellProductDialogTitle: string;
      sellProductDialogDescription: string;
      sellProductForm: {
        typeStepTitle: string;
        typeStepDescription: string;
        containerStepTitle: string;
        containerStepDescription: string;
        productStepTitle: string;
        productStepDescription: string;
        containerAutoMessage: string;
        inventoryGroups: {
          compatible: string;
          other: string;
        };
        selectProductPlaceholder: string;
        noProductsAvailable: string;
        presetRecipeLabel: string;
        presetSelectPlaceholder: string;
        customCocktailLabel: string;
        customCocktailPlaceholder: string;
        ingredientReferenceLabel: string;
        ingredientCustomLabel: string;
        customIngredientProductLabel: string;
        customIngredientQuantityLabel: string;
        customIngredientRemoveLabel: string;
        addIngredientButton: string;
        estimatedCostLabel: string;
        estimatedCostDetailSingle: string;
        estimatedCostDetailMulti: string;
        profitMarginLabel: string;
        profitMarginHint: string;
        salePriceLabel: string;
        containerSelectedLabel: string;
        stepIndicator: string;
        stockCount: string;
        saveButton: string;
        typeOptions: Record<string, { label: string; helper: string }>;
        containerOptions: Record<string, string>;
        errors: {
          typeRequired: string;
          containerRequired: string;
          priceInvalid: string;
          productRequired: string;
          ingredientRequired: string;
        };
        customCocktailFallback: string;
        saleDisplayNameFallback: string;
      };
      cocktailRecipeLabel: string;
      cocktailRecipeSelectPlaceholder: string;
      alerts: {
        cashPayment: string;
        orderCompleted: string;
      };
      servingConfig: {
        title: string;
        description: string;
        formatDetails: string;
        categoryLabels: Record<string, string>;
        formats: Record<string, Record<string, string>>;
      };
    };

  // Analytics page
  analytics: {
    title: string;
    subtitle: string;
    salesAnalytics: string;
    salesAnalyticsDesc: string;
    inventoryTrends: string;
    inventoryTrendsDesc: string;
    revenueReports: string;
    revenueReportsDesc: string;
    comingSoon: string;
    salesPrediction: {
      errorTitle: string;
      retryButton: string;
      retrying: string;
      emptyMessage: string;
      analyzeButton: string;
      cardTitle: string;
      forecastLabel: string;
      unitsLabel: string;
      unitPriceLabel: string;
      dailyRevenueLabel: string;
      marginLabel: string;
      noProductDetails: string;
    };
    salesReport: {
      dailyDetailTitle: string;
      dailyDetailSubtitle: string;
      dailyDetailEmpty: string;
      dailyRevenueLabel: string;
      dailySalesLabel: string;
      dailyTipsLabel: string;
      dailyTaxLabel: string;
      downloadCsvButton: string;
    };
    aiTools: {
      title: string;
      refreshLabel: string;
      toolOptions: {
        insights: {
          title: string;
          description: string;
        };
        "sales-prediction": {
          title: string;
          description: string;
        };
        "food-wine-pairing": {
          title: string;
          description: string;
        };
        "sales-report": {
          title: string;
          description: string;
        };
      };
      insights: {
        errorTitle: string;
        retrying: string;
        retryButton: string;
        intro: string;
        generateButton: string;
        generating: string;
        noDataTitle: string;
        noDataDescription: string;
        comparativesTitle: string;
        comparativesTimeframes: {
          weekly: string;
          monthly: string;
          yearly: string;
        };
        trendLabels: {
          positive: string;
          negative: string;
          warning: string;
          neutral: string;
        };
        tableHeaders: {
          metric: string;
          value: string;
          trend: string;
          description: string;
        };
        summary: {
          title: string;
          totalSalesLabel: string;
          topCategoryLabel: string;
          recommendationLabel: string;
        };
      };
      foodWinePairing: {
        errorTitle: string;
        retrying: string;
        retryButton: string;
        emptyMessage: string;
        buttonLabel: string;
        title: string;
      };
      salesReport: {
        errorTitle: string;
        loading: string;
        retryButton: string;
        emptyMessage: string;
        buttonLabel: string;
        statsLabels: {
          totalSales: string;
          revenue: string;
          tps: string;
          tvq: string;
          tips: string;
          averageValue: string;
        };
      };
    };
  };

  // Audit Logs page
  auditLogs: {
    title: string;
    subtitle: string;
    accessDenied: string;
    accessDeniedDesc: string;
    suspiciousActivity: string;
    noSuspiciousActivity: string;
    statistics: string;
    totalChanges: string;
    byAction: string;
    byRole: string;
    activeUsers: string;
    recentChanges: string;
    noLogs: string;
    actions: {
      create: string;
      update: string;
      delete: string;
      restock: string;
      adjustment: string;
      sale: string;
    };
    changeInfo: string;
    priceChange: string;
  };

  // NotFound page
  notFound: {
    title: string;
    subtitle: string;
    description: string;
    inventory: string;
    inventoryDesc: string;
    pointOfSale: string;
    pointOfSaleDesc: string;
    analytics: string;
    analyticsDesc: string;
  };

  // Payment Modal
  paymentModal: {
    completePayment: string;
    totalAmount: string;
    processingPayment: string;
  };

  // Payment Form
  paymentForm: {
    choosePaymentMethod: string;
    cardPayment: string;
    applePay: string;
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvc: string;
    cancel: string;
    pay: string;
    paymentSuccessful: string;
    thankYou: string;
    errors: {
      selectCard: string;
      fillAllDetails: string;
      cardNumberLength: string;
      paymentFailed: string;
      applePayFailed: string;
    };
    testCardNotice: string;
  };

  // Settings page
  settings: {
    title: string;
    subtitle: string;
    saveChanges: string;
    saveSuccess: string;
    saveError: string;
    general: {
      title: string;
      description: string;
      barName: string;
      email: string;
      phone: string;
      address: string;
      currency: string;
      taxRegion: string;
      taxRate: string;
      taxRegions: {
        quebec: string;
        ontario: string;
        "british-columbia": string;
        alberta: string;
        manitoba: string;
        saskatchewan: string;
        "nova-scotia": string;
        "new-brunswick": string;
        newfoundland: string;
        "prince-edward-island": string;
        "northwest-territories": string;
        nunavut: string;
        yukon: string;
        california: string;
        "new-york": string;
        texas: string;
        florida: string;
        illinois: string;
        nevada: string;
        washington: string;
        oregon: string;
        "new-hampshire": string;
        montana: string;
        france: string;
        spain: string;
        germany: string;
        italy: string;
        uk: string;
        belgium: string;
        netherlands: string;
        portugal: string;
        sweden: string;
        denmark: string;
        poland: string;
        mexico: string;
        argentina: string;
        chile: string;
        colombia: string;
        peru: string;
        ecuador: string;
        uruguay: string;
        panama: string;
        "dominican-republic": string;
        australia: string;
        "new-zealand": string;
        switzerland: string;
        custom: string;
      };
    };
    notifications: {
      title: string;
      description: string;
      lowStockAlerts: string;
      lowStockAlertsDesc: string;
      emailNotifications: string;
      emailNotificationsDesc: string;
      salesReports: string;
      salesReportsDesc: string;
      weeklySummary: string;
      weeklySummaryDesc: string;
    };
    inventory: {
      title: string;
      description: string;
      lowStockThreshold: string;
      lowStockThresholdDesc: string;
      autoReorder: string;
      autoReorderDesc: string;
      reorderQuantity: string;
    };
    import: {
      title: string;
      description: string;
      importInventory: string;
      selectFile: string;
      supportedFormats: string;
      importSuccess: string;
      importError: string;
      fileRequired: string;
      processing: string;
      selected: string;
      productsImported: string;
    };
    export: {
      title: string;
      description: string;
      exportInventory: string;
      exportAsCSV: string;
      exportAsExcel: string;
      exportSuccess: string;
      exportError: string;
      noProducts: string;
    };
    appearance: {
      title: string;
      description: string;
      theme: string;
      language: string;
    };
    auditLogsSection: {
      title: string;
      description: string;
      details: string;
      button: string;
    };
    userManagementSection: {
      title: string;
      description: string;
      details: string;
      button: string;
    };
    security: {
      title: string;
      description: string;
      downloadData: string;
      downloadDataDesc: string;
      downloadButton: string;
      downloading: string;
      downloadSuccess: string;
      downloadError: string;
      deleteAccount: string;
      deleteAccountDesc: string;
      deleteButton: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
      deleteConfirmPlaceholder: string;
      deleteConfirmButton: string;
      deleteCancel: string;
      deleteSuccess: string;
      deleteError: string;
      confirmationRequired: string;
    };
  };

  // Common
  common: {
    light: string;
    dark: string;
    system: string;
    cancel: string;
    close: string;
    previous: string;
    next: string;
    units: {
      bottles: string;
      bottle: string;
      bags: string;
      bag: string;
      shot: string;
      shooter: string;
      glass: string;
      drink: string;
    };
  };

  // Home page
  home: {
    title: string;
    subtitle: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    login: string;
    signUp: string;
    createAccount: string;
    or: string;
    continueWithGoogle: string;
    continueWithApple: string;
    alreadyHaveAccount: string;
    noAccountYet: string;
    switchToLogin: string;
    switchToSignUp: string;
    fillAllFields: string;
    signUpError: string;
    loginError: string;
    generalError: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    Layout: {
      appName: "Inventory Vault",
      appSubtitle: "Inventory & POS System",
      nav: {
        inventory: "Inventory",
        sales: "Sales",
        analytics: "Analytics",
        users: "Roles",
        settings: "Settings",
      },
    },
    inventory: {
      title: "Inventory",
      subtitle: "Manage your bar stock levels and products",
      addProduct: "Add Product",
      totalInventoryValue: "Total Inventory Value",
      totalProducts: "Total Products",
      lowStockItems: "Low Stock Items",
      searchProducts: "Search products...",
      noProductsFound: "No products found",
      confirmDelete: "Are you sure you want to delete \"{name}\"?",
      categories: {
        all: "All Products",
        spirits: "Spirits",
        wine: "Wine",
        beer: "Beer",
        soda: "Soda",
        juice: "Juice",
        other: "Other",
      },
      addProductModal: {
        title: "Add New Product",
        description: "Add a new product to your inventory",
        name: "Product Name",
        category: "Category",
        subcategory: "Subcategory",
        origin: "Origin",
        quantity: "Quantity",
        pricePerBottle: "Price per Bottle",
        bottleSizeInMl: "Bottle Size (ml)",
        bottleSizeHint: "The capacity of the bottle in milliliters. Example: 750ml for a standard wine bottle",
        inventoryCode: "Inventory Code",
        inventoryCodeHint: "Auto-generated if empty",
        inventoryCodePlaceholder: "Enter code or leave empty for auto-generation",
        qrCode: "QR Code",
        generateQR: "Generate QR Code",
        downloadQR: "Download QR Code",
        qrCodePlaceholder: "Fill in the product name and inventory code, then click 'Generate' to create a QR code",
        codeLabel: "Code",
        fillRequiredFields: "Please fill in all required fields",
        imageUrl: "Image URL",
        searchImage: "Search Image",
        searchingImage: "Searching...",
        fillProductName: "Please enter a product name first",
        imageApiNotConfigured: "To use automatic image search, configure a Google Custom Search API key in settings.",
        imageNotFound: "No image found automatically. You can enter the image URL manually in the field below.",
        imageSearchError: "Error during image search. You can enter the URL manually in the field below.",
        imageSearchTimeout: "Image search is taking too long. Please try again.",
        editTitle: "Edit Product",
        editDescription: "Modify product information",
        save: "Save Product",
        cancel: "Cancel",
        categories: {
          spirits: "Spirits",
          beer: "Beer",
          wine: "Wine",
          aperitif: "Aperitif",
          champagne: "Champagne & Sparkling",
          readyToDrink: "Ready to Drink",
          snacks: "Snacks",
          juice: "Juice",
          soda: "Soda",
          other: "Other",
        },
        subcategories: {
          redWine: "Red Wine",
          whiteWine: "White Wine",
          roseWine: "Rosé Wine",
          scotchWhisky: "Scotch & Whisky",
          liqueurCream: "Liqueur & Cream",
          gin: "Gin",
          rum: "Rum",
          vodka: "Vodka",
          tequila: "Tequila",
          cognacBrandy: "Cognac & Brandy",
        },
        origins: {
          imported: "Imported",
          canadian: "Canadian",
          quebec: "Quebec",
          spain: "Spain",
          france: "France",
          italy: "Italy",
          usa: "United States",
          australia: "Australia",
          southAfrica: "South Africa",
          newZealand: "New Zealand",
        portugal: "Portugal",
        chile: "Chile",
        uk: "United Kingdom",
      },
      },
      other: "",
      juice: "",
      soda: "",
      beer: "",
      spirits: "",
      wine: "",
      allCategories: ""
    },
    productCard: {
      stockLevel: "Stock Level",
      lowStock: "Low stock!",
      add: "Add",
      remove: "Remove",
      categories: {
        spirits: "Spirits",
        wine: "Wine",
        beer: "Beer",
        soda: "Soda",
        juice: "Juice",
        other: "Other",
      },
    },
    sales: {
      title: "Point of Sale",
      subtitle: "Process customer orders and ring up sales",
      orderSummary: "Order Summary",
      noItemsInCart: "No items in cart",
      each: "each",
      subtotal: "Subtotal",
      tax: "Tax (8%)",
      total: "Total",
      paymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card",
      tab: "Tab",
      openTab: "Open Tab",
      openNewTab: "Open New Tab",
      selectTab: "Select Tab",
      tabName: "Tab Name",
      tabNamePlaceholder: "Enter customer name or table number",
      creditCardNumber: "Credit Card Number",
      creditCardInfo: "The card will be charged when the tab is closed",
      tabCreated: "Tab opened successfully",
      tabClosed: "Tab closed and paid",
      noOpenTabs: "No open tabs",
      tabs: "Open Tabs",
      closeTab: "Close Tab",
      payTab: "Pay Tab",
      manageTabs: "Manage Tabs",
      tabsManagement: "Tabs Management",
      viewDetails: "View Details",
      hideDetails: "Hide Details",
      allTabsTotal: "Total of all tabs",
      completeSale: "Complete Sale",
      outOfStockLabel: "Out of stock",
      categories: {
        all: "All",
        spirits: "Spirits",
        wine: "Wine",
        beer: "Beer",
        soda: "Soda",
        juice: "Juice",
        other: "Other",
        cocktail: "Cocktails",
      },
      sellProductCTA: "Add product",
      sellProductDialogTitle: "Sell a product",
      sellProductDialogDescription:
        "Choose an inventory item or build a quick recipe to add it to the sale.",
      sellProductForm: {
        typeStepTitle: "Service type",
        typeStepDescription: "Select the format you want to sell (glass, flight, etc.).",
        containerStepTitle: "Container",
        containerStepDescription: "Pick the container or variant that matches this service.",
        productStepTitle: "Product",
        productStepDescription: "Choose an inventory product to attach to this recipe.",
        containerAutoMessage: "We'll pick the best container automatically.",
        inventoryGroups: {
          compatible: "Compatible inventory",
          other: "Other inventory",
        },
        selectProductPlaceholder: "Choose a product",
        noProductsAvailable: "No products available for this selection.",
        presetRecipeLabel: "Default recipe",
        presetSelectPlaceholder: "Select a recipe...",
        customCocktailLabel: "House cocktail name",
        customCocktailPlaceholder: "Cocktail name",
        ingredientReferenceLabel: "Recipe",
        ingredientCustomLabel: "Custom ingredient",
        customIngredientProductLabel: "Product",
        customIngredientQuantityLabel: "Quantity (ml)",
        customIngredientRemoveLabel: "Remove ingredient",
        addIngredientButton: "Add ingredient",
        estimatedCostLabel: "Estimated cost of service",
        estimatedCostDetailSingle:
          "Based on {servingVolume} ml of the {bottleSize} ml bottle.",
        estimatedCostDetailMulti: "Based on {totalVolume} ml of ingredients.",
        profitMarginLabel: "Profit margin (%)",
        profitMarginHint: "Suggested price: {price}",
        salePriceLabel: "Sale price",
        containerSelectedLabel: "Selected container: {container}",
        stepIndicator: "Step {current} / {total}",
        stockCount: "{count} in stock",
        saveButton: "Save product",
        typeOptions: {
          wine: {
            label: "Wine",
            helper: "Glass, half-liter or bottle",
          },
          beer: {
            label: "Beer",
            helper: "Glass, pint or buck",
          },
          shot: {
            label: "Shot",
            helper: "1.5 oz standard pour",
          },
          cocktail: {
            label: "Cocktail",
            helper: "Preset or custom recipe",
          },
          other: {
            label: "Other",
            helper: "Mocktails, juices or specials",
          },
        },
        containerOptions: {
          "wine-red-glass": "Red wine glass (180 ml)",
          "wine-white-glass": "White wine glass (150 ml)",
          "wine-half-liter": "Half liter (500 ml)",
          "wine-bottle": "Bottle (750 ml)",
          "beer-bottle": "Bottle (341 ml)",
          "beer-glass": "Glass (355 ml)",
          "beer-pint": "Pint (473 ml)",
          "beer-buck": "Buck (500 ml)",
          "cocktail-default-recipe": "Default recipe",
          "cocktail-custom": "Custom recipe",
        },
        errors: {
          typeRequired: "Choose a service type.",
          containerRequired: "Select a container.",
          priceInvalid: "Enter a valid price.",
          productRequired: "Select an inventory product.",
          ingredientRequired: "Add at least one ingredient with a valid quantity.",
        },
        customCocktailFallback: "House cocktail",
        saleDisplayNameFallback: "Sale product",
      },
      cocktailRecipeLabel: "Cocktail recipe",
      cocktailRecipeSelectPlaceholder: "Select a recipe...",
      alerts: {
        cashPayment: "Cash payment received! Total: $",
        orderCompleted: "Order completed! Total: $",
      },
      servingConfig: {
        title: "Serving formats & margins",
        description:
          "Adjust the margin applied to each serving format (price = cost × (1 + margin/100)).",
        formatDetails: "{volume} ml • default margin {margin}%",
        categoryLabels: {
          spirits: "Spirits",
          wine: "Wine",
          beer: "Beer",
          soda: "Ready-to-drink",
          juice: "Juice",
          other: "Other",
        },
        formats: {
          spirits: {
            shot: "Shooter 1.5 oz",
            double: "Double 3 oz",
          },
          wine: {
            "wine-white-glass": "White wine glass (150 ml)",
            "wine-red-glass": "Red wine glass (180 ml)",
          },
          beer: {
            "beer-pint": "Pint (473 ml)",
            "beer-buck": "Buck (355 ml)",
          },
          soda: {
            rtb: "Ready-to-drink 250 ml",
          },
          juice: {
            "juice-glass": "Glass 250 ml",
          },
          other: {
            "other-portion": "Portion 200 ml",
          },
        },
      },
      accessDenied: "",
      noSalesPermission: ""
    },
    analytics: {
      title: "Analytics",
      subtitle: "Sales reports, inventory trends, and business insights",
      salesAnalytics: "Sales Analytics",
      salesAnalyticsDesc: "Track daily, weekly, and monthly sales performance",
      inventoryTrends: "Inventory Trends",
      inventoryTrendsDesc: "Analyze product popularity and stock turnover",
      revenueReports: "Revenue Reports",
      revenueReportsDesc: "View detailed revenue breakdowns by category",
      comingSoon: "Analytics dashboard coming soon. Continue adding features to build out this section!",
      salesPrediction: {
        errorTitle: "Analysis error",
        retryButton: "Retry",
        retrying: "Retrying...",
        emptyMessage: "Click the button to analyze the best sellers.",
        analyzeButton: "Analyze sales",
        cardTitle: "Top sellers by region",
        forecastLabel: "Projected revenue (7 days)",
        unitsLabel: "Units/day",
        unitPriceLabel: "Unit price",
        dailyRevenueLabel: "Daily revenue",
        marginLabel: "Margin",
        noProductDetails: "No product breakdowns yet."
      },
      salesReport: {
        dailyDetailTitle: "Daily sales detail",
        dailyDetailSubtitle: "Review how each day performed so you can spot trends.",
        dailyDetailEmpty: "Generate a report to see daily totals.",
        dailyRevenueLabel: "Revenue",
        dailySalesLabel: "Sales",
        dailyTipsLabel: "Tips",
        dailyTaxLabel: "Taxes",
        downloadCsvButton: "Download full report (CSV)",
      },
      aiTools: {
        title: "AI Tools",
        refreshLabel: "Refresh AI results",
        toolOptions: {
          insights: {
            title: "Smart insights",
            description: "Analyze recent sales to surface key trends.",
          },
          "sales-prediction": {
            title: "Sales prediction",
            description: "Forecast your best sellers and expected demand.",
          },
          "food-wine-pairing": {
            title: "Food & wine pairing",
            description: "Generate pairing suggestions for your menu.",
          },
          "sales-report": {
            title: "Sales report",
            description: "Get a detailed breakdown with stats and tax totals.",
          },
        },
        insights: {
          errorTitle: "Error generating insights",
          retrying: "Retrying...",
          retryButton: "Retry",
          intro: "Generate smart insights based on your sales data.",
          generateButton: "Generate insights",
          generating: "Generating...",
          noDataTitle: "Insights coming soon",
          noDataDescription: "AI insights will appear after a few sales have been recorded.",
          comparativesTitle: "Compare performance",
          comparativesTimeframes: {
            weekly: "Weekly",
            monthly: "Monthly",
            yearly: "Yearly",
          },
        trendLabels: {
          positive: "Positive",
          negative: "Negative",
          warning: "Watch",
          neutral: "Neutral",
        },
        tableHeaders: {
          metric: "Metric",
          value: "Value",
          trend: "Trend",
          description: "Description",
        },
        summary: {
          title: "Analysis summary",
          totalSalesLabel: "Sales analyzed",
          topCategoryLabel: "Featured product",
          recommendationLabel: "Key recommendation",
        },
      },
        foodWinePairing: {
          errorTitle: "Error generating pairings",
          retrying: "Retrying...",
          retryButton: "Retry",
          emptyMessage: "Click the button to generate food and wine pairings.",
          buttonLabel: "Generate pairings",
          title: "Food & wine pairing",
        },
        salesReport: {
          errorTitle: "Error generating report",
          loading: "Loading report...",
          retryButton: "Retry",
          emptyMessage: "Click the button to generate a detailed sales report.",
          buttonLabel: "Generate report",
          statsLabels: {
            totalSales: "Total sales",
            revenue: "Revenue",
            tps: "TPS",
            tvq: "TVQ",
            tips: "Tips",
            averageValue: "Avg. value",
          },
        },
      },
    },
    auditLogs: {
      title: "Audit Logs",
      subtitle: "Inventory change history and fraud detection",
      accessDenied: "Access Denied",
      accessDeniedDesc: "You don't have permission to view audit logs. Only managers and above can access this page.",
      suspiciousActivity: "Suspicious Activity Detected",
      noSuspiciousActivity: "No suspicious activity detected",
      statistics: "Statistics",
      totalChanges: "Total Changes",
      byAction: "By Action",
      byRole: "By Role",
      activeUsers: "Active Users",
      recentChanges: "Recent Changes",
      noLogs: "No inventory changes recorded yet",
      actions: {
        create: "Created",
        update: "Updated",
        delete: "Deleted",
        restock: "Restocked",
        adjustment: "Adjusted",
        sale: "Sale",
      },
      changeInfo: "changed from {prev} to {new}",
      priceChange: "Price: ${prev} → ${new}",
    },
    notFound: {
      title: "404",
      subtitle: "This page doesn't exist yet.",
      description: "Continue building out your La Réserve system by exploring the available features below.",
      inventory: "Inventory",
      inventoryDesc: "Manage stock levels and products",
      pointOfSale: "Point of Sale",
      pointOfSaleDesc: "Ring up sales and process orders",
      analytics: "Analytics",
      analyticsDesc: "View reports and insights",
    },
    paymentModal: {
      completePayment: "Complete Payment",
      totalAmount: "Total Amount",
      processingPayment: "Processing your payment...",
    },
    paymentForm: {
      choosePaymentMethod: "Choose Payment Method",
      cardPayment: "Card Payment",
      applePay: "Apple Pay",
      cardNumber: "Card Number",
      cardholderName: "Cardholder Name",
      expiryDate: "Expiry Date",
      cvc: "CVC",
      cancel: "Cancel",
      pay: "Pay",
      paymentSuccessful: "Payment Successful!",
      thankYou: "Thank you for your purchase",
      errors: {
        selectCard: "Please select card payment",
        fillAllDetails: "Please fill in all card details",
        cardNumberLength: "Card number must be 16 digits",
        paymentFailed: "Payment failed. Please try again.",
        applePayFailed: "Apple Pay failed. Please try again.",
      },
      testCardNotice: "Test card: 4242 4242 4242 4242 | Any future date | Any CVC",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your bar settings and preferences",
      saveChanges: "Save Changes",
      saveSuccess: "Settings saved successfully!",
      saveError: "Error saving settings.",
      general: {
        title: "General Information",
        description: "Basic information about your bar or establishment",
        barName: "Bar Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        currency: "Currency",
        taxRegion: "Tax Region",
        taxRate: "Tax Rate (%)",
        taxRegions: {
          quebec: "Quebec, Canada (TPS 5% + TVQ 9.975%)",
          ontario: "Ontario, Canada (HST 13%)",
          "british-columbia": "British Columbia, Canada (GST 5% + PST 7%)",
          alberta: "Alberta, Canada (GST 5%)",
          manitoba: "Manitoba, Canada (GST 5% + PST 7%)",
          saskatchewan: "Saskatchewan, Canada (GST 5% + PST 6%)",
          "nova-scotia": "Nova Scotia, Canada (HST 15%)",
          "new-brunswick": "New Brunswick, Canada (HST 15%)",
          newfoundland: "Newfoundland, Canada (HST 15%)",
          "prince-edward-island": "Prince Edward Island, Canada (HST 15%)",
          "northwest-territories": "Northwest Territories, Canada (GST 5%)",
          nunavut: "Nunavut, Canada (GST 5%)",
          yukon: "Yukon, Canada (GST 5%)",
          california: "California, USA (7.25% - 10%)",
          "new-york": "New York, USA (4% - 8.875%)",
          texas: "Texas, USA (6.25% - 8.25%)",
          florida: "Florida, USA (6% - 7.5%)",
          illinois: "Illinois, USA (6.25% - 11%)",
          nevada: "Nevada, USA (6.85% - 8.375%)",
          washington: "Washington, USA (6.5% - 10.4%)",
          oregon: "Oregon, USA (0%)",
          "new-hampshire": "New Hampshire, USA (0%)",
          montana: "Montana, USA (0%)",
          france: "France (TVA 20%)",
          spain: "Spain (IVA 21%)",
          germany: "Germany (MwSt 19%)",
          italy: "Italy (IVA 22%)",
          uk: "United Kingdom (VAT 20%)",
          belgium: "Belgium (TVA 21%)",
          netherlands: "Netherlands (BTW 21%)",
          portugal: "Portugal (IVA 23%)",
          sweden: "Sweden (Moms 25%)",
          denmark: "Denmark (Moms 25%)",
          poland: "Poland (VAT 23%)",
          mexico: "Mexico (IVA 16%)",
          argentina: "Argentina (IVA 21%)",
          chile: "Chile (IVA 19%)",
          colombia: "Colombia (IVA 19%)",
          peru: "Peru (IGV 18%)",
          ecuador: "Ecuador (IVA 12%)",
          uruguay: "Uruguay (IVA 22%)",
          panama: "Panama (ITBMS 7%)",
          "dominican-republic": "Dominican Republic (ITBIS 18%)",
          australia: "Australia (GST 10%)",
          "new-zealand": "New Zealand (GST 15%)",
          switzerland: "Switzerland (TVA 7.7%)",
          custom: "Custom Rate",
        },
      },
      notifications: {
        title: "Notifications",
        description: "Configure how and when you receive notifications",
        lowStockAlerts: "Low Stock Alerts",
        lowStockAlertsDesc: "Get notified when inventory levels are low",
        emailNotifications: "Email Notifications",
        emailNotificationsDesc: "Receive notifications via email",
        salesReports: "Daily Sales Reports",
        salesReportsDesc: "Receive daily sales summary reports",
        weeklySummary: "Weekly Summary",
        weeklySummaryDesc: "Receive weekly performance summary",
      },
      inventory: {
        title: "Inventory Management",
        description: "Configure inventory tracking and alerts",
        lowStockThreshold: "Low Stock Threshold",
        lowStockThresholdDesc: "Alert when stock falls below this quantity",
        autoReorder: "Auto Reorder",
        autoReorderDesc: "Automatically create reorder requests when stock is low",
        reorderQuantity: "Default Reorder Quantity",
      },
      import: {
        title: "Import Inventory",
        description: "Import your inventory from CSV, Excel, or Google Sheets",
        importInventory: "Import Inventory",
        selectFile: "Select File",
        supportedFormats: "Supported formats: CSV, Excel (.xlsx, .xls), Google Sheets",
        importSuccess: "Inventory imported successfully!",
        importError: "Error importing inventory. Please check the file format.",
        fileRequired: "Please select a file to import",
        processing: "Processing file...",
        selected: "Selected",
        productsImported: "products imported",
      },
      export: {
        title: "Export Inventory",
        description: "Export your inventory to CSV or Excel format",
        exportInventory: "Export Inventory",
        exportAsCSV: "Export as CSV",
        exportAsExcel: "Export as Excel",
        exportSuccess: "Inventory exported successfully!",
        exportError: "Error exporting inventory. Please try again.",
        noProducts: "No products to export",
      },
      appearance: {
        title: "Appearance",
        description: "Customize the look and feel of the application",
        theme: "Theme",
        language: "Language",
      },
      auditLogsSection: {
        title: "Audit Logs",
        description: "Review inventory activity and suspicious alerts.",
        details: "This log helps you trace changes, spot unusual edits, and keep compliance.",
        button: "Open audit logs",
      },
      userManagementSection: {
        title: "User Management",
        description: "Invite team members, assign roles, and guard access.",
        details: "Control who can edit inventory, view sales, or adjust settings.",
        button: "Manage users",
      },
      security: {
        title: "Security and Data",
        description: "Manage your personal data and account security",
        downloadData: "Download My Data",
        downloadDataDesc: "Download a copy of all your data (products, sales, recipes, settings)",
        downloadButton: "Download Data",
        downloading: "Downloading...",
        downloadSuccess: "Data downloaded successfully!",
        downloadError: "Error downloading data.",
        deleteAccount: "Delete Account",
        deleteAccountDesc: "Permanently delete your account and all your data. This action is irreversible.",
        deleteButton: "Delete My Account",
        deleteConfirmTitle: "Confirm Account Deletion",
        deleteConfirmMessage: "Are you absolutely sure you want to delete your account? This will permanently delete all your data (products, sales, recipes, settings). This action is IRREVERSIBLE.",
        deleteConfirmPlaceholder: "Type 'DELETE' to confirm",
        deleteConfirmButton: "Yes, delete permanently",
        deleteCancel: "Cancel",
        deleteSuccess: "Account deleted successfully. You will be logged out.",
        deleteError: "Error deleting account.",
        confirmationRequired: "Please type 'DELETE' to confirm",
      },
    },
    common: {
      light: "Light",
      dark: "Dark",
      system: "System",
      cancel: "Cancel",
      close: "Close",
      previous: "Previous",
      next: "Next",
      units: {
        bottles: "bottles",
        bottle: "bottle",
        bags: "bags",
        bag: "bag",
        shot: "shot",
        shooter: "shooter",
        glass: "glass",
        drink: "drink",
      },
    },
    home: {
      title: "Inventory Vault",
      subtitle: "Manage your bar with style",
      username: "Username",
      usernamePlaceholder: "Enter your username",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      login: "Sign in",
      signUp: "Sign up",
      createAccount: "Create account",
      or: "Or",
      continueWithGoogle: "Continue with Google",
      continueWithApple: "Continue with Apple",
      alreadyHaveAccount: "Already have an account?",
      noAccountYet: "Don't have an account yet?",
      switchToLogin: "Sign in",
      switchToSignUp: "Sign up",
      fillAllFields: "Please fill in all fields",
      signUpError: "Error during registration",
      loginError: "Invalid username or password",
      generalError: "An error occurred. Please try again.",
    },
  },
  fr: {
    Layout: {
      appName: "La Réserve",
      appSubtitle: "Système d'inventaire et de caisse",
      nav: {
        inventory: "Inventaire",
        sales: "Ventes",
        analytics: "Analyses",
        users: "Rôles",
        settings: "Paramètres",
      },
    },
    inventory: {
      title: "Inventaire",
      subtitle: "Gérez les niveaux de stock et les produits de votre bar",
      addProduct: "Ajouter un produit",
      totalInventoryValue: "Valeur totale de l'inventaire",
      totalProducts: "Total des produits",
      lowStockItems: "Articles en stock faible",
      searchProducts: "Rechercher des produits...",
      noProductsFound: "Aucun produit trouvé",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer \"{name}\" ?",
      categories: {
        all: "Tous les produits",
        spirits: "Spiritueux",
        wine: "Vin",
        beer: "Bière",
        soda: "Boissons gazeuses",
        juice: "Jus",
        other: "Autres",
      },
      addProductModal: {
        title: "Ajouter un nouveau produit",
        description: "Ajouter un nouveau produit à votre inventaire",
        name: "Nom du produit",
        category: "Catégorie",
        subcategory: "Sous-catégorie",
        origin: "Provenance",
        quantity: "Quantité",
        pricePerBottle: "Prix par bouteille",
        bottleSizeInMl: "Taille de la bouteille (ml)",
        bottleSizeHint: "La capacité de la bouteille en millilitres. Exemple : 750ml pour une bouteille de vin standard",
        inventoryCode: "Code d'inventaire",
        inventoryCodeHint: "Auto-généré si vide",
        inventoryCodePlaceholder: "Entrez un code ou laissez vide pour la génération automatique",
        qrCode: "Code QR",
        generateQR: "Générer le code QR",
        downloadQR: "Télécharger le code QR",
        qrCodePlaceholder: "Remplissez le nom du produit et le code d'inventaire, puis cliquez sur 'Générer' pour créer un code QR",
        codeLabel: "Code",
        fillRequiredFields: "Veuillez remplir tous les champs obligatoires",
        imageUrl: "URL de l'image",
        searchImage: "Rechercher image",
        searchingImage: "Recherche...",
        fillProductName: "Veuillez d'abord entrer un nom de produit",
        imageApiNotConfigured: "Pour utiliser la recherche automatique d'images, configurez une clé API Google Custom Search dans les paramètres.",
        imageNotFound: "Aucune image trouvée automatiquement. Vous pouvez entrer l'URL de l'image manuellement dans le champ ci-dessous.",
        imageSearchError: "Erreur lors de la recherche d'image. Vous pouvez entrer l'URL manuellement dans le champ ci-dessous.",
        imageSearchTimeout: "La recherche d'image est trop longue. Veuillez réessayer.",
        editTitle: "Modifier le produit",
        editDescription: "Modifiez les informations du produit",
        save: "Enregistrer le produit",
        cancel: "Annuler",
        categories: {
          spirits: "Spiritueux",
          beer: "Bière",
          wine: "Vin",
          aperitif: "Apéritif",
          champagne: "Champagne et mousseux",
          readyToDrink: "Prêt-à-boire",
          snacks: "Collation",
          other: "",
          soda: "",
          juice: ""
        },
        subcategories: {
          redWine: "Vin rouge",
          whiteWine: "Vin blanc",
          roseWine: "Vin rosé",
          scotchWhisky: "Scotch et Whisky",
          liqueurCream: "Liqueur et Crème",
          gin: "Gin",
          rum: "Rhum",
          vodka: "Vodka",
          tequila: "Tequila",
          cognacBrandy: "Cognac et Brandy",
        },
        origins: {
          imported: "Importée",
          canadian: "Canadien",
          quebec: "Québécois",
          spain: "Espagne",
          france: "France",
          italy: "Italie",
          usa: "États-Unis",
          australia: "Australie",
          southAfrica: "Afrique du Sud",
          newZealand: "Nouvelle-Zélande",
        portugal: "Portugal",
        chile: "Chili",
        uk: "Royaume-Uni",
      },
      },
      other: "",
      juice: "",
      soda: "",
      beer: "",
      spirits: "",
      wine: "",
      allCategories: ""
    },
    productCard: {
      stockLevel: "Niveau de stock",
      lowStock: "Stock faible !",
      add: "Ajouter",
      remove: "Retirer",
      categories: {
        spirits: "Spiritueux",
        wine: "Vin",
        beer: "Bière",
        soda: "Boissons gazeuses",
        juice: "Jus",
        other: "Autres",
      },
    },
    sales: {
      title: "Point de vente",
      subtitle: "Traitez les commandes clients et enregistrez les ventes",
      orderSummary: "Résumé de la commande",
      noItemsInCart: "Aucun article dans le panier",
      each: "chaque",
      subtotal: "Sous-total",
      tax: "Taxe (8%)",
      total: "Total",
      paymentMethod: "Méthode de paiement",
      cash: "Espèces",
      card: "Carte",
      tab: "Compte",
      openTab: "Ouvrir un compte",
      openNewTab: "Ouvrir un nouveau compte",
      selectTab: "Sélectionner un compte",
      tabName: "Nom du compte",
      tabNamePlaceholder: "Entrez le nom du client ou le numéro de table",
      creditCardNumber: "Numéro de carte de crédit",
      creditCardInfo: "La carte sera débitée lorsque le compte sera fermé",
      tabCreated: "Compte ouvert avec succès",
      tabClosed: "Compte fermé et payé",
      noOpenTabs: "Aucun compte ouvert",
      tabs: "Comptes ouverts",
      closeTab: "Fermer le compte",
      payTab: "Payer le compte",
      manageTabs: "Gérer les comptes",
      tabsManagement: "Gestion des comptes",
      viewDetails: "Voir les détails",
      hideDetails: "Masquer les détails",
      allTabsTotal: "Total de tous les comptes",
      completeSale: "Finaliser la vente",
      outOfStockLabel: "Rupture de stock",
      categories: {
        all: "Tous",
        spirits: "Spiritueux",
        wine: "Vin",
        beer: "Bière",
        soda: "Boissons gazeuses",
        juice: "Jus",
        other: "Autres",
        cocktail: "Cocktails",
      },
      sellProductCTA: "Ajouter un produit",
      sellProductDialogTitle: "Vendre un produit",
      sellProductDialogDescription:
        "Choisissez un article de l'inventaire ou créez une recette rapide pour l'ajouter à la vente.",
      sellProductForm: {
        typeStepTitle: "Type de service",
        typeStepDescription: "Sélectionnez le format à servir (verre, volée, etc.).",
        containerStepTitle: "Contenant",
        containerStepDescription: "Choisissez le contenant ou la variante adaptée à ce service.",
        productStepTitle: "Produit",
        productStepDescription: "Choisissez un produit d'inventaire pour l'associer à cette recette.",
        containerAutoMessage: "Nous sélectionnerons automatiquement le contenant le plus adapté.",
        inventoryGroups: {
          compatible: "Inventaire compatible",
          other: "Autres produits",
        },
        selectProductPlaceholder: "Choisissez un produit",
        noProductsAvailable: "Aucun produit disponible pour cette sélection.",
        presetRecipeLabel: "Recette par défaut",
        presetSelectPlaceholder: "Sélectionnez une recette...",
        customCocktailLabel: "Nom du cocktail maison",
        customCocktailPlaceholder: "Nom du cocktail",
        ingredientReferenceLabel: "Recette",
        ingredientCustomLabel: "Ingrédient personnalisé",
        customIngredientProductLabel: "Produit",
        customIngredientQuantityLabel: "Quantité (ml)",
        customIngredientRemoveLabel: "Supprimer l'ingrédient",
        addIngredientButton: "Ajouter un ingrédient",
        estimatedCostLabel: "Coût estimé du service",
        estimatedCostDetailSingle:
          "Basé sur {servingVolume} ml de la bouteille de {bottleSize} ml.",
        estimatedCostDetailMulti: "Basé sur {totalVolume} ml d'ingrédients.",
        profitMarginLabel: "Marge de profit (%)",
        profitMarginHint: "Prix suggéré : {price}",
        salePriceLabel: "Prix de vente",
        containerSelectedLabel: "Contenant choisi : {container}",
        stepIndicator: "Étape {current} / {total}",
        stockCount: "{count} en stock",
        saveButton: "Enregistrer le produit",
        typeOptions: {
          wine: {
            label: "Vin",
            helper: "Verre, demi-litre ou bouteille",
          },
          beer: {
            label: "Bière",
            helper: "Verre, pinte ou buck",
          },
          shot: {
            label: "Shot",
            helper: "Dose standard de 1,5 oz",
          },
          cocktail: {
            label: "Cocktail",
            helper: "Recette prédéfinie ou personnalisée",
          },
          other: {
            label: "Autre",
            helper: "Mocktails, jus ou créations spéciales",
          },
        },
        containerOptions: {
          "wine-red-glass": "Verre vin rouge (180 ml)",
          "wine-white-glass": "Verre vin blanc (150 ml)",
          "wine-half-liter": "Demi-litre (500 ml)",
          "wine-bottle": "Bouteille (750 ml)",
          "beer-bottle": "Bouteille (341 ml)",
          "beer-glass": "Verre (355 ml)",
          "beer-pint": "Pinte (473 ml)",
          "beer-buck": "Buck (500 ml)",
          "cocktail-default-recipe": "Recette par défaut",
          "cocktail-custom": "Recette maison",
        },
        errors: {
          typeRequired: "Choisissez un type de service.",
          containerRequired: "Sélectionnez un contenant.",
          priceInvalid: "Entrez un prix valide.",
          productRequired: "Sélectionnez un produit de l'inventaire.",
          ingredientRequired: "Ajoutez au moins un ingrédient avec une quantité valide.",
        },
        customCocktailFallback: "Cocktail maison",
        saleDisplayNameFallback: "Produit de vente",
      },
      cocktailRecipeLabel: "Recette de cocktail",
      cocktailRecipeSelectPlaceholder: "Sélectionnez une recette...",
      alerts: {
        cashPayment: "Paiement en espèces reçu ! Total : ",
        orderCompleted: "Commande terminée ! Total : ",
      },
      servingConfig: {
        title: "Formats de service et marges",
        description:
          "Ajustez la marge appliquée à chaque format de service (prix = coût × (1 + marge/100)).",
        formatDetails: "{volume} ml • marge par défaut {margin}%",
        categoryLabels: {
          spirits: "Spiritueux",
          wine: "Vin",
          beer: "Bière",
          soda: "Prêt-à-boire",
          juice: "Jus",
          other: "Autres",
        },
        formats: {
          spirits: {
            shot: "Shooter 1,5 oz",
            double: "Double 3 oz",
          },
          wine: {
            "wine-white-glass": "Verre vin blanc (150 ml)",
            "wine-red-glass": "Verre vin rouge (180 ml)",
          },
          beer: {
            "beer-pint": "Pinte (473 ml)",
            "beer-buck": "Buck (355 ml)",
          },
          soda: {
            rtb: "Prêt-à-boire 250 ml",
          },
          juice: {
            "juice-glass": "Verre 250 ml",
          },
          other: {
            "other-portion": "Portion 200 ml",
          },
        },
      },
      accessDenied: "",
      noSalesPermission: ""
    },
    analytics: {
      title: "Analyses",
      subtitle: "Rapports de ventes, tendances d'inventaire et informations commerciales",
      salesAnalytics: "Analyses des ventes",
      salesAnalyticsDesc: "Suivez les performances de ventes quotidiennes, hebdomadaires et mensuelles",
      inventoryTrends: "Tendances d'inventaire",
      inventoryTrendsDesc: "Analysez la popularité des produits et la rotation des stocks",
      revenueReports: "Rapports de revenus",
      revenueReportsDesc: "Consultez les répartitions détaillées des revenus par catégorie",
      comingSoon: "Tableau de bord d'analyses à venir. Continuez à ajouter des fonctionnalités pour développer cette section !",
      salesPrediction: {
        errorTitle: "Erreur lors de l'analyse",
        retryButton: "Réessayer",
        retrying: "Réessai en cours...",
        emptyMessage: "Cliquez sur le bouton pour analyser les meilleurs vendeurs.",
        analyzeButton: "Analyser les ventes",
        cardTitle: "Meilleurs vendeurs par région",
        forecastLabel: "Revenu prévu (7 jours)",
        unitsLabel: "Unités/jour",
        unitPriceLabel: "Prix unitaire",
        dailyRevenueLabel: "Revenu/jour",
        marginLabel: "Marge",
        noProductDetails: "Aucune ventilation produit disponible pour le moment."
      },
      salesReport: {
        dailyDetailTitle: "Détail journalier des ventes",
        dailyDetailSubtitle: "Consultez les totaux par jour pour suivre vos tendances.",
        dailyDetailEmpty: "Générez un rapport pour afficher les totaux journaliers.",
        dailyRevenueLabel: "Revenu",
        dailySalesLabel: "Ventes",
        dailyTipsLabel: "Pourboires",
        dailyTaxLabel: "Taxes",
        downloadCsvButton: "Télécharger le rapport complet (CSV)",
      },
      aiTools: {
        title: "Outils d'IA",
        refreshLabel: "Actualiser les résultats IA",
        toolOptions: {
          insights: {
            title: "Analyses intelligentes",
            description: "Analysez les ventes récentes pour mettre en avant les tendances clés.",
          },
          "sales-prediction": {
            title: "Prédiction des ventes",
            description: "Anticipez vos meilleurs vendeurs et la demande attendue.",
          },
          "food-wine-pairing": {
            title: "Accords mets et vins",
            description: "Générez des suggestions d'accords pour votre menu.",
          },
          "sales-report": {
            title: "Rapport de ventes",
            description: "Obtenez une ventilation détaillée avec statistiques et taxes.",
          },
        },
        insights: {
          errorTitle: "Erreur lors de la génération des analyses",
          retrying: "Nouvel essai...",
          retryButton: "Réessayer",
          intro: "Générez des analyses intelligentes basées sur vos données de ventes.",
          generateButton: "Générer les analyses",
          generating: "Génération en cours...",
          noDataTitle: "Analyses à venir",
          noDataDescription: "Les analyses IA apparaîtront après quelques ventes.",
          comparativesTitle: "Comparer les performances",
          comparativesTimeframes: {
            weekly: "Hebdomadaire",
            monthly: "Mensuel",
            yearly: "Annuel",
          },
          trendLabels: {
            positive: "Positif",
            negative: "Négatif",
            warning: "Surveiller",
            neutral: "Neutre",
          },
          tableHeaders: {
            metric: "Métrique",
            value: "Valeur",
            trend: "Tendance",
            description: "Description",
          },
          summary: {
            title: "Résumé de l'analyse",
            totalSalesLabel: "Ventes analysées",
            topCategoryLabel: "Produit vedette",
            recommendationLabel: "Recommandation clé",
          },
        },
        foodWinePairing: {
          errorTitle: "Erreur lors de la génération des accords",
          retrying: "Nouvel essai...",
          retryButton: "Réessayer",
          emptyMessage: "Cliquez sur le bouton pour générer des accords mets et vins.",
          buttonLabel: "Générer les accords",
          title: "Accords mets et vins",
        },
        salesReport: {
          errorTitle: "Erreur lors de la génération du rapport",
          loading: "Chargement du rapport...",
          retryButton: "Réessayer",
          emptyMessage: "Cliquez sur le bouton pour générer un rapport de ventes détaillé.",
          buttonLabel: "Générer le rapport",
          statsLabels: {
            totalSales: "Ventes totales",
            revenue: "Revenu",
            tps: "TPS",
            tvq: "TVQ",
            tips: "Pourboires",
            averageValue: "Valeur moyenne",
          },
        },
      },
    },
    auditLogs: {
      title: "Logs d'audit",
      subtitle: "Historique des modifications d'inventaire et détection de fraude",
      accessDenied: "Accès refusé",
      accessDeniedDesc: "Vous n'avez pas la permission de consulter les logs d'audit. Seuls les gérants et supérieurs peuvent accéder à cette page.",
      suspiciousActivity: "Activité suspecte détectée",
      noSuspiciousActivity: "Aucune activité suspecte détectée",
      statistics: "Statistiques",
      totalChanges: "Modifications totales",
      byAction: "Par action",
      byRole: "Par rôle",
      activeUsers: "Utilisateurs actifs",
      recentChanges: "Modifications récentes",
      noLogs: "Aucune modification d'inventaire enregistrée",
      actions: {
        create: "Créé",
        update: "Modifié",
        delete: "Supprimé",
        restock: "Réapprovisionné",
        adjustment: "Ajusté",
        sale: "Vente",
      },
      changeInfo: "passé de {prev} à {new}",
      priceChange: "Prix : {prev}$ → {new}$",
    },
    notFound: {
      title: "404",
      subtitle: "Cette page n'existe pas encore.",
      description: "Continuez à développer votre système La Réserve en explorant les fonctionnalités disponibles ci-dessous.",
      inventory: "Inventaire",
      inventoryDesc: "Gérer les niveaux de stock et les produits",
      pointOfSale: "Point de vente",
      pointOfSaleDesc: "Enregistrer les ventes et traiter les commandes",
      analytics: "Analyses",
      analyticsDesc: "Consulter les rapports et informations",
    },
    paymentModal: {
      completePayment: "Finaliser le paiement",
      totalAmount: "Montant total",
      processingPayment: "Traitement de votre paiement...",
    },
    paymentForm: {
      choosePaymentMethod: "Choisir la méthode de paiement",
      cardPayment: "Paiement par carte",
      applePay: "Apple Pay",
      cardNumber: "Numéro de carte",
      cardholderName: "Nom du titulaire",
      expiryDate: "Date d'expiration",
      cvc: "CVC",
      cancel: "Annuler",
      pay: "Payer",
      paymentSuccessful: "Paiement réussi !",
      thankYou: "Merci pour votre achat",
      errors: {
        selectCard: "Veuillez sélectionner le paiement par carte",
        fillAllDetails: "Veuillez remplir tous les détails de la carte",
        cardNumberLength: "Le numéro de carte doit contenir 16 chiffres",
        paymentFailed: "Le paiement a échoué. Veuillez réessayer.",
        applePayFailed: "Apple Pay a échoué. Veuillez réessayer.",
      },
      testCardNotice: "Carte de test : 4242 4242 4242 4242 | Toute date future | Tout CVC",
    },
    settings: {
      title: "Paramètres",
      subtitle: "Gérez les paramètres et préférences de votre bar",
      saveChanges: "Enregistrer les modifications",
      saveSuccess: "Paramètres enregistrés avec succès !",
      saveError: "Erreur lors de l'enregistrement des paramètres.",
      general: {
        title: "Informations générales",
        description: "Informations de base sur votre bar ou établissement",
        barName: "Nom du bar",
        email: "Email",
        phone: "Téléphone",
        address: "Adresse",
        currency: "Devise",
        taxRegion: "Région fiscale",
        taxRate: "Taux de taxe (%)",
        taxRegions: {
          quebec: "Québec, Canada (TPS 5% + TVQ 9,975%)",
          ontario: "Ontario, Canada (TPS 13%)",
          "british-columbia": "Colombie-Britannique, Canada (TPS 5% + PST 7%)",
          alberta: "Alberta, Canada (TPS 5%)",
          manitoba: "Manitoba, Canada (TPS 5% + PST 7%)",
          saskatchewan: "Saskatchewan, Canada (TPS 5% + PST 6%)",
          "nova-scotia": "Nouvelle-Écosse, Canada (TPS 15%)",
          "new-brunswick": "Nouveau-Brunswick, Canada (TPS 15%)",
          newfoundland: "Terre-Neuve, Canada (TPS 15%)",
          "prince-edward-island": "Île-du-Prince-Édouard, Canada (TPS 15%)",
          "northwest-territories": "Territoires du Nord-Ouest, Canada (TPS 5%)",
          nunavut: "Nunavut, Canada (TPS 5%)",
          yukon: "Yukon, Canada (TPS 5%)",
          california: "Californie, États-Unis (7,25% - 10%)",
          "new-york": "New York, États-Unis (4% - 8,875%)",
          texas: "Texas, États-Unis (6,25% - 8,25%)",
          florida: "Floride, États-Unis (6% - 7,5%)",
          illinois: "Illinois, États-Unis (6,25% - 11%)",
          nevada: "Nevada, États-Unis (6,85% - 8,375%)",
          washington: "Washington, États-Unis (6,5% - 10,4%)",
          oregon: "Oregon, États-Unis (0%)",
          "new-hampshire": "New Hampshire, États-Unis (0%)",
          montana: "Montana, États-Unis (0%)",
          france: "France (TVA 20%)",
          spain: "Espagne (IVA 21%)",
          germany: "Allemagne (MwSt 19%)",
          italy: "Italie (IVA 22%)",
          uk: "Royaume-Uni (TVA 20%)",
          belgium: "Belgique (TVA 21%)",
          netherlands: "Pays-Bas (TVA 21%)",
          portugal: "Portugal (IVA 23%)",
          sweden: "Suède (TVA 25%)",
          denmark: "Danemark (TVA 25%)",
          poland: "Pologne (TVA 23%)",
          mexico: "Mexique (IVA 16%)",
          argentina: "Argentine (IVA 21%)",
          chile: "Chili (IVA 19%)",
          colombia: "Colombie (IVA 19%)",
          peru: "Pérou (IGV 18%)",
          ecuador: "Équateur (IVA 12%)",
          uruguay: "Uruguay (IVA 22%)",
          panama: "Panama (ITBMS 7%)",
          "dominican-republic": "République dominicaine (ITBIS 18%)",
          australia: "Australie (TPS 10%)",
          "new-zealand": "Nouvelle-Zélande (TPS 15%)",
          switzerland: "Suisse (TVA 7,7%)",
          custom: "Taux personnalisé",
        },
      },
      notifications: {
        title: "Notifications",
        description: "Configurez comment et quand vous recevez des notifications",
        lowStockAlerts: "Alertes de stock faible",
        lowStockAlertsDesc: "Soyez averti lorsque les niveaux d'inventaire sont bas",
        emailNotifications: "Notifications par email",
        emailNotificationsDesc: "Recevoir des notifications par email",
        salesReports: "Rapports de ventes quotidiens",
        salesReportsDesc: "Recevoir des rapports de synthèse des ventes quotidiennes",
        weeklySummary: "Résumé hebdomadaire",
        weeklySummaryDesc: "Recevoir un résumé hebdomadaire des performances",
      },
      inventory: {
        title: "Gestion de l'inventaire",
        description: "Configurez le suivi et les alertes d'inventaire",
        lowStockThreshold: "Seuil de stock faible",
        lowStockThresholdDesc: "Alerte lorsque le stock tombe en dessous de cette quantité",
        autoReorder: "Réapprovisionnement automatique",
        autoReorderDesc: "Créer automatiquement des demandes de réapprovisionnement lorsque le stock est faible",
        reorderQuantity: "Quantité de réapprovisionnement par défaut",
      },
      import: {
        title: "Importer l'inventaire",
        description: "Importez votre inventaire depuis CSV, Excel ou Google Sheets",
        importInventory: "Importer l'inventaire",
        selectFile: "Sélectionner un fichier",
        supportedFormats: "Formats supportés : CSV, Excel (.xlsx, .xls), Google Sheets",
        importSuccess: "Inventaire importé avec succès !",
        importError: "Erreur lors de l'importation. Veuillez vérifier le format du fichier.",
        fileRequired: "Veuillez sélectionner un fichier à importer",
        processing: "Traitement du fichier...",
        selected: "Sélectionné",
        productsImported: "produits importés",
      },
      export: {
        title: "Exporter l'inventaire",
        description: "Exportez votre inventaire au format CSV ou Excel",
        exportInventory: "Exporter l'inventaire",
        exportAsCSV: "Exporter en CSV",
        exportAsExcel: "Exporter en Excel",
        exportSuccess: "Inventaire exporté avec succès !",
        exportError: "Erreur lors de l'exportation. Veuillez réessayer.",
        noProducts: "Aucun produit à exporter",
      },
      appearance: {
        title: "Apparence",
        description: "Personnalisez l'apparence de l'application",
        theme: "Thème",
        language: "Langue",
      },
      auditLogsSection: {
        title: "Logs d'audit",
        description: "Consultez les actions sur l'inventaire et les alertes suspectes.",
        details: "Ce journal permet de retracer les modifications et de détecter les anomalies.",
        button: "Voir les logs d'audit",
      },
      userManagementSection: {
        title: "Gestion des utilisateurs",
        description: "Invitez les membres de l'équipe, attribuez des rôles et contrôlez l'accès.",
        details: "Choisissez qui peut modifier l'inventaire, consulter les ventes ou ajuster les paramètres.",
        button: "Gérer les utilisateurs",
      },
      security: {
        title: "Sécurité et données",
        description: "Gérez vos données personnelles et la sécurité de votre compte",
        downloadData: "Télécharger mes données",
        downloadDataDesc: "Téléchargez une copie de toutes vos données (produits, ventes, recettes, paramètres)",
        downloadButton: "Télécharger les données",
        downloading: "Téléchargement en cours...",
        downloadSuccess: "Données téléchargées avec succès !",
        downloadError: "Erreur lors du téléchargement des données.",
        deleteAccount: "Supprimer le compte",
        deleteAccountDesc: "Supprimez définitivement votre compte et toutes vos données. Cette action est irréversible.",
        deleteButton: "Supprimer mon compte",
        deleteConfirmTitle: "Confirmer la suppression du compte",
        deleteConfirmMessage: "Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action supprimera définitivement toutes vos données (produits, ventes, recettes, paramètres). Cette action est IRRÉVERSIBLE.",
        deleteConfirmPlaceholder: "Tapez 'SUPPRIMER' pour confirmer",
        deleteConfirmButton: "Oui, supprimer définitivement",
        deleteCancel: "Annuler",
        deleteSuccess: "Compte supprimé avec succès. Vous allez être déconnecté.",
        deleteError: "Erreur lors de la suppression du compte.",
        confirmationRequired: "Veuillez taper 'SUPPRIMER' pour confirmer",
      },
    },
    common: {
      light: "Clair",
      dark: "Sombre",
      system: "Système",
      cancel: "Annuler",
      close: "Fermer",
      previous: "Précédent",
      next: "Suivant",
      units: {
        bottles: "bouteilles",
        bottle: "bouteille",
        bags: "sacs",
        bag: "sac",
        shot: "shot",
        shooter: "shooter",
        glass: "verre",
        drink: "boisson",
      },
    },
    home: {
      title: "La Réserve",
      subtitle: "Gérez votre bar avec style",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Entrez votre nom d'utilisateur",
      password: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      login: "Se connecter",
      signUp: "S'inscrire",
      createAccount: "Créer un compte",
      or: "Ou",
      continueWithGoogle: "Continuer avec Google",
      continueWithApple: "Continuer avec Apple",
      alreadyHaveAccount: "Déjà un compte ?",
      noAccountYet: "Pas encore de compte ?",
      switchToLogin: "Se connecter",
      switchToSignUp: "S'inscrire",
      fillAllFields: "Veuillez remplir tous les champs",
      signUpError: "Erreur lors de l'inscription",
      loginError: "Nom d'utilisateur ou mot de passe incorrect",
      generalError: "Une erreur est survenue. Veuillez réessayer.",
    },
  },
  es: {
    Layout: {
      appName: "Reserva Boveda",
      appSubtitle: "Sistema de inventario y punto de venta",
      nav: {
        inventory: "Inventario",
        sales: "Ventas",
        analytics: "Análisis",
        users: "Roles",
        settings: "Configuración",
      },
    },
    inventory: {
      title: "Inventario",
      subtitle: "Administra los niveles de stock y productos de tu bar",
      addProduct: "Agregar producto",
      totalInventoryValue: "Valor total del inventario",
      totalProducts: "Total de productos",
      lowStockItems: "Artículos con stock bajo",
      searchProducts: "Buscar productos...",
      noProductsFound: "No se encontraron productos",
      confirmDelete: "¿Está seguro de que desea eliminar \"{name}\"?",
      categories: {
        all: "Todos los productos",
        spirits: "Licores",
        wine: "Vino",
        beer: "Cerveza",
        soda: "Bebidas gaseosas",
        juice: "Jugo",
        other: "Otros",
      },
      addProductModal: {
        title: "Agregar nuevo producto",
        description: "Agregar un nuevo producto a tu inventario",
        name: "Nombre del producto",
        category: "Categoría",
        subcategory: "Subcategoría",
        origin: "Origen",
        quantity: "Cantidad",
        pricePerBottle: "Precio por botella",
        bottleSizeInMl: "Tamaño de botella (ml)",
        bottleSizeHint: "La capacidad de la botella en mililitros. Ejemplo: 750ml para una botella de vino estándar",
        inventoryCode: "Código de inventario",
        inventoryCodeHint: "Auto-generado si está vacío",
        inventoryCodePlaceholder: "Ingrese un código o deje vacío para generación automática",
        qrCode: "Código QR",
        generateQR: "Generar código QR",
        downloadQR: "Descargar código QR",
        qrCodePlaceholder: "Complete el nombre del producto y el código de inventario, luego haga clic en 'Generar' para crear un código QR",
        codeLabel: "Código",
        fillRequiredFields: "Por favor complete todos los campos obligatorios",
        imageUrl: "URL de la imagen",
        searchImage: "Buscar imagen",
        searchingImage: "Buscando...",
        fillProductName: "Por favor ingrese primero un nombre de producto",
        imageApiNotConfigured: "Para usar la búsqueda automática de imágenes, configure una clave API de Google Custom Search en la configuración.",
        imageNotFound: "No se encontró ninguna imagen automáticamente. Puede ingresar la URL de la imagen manualmente en el campo a continuación.",
        imageSearchError: "Error durante la búsqueda de imagen. Puede ingresar la URL manualmente en el campo a continuación.",
        imageSearchTimeout: "La búsqueda de imagen tarda demasiado. Vuelve a intentarlo.",
        editTitle: "Editar producto",
        editDescription: "Modificar información del producto",
        save: "Guardar producto",
        cancel: "Cancelar",
        categories: {
          spirits: "Licores",
          beer: "Cerveza",
          wine: "Vino",
          aperitif: "Aperitivo",
          champagne: "Champán y espumoso",
          readyToDrink: "Listo para beber",
          snacks: "Aperitivos",
          other: "",
          soda: "",
          juice: ""
        },
        subcategories: {
          redWine: "Vino tinto",
          whiteWine: "Vino blanco",
          roseWine: "Vino rosado",
          scotchWhisky: "Scotch y Whisky",
          liqueurCream: "Licor y Crema",
          gin: "Ginebra",
          rum: "Ron",
          vodka: "Vodka",
          tequila: "Tequila",
          cognacBrandy: "Cognac y Brandy",
        },
        origins: {
          imported: "Importado",
          canadian: "Canadiense",
          quebec: "Quebec",
          spain: "España",
          france: "Francia",
          italy: "Italia",
          usa: "Estados Unidos",
          australia: "Australia",
          southAfrica: "Sudáfrica",
          newZealand: "Nueva Zelanda",
        portugal: "Portugal",
        chile: "Chile",
        uk: "Reino Unido",
      },
      },
      other: "",
      juice: "",
      soda: "",
      beer: "",
      spirits: "",
      wine: "",
      allCategories: ""
    },
    productCard: {
      stockLevel: "Nivel de stock",
      lowStock: "¡Stock bajo!",
      add: "Agregar",
      remove: "Quitar",
      categories: {
        spirits: "Licores",
        wine: "Vino",
        beer: "Cerveza",
        soda: "Bebidas gaseosas",
        juice: "Jugo",
        other: "Otros",
      },
    },
    sales: {
      title: "Punto de venta",
      subtitle: "Procesa pedidos de clientes y registra ventas",
      orderSummary: "Resumen del pedido",
      noItemsInCart: "No hay artículos en el carrito",
      each: "cada",
      subtotal: "Subtotal",
      tax: "Impuesto (8%)",
      total: "Total",
      paymentMethod: "Método de pago",
      cash: "Efectivo",
      card: "Tarjeta",
      tab: "Cuenta",
      openTab: "Abrir cuenta",
      openNewTab: "Abrir nueva cuenta",
      selectTab: "Seleccionar cuenta",
      tabName: "Nombre de la cuenta",
      tabNamePlaceholder: "Ingrese el nombre del cliente o número de mesa",
      creditCardNumber: "Número de tarjeta de crédito",
      creditCardInfo: "La tarjeta será cargada cuando se cierre la cuenta",
      tabCreated: "Cuenta abierta exitosamente",
      tabClosed: "Cuenta cerrada y pagada",
      noOpenTabs: "No hay cuentas abiertas",
      tabs: "Cuentas abiertas",
      closeTab: "Cerrar cuenta",
      payTab: "Pagar cuenta",
      manageTabs: "Gestionar cuentas",
      tabsManagement: "Gestión de cuentas",
      viewDetails: "Ver detalles",
      hideDetails: "Ocultar detalles",
      allTabsTotal: "Total de todas las cuentas",
      completeSale: "Completar venta",
      outOfStockLabel: "Agotado",
      categories: {
        all: "Todos",
        spirits: "Licores",
        wine: "Vino",
        beer: "Cerveza",
        soda: "Refrescos",
        juice: "Jugo",
        other: "Otros",
        cocktail: "Cócteles",
      },
      sellProductCTA: "Agregar un producto",
      sellProductDialogTitle: "Vender un producto",
      sellProductDialogDescription:
        "Elige un artículo del inventario o crea una receta rápida para agregarla a la venta.",
      sellProductForm: {
        typeStepTitle: "Tipo de servicio",
        typeStepDescription: "Selecciona el formato que deseas servir (copa, trago, etc.).",
        containerStepTitle: "Contenedor",
        containerStepDescription: "Elige el contenedor o la variante que se adapte a este servicio.",
        productStepTitle: "Producto",
        productStepDescription: "Escoge un producto del inventario para asociarlo a esta receta.",
        containerAutoMessage: "Seleccionaremos automáticamente el contenedor más adecuado.",
        inventoryGroups: {
          compatible: "Inventario compatible",
          other: "Otro inventario",
        },
        selectProductPlaceholder: "Elige un producto",
        noProductsAvailable: "No hay productos disponibles para esta selección.",
        presetRecipeLabel: "Receta predeterminada",
        presetSelectPlaceholder: "Selecciona una receta...",
        customCocktailLabel: "Nombre del cóctel personalizado",
        customCocktailPlaceholder: "Nombre del cóctel",
        ingredientReferenceLabel: "Receta",
        ingredientCustomLabel: "Ingrediente personalizado",
        customIngredientProductLabel: "Producto",
        customIngredientQuantityLabel: "Cantidad (ml)",
        customIngredientRemoveLabel: "Eliminar ingrediente",
        addIngredientButton: "Agregar un ingrediente",
        estimatedCostLabel: "Costo estimado del servicio",
        estimatedCostDetailSingle:
          "Basado en {servingVolume} ml de la botella de {bottleSize} ml.",
        estimatedCostDetailMulti: "Basado en {totalVolume} ml de ingredientes.",
        profitMarginLabel: "Margen de ganancia (%)",
        profitMarginHint: "Precio sugerido: {price}",
        salePriceLabel: "Precio de venta",
        containerSelectedLabel: "Contenedor seleccionado: {container}",
        stepIndicator: "Paso {current} de {total}",
        stockCount: "{count} en stock",
        saveButton: "Guardar producto",
        typeOptions: {
          wine: {
            label: "Vino",
            helper: "Copa, medio litro o botella",
          },
          beer: {
            label: "Cerveza",
            helper: "Copa, pinta o jarra",
          },
          shot: {
            label: "Trago",
            helper: "Medida estándar de 45 ml",
          },
          cocktail: {
            label: "Cóctel",
            helper: "Receta predeterminada o personalizada",
          },
          other: {
            label: "Otro",
            helper: "Mocktails, jugos o especiales",
          },
        },
        containerOptions: {
          "wine-red-glass": "Copa de vino tinto (180 ml)",
          "wine-white-glass": "Copa de vino blanco (150 ml)",
          "wine-half-liter": "Medio litro (500 ml)",
          "wine-bottle": "Botella (750 ml)",
          "beer-bottle": "Botella (341 ml)",
          "beer-glass": "Copa (355 ml)",
          "beer-pint": "Pinta (473 ml)",
          "beer-buck": "Jarra (500 ml)",
          "cocktail-default-recipe": "Receta predeterminada",
          "cocktail-custom": "Receta personalizada",
        },
        errors: {
          typeRequired: "Elige un tipo de servicio.",
          containerRequired: "Selecciona un contenedor.",
          priceInvalid: "Ingresa un precio válido.",
          productRequired: "Selecciona un producto del inventario.",
          ingredientRequired:
            "Agrega al menos un ingrediente con una cantidad válida.",
        },
        customCocktailFallback: "Cóctel personalizado",
        saleDisplayNameFallback: "Producto de venta",
      },
      cocktailRecipeLabel: "Receta de cóctel",
      cocktailRecipeSelectPlaceholder: "Selecciona una receta...",
      alerts: {
        cashPayment: "¡Pago en efectivo recibido! Total: $",
        orderCompleted: "¡Pedido completado! Total: $",
      },
      servingConfig: {
        title: "Formatos de servicio y márgenes",
        description:
          "Ajusta el margen aplicado a cada formato de servicio (precio = costo × (1 + margen/100)).",
        formatDetails: "{volume} ml • margen predeterminado {margin}%",
        categoryLabels: {
          spirits: "Licores",
          wine: "Vino",
          beer: "Cerveza",
          soda: "Listo para beber",
          juice: "Jugo",
          other: "Otros",
        },
        formats: {
          spirits: {
            shot: "Copa de 1,5 oz",
            double: "Doble 3 oz",
          },
          wine: {
            "wine-white-glass": "Copa de vino blanco (150 ml)",
            "wine-red-glass": "Copa de vino tinto (180 ml)",
          },
          beer: {
            "beer-pint": "Pinta (473 ml)",
            "beer-buck": "Buck (355 ml)",
          },
          soda: {
            rtb: "Listo para beber 250 ml",
          },
          juice: {
            "juice-glass": "Copa 250 ml",
          },
          other: {
            "other-portion": "Porción 200 ml",
          },
        },
      },
      accessDenied: "",
      noSalesPermission: ""
    },
    analytics: {
      title: "Análisis",
      subtitle: "Informes de ventas, tendencias de inventario e información comercial",
      salesAnalytics: "Análisis de ventas",
      salesAnalyticsDesc: "Rastrea el rendimiento de ventas diario, semanal y mensual",
      inventoryTrends: "Tendencias de inventario",
      inventoryTrendsDesc: "Analiza la popularidad de productos y la rotación de stock",
      revenueReports: "Informes de ingresos",
      revenueReportsDesc: "Ver desgloses detallados de ingresos por categoría",
      comingSoon: "Panel de análisis próximamente. ¡Continúa agregando funciones para desarrollar esta sección!",
      salesPrediction: {
        errorTitle: "Error en el análisis",
        retryButton: "Reintentar",
        retrying: "Reintentando...",
        emptyMessage: "Haz clic en el botón para analizar los mejores vendedores.",
        analyzeButton: "Analizar ventas",
        cardTitle: "Mejores vendedores por región",
        forecastLabel: "Ingresos proyectados (7 días)",
        unitsLabel: "Unidades/día",
        unitPriceLabel: "Precio por unidad",
        dailyRevenueLabel: "Ingresos diarios",
        marginLabel: "Margen",
        noProductDetails: "No hay detalles de productos disponibles todavía."
      },
      salesReport: {
        dailyDetailTitle: "Detalle diario de ventas",
        dailyDetailSubtitle: "Consulta los totales de cada día para seguir la tendencia.",
        dailyDetailEmpty: "Genera un informe para ver los resúmenes diarios.",
        dailyRevenueLabel: "Ingresos",
        dailySalesLabel: "Ventas",
        dailyTipsLabel: "Propinas",
        dailyTaxLabel: "Impuestos",
        downloadCsvButton: "Descargar informe completo (CSV)",
      },
      aiTools: {
        title: "Herramientas de IA",
        refreshLabel: "Actualizar resultados de IA",
        toolOptions: {
          insights: {
            title: "Perspectivas inteligentes",
            description: "Analiza las ventas recientes para destacar las tendencias clave.",
          },
          "sales-prediction": {
            title: "Predicción de ventas",
            description: "Pronostica tus más vendidos y la demanda esperada.",
          },
          "food-wine-pairing": {
            title: "Maridaje comida y vino",
            description: "Genera sugerencias de maridaje para tu menú.",
          },
          "sales-report": {
            title: "Informe de ventas",
            description: "Obtén un desglose detallado con estadísticas e impuestos.",
          },
        },
        insights: {
          errorTitle: "Error al generar las perspectivas",
          retrying: "Reintentando...",
          retryButton: "Reintentar",
          intro: "Genera perspectivas inteligentes basadas en tus datos de ventas.",
          generateButton: "Generar perspectivas",
          generating: "Generando...",
          noDataTitle: "Perspectivas próximamente",
          noDataDescription: "Las perspectivas de IA aparecerán después de registrar algunas ventas.",
          comparativesTitle: "Comparar rendimiento",
          comparativesTimeframes: {
            weekly: "Semanal",
            monthly: "Mensual",
            yearly: "Anual",
          },
          trendLabels: {
            positive: "Positivo",
            negative: "Negativo",
            warning: "Atención",
            neutral: "Neutro",
          },
          tableHeaders: {
            metric: "Métrica",
            value: "Valor",
            trend: "Tendencia",
            description: "Descripción",
          },
          summary: {
            title: "Resumen del análisis",
            totalSalesLabel: "Ventas analizadas",
            topCategoryLabel: "Producto destacado",
            recommendationLabel: "Recomendación clave",
          },
        },
        foodWinePairing: {
          errorTitle: "Error al generar los maridajes",
          retrying: "Reintentando...",
          retryButton: "Reintentar",
          emptyMessage: "Haz clic en el botón para generar maridajes de comida y vino.",
          buttonLabel: "Generar maridajes",
          title: "Maridaje comida y vino",
        },
        salesReport: {
          errorTitle: "Error al generar el informe",
          loading: "Cargando informe...",
          retryButton: "Reintentar",
          emptyMessage: "Haz clic en el botón para generar un informe detallado de ventas.",
          buttonLabel: "Generar informe",
          statsLabels: {
            totalSales: "Ventas totales",
            revenue: "Ingresos",
            tps: "TPS",
            tvq: "TVQ",
            tips: "Propinas",
            averageValue: "Valor promedio",
          },
        },
      },
    },
    auditLogs: {
      title: "Registros de auditoría",
      subtitle: "Historial de cambios de inventario y detección de fraude",
      accessDenied: "Acceso denegado",
      accessDeniedDesc: "No tienes permiso para ver los registros de auditoría. Solo los gerentes y superiores pueden acceder a esta página.",
      suspiciousActivity: "Actividad sospechosa detectada",
      noSuspiciousActivity: "No se detectó actividad sospechosa",
      statistics: "Estadísticas",
      totalChanges: "Cambios totales",
      byAction: "Por acción",
      byRole: "Por rol",
      activeUsers: "Usuarios activos",
      recentChanges: "Cambios recientes",
      noLogs: "No se han registrado cambios de inventario",
      actions: {
        create: "Creado",
        update: "Actualizado",
        delete: "Eliminado",
        restock: "Reabastecido",
        adjustment: "Ajustado",
        sale: "Venta",
      },
      changeInfo: "cambió de {prev} a {new}",
      priceChange: "Precio: ${prev} → ${new}",
    },
    notFound: {
      title: "404",
      subtitle: "Esta página aún no existe.",
      description: "Continúa desarrollando tu sistema La Réserve explorando las funciones disponibles a continuación.",
      inventory: "Inventario",
      inventoryDesc: "Administrar niveles de stock y productos",
      pointOfSale: "Punto de venta",
      pointOfSaleDesc: "Registrar ventas y procesar pedidos",
      analytics: "Análisis",
      analyticsDesc: "Ver informes e información",
    },
    paymentModal: {
      completePayment: "Completar pago",
      totalAmount: "Monto total",
      processingPayment: "Procesando tu pago...",
    },
    paymentForm: {
      choosePaymentMethod: "Elegir método de pago",
      cardPayment: "Pago con tarjeta",
      applePay: "Apple Pay",
      cardNumber: "Número de tarjeta",
      cardholderName: "Nombre del titular",
      expiryDate: "Fecha de vencimiento",
      cvc: "CVC",
      cancel: "Cancelar",
      pay: "Pagar",
      paymentSuccessful: "¡Pago exitoso!",
      thankYou: "Gracias por tu compra",
      errors: {
        selectCard: "Por favor selecciona el pago con tarjeta",
        fillAllDetails: "Por favor completa todos los detalles de la tarjeta",
        cardNumberLength: "El número de tarjeta debe tener 16 dígitos",
        paymentFailed: "El pago falló. Por favor intenta de nuevo.",
        applePayFailed: "Apple Pay falló. Por favor intenta de nuevo.",
      },
      testCardNotice: "Tarjeta de prueba: 4242 4242 4242 4242 | Cualquier fecha futura | Cualquier CVC",
    },
    settings: {
      title: "Configuración",
      subtitle: "Administra la configuración y preferencias de tu bar",
      saveChanges: "Guardar cambios",
      saveSuccess: "¡Configuración guardada con éxito!",
      saveError: "Error al guardar la configuración.",
      general: {
        title: "Información general",
        description: "Información básica sobre tu bar o establecimiento",
        barName: "Nombre del bar",
        email: "Correo electrónico",
        phone: "Teléfono",
        address: "Dirección",
        currency: "Moneda",
        taxRegion: "Región fiscal",
        taxRate: "Tasa de impuesto (%)",
        taxRegions: {
          quebec: "Quebec, Canadá (TPS 5% + TVQ 9,975%)",
          ontario: "Ontario, Canadá (TPS 13%)",
          "british-columbia": "Columbia Británica, Canadá (TPS 5% + PST 7%)",
          alberta: "Alberta, Canadá (TPS 5%)",
          manitoba: "Manitoba, Canadá (TPS 5% + PST 7%)",
          saskatchewan: "Saskatchewan, Canadá (TPS 5% + PST 6%)",
          "nova-scotia": "Nueva Escocia, Canadá (TPS 15%)",
          "new-brunswick": "Nuevo Brunswick, Canadá (TPS 15%)",
          newfoundland: "Terranova, Canadá (TPS 15%)",
          "prince-edward-island": "Isla del Príncipe Eduardo, Canadá (TPS 15%)",
          "northwest-territories": "Territorios del Noroeste, Canadá (TPS 5%)",
          nunavut: "Nunavut, Canadá (TPS 5%)",
          yukon: "Yukón, Canadá (TPS 5%)",
          california: "California, EE. UU. (7,25% - 10%)",
          "new-york": "Nueva York, EE. UU. (4% - 8,875%)",
          texas: "Texas, EE. UU. (6,25% - 8,25%)",
          florida: "Florida, EE. UU. (6% - 7,5%)",
          illinois: "Illinois, EE. UU. (6,25% - 11%)",
          nevada: "Nevada, EE. UU. (6,85% - 8,375%)",
          washington: "Washington, EE. UU. (6,5% - 10,4%)",
          oregon: "Oregón, EE. UU. (0%)",
          "new-hampshire": "New Hampshire, EE. UU. (0%)",
          montana: "Montana, EE. UU. (0%)",
          france: "Francia (IVA 20%)",
          spain: "España (IVA 21%)",
          germany: "Alemania (MwSt 19%)",
          italy: "Italia (IVA 22%)",
          uk: "Reino Unido (IVA 20%)",
          belgium: "Bélgica (IVA 21%)",
          netherlands: "Países Bajos (IVA 21%)",
          portugal: "Portugal (IVA 23%)",
          sweden: "Suecia (IVA 25%)",
          denmark: "Dinamarca (IVA 25%)",
          poland: "Polonia (IVA 23%)",
          mexico: "México (IVA 16%)",
          argentina: "Argentina (IVA 21%)",
          chile: "Chile (IVA 19%)",
          colombia: "Colombia (IVA 19%)",
          peru: "Perú (IGV 18%)",
          ecuador: "Ecuador (IVA 12%)",
          uruguay: "Uruguay (IVA 22%)",
          panama: "Panamá (ITBMS 7%)",
          "dominican-republic": "República Dominicana (ITBIS 18%)",
          australia: "Australia (TPS 10%)",
          "new-zealand": "Nueva Zelanda (TPS 15%)",
          switzerland: "Suiza (IVA 7,7%)",
          custom: "Tasa personalizada",
        },
      },
      notifications: {
        title: "Notificaciones",
        description: "Configura cómo y cuándo recibes notificaciones",
        lowStockAlerts: "Alertas de stock bajo",
        lowStockAlertsDesc: "Recibe notificaciones cuando los niveles de inventario sean bajos",
        emailNotifications: "Notificaciones por correo",
        emailNotificationsDesc: "Recibir notificaciones por correo electrónico",
        salesReports: "Informes de ventas diarios",
        salesReportsDesc: "Recibir informes resumen de ventas diarias",
        weeklySummary: "Resumen semanal",
        weeklySummaryDesc: "Recibir resumen semanal de rendimiento",
      },
      inventory: {
        title: "Gestión de inventario",
        description: "Configura el seguimiento y alertas de inventario",
        lowStockThreshold: "Umbral de stock bajo",
        lowStockThresholdDesc: "Alerta cuando el stock cae por debajo de esta cantidad",
        autoReorder: "Reorden automático",
        autoReorderDesc: "Crear automáticamente solicitudes de reorden cuando el stock es bajo",
        reorderQuantity: "Cantidad de reorden por defecto",
      },
      import: {
        title: "Importar inventario",
        description: "Importa tu inventario desde CSV, Excel o Google Sheets",
        importInventory: "Importar inventario",
        selectFile: "Seleccionar archivo",
        supportedFormats: "Formatos soportados: CSV, Excel (.xlsx, .xls), Google Sheets",
        importSuccess: "¡Inventario importado con éxito!",
        importError: "Error al importar el inventario. Por favor verifica el formato del archivo.",
        fileRequired: "Por favor selecciona un archivo para importar",
        processing: "Procesando archivo...",
        selected: "Seleccionado",
        productsImported: "productos importados",
      },
      export: {
        title: "Exportar inventario",
        description: "Exporta tu inventario en formato CSV o Excel",
        exportInventory: "Exportar inventario",
        exportAsCSV: "Exportar como CSV",
        exportAsExcel: "Exportar como Excel",
        exportSuccess: "¡Inventario exportado con éxito!",
        exportError: "Error al exportar el inventario. Por favor intenta de nuevo.",
        noProducts: "No hay productos para exportar",
      },
      appearance: {
        title: "Apariencia",
        description: "Personaliza la apariencia de la aplicación",
        theme: "Tema",
        language: "Idioma",
      },
      auditLogsSection: {
        title: "Registros de auditoría",
        description: "Revisa las acciones de inventario y alertas sospechosas.",
        details: "Este registro te ayuda a rastrear cambios y detectar actividad inusual.",
        button: "Ver registros de auditoría",
      },
      userManagementSection: {
        title: "Gestión de usuarios",
        description: "Invita al equipo, asigna roles y controla accesos.",
        details: "Elige quién puede editar inventario, ver ventas o cambiar ajustes.",
        button: "Administrar usuarios",
      },
      security: {
        title: "Seguridad y Datos",
        description: "Gestiona tus datos personales y la seguridad de tu cuenta",
        downloadData: "Descargar Mis Datos",
        downloadDataDesc: "Descarga una copia de todos tus datos (productos, ventas, recetas, configuración)",
        downloadButton: "Descargar Datos",
        downloading: "Descargando...",
        downloadSuccess: "¡Datos descargados con éxito!",
        downloadError: "Error al descargar los datos.",
        deleteAccount: "Eliminar Cuenta",
        deleteAccountDesc: "Elimina permanentemente tu cuenta y todos tus datos. Esta acción es irreversible.",
        deleteButton: "Eliminar Mi Cuenta",
        deleteConfirmTitle: "Confirmar Eliminación de Cuenta",
        deleteConfirmMessage: "¿ Estás absolutamente seguro de que deseas eliminar tu cuenta? Esto eliminará permanentemente todos tus datos (productos, ventas, recetas, configuración). Esta acción es IRREVERSIBLE.",
        deleteConfirmPlaceholder: "Escribe 'ELIMINAR' para confirmar",
        deleteConfirmButton: "Sí, eliminar permanentemente",
        deleteCancel: "Cancelar",
        deleteSuccess: "Cuenta eliminada con éxito. Serás desconectado.",
        deleteError: "Error al eliminar la cuenta.",
        confirmationRequired: "Por favor escribe 'ELIMINAR' para confirmar",
      },
    },
    common: {
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
      cancel: "Cancelar",
      close: "Cerrar",
      previous: "Anterior",
      next: "Siguiente",
      units: {
        bottles: "botellas",
        bottle: "botella",
        bags: "bolsas",
        bag: "bolsa",
        shot: "shot",
        shooter: "shooter",
        glass: "vaso",
        drink: "bebida",
      },
    },
    home: {
      title: "Reserva Bóveda",
      subtitle: "Gestiona tu bar con estilo",
      username: "Nombre de usuario",
      usernamePlaceholder: "Ingresa tu nombre de usuario",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      login: "Iniciar sesión",
      signUp: "Registrarse",
      createAccount: "Crear cuenta",
      or: "O",
      continueWithGoogle: "Continuar con Google",
      continueWithApple: "Continuar con Apple",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      noAccountYet: "¿Aún no tienes una cuenta?",
      switchToLogin: "Iniciar sesión",
      switchToSignUp: "Registrarse",
      fillAllFields: "Por favor completa todos los campos",
      signUpError: "Error durante el registro",
      loginError: "Nombre de usuario o contraseña incorrectos",
      generalError: "Ocurrió un error. Por favor intenta de nuevo.",
    },
  },
  de: {
    Layout: {
      appName: "Lagerkammer",
      appSubtitle: "Inventar- und Kassensystem",
      nav: {
        inventory: "Inventar",
        sales: "Verkäufe",
        analytics: "Analysen",
        users: "Rollen",
        settings: "Einstellungen",
      },
    },
    inventory: {
      title: "Inventar",
      subtitle: "Verwalten Sie Ihre Bar-Bestandsniveaus und Produkte",
      addProduct: "Produkt hinzufügen",
      totalInventoryValue: "Gesamter Inventarwert",
      totalProducts: "Gesamtprodukte",
      lowStockItems: "Artikel mit niedrigem Bestand",
      searchProducts: "Produkte suchen...",
      noProductsFound: "Keine Produkte gefunden",
      confirmDelete: "Sind Sie sicher, dass Sie \"{name}\" löschen möchten?",
      categories: {
        all: "Alle Produkte",
        spirits: "Spirituosen",
        wine: "Wein",
        beer: "Bier",
        soda: "Erfrischungsgetränke",
        juice: "Saft",
        other: "Andere",
      },
      addProductModal: {
        title: "Neues Produkt hinzufügen",
        description: "Ein neues Produkt zu Ihrem Inventar hinzufügen",
        name: "Produktname",
        category: "Kategorie",
        subcategory: "Unterkategorie",
        origin: "Herkunft",
        quantity: "Menge",
        pricePerBottle: "Preis pro Flasche",
        bottleSizeInMl: "Flaschenraum (ml)",
        bottleSizeHint: "Die Kapazität der Flasche in Millilitern. Beispiel: 750ml für eine Standard-Weinflasche",
        inventoryCode: "Inventarcode",
        inventoryCodeHint: "Automatisch generiert wenn leer",
        inventoryCodePlaceholder: "Code eingeben oder leer lassen für automatische Generierung",
        qrCode: "QR-Code",
        generateQR: "QR-Code generieren",
        downloadQR: "QR-Code herunterladen",
        qrCodePlaceholder: "Füllen Sie den Produktnamen und den Inventarcode aus, dann klicken Sie auf 'Generieren', um einen QR-Code zu erstellen",
        codeLabel: "Code",
        fillRequiredFields: "Bitte füllen Sie alle erforderlichen Felder aus",
        imageUrl: "Bild-URL",
        searchImage: "Bild suchen",
        searchingImage: "Suche läuft...",
        fillProductName: "Bitte geben Sie zuerst einen Produktnamen ein",
        imageApiNotConfigured: "Um die automatische Bildsuche zu verwenden, konfigurieren Sie einen Google Custom Search API-Schlüssel in den Einstellungen.",
        imageNotFound: "Kein Bild automatisch gefunden. Sie können die Bild-URL manuell in das Feld unten eingeben.",
        imageSearchError: "Fehler bei der Bildsuche. Sie können die URL manuell in das Feld unten eingeben.",
        imageSearchTimeout: "Die Bildsuche dauert zu lange. Bitte versuchen Sie es erneut.",
        editTitle: "Produkt bearbeiten",
        editDescription: "Produktinformationen ändern",
        save: "Produkt speichern",
        cancel: "Abbrechen",
        categories: {
          spirits: "Spirituosen",
          beer: "Bier",
          wine: "Wein",
          aperitif: "Aperitif",
          champagne: "Champagner & Schaumwein",
          readyToDrink: "Trinkfertig",
          snacks: "Snacks",
          other: "",
          soda: "",
          juice: ""
        },
        subcategories: {
          redWine: "Rotwein",
          whiteWine: "Weißwein",
          roseWine: "Roséwein",
          scotchWhisky: "Scotch & Whisky",
          liqueurCream: "Likör & Sahne",
          gin: "Gin",
          rum: "Rum",
          vodka: "Wodka",
          tequila: "Tequila",
          cognacBrandy: "Cognac & Brandy",
        },
        origins: {
          imported: "Importiert",
          canadian: "Kanadisch",
          quebec: "Québec",
          spain: "Spanien",
          france: "Frankreich",
          italy: "Italien",
          usa: "Vereinigte Staaten",
          australia: "Australien",
          southAfrica: "Südafrika",
          newZealand: "Neuseeland",
        portugal: "Portugal",
        chile: "Chile",
        uk: "Vereinigtes Königreich",
      },
      },
      other: "",
      juice: "",
      soda: "",
      beer: "",
      spirits: "",
      wine: "",
      allCategories: ""
    },
    productCard: {
      stockLevel: "Bestandsniveau",
      lowStock: "Niedriger Bestand!",
      add: "Hinzufügen",
      remove: "Entfernen",
      categories: {
        spirits: "Spirituosen",
        wine: "Wein",
        beer: "Bier",
        soda: "Erfrischungsgetränke",
        juice: "Saft",
        other: "Andere",
      },
    },
    sales: {
      title: "Kassensystem",
      subtitle: "Kundenbestellungen bearbeiten und Verkäufe tätigen",
      orderSummary: "Bestellübersicht",
      noItemsInCart: "Keine Artikel im Warenkorb",
      each: "jeweils",
      subtotal: "Zwischensumme",
      tax: "Steuer (8%)",
      total: "Gesamt",
      paymentMethod: "Zahlungsmethode",
      cash: "Bargeld",
      card: "Karte",
      tab: "Rechnung",
      openTab: "Rechnung öffnen",
      openNewTab: "Neue Rechnung öffnen",
      selectTab: "Rechnung auswählen",
      tabName: "Rechnungsname",
      tabNamePlaceholder: "Kundenname oder Tischnummer eingeben",
      creditCardNumber: "Kreditkartennummer",
      creditCardInfo: "Die Karte wird belastet, wenn die Rechnung geschlossen wird",
      tabCreated: "Rechnung erfolgreich geöffnet",
      tabClosed: "Rechnung geschlossen und bezahlt",
      noOpenTabs: "Keine offenen Rechnungen",
      tabs: "Offene Rechnungen",
      closeTab: "Rechnung schließen",
      payTab: "Rechnung bezahlen",
      manageTabs: "Rechnungen verwalten",
      tabsManagement: "Rechnungsverwaltung",
      viewDetails: "Details anzeigen",
      hideDetails: "Details ausblenden",
      allTabsTotal: "Gesamt aller Rechnungen",
      completeSale: "Verkauf abschließen",
      outOfStockLabel: "Nicht vorrätig",
      categories: {
        all: "Alle",
        spirits: "Spirituosen",
        wine: "Wein",
        beer: "Bier",
        soda: "Erfrischungsgetränke",
        juice: "Saft",
        other: "Andere",
        cocktail: "Cocktails",
      },
      sellProductCTA: "Produkt hinzufügen",
      sellProductDialogTitle: "Produkt verkaufen",
      sellProductDialogDescription:
        "Wähle einen Artikel aus dem Inventar oder erstell eine schnelle Rezeptur, um ihn zum Verkauf hinzuzufügen.",
      sellProductForm: {
        typeStepTitle: "Servicetyp",
        typeStepDescription:
          "Wählen Sie das Format, das Sie servieren möchten (Glas, Flight usw.).",
        containerStepTitle: "Behälter",
        containerStepDescription:
          "Wählen Sie den Behälter oder die Variante, die zu diesem Service passt.",
        productStepTitle: "Produkt",
        productStepDescription:
          "Wählen Sie ein Inventarprodukt für dieses Rezept.",
        containerAutoMessage: "Wir wählen automatisch den passendsten Behälter aus.",
        inventoryGroups: {
          compatible: "Kompatibles Inventar",
          other: "Sonstiges Inventar",
        },
        selectProductPlaceholder: "Produkt wählen",
        noProductsAvailable:
          "Für diese Auswahl sind keine Produkte verfügbar.",
        presetRecipeLabel: "Standardrezept",
        presetSelectPlaceholder: "Rezept auswählen...",
        customCocktailLabel: "Name des hausgemachten Cocktails",
        customCocktailPlaceholder: "Cocktailname",
        ingredientReferenceLabel: "Rezept",
        ingredientCustomLabel: "Individuelle Zutat",
        customIngredientProductLabel: "Produkt",
        customIngredientQuantityLabel: "Menge (ml)",
        customIngredientRemoveLabel: "Zutat entfernen",
        addIngredientButton: "Zutat hinzufügen",
        estimatedCostLabel: "Geschätzte Servicenkosten",
        estimatedCostDetailSingle:
          "Basierend auf {servingVolume} ml der {bottleSize} ml Flasche.",
        estimatedCostDetailMulti: "Basierend auf {totalVolume} ml Zutaten.",
        profitMarginLabel: "Gewinnspanne (%)",
        profitMarginHint: "Vorgeschlagener Preis: {price}",
        salePriceLabel: "Verkaufspreis",
        containerSelectedLabel: "Ausgewählter Behälter: {container}",
        stepIndicator: "Schritt {current} von {total}",
        stockCount: "{count} auf Lager",
        saveButton: "Produkt speichern",
        typeOptions: {
          wine: {
            label: "Wein",
            helper: "Glas, halber Liter oder Flasche",
          },
          beer: {
            label: "Bier",
            helper: "Glas, Pinte oder Buck",
          },
          shot: {
            label: "Shot",
            helper: "Standardportion (45 ml)",
          },
          cocktail: {
            label: "Cocktail",
            helper: "Vorgegebenes oder eigenes Rezept",
          },
          other: {
            label: "Andere",
            helper: "Mocktails, Säfte oder Specials",
          },
        },
        containerOptions: {
          "wine-red-glass": "Rotweinglas (180 ml)",
          "wine-white-glass": "Weißweinglas (150 ml)",
          "wine-half-liter": "Halber Liter (500 ml)",
          "wine-bottle": "Flasche (750 ml)",
          "beer-bottle": "Flasche (341 ml)",
          "beer-glass": "Glas (355 ml)",
          "beer-pint": "Pinte (473 ml)",
          "beer-buck": "Buck (500 ml)",
          "cocktail-default-recipe": "Standardrezept",
          "cocktail-custom": "Eigenes Rezept",
        },
        errors: {
          typeRequired: "Wählen Sie einen Servicetyp.",
          containerRequired: "Wählen Sie einen Behälter.",
          priceInvalid: "Geben Sie einen gültigen Preis ein.",
          productRequired: "Wählen Sie ein Inventarprodukt.",
          ingredientRequired:
            "Fügen Sie mindestens eine Zutat mit gültiger Menge hinzu.",
        },
        customCocktailFallback: "Hauscocktail",
        saleDisplayNameFallback: "Verkaufsprodukt",
      },
      cocktailRecipeLabel: "Cocktail-Rezept",
      cocktailRecipeSelectPlaceholder: "Rezept auswählen...",
      alerts: {
        cashPayment: "Barzahlung erhalten! Gesamt: $",
        orderCompleted: "Bestellung abgeschlossen! Gesamt: $",
      },
      servingConfig: {
        title: "Verkaufsversionen & Margen",
        description:
          "Passen Sie die Marge für jedes Servierformat an (Preis = Kosten × (1 + Marge/100)).",
        formatDetails: "{volume} ml • Standardmarge {margin}%",
        categoryLabels: {
          spirits: "Spirituosen",
          wine: "Wein",
          beer: "Bier",
          soda: "Trinkfertig",
          juice: "Saft",
          other: "Andere",
        },
        formats: {
          spirits: {
            shot: "Shot 1,5 oz",
            double: "Double 3 oz",
          },
          wine: {
            "wine-white-glass": "Weißweinglas (150 ml)",
            "wine-red-glass": "Rotweinglas (180 ml)",
          },
          beer: {
            "beer-pint": "Pint (473 ml)",
            "beer-buck": "Buck (355 ml)",
          },
          soda: {
            rtb: "Trinkfertig 250 ml",
          },
          juice: {
            "juice-glass": "Glas 250 ml",
          },
          other: {
            "other-portion": "Portion 200 ml",
          },
        },
      },
      accessDenied: "",
      noSalesPermission: ""
    },
    analytics: {
      title: "Analysen",
      subtitle: "Verkaufsberichte, Bestandstrends und Geschäftseinblicke",
      salesAnalytics: "Verkaufsanalysen",
      salesAnalyticsDesc: "Verfolgen Sie tägliche, wöchentliche und monatliche Verkaufsleistung",
      inventoryTrends: "Bestandstrends",
      inventoryTrendsDesc: "Analysieren Sie Produktpopularität und Lagerumschlag",
      revenueReports: "Umsatzberichte",
      revenueReportsDesc: "Detaillierte Umsatzaufschlüsselungen nach Kategorie anzeigen",
      comingSoon: "Analysedashboard kommt bald. Fügen Sie weiterhin Funktionen hinzu, um diesen Abschnitt zu entwickeln!",
      salesPrediction: {
        errorTitle: "Analysefehler",
        retryButton: "Wiederholen",
        retrying: "Wiederhole...",
        emptyMessage: "Tippen Sie auf die Schaltfläche, um die Topseller zu analysieren.",
        analyzeButton: "Verkäufe analysieren",
        cardTitle: "Top Seller nach Region",
        forecastLabel: "Prognostizierter Umsatz (7 Tage)",
        unitsLabel: "Einheiten/Tag",
        unitPriceLabel: "Stückpreis",
        dailyRevenueLabel: "Täglicher Umsatz",
        marginLabel: "Marge",
        noProductDetails: "Noch keine Produktdetails verfügbar."
      },
      salesReport: {
        dailyDetailTitle: "Tägliche Verkaufsdetails",
        dailyDetailSubtitle: "Sieh dir die Tagessummen an, um Trends zu erkennen.",
        dailyDetailEmpty: "Erstelle einen Bericht, um die Tagesdaten zu sehen.",
        dailyRevenueLabel: "Umsatz",
        dailySalesLabel: "Verkäufe",
        dailyTipsLabel: "Trinkgelder",
        dailyTaxLabel: "Steuern",
        downloadCsvButton: "Kompletten Bericht herunterladen (CSV)",
      },
      aiTools: {
        title: "KI-Tools",
        refreshLabel: "KI-Ergebnisse aktualisieren",
        toolOptions: {
          insights: {
            title: "Smarter Einblick",
            description: "Analysieren Sie aktuelle Verkäufe, um wichtige Trends zu erkennen.",
          },
          "sales-prediction": {
            title: "Verkaufsprognose",
            description: "Prognostizieren Sie Ihre Bestseller und die erwartete Nachfrage.",
          },
          "food-wine-pairing": {
            title: "Speisen- & Weinbegleitung",
            description: "Erstellen Sie passende Vorschläge für Ihr Menü.",
          },
          "sales-report": {
            title: "Verkaufsbericht",
            description: "Erhalten Sie eine detaillierte Aufschlüsselung mit Statistiken und Steuern.",
          },
        },
        insights: {
          errorTitle: "Fehler bei der Generierung der Einblicke",
          retrying: "Erneuter Versuch...",
          retryButton: "Erneut versuchen",
          intro: "Generieren Sie smarte Einblicke basierend auf Ihren Verkaufsdaten.",
          generateButton: "Einblicke generieren",
          generating: "Generierung läuft...",
          noDataTitle: "Einblicke kommen bald",
          noDataDescription: "KI-Einblicke erscheinen nach einigen erfassten Verkäufen.",
          comparativesTitle: "Leistung vergleichen",
          comparativesTimeframes: {
            weekly: "Wöchentlich",
            monthly: "Monatlich",
            yearly: "Jährlich",
          },
          trendLabels: {
            positive: "Positiv",
            negative: "Negativ",
            warning: "Beobachten",
            neutral: "Neutral",
          },
          tableHeaders: {
            metric: "Metrik",
            value: "Wert",
            trend: "Trend",
            description: "Beschreibung",
          },
          summary: {
            title: "Analyseübersicht",
            totalSalesLabel: "Analysierte Verkäufe",
            topCategoryLabel: "Top-Produkt",
            recommendationLabel: "Wichtigste Empfehlung",
          },
        },
        foodWinePairing: {
          errorTitle: "Fehler bei der Generierung der Begleitungen",
          retrying: "Erneuter Versuch...",
          retryButton: "Erneut versuchen",
          emptyMessage: "Klicken Sie auf die Schaltfläche, um Speise- und Weinbegleitungen zu generieren.",
          buttonLabel: "Begleitungen generieren",
          title: "Speisen- & Weinbegleitung",
        },
        salesReport: {
          errorTitle: "Fehler bei der Berichtserstellung",
          loading: "Bericht wird geladen...",
          retryButton: "Erneut versuchen",
          emptyMessage: "Klicken Sie auf die Schaltfläche, um einen detaillierten Verkaufsbericht zu erstellen.",
          buttonLabel: "Bericht generieren",
          statsLabels: {
            totalSales: "Gesamtverkäufe",
            revenue: "Umsatz",
            tps: "TPS",
            tvq: "TVQ",
            tips: "Trinkgelder",
            averageValue: "Durchschnittswert",
          },
        },
      },
    },
    auditLogs: {
      title: "Audit-Protokolle",
      subtitle: "Inventar-Änderungsverlauf und Betrugserkennung",
      accessDenied: "Zugriff verweigert",
      accessDeniedDesc: "Sie haben keine Berechtigung, Audit-Protokolle anzuzeigen. Nur Manager und höher können auf diese Seite zugreifen.",
      suspiciousActivity: "Verdächtige Aktivität erkannt",
      noSuspiciousActivity: "Keine verdächtige Aktivität erkannt",
      statistics: "Statistiken",
      totalChanges: "Gesamtänderungen",
      byAction: "Nach Aktion",
      byRole: "Nach Rolle",
      activeUsers: "Aktive Benutzer",
      recentChanges: "Letzte Änderungen",
      noLogs: "Keine Inventaränderungen aufgezeichnet",
      actions: {
        create: "Erstellt",
        update: "Aktualisiert",
        delete: "Gelöscht",
        restock: "Aufgefüllt",
        adjustment: "Angepasst",
        sale: "Verkauf",
      },
      changeInfo: "von {prev} zu {new} geändert",
      priceChange: "Preis: ${prev} → ${new}",
    },
    notFound: {
      title: "404",
      subtitle: "Diese Seite existiert noch nicht.",
      description: "Entwickeln Sie Ihr La Réserve-System weiter, indem Sie die verfügbaren Funktionen unten erkunden.",
      inventory: "Inventar",
      inventoryDesc: "Bestandsniveaus und Produkte verwalten",
      pointOfSale: "Kassensystem",
      pointOfSaleDesc: "Verkäufe tätigen und Bestellungen bearbeiten",
      analytics: "Analysen",
      analyticsDesc: "Berichte und Einblicke anzeigen",
    },
    paymentModal: {
      completePayment: "Zahlung abschließen",
      totalAmount: "Gesamtbetrag",
      processingPayment: "Ihre Zahlung wird bearbeitet...",
    },
    paymentForm: {
      choosePaymentMethod: "Zahlungsmethode wählen",
      cardPayment: "Kartenzahlung",
      applePay: "Apple Pay",
      cardNumber: "Kartennummer",
      cardholderName: "Karteninhaber",
      expiryDate: "Ablaufdatum",
      cvc: "CVC",
      cancel: "Abbrechen",
      pay: "Zahlen",
      paymentSuccessful: "Zahlung erfolgreich!",
      thankYou: "Vielen Dank für Ihren Einkauf",
      errors: {
        selectCard: "Bitte wählen Sie Kartenzahlung",
        fillAllDetails: "Bitte füllen Sie alle Kartendaten aus",
        cardNumberLength: "Kartennummer muss 16 Stellen haben",
        paymentFailed: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        applePayFailed: "Apple Pay fehlgeschlagen. Bitte versuchen Sie es erneut.",
      },
      testCardNotice: "Testkarte: 4242 4242 4242 4242 | Jedes zukünftige Datum | Jeder CVC",
    },
    settings: {
      title: "Einstellungen",
      subtitle: "Verwalten Sie Ihre Bar-Einstellungen und Präferenzen",
      saveChanges: "Änderungen speichern",
      saveSuccess: "Einstellungen erfolgreich gespeichert!",
      saveError: "Fehler beim Speichern der Einstellungen.",
      general: {
        title: "Allgemeine Informationen",
        description: "Grundlegende Informationen über Ihre Bar oder Einrichtung",
        barName: "Bar-Name",
        email: "E-Mail",
        phone: "Telefon",
        address: "Adresse",
        currency: "Währung",
        taxRegion: "Steuerregion",
        taxRate: "Steuersatz (%)",
        taxRegions: {
          quebec: "Québec, Kanada (TPS 5% + TVQ 9,975%)",
          ontario: "Ontario, Kanada (TPS 13%)",
          "british-columbia": "British Columbia, Kanada (TPS 5% + PST 7%)",
          alberta: "Alberta, Kanada (TPS 5%)",
          manitoba: "Manitoba, Kanada (TPS 5% + PST 7%)",
          saskatchewan: "Saskatchewan, Kanada (TPS 5% + PST 6%)",
          "nova-scotia": "Neuschottland, Kanada (TPS 15%)",
          "new-brunswick": "New Brunswick, Kanada (TPS 15%)",
          newfoundland: "Neufundland, Kanada (TPS 15%)",
          "prince-edward-island": "Prinz-Edward-Insel, Kanada (TPS 15%)",
          "northwest-territories": "Nordwest-Territorien, Kanada (TPS 5%)",
          nunavut: "Nunavut, Kanada (TPS 5%)",
          yukon: "Yukon, Kanada (TPS 5%)",
          california: "Kalifornien, USA (7,25% - 10%)",
          "new-york": "New York, USA (4% - 8,875%)",
          texas: "Texas, USA (6,25% - 8,25%)",
          florida: "Florida, USA (6% - 7,5%)",
          illinois: "Illinois, USA (6,25% - 11%)",
          nevada: "Nevada, USA (6,85% - 8,375%)",
          washington: "Washington, USA (6,5% - 10,4%)",
          oregon: "Oregon, USA (0%)",
          "new-hampshire": "New Hampshire, USA (0%)",
          montana: "Montana, USA (0%)",
          france: "Frankreich (MwSt 20%)",
          spain: "Spanien (MwSt 21%)",
          germany: "Deutschland (MwSt 19%)",
          italy: "Italien (MwSt 22%)",
          uk: "Vereinigtes Königreich (MwSt 20%)",
          belgium: "Belgien (MwSt 21%)",
          netherlands: "Niederlande (MwSt 21%)",
          portugal: "Portugal (MwSt 23%)",
          sweden: "Schweden (MwSt 25%)",
          denmark: "Dänemark (MwSt 25%)",
          poland: "Polen (MwSt 23%)",
          mexico: "Mexiko (MwSt 16%)",
          argentina: "Argentinien (MwSt 21%)",
          chile: "Chile (MwSt 19%)",
          colombia: "Kolumbien (MwSt 19%)",
          peru: "Peru (MwSt 18%)",
          ecuador: "Ecuador (MwSt 12%)",
          uruguay: "Uruguay (MwSt 22%)",
          panama: "Panama (MwSt 7%)",
          "dominican-republic": "Dominikanische Republik (MwSt 18%)",
          australia: "Australien (MwSt 10%)",
          "new-zealand": "Neuseeland (MwSt 15%)",
          switzerland: "Schweiz (MwSt 7,7%)",
          custom: "Benutzerdefinierter Satz",
        },
      },
      notifications: {
        title: "Benachrichtigungen",
        description: "Konfigurieren Sie, wie und wann Sie Benachrichtigungen erhalten",
        lowStockAlerts: "Niedrige Bestandsalarme",
        lowStockAlertsDesc: "Benachrichtigt werden, wenn die Lagerbestände niedrig sind",
        emailNotifications: "E-Mail-Benachrichtigungen",
        emailNotificationsDesc: "Benachrichtigungen per E-Mail erhalten",
        salesReports: "Tägliche Verkaufsberichte",
        salesReportsDesc: "Tägliche Verkaufszusammenfassungsberichte erhalten",
        weeklySummary: "Wöchentliche Zusammenfassung",
        weeklySummaryDesc: "Wöchentliche Leistungszusammenfassung erhalten",
      },
      inventory: {
        title: "Bestandsverwaltung",
        description: "Konfigurieren Sie die Bestandsverfolgung und Warnungen",
        lowStockThreshold: "Niedrige Bestandsschwelle",
        lowStockThresholdDesc: "Alarm, wenn der Bestand unter diese Menge fällt",
        autoReorder: "Automatische Nachbestellung",
        autoReorderDesc: "Automatisch Nachbestellungsanfragen erstellen, wenn der Bestand niedrig ist",
        reorderQuantity: "Standard-Nachbestellungsmenge",
      },
      import: {
        title: "Inventar importieren",
        description: "Importieren Sie Ihr Inventar aus CSV, Excel oder Google Sheets",
        importInventory: "Inventar importieren",
        selectFile: "Datei auswählen",
        supportedFormats: "Unterstützte Formate: CSV, Excel (.xlsx, .xls), Google Sheets",
        importSuccess: "Inventar erfolgreich importiert!",
        importError: "Fehler beim Importieren des Inventars. Bitte überprüfen Sie das Dateiformat.",
        fileRequired: "Bitte wählen Sie eine Datei zum Importieren aus",
        processing: "Datei wird verarbeitet...",
        selected: "Ausgewählt",
        productsImported: "Produkte importiert",
      },
      export: {
        title: "Inventar exportieren",
        description: "Exportieren Sie Ihr Inventar im CSV- oder Excel-Format",
        exportInventory: "Inventar exportieren",
        exportAsCSV: "Als CSV exportieren",
        exportAsExcel: "Als Excel exportieren",
        exportSuccess: "Inventar erfolgreich exportiert!",
        exportError: "Fehler beim Exportieren des Inventars. Bitte versuchen Sie es erneut.",
        noProducts: "Keine Produkte zum Exportieren",
      },
      appearance: {
        title: "Erscheinungsbild",
        description: "Passen Sie das Aussehen und Verhalten der Anwendung an",
        theme: "Thema",
        language: "Sprache",
      },
      auditLogsSection: {
        title: "Audit-Protokolle",
        description: "Prüfen Sie Inventaraktionen und verdächtige Meldungen.",
        details: "Dieses Protokoll hilft, Änderungen nachzuverfolgen und ungewöhnliche Aktivitäten zu erkennen.",
        button: "Audit-Protokolle ansehen",
      },
      userManagementSection: {
        title: "Benutzerverwaltung",
        description: "Team einladen, Rollen vergeben und Zugänge steuern.",
        details: "Bestimmen Sie, wer Inventar bearbeiten, Verkäufe einsehen oder Einstellungen ändern darf.",
        button: "Benutzer verwalten",
      },
      security: {
        title: "Sicherheit und Daten",
        description: "Verwalten Sie Ihre persönlichen Daten und Kontosicherheit",
        downloadData: "Meine Daten Herunterladen",
        downloadDataDesc: "Laden Sie eine Kopie aller Ihrer Daten herunter (Produkte, Verkäufe, Rezepte, Einstellungen)",
        downloadButton: "Daten Herunterladen",
        downloading: "Wird heruntergeladen...",
        downloadSuccess: "Daten erfolgreich heruntergeladen!",
        downloadError: "Fehler beim Herunterladen der Daten.",
        deleteAccount: "Konto Löschen",
        deleteAccountDesc: "Löschen Sie Ihr Konto und alle Ihre Daten dauerhaft. Diese Aktion ist unwiderruflich.",
        deleteButton: "Mein Konto Löschen",
        deleteConfirmTitle: "Kontolöschung Bestätigen",
        deleteConfirmMessage: "Sind Sie absolut sicher, dass Sie Ihr Konto löschen möchten? Dies löscht dauerhaft alle Ihre Daten (Produkte, Verkäufe, Rezepte, Einstellungen). Diese Aktion ist UNWIDERRUFLICH.",
        deleteConfirmPlaceholder: "Geben Sie 'LÖSCHEN' ein, um zu bestätigen",
        deleteConfirmButton: "Ja, dauerhaft löschen",
        deleteCancel: "Abbrechen",
        deleteSuccess: "Konto erfolgreich gelöscht. Sie werden abgemeldet.",
        deleteError: "Fehler beim Löschen des Kontos.",
        confirmationRequired: "Bitte geben Sie 'LÖSCHEN' ein, um zu bestätigen",
      },
    },
    common: {
      light: "Hell",
      dark: "Dunkel",
      system: "System",
      cancel: "Abbrechen",
      close: "Schließen",
      previous: "Zurück",
      next: "Weiter",
      units: {
        bottles: "Flaschen",
        bottle: "Flasche",
        bags: "Tüten",
        bag: "Tüte",
        shot: "shot",
        shooter: "shooter",
        glass: "Glas",
        drink: "Getränk",
      },
    },
    home: {
      title: "Lagerkammer",
      subtitle: "Verwalten Sie Ihre Bar mit Stil",
      username: "Benutzername",
      usernamePlaceholder: "Geben Sie Ihren Benutzernamen ein",
      password: "Passwort",
      passwordPlaceholder: "Geben Sie Ihr Passwort ein",
      login: "Anmelden",
      signUp: "Registrieren",
      createAccount: "Konto erstellen",
      or: "Oder",
      continueWithGoogle: "Mit Google fortfahren",
      continueWithApple: "Mit Apple fortfahren",
      alreadyHaveAccount: "Haben Sie bereits ein Konto?",
      noAccountYet: "Noch kein Konto?",
      switchToLogin: "Anmelden",
      switchToSignUp: "Registrieren",
      fillAllFields: "Bitte füllen Sie alle Felder aus",
      signUpError: "Fehler bei der Registrierung",
      loginError: "Ungültiger Benutzername oder Passwort",
      generalError: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    },
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function getTranslation(
  lang: Language,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let value: any = translations[lang];

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return undefined;
  }

  return typeof value === "string" ? value : undefined;
}
