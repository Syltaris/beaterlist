export const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`)).json();
};

export const getMapByKey = async (songKey) => {
  return await fetch(`https://beatsaver.com/api/maps/detail/${songKey}`);
};

export const getBeatSaverMapList = async (page, type = "hot") => {
  return (await fetch(`https://beatsaver.com/api/maps/${type}/${page}`)).json();
};
