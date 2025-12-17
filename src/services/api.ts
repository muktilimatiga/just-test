import axios from 'axios';
import type { AxiosRequestConfig, AxiosError } from 'axios';

// Base API configuration
export const API_BASE_URL = 'http://localhost:8001';

export const AXIOS_INSTANCE = axios.create({ 
  baseURL: API_BASE_URL 
});

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// Generic type error wrapper for use by Orval if needed
export type ErrorType<Error> = AxiosError<Error>;
