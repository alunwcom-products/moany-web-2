
const BASE_URL = import.meta.env.VITE_API_ENDPOINT;

class UnauthorizedError extends Error { };

// basic content-type header required for most (but not all) API requests
const JSON_HEADER = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// generic api call with error handling
const apiClient = async (endpoint, options = {}) => {
  const { params } = options;
  let paramStr = '';
  if (params) paramStr = '?' + params;
  const response = await fetch(`${BASE_URL}${endpoint}${paramStr}`, {
    signal: options.signal,
    headers: {
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new UnauthorizedError('401 Unauthorized');
    }
    if (response.status === 403) {
      throw new UnauthorizedError('403 Forbidden');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const getSession = () => apiClient('/session', JSON_HEADER);

const postSession = (user, password) =>
  apiClient('/session', {
    ...JSON_HEADER,
    method: 'POST',
    body: JSON.stringify({ user, password }),
  });

const deleteSession = () => apiClient('/session', {
  ...JSON_HEADER, method: 'DELETE'
});

const getAccountSummary = () => apiClient('/accountSummary', JSON_HEADER);

const getMonthlyTotals = () => apiClient('/monthly-totals', JSON_HEADER);

const getTransactions = (paramStr, abortController) =>
  apiClient('/transactions', {
    ...JSON_HEADER,
    params: paramStr,
    signal: abortController?.signal,
  });

const getCategories = (abortController) =>
  apiClient('/categories', {
    ...JSON_HEADER,
    //params: paramStr,
    signal: abortController?.signal,
  });

const setAccount = (account) =>
  apiClient('/account', {
    ...JSON_HEADER,
    method: 'PUT',
    body: JSON.stringify(account),
  });

const setCategory = (category) =>
  apiClient('/categories', {
    ...JSON_HEADER,
    method: 'PUT',
    body: JSON.stringify(category),
  });

const setTransaction = (transaction) =>
  apiClient('/transaction', {
    ...JSON_HEADER,
    method: 'PUT',
    body: JSON.stringify(transaction),
  });

const postStatement = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('statementType', type);
  return apiClient('/statement', {
    // no JSON_HEADER
    method: 'POST',
    body: formData,
  });
};

export {
  getSession,
  deleteSession,
  postSession,
  getAccountSummary,
  getCategories,
  getMonthlyTotals,
  getTransactions,
  setAccount,
  setCategory,
  setTransaction,
  postStatement,
  UnauthorizedError,
}