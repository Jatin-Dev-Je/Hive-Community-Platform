import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchThreads = async (params = {}) => {
  const response = await axios.get(`${API_URL}/threads`, { params });
  return response.data;
};

export const createThread = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/threads`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
