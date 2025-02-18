import { originWhiteList } from "./originWhiteList";

export const corsOrigin = {
  origin: (origin: any, callback: any) => {
    if (originWhiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};
