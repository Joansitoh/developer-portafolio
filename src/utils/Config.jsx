import configuration from "../../cfg/configuration.json";

let config = null;

const Configuration = {
  get: (key) => {
    if (!config) {
      config = configuration;
    }

    const parts = key.split(".");
    let value = config;

    for (let part of parts) {
      value = value[part];
      if (value === undefined) break;
    }
    return value;
  },
  getAll: () => {
    if (!config) {
      config = configuration;
    }
    return config;
  },
};

export default Configuration;
