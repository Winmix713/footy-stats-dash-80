import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend the Axios config interface to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId: string;
    startTime: number;
  };
}

import { getApiConfig, API_ENDPOINTS } from './apiConfig';
import { apiLogger } from './apiLogger';
import { validateApiResponse, type ApiResponse } from '../schemas/footballSchemas';

export class ApiClient {
  private client: AxiosInstance;
  private config = getApiConfig();

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        const requestId = Math.random().toString(36).substr(2, 9);
        config.metadata = { requestId, startTime: Date.now() };
        
        apiLogger.info(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
          { params: config.params, requestId },
          'request'
        );
        return config;
      },
      (error) => {
        apiLogger.error('Request interceptor error', error, 'request');
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as ExtendedAxiosRequestConfig;
        const duration = config.metadata?.startTime ? Date.now() - config.metadata.startTime : 0;
        const requestId = config.metadata?.requestId;
        
        apiLogger.info(
          `API Response: ${response.status} ${response.config.url} (${duration}ms)`,
          { status: response.status, requestId },
          'response'
        );
        return response;
      },
      (error: AxiosError) => {
        const config = error.config as ExtendedAxiosRequestConfig | undefined;
        const duration = config?.metadata?.startTime ? 
          Date.now() - config.metadata.startTime : 0;
        const requestId = config?.metadata?.requestId;
        
        apiLogger.error(
          `API Error: ${error.response?.status || 'NETWORK'} ${error.config?.url} (${duration}ms)`,
          { 
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
            requestId
          },
          'response'
        );
        return Promise.reject(error);
      }
    );
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = this.config.retryAttempts,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Only retry on network errors or 5xx status codes
        if (axios.isAxiosError(error)) {
          const shouldRetry = !error.response || 
            (error.response.status >= 500 && error.response.status < 600);
          
          if (!shouldRetry) {
            break;
          }
        }

        apiLogger.warn(
          `Retrying request (attempt ${attempt}/${maxRetries})`,
          { error: error.message },
          'retry'
        );

        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.post<T>(url, data);
      return response.data;
    });
  }

  async fetchFootballData(params: Record<string, string> = {}): Promise<ApiResponse> {
    try {
      const data = await this.get(API_ENDPOINTS.FOOTBALL_DATA, params);
      return validateApiResponse(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        apiLogger.error('Football API request failed', {
          status: error.response?.status,
          message: errorMessage,
          params
        }, 'api');
        
        throw new Error(`Football API Error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.get(API_ENDPOINTS.HEALTH_CHECK);
    } catch (error) {
      apiLogger.error('Health check failed', error, 'health');
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
