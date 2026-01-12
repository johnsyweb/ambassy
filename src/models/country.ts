export interface Country {
  url: string | null;
  bounds: [number, number, number, number];
}

export type CountryMap = {
  [key: string]: Country;
};

export const countries: CountryMap = {
  "0": { url: null, bounds: [-141.002, -47.29, 153.639, 83.1132] },
  "1": { url: "www.parkrun.org.uk", bounds: [-8.61772, 49.9029, 1.76891, 59.3608] },
  "2": { url: "www.parkrun.us", bounds: [-124.733, 24.5439, -66.9492, 49.3845] },
  "3": { url: "www.parkrun.ca", bounds: [-141.002, 41.6766, -52.6191, 83.1132] },
  "4": { url: "www.parkrun.co.za", bounds: [16.4519, -34.8342, 32.945, -22.125] },
  "5": { url: "www.parkrun.com.de", bounds: [5.86632, 47.2701, 15.0418, 55.0584] },
  "6": { url: "www.parkrun.fr", bounds: [-5.14128, 41.3646, 9.56009, 51.089] },
  "7": { url: "www.parkrun.it", bounds: [6.62662, 36.6441, 18.5204, 47.0918] },
  "8": { url: "www.parkrun.co.nz", bounds: [166.724, -47.29, -180, -34.3928] },
  "9": { url: "www.parkrun.pl", bounds: [14.1229, 49.002, 24.1458, 54.8358] },
  "10": { url: "www.parkrun.se", bounds: [11.1095, 55.3374, 24.1552, 69.06] },
  "11": { url: "www.parkrun.no", bounds: [4.64182, 57.9799, 31.0637, 71.1855] },
  "12": { url: "www.parkrun.dk", bounds: [8.07251, 54.5591, 15.157, 57.3282] },
  "13": { url: "www.parkrun.com.au", bounds: [112.921, -43.6432, 153.639, -10.0591] },
  "14": { url: "www.parkrun.ie", bounds: [-10.48, 51.4475, -5.99805, 55.3829] },
  "15": { url: "www.parkrun.fi", bounds: [20.5486, 59.8078, 31.5867, 70.0923] },
  "16": { url: "www.parkrun.co.nl", bounds: [3.35838, 50.7504, 7.2275, 53.5157] },
  "17": { url: "www.parkrun.sg", bounds: [103.606, 1.21065, 104.044, 1.47077] },
  "18": { url: "www.parkrun.my", bounds: [99.6407, 0.855001, 119.27, 7.36334] },
  "19": { url: "www.parkrun.jp", bounds: [122.934, 24.2552, 145.817, 45.523] },
  "20": { url: "www.parkrun.co.at", bounds: [9.53095, 46.3727, 17.1621, 49.0212] }
};