export const getCliParameter = (key: string) => {
  const agrvs = process.argv.slice(2);

  const value = agrvs.find((arg) => arg.startsWith(`--${key}=`));

  if (!value) {
    console.log(`⛔⛔${key} parameter is not defined in CLI arguments⛔⛔`);

    return null;
  }

  return value.split("=")[1];
};
