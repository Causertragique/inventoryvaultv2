const fs = require('fs');
const path = require('path');
const filePath = path.join('client', 'pages', 'Sales.tsx');
let text = fs.readFileSync(filePath, 'utf8');
const startMarker = '  const handleCreateNewTab = async () => {';
const start = text.indexOf(startMarker);
if (start === -1) throw new Error('start marker not found');
const endMarker = '\r\n  };';
const end = text.indexOf(endMarker, start);
if (end === -1) throw new Error('end marker not found');
const endIndex = end + endMarker.length;
const lines = [
  '  const handleCreateNewTab = async () => {',
  '    if (!newTabName.trim()) {',
  '      alert("Veuillez entrer un nom de compte");',
  '      return;',
  '    }',
  '    if (!user?.uid) {',
  '      toast({',
  '        title: "Action impossible",',
  '        description: "Connectez-vous pour ouvrir un compte.",',
  '        variant: "destructive",',
  '      });',
  '      return;',
  '    }',
  '    ',
  '    // Credit card is optional, but if provided, validate it',
  '    let last4Digits: string | undefined;',
  '    if (newTabCreditCard.trim()) {',
  '      const cleanedCard = newTabCreditCard.replace(/\\s+/g, "");',
  '      if (cleanedCard.length < 13 || cleanedCard.length > 19 || !/^\\d+$/.test(cleanedCard)) {',
  '        alert("Veuillez entrer un numero de carte de credit valide");',
  '        return;',
  '      }',
  '      // Store only last 4 digits for security',
  '      last4Digits = cleanedCard.slice(-4);',
  '    }',
  '    ',
  '    const tabItems = cart.map((item) => ({',
  '      id: item.id,',
  '      name: item.name,',
  '      category: item.category,',
  '      price: item.price,',
  '      cartQuantity: item.cartQuantity,',
  '      isRecipe: item.isRecipe,',
  '      userId: item.userId,',
  '    }));',
  '    ',
  '    const payload: Omit<FirestoreTab, "id" | "createdAt" | "updatedAt"> = {',
  '      name: newTabName.trim(),',
  '      creditCard: last4Digits,',
  '      items: tabItems,',
  '      subtotal,',
  '      tax,',
  '      total,',
  '      status: "open",',
  '    };',
  '    ',
  '    try {',
  '      const createdTab = await createTabRecord(user.uid, payload);',
  '      setOpenTabs((prevTabs) => [...prevTabs, createdTab as Tab]);',
  '      setSelectedTabId(createdTab.id);',
  '      alert(`${t.sales.tabCreated}: ${createdTab.name}`);',
  '      setCart([]);',
  '      setPaymentMethod(null);',
  '      setNewTabName("");',
  '      setNewTabCreditCard("");',
  '      setShowNewTabDialog(false);',
  '    } catch (error) {',
  '      console.error("[Sales] Echec de creation de compte :", error);',
  '      toast({',
  '        title: "Erreur",',
  '        description: "Impossible d\'ouvrir le compte. Reessayez.",',
  '        variant: "destructive",',
  '      });',
  '    }',
  '  };',
  ''
];
const newBlock = lines.join('\r\n');
const updated = text.slice(0, start) + newBlock + text.slice(endIndex);
fs.writeFileSync(filePath, updated, 'utf8');
