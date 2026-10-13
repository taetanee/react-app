import axios from 'axios';

const BASE_URL = 'https://api.mypad.kr/weddingPlatform';
const TOKEN_KEY = 'wedding_platform_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { 'X-Auth-Token': token } : {};
}

function unwrap(response) {
  const data = response.data || {};
  if (data.result_code) {
    throw new Error(data.result_msg || '요청 처리 중 오류가 발생했습니다.');
  }
  return data.result;
}

function friendlyError(error) {
  if (error.response) {
    const msg = error.response.data?.result_msg;
    return new Error(msg || '서버와 통신 중 오류가 발생했습니다.');
  }
  return error;
}

export async function login(loginId, password) {
  try {
    const res = await axios.post(`${BASE_URL}/login`, { loginId, password });
    const result = unwrap(res);
    setToken(result.token);
    return result.customer;
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function logout() {
  try {
    await axios.post(`${BASE_URL}/logout`, {}, { headers: authHeaders() });
  } catch (e) {
    // 로그아웃은 실패해도 토큰은 지운다
  }
  clearToken();
}

export async function getMe() {
  try {
    const res = await axios.get(`${BASE_URL}/me`, { headers: authHeaders() });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function saveInvite(content) {
  try {
    const res = await axios.put(`${BASE_URL}/invite`, content, { headers: authHeaders() });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function getInvitePublic(slug) {
  try {
    const res = await axios.get(`${BASE_URL}/invite/public`, { params: { slug } });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function saveVideo(content) {
  try {
    const res = await axios.put(`${BASE_URL}/video`, content, { headers: authHeaders() });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function getVideoPublic(slug) {
  try {
    const res = await axios.get(`${BASE_URL}/video/public`, { params: { slug } });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function uploadImage(file) {
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post(`${BASE_URL}/upload`, form, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    const result = unwrap(res);
    return `https://api.mypad.kr${result.url}`;
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function createOrder(param) {
  try {
    const res = await axios.post(`${BASE_URL}/orders`, param, { headers: authHeaders() });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function listMyOrders() {
  try {
    const res = await axios.get(`${BASE_URL}/orders`, { headers: authHeaders() });
    return unwrap(res) || [];
  } catch (e) {
    throw friendlyError(e);
  }
}

export async function adminCreateCustomer(adminKey, param) {
  try {
    const res = await axios.post(`${BASE_URL}/admin/customers`, param, {
      headers: { 'X-Admin-Key': adminKey },
    });
    return unwrap(res);
  } catch (e) {
    throw friendlyError(e);
  }
}
