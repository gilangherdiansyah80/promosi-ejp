// utils/response.js
const response = (statusCode, datas, message) => {
  return {
    payload: {
      statusCode: statusCode,
      datas: datas,
      message: message,
    },
    pagination: {
      prev: "",
      next: "",
      max: "",
    },
  };
};

export default response;
