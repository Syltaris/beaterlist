export const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/hash/${hash}`)).json();
};

export const getMapById = async (id) => {
  return (await fetch(`https://beatsaver.com/api/maps/id/${id}`)).json();
};

export const getBeatSaverMapList = async (page, type) => {
  return (await fetch(`https://beatsaver.com/api/maps/${type}/${page}`)).json();
};

export const searchBeatSaverMapList = async (page, search) => {
  return (
    await fetch(`https://beatsaver.com/api/search/text/${page}?q=${search}`)
  ).json();
};
