// Service API pour remplacer localStorage par SQLite

export interface Product {
  id: string;
  name: string;
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other";
  price: number;
  quantity: number;
  unit: string;
  lastRestocked?: string;
  imageUrl?: string;
  bottleSizeInMl?: number;
}

export interface RecipeIngredient {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  price: number;
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other";
  ingredients: RecipeIngredient[];
  servingSize?: number;
}

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
  },

  create: async (product: Omit<Product, "id"> & { id?: string }): Promise<Product> => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Failed to update product");
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete product");
  },

  updateQuantity: async (id: string, quantity: number): Promise<Product> => {
    const response = await fetch(`/api/products/${id}/quantity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error("Failed to update product quantity");
    return response.json();
  },
};

// Recipes API
export const recipesApi = {
  getAll: async (): Promise<Recipe[]> => {
    const response = await fetch("/api/recipes");
    if (!response.ok) throw new Error("Failed to fetch recipes");
    return response.json();
  },

  getById: async (id: string): Promise<Recipe> => {
    const response = await fetch(`/api/recipes/${id}`);
    if (!response.ok) throw new Error("Failed to fetch recipe");
    return response.json();
  },

  create: async (recipe: Omit<Recipe, "id"> & { id?: string }): Promise<Recipe> => {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });
    if (!response.ok) throw new Error("Failed to create recipe");
    return response.json();
  },

  update: async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });
    if (!response.ok) throw new Error("Failed to update recipe");
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete recipe");
  },
};

