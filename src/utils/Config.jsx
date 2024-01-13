import configuration from "../../cfg/configuration.json";

const Configuration = {
  get: (key) => {
    const parts = key.split(".");
    let value = configuration;

    for (let part of parts) {
      value = value[part];
      if (value === undefined) break;
    }
    return value;
  },
  getAll: () => configuration,
};

export default Configuration;
