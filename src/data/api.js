

const BASE_URL = import.meta.env.VITE_API_ENDPOINT;

const postSession = async (user, password) => {
  try {
    const body = JSON.stringify({ user, password });
    const postResponse = await fetch(`${BASE_URL}/session`, {
      method: "POST",
      body: body,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    console.debug(`POST session response: ${postResponse.status}`);

    if (postResponse.ok) {
      const data = await postResponse.json();
      console.debug(`POST session user: ${JSON.stringify(data)}`);
      return { user: data.user }; // userSession object
    } else {
      console.debug('Login failed!');
    }
  } catch (error) {
    console.error('Caught error in postSession: ', error);
  }
  return null;
};

const getSession = async () => {
  try {
    const getResponse = await fetch(`${BASE_URL}/session`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    console.debug(`GET session response [API]: ${getResponse.status}`);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.debug(`GET session user [API]: ${JSON.stringify(data)}`);
      return { user: data.user }; // userSession object
    } else {
      return null; // no userSession
    }
  } catch (error) {
    console.error('Caught error [API]: ', error);
    return null; // no userSession
  }
};

const deleteSession = async () => {
  try {
    const deleteResponse = await fetch(`${BASE_URL}/session`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
    console.debug(`DELETE session response: ${deleteResponse.status}`);
  } catch (error) {
    // catch errors but do nothing, just clear userSession
    console.error('Caught error in deleteSession: ', error);
  }
  return null; // no userSession
};

const getAccountSummary = async () => {
  try {
    const response = await fetch(`${BASE_URL}/accountSummary`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    console.debug(`GET accountSummary response: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      // console.debug(`GET accountSummary data: ${JSON.stringify(data)}`);
      return data;
    } else {
      throw new Response(null, { status: response.status });
    }
  } catch (error) {
    console.error('Error in getAccountSummary: ', error);
    throw error;
  }
};

export {
  getSession,
  deleteSession,
  postSession,
  getAccountSummary,
}