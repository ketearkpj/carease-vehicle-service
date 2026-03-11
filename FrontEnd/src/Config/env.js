// Vite-safe environment access helper.
const env = import.meta.env || {};

export const getEnv = (key, fallback = undefined) => {
  if (Object.prototype.hasOwnProperty.call(env, key) && env[key] !== undefined) {
    return env[key];
  }

  // Backward compatibility: REACT_APP_FOO -> VITE_FOO
  if (key.startsWith('REACT_APP_')) {
    const viteKey = `VITE_${key.slice('REACT_APP_'.length)}`;
    if (Object.prototype.hasOwnProperty.call(env, viteKey) && env[viteKey] !== undefined) {
      return env[viteKey];
    }
  }

  return fallback;
};

export const IS_DEV = Boolean(env.DEV);

