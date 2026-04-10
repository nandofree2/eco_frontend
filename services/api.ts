import { User, Product, Category, Province, City, Branch, UnitOfMeasurement, Role, DashboardStats, ProductStatus, PaginatedResponse, PaginationMeta, Customer, StockProduct, AdjustmentProduct } from '../types';

const API_BASE_URL = process.env.API_BASE_URL || 'https://concealable-reemergent-leota.ngrok-free.dev/api/v1';
const NGROK_SKIP_VAL = process.env.NGROK_SKIP_HEADER || '69420';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': NGROK_SKIP_VAL
};

async function safeParseJson(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  const text = await response.text();
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error(`Server Error (Status ${response.status}): The API returned an HTML error page instead of JSON. Check backend logs.`);
  }
  return text ? { message: text } : {};
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('ecolocal_token');
  const authHeader = token ? { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {};

  const headers = {
    ...DEFAULT_HEADERS,
    ...authHeader,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    if (response.status === 422) {
      const data = await safeParseJson(response);
      const errorMessage = data.message || (typeof data.errors === 'string' ? data.errors : 'Validation failed');
      const error: any = new Error(errorMessage);
      error.errors = data.errors;
      error.status = 422;
      error.data = data;
      throw error;
    }

    if (response.status === 500) {
       throw new Error(`Internal Server Error (500): The backend encountered an unexpected condition. Please ensure all required fields are provided and numeric values are in the correct format.`);
    }

    const data = await safeParseJson(response);
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || (typeof data.errors === 'string' ? data.errors : `Request failed with status ${response.status}`);
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to API at ${API_BASE_URL}. Check your server or Ngrok tunnel.`);
    }
    throw error;
  }
}

const mapAttributes = (item: any) => {
  if (!item) return null;
  const attrs = item.attributes || item;
  
  // Robust mapping for nested objects to ensure they are visible in lists/forms
  const getNested = (obj: any) => {
    if (!obj) return null;
    return obj.attributes ? { id: obj.id, ...obj.attributes } : obj;
  };

  // Mapping string enums from backend to integer enums for frontend
  const statusMap: Record<string, number> = { unreleased: 0, expired: 1, active: 2, deactive: 3 };
  const typeMap: Record<string, number> = { storable: 0, service: 1, preorder: 2 };
  const membershipMap: Record<string, number> = { regular: 0, member: 1, vip: 2 };

  const status_product = typeof attrs.status_product === 'string' 
    ? (statusMap[attrs.status_product] ?? attrs.status_product)
    : attrs.status_product;
    
  const product_type = typeof attrs.product_type === 'string'
    ? (typeMap[attrs.product_type] ?? attrs.product_type)
    : attrs.product_type;

  const membership = typeof attrs.membership === 'string'
    ? (membershipMap[attrs.membership] ?? attrs.membership)
    : attrs.membership;

  const adjustment_product_items = attrs.adjustment_product_items?.map((item: any) => {
    const itemAttrs = item.attributes || item;
    return {
      id: item.id,
      ...itemAttrs,
      product: getNested(itemAttrs.product)
    };
  });

  return {
    id: item.id,
    ...attrs,
    status_product,
    product_type,
    membership,
    adjustment_product_items,
    sku: attrs.sku || attrs.code,
    code: attrs.code || attrs.sku,
    cover_image_url: attrs.cover_image_url || attrs.cover_image,
    preview_images_urls: attrs.preview_images_urls || attrs.preview_images || attrs.preview_image_urls,
    category: getNested(attrs.category),
    unit_of_measurement: getNested(attrs.unit_of_measurement),
    role: getNested(attrs.role),
    province: getNested(attrs.province),
    city: getNested(attrs.city),
    current_abilities: attrs.current_abilities || item.current_abilities || attrs.role_ability || item.role_ability,
    creator_name: attrs.creator_name || item.creator_name,
    updated_at: attrs.updated_at || item.updated_at,
    created_at: attrs.created_at || item.created_at
  };
};

export const api = {
  auth: {
    register: async (data: any): Promise<{ user: User, token: string }> => {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data)
      });
      
      const rawData = await safeParseJson(response);

      if (!response.ok) throw new Error(rawData.status?.message || rawData.message || 'Registration failed');

      let user = rawData.data || rawData.user || rawData;
      let token = response.headers.get('Authorization') || rawData.token;
      
      if (token && !token.startsWith('Bearer ')) token = `Bearer ${token}`;

      localStorage.setItem('ecolocal_token', token || '');
      localStorage.setItem('ecolocal_user', JSON.stringify(user));
      
      return { user, token: token || '' };
    },
    login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ user: { email, password } })
      });
      
      const rawData = await safeParseJson(response);

      if (!response.ok) throw new Error(rawData.status?.message || rawData.message || 'Login failed');

      let user = rawData.data || rawData.user || rawData;
      let token = response.headers.get('Authorization') || rawData.token;
      
      if (token && !token.startsWith('Bearer ')) token = `Bearer ${token}`;

      localStorage.setItem('ecolocal_token', token || '');
      localStorage.setItem('ecolocal_user', JSON.stringify(user));
      
      return { user, token: token || '' };
    },
    logout: async () => {
      try {
        await request('/logout', { method: 'DELETE' });
      } catch (e) {}
      localStorage.removeItem('ecolocal_token');
      localStorage.removeItem('ecolocal_user');
    }
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      try {
        const json = await request('/dashboard_stats');
        return json.data || json;
      } catch (e) {
        return { products_count: 0, categories_count: 0, units_count: 0, users_count: 0 };
      }
    }
  },

  units: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<UnitOfMeasurement>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_code_or_abbreviation_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/unit_of_measurements?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    searchLite: async (q: string): Promise<{id: string, name: string}[]> => {
      const json = await request(`/unit_of_measurements/unit_of_measurement_list?q=${encodeURIComponent(q)}`);
      return json.data || [];
    },
    create: async (data: Partial<UnitOfMeasurement>) => {
      const json = await request('/unit_of_measurements', { method: 'POST', body: JSON.stringify({ unit_of_measurement: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<UnitOfMeasurement>) => {
      const json = await request(`/unit_of_measurements/${id}`, { method: 'PATCH', body: JSON.stringify({ unit_of_measurement: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/unit_of_measurements/${id}`, { method: 'DELETE' });
    }
  },

  products: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10, status?: string, type?: string): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_code_cont]', query);
      if (sort) params.append('q[s]', sort);
      if (status) params.append('q[status_product_eq]', status);
      if (type) params.append('q[product_type_eq]', type);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/products?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    get: async (id: string): Promise<Product> => {
      const json = await request(`/products/${id}`);
      return mapAttributes(json.data || json);
    },
    create: async (data: Partial<Product>) => {
      const json = await request('/products', { method: 'POST', body: JSON.stringify({ product: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<Product>) => {
      const json = await request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify({ product: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/products/${id}`, { method: 'DELETE' });
    },
    product_list: async (q: string = ''): Promise<{id: string, name: string}[]> => {
      const json = await request(`/products/product_list?q=${encodeURIComponent(q)}`);
      return json.data || [];
    }
  },

  categories: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Category>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_sku_or_description_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/categories?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    searchLite: async (q: string): Promise<{id: string, name: string}[]> => {
      const json = await request(`/categories/category_list?q=${encodeURIComponent(q)}`);
      return json.data || [];
    },
    create: async (data: Partial<Category>) => {
      const json = await request('/categories', { method: 'POST', body: JSON.stringify({ category: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<Category>) => {
      const json = await request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ category: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/categories/${id}`, { method: 'DELETE' });
    }
  },

  users: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10, roleName?: string): Promise<PaginatedResponse<User>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_email_cont]', query);
      if (roleName) params.append('q[role_name_eq]', roleName);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/users?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    getProfile: async (): Promise<User> => {
      // Fetch specifically using the /profile endpoint
      const json = await request('/users/profile');
      return mapAttributes(json.data || json);
    },
    updateProfile: async (id: string, data: any) => {
      // Use PATCH /users/:id for profile/security updates as per instruction
      const json = await request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ user: data }) });
      const mapped = mapAttributes(json.data || json);
      if (mapped) {
        localStorage.setItem('ecolocal_user', JSON.stringify(mapped));
      }
      return mapped;
    },
    changePassword: async (id: string, data: any) => {
      // PUT /api/v1/users/:id/change_password
      const json = await request(`/users/${id}/change_password`, { 
        method: 'PUT', 
        body: JSON.stringify({ user: data }) 
      });
      return json;
    },
    create: async (data: any) => {
      const json = await request('/users', { method: 'POST', body: JSON.stringify({ user: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: any) => {
      const json = await request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ user: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/users/${id}`, { method: 'DELETE' });
    }
  },

  roles: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Role>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/roles?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    role_list: async (): Promise<Role[]> => {
        const json = await request('/roles/role_list');
        return (json.data || []).map(mapAttributes);
    },
    get: async (id: string): Promise<Role> => {
      const json = await request(`/roles/${id}`);
      return mapAttributes(json.data || json);
    },
    create: async (data: any) => {
        const json = await request('/roles', { method: 'POST', body: JSON.stringify({ role: data }) });
        return mapAttributes(json.data || json);
    },
    update: async (id: string, data: any) => {
        const json = await request(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify({ role: data }) });
        return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
        await request(`/roles/${id}`, { method: 'DELETE' });
    }
  },
  provinces: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Province>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_code_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/provinces?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    create: async (data: Partial<Province>) => {
      const json = await request('/provinces', { method: 'POST', body: JSON.stringify({ province: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<Province>) => {
      const json = await request(`/provinces/${id}`, { method: 'PATCH', body: JSON.stringify({ province: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/provinces/${id}`, { method: 'DELETE' });
    },
    province_list: async (q: string = ''): Promise<Province[]> => {
      const json = await request(`/provinces/province_list?q=${encodeURIComponent(q)}`);
      return (json.data || []).map(mapAttributes);
    }
  },
  cities: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<City>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_code_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/cities?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    create: async (data: Partial<City>) => {
      const json = await request('/cities', { method: 'POST', body: JSON.stringify({ city: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<City>) => {
      const json = await request(`/cities/${id}`, { method: 'PATCH', body: JSON.stringify({ city: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/cities/${id}`, { method: 'DELETE' });
    },
    city_list: async (q: string = ''): Promise<City[]> => {
      const json = await request(`/cities/city_list?q=${encodeURIComponent(q)}`);
      return (json.data || []).map(mapAttributes);
    }
  },
  branches: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Branch>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_code_cont]', query);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/branches?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    create: async (data: Partial<Branch>) => {
      const json = await request('/branches', { method: 'POST', body: JSON.stringify({ branch: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<Branch>) => {
      const json = await request(`/branches/${id}`, { method: 'PATCH', body: JSON.stringify({ branch: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/branches/${id}`, { method: 'DELETE' });
    },
    branch_list: async (q: string = ''): Promise<Branch[]> => {
      const json = await request(`/branches/branch_list?q=${encodeURIComponent(q)}`);
      return (json.data || []).map(mapAttributes);
    }
  },
  customers: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10, membership?: string): Promise<PaginatedResponse<Customer>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[name_or_email_or_phone_cont]', query);
      if (membership) params.append('q[membership_eq]', membership);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/customers?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    get: async (id: string): Promise<Customer> => {
      const json = await request(`/customers/${id}`);
      return mapAttributes(json.data || json);
    },
    create: async (data: Partial<Customer>) => {
      const json = await request('/customers', { method: 'POST', body: JSON.stringify({ customer: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<Customer>) => {
      const json = await request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify({ customer: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/customers/${id}`, { method: 'DELETE' });
    }
  },
  stock_products: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10, branchId?: string): Promise<PaginatedResponse<StockProduct>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[product_name_cont]', query);
      if (branchId) params.append('q[branch_id_eq]', branchId);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/stock_products?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    get: async (id: string): Promise<StockProduct> => {
      const json = await request(`/stock_products/${id}`);
      return mapAttributes(json.data || json);
    },
    create: async (data: Partial<StockProduct>) => {
      const json = await request('/stock_products', { method: 'POST', body: JSON.stringify({ stock_product: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<StockProduct>) => {
      const json = await request(`/stock_products/${id}`, { method: 'PATCH', body: JSON.stringify({ stock_product: data }) });
      return mapAttributes(json.data || json);
    },
    delete: async (id: string) => {
      await request(`/stock_products/${id}`, { method: 'DELETE' });
    }
  },
  adjustment_products: {
    list: async (query?: string, sort?: string, page: number = 1, perPage: number = 10, branchId?: string): Promise<PaginatedResponse<AdjustmentProduct>> => {
      const params = new URLSearchParams();
      if (query) params.append('q[description_cont]', query);
      if (branchId) params.append('q[branch_id_eq]', branchId);
      if (sort) params.append('q[s]', sort);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      const json = await request(`/adjustment_products?${params.toString()}`);
      return { data: (json.data || []).map(mapAttributes), meta: json.meta };
    },
    get: async (id: string): Promise<AdjustmentProduct> => {
      const json = await request(`/adjustment_products/${id}`);
      return mapAttributes(json.data || json);
    },
    create: async (data: Partial<AdjustmentProduct>) => {
      const json = await request('/adjustment_products', { method: 'POST', body: JSON.stringify({ adjustment_product: data }) });
      return mapAttributes(json.data || json);
    },
    update: async (id: string, data: Partial<AdjustmentProduct>) => {
      const json = await request(`/adjustment_products/${id}`, { method: 'PATCH', body: JSON.stringify({ adjustment_product: data }) });
      return mapAttributes(json.data || json);
    },
    approve: async (id: string) => {
      const json = await request(`/adjustment_products/${id}/approve`, { method: 'POST' });
      return mapAttributes(json.data || json);
    },
    checkStockItem: async (branchId: string, productId: string, quantity: number, adjustmentType: string) => {
      const params = new URLSearchParams();
      params.append('branch_id', branchId);
      params.append('product_id', productId);
      params.append('quantity', quantity.toString());
      params.append('adjustment_type', adjustmentType);
      return await request(`/adjustment_products/check_stock_item?${params.toString()}`);
    },
    delete: async (id: string) => {
      await request(`/adjustment_products/${id}`, { method: 'DELETE' });
    }
  }
};
