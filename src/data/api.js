
const BASE_URL = import.meta.env.VITE_API_ENDPOINT;

class UnauthorizedError extends Error {};

const apiClient = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  console.debug(`${options.method || 'GET'} ${endpoint}: ${response.status}`);

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

const getSession = () => apiClient('/session');

const postSession = (user, password) =>
  apiClient('/session', {
    method: 'POST',
    body: JSON.stringify({ user, password }),
  });

const deleteSession = () => apiClient('/session', { method: 'DELETE' });

const getAccountSummary = () => apiClient('/accountSummary');

const setAccount = (account) =>
  apiClient('/account', {
    method: 'PUT',
    body: JSON.stringify(account),
  });




// const getAccountSummary = async () => {
//   try {
//     const response = await fetch(`${BASE_URL}/accountSummary`, {
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       credentials: 'include',
//     });

//     console.debug(`GET accountSummary response: ${response.status}`);

//     if (response.ok) {
//       const data = await response.json();
//       // console.debug(`GET accountSummary data: ${JSON.stringify(data)}`);
//       return data;
//     } else {
//       throw new Response(null, { status: response.status });
//     }
//   } catch (error) {
//     console.error('Error in getAccountSummary: ', error);
//     throw error;
//   }
// };

// NOTE: trying alt error handling...
// const setAccount = async (account) => {

//   // if (true) throw new Error('000 Test Error');

//   const body = JSON.stringify(account);
//   const response = await fetch(`${BASE_URL}/account`, {
//     method: 'PUT',
//     body,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     credentials: 'include',
//   });

//   console.debug(`PUT setAccount response: ${response.status}`);

//   if (!response.ok) {
//     if (response.status === 401 || response.status === 403) {
//       throw new UnauthorizedError(`${response.status} ${response.statusText}`);
//     }
//     throw new Error(`${response.status} ${response.statusText}`)
//   }
// };

export {
  getSession,
  deleteSession,
  postSession,
  getAccountSummary,
  setAccount,
  UnauthorizedError,
}