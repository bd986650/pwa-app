// API клиент для работы с бэкендом

const BASE_URL = 'http://localhost:3000/api';

// Типы данных
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryList {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: GroceryItem[];
}

// Типы ответов API
interface AuthResponse {
  user: User;
  token: string;
}

interface UserResponse {
  user: User;
}

interface ListsResponse {
  lists: GroceryList[];
}

interface ListResponse {
  list: GroceryList;
}

interface ItemResponse {
  item: GroceryItem;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
  errors?: Array<{
    type: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

// Класс для работы с API
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('ApiClient.request:', {
      method: options.method || 'GET',
      url,
      hasToken: !!this.token,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    try {
      // Добавляем заголовки для предотвращения кеширования API запросов
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          ...headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store', // Запрещаем кеширование в браузере
      };

      const response = await fetch(url, fetchOptions);

      console.log('ApiClient.request: Ответ получен:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let error: ErrorResponse;
        try {
          error = await response.json();
        } catch (e) {
          // Если не удалось распарсить JSON, создаем базовую ошибку
          error = {
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
        console.error('ApiClient.request: Ошибка ответа:', {
          status: response.status,
          statusText: response.statusText,
          error
        });
        throw new Error(error.error || 'Ошибка запроса');
      }

      const data = await response.json();
      console.log('ApiClient.request: Успешный ответ:', data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('ApiClient.request: Исключение:', error.message);
        throw error;
      }
      console.error('ApiClient.request: Неизвестная ошибка:', error);
      throw new Error('Неизвестная ошибка при выполнении запроса');
    }
  }

  // Health Check
  async healthCheck() {
    return this.request<{ status: string }>('/health');
  }

  // Auth
  async register(email: string, password: string, name: string) {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<UserResponse>('/auth/me');
  }

  // Lists
  async getLists() {
    console.log('ApiClient.getLists: Запрос списков с', `${this.baseUrl}/lists`);
    console.log('ApiClient.getLists: Токен:', this.token ? 'присутствует' : 'отсутствует');
    
    const response = await this.request<ListsResponse>('/lists');
    console.log('ApiClient.getLists: Получено списков:', response.lists.length);
    return response;
  }

  async getList(id: string) {
    return this.request<ListResponse>(`/lists/${id}`);
  }

  async createList(data: {
    name: string;
    description?: string;
    items?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      completed?: boolean;
    }>;
  }) {
    console.log('ApiClient.createList: Отправка запроса на', `${this.baseUrl}/lists`);
    console.log('ApiClient.createList: Данные:', JSON.stringify(data, null, 2));
    console.log('ApiClient.createList: Токен:', this.token ? 'присутствует' : 'отсутствует');
    
    const response = await this.request<ListResponse>('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('ApiClient.createList: Ответ от сервера:', response);
    return response;
  }

  async updateList(id: string, data: { name?: string; description?: string }) {
    return this.request<ListResponse>(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteList(id: string) {
    return this.request<MessageResponse>(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  // Items
  async addItem(listId: string, data: { name: string; quantity?: number; unit?: string }) {
    return this.request<ItemResponse>(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(
    listId: string,
    itemId: string,
    data: { name?: string; quantity?: number; unit?: string; completed?: boolean }
  ) {
    return this.request<ItemResponse>(`/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(listId: string, itemId: string) {
    return this.request<MessageResponse>(`/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async toggleItemStatus(listId: string, itemId: string) {
    return this.request<ItemResponse>(`/lists/${listId}/items/${itemId}/toggle`, {
      method: 'PATCH',
    });
  }
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient();

