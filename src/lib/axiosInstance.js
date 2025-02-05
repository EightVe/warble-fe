import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const { config, response: { status } = {} } = error;
    const originalRequest = config;



    if (status === 401) {
      if (originalRequest.url.includes('/auth/refresh-token')) {
      
        //window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
     
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch(err => {
             
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          axiosInstance
            .post('/auth/refresh-token', {}, { withCredentials: true })
            .then(({ data }) => {
              
              axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + data.accessToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
              processQueue(null, data.accessToken);
              resolve(axiosInstance(originalRequest));
            })
            .catch(err => {
           
              processQueue(err, null);
              //window.location.href = '/login';
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
