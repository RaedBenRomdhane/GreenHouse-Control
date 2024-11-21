// sharedData.ts

let url: string = 'http://4.233.148.168:80';

export const setUrl = (newUrl: string) => {
  url = newUrl;
};

export const getUrl = () => url;
