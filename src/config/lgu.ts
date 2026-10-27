export interface MunicipalityConfig {
  slug: string
  name: string
  province: string
  recordId: string
  dataPath: string
  repository: string
  officialUrl: string
  defaultLocale: 'en' | 'fil'
  sourceIds: Record<'about' | 'charter' | 'executive' | 'legislative' | 'psgc' | 'population' | 'competitiveness' | 'fdp' | 'fiscal' | 'audit' | 'procurement', string>
  mapView: { center: readonly [number, number]; zoom: number }
  homepagePhotos: {
    src: string
    width: number
    height: number
    title: string
    alt: Record<'en' | 'fil', string>
    author: string
    source: string
    license: string
    licenseUrl: string
  }[]
}

export const lgu: MunicipalityConfig = {
  slug: 'cavinti', name: 'Cavinti', province: 'Laguna', recordId: 'ph:laguna:cavinti',
  dataPath: 'data', repository: 'https://github.com/klnwlks/bettercavinti',
  officialUrl: 'https://www.cavinti-egov.com/', defaultLocale: 'en',
  // Approximate OSM town center; map orientation only, not an official boundary.
  mapView: { center: [121.5070018, 14.2453833], zoom: 14 },
  sourceIds: {
    about: 'cavinti-about', charter: 'cavinti-citizens-charter',
    executive: 'cavinti-executive-directory', legislative: 'cavinti-legislative-directory',
    psgc: 'psa-psgc-cavinti', population: 'philatlas-cavinti', competitiveness: 'dti-cmci-cavinti',
    fdp: 'dilg-fdp', fiscal: 'blgf-fiscal-data', audit: 'coa-annual-audits', procurement: 'philgeps-cavinti-award-lead',
  },
  homepagePhotos: [
    {
      src: 'images/cavinti/caliraya-lake.webp', width: 1280, height: 960,
      title: 'Caliraya Lake · Kanluran Talaongan',
      alt: { en: 'Caliraya Lake and its wooded shore at Kanluran Talaongan, Cavinti.', fil: 'Lawa ng Caliraya at ang baybaying may mga puno sa Kanluran Talaongan, Cavinti.' },
      author: 'Judgefloro',
      source: 'https://commons.wikimedia.org/wiki/File:9720Kanluran_Talaongan,_Cavinti,_Laguna_10.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      src: 'images/cavinti/cavinti-falls.webp', width: 640, height: 640,
      title: 'Cavinti Falls / Pagsanjan Falls',
      alt: { en: 'Cavinti Falls, also known as Pagsanjan Falls, viewed from a bamboo raft.', fil: 'Talon ng Cavinti, na kilala rin bilang Talon ng Pagsanjan, mula sa isang balsa.' },
      author: 'Kathleen Mae Tugano',
      source: 'https://commons.wikimedia.org/wiki/File:Pagsanjan_Falls_-_Pagsanjan,_Laguna_1.jpg',
      license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    {
      src: 'images/cavinti/cavinti-bridge.webp', width: 960, height: 720,
      title: 'Cavinti Bridge II · Tibatib',
      alt: { en: 'Cavinti Bridge II over the Bumbungan River, surrounded by trees in Tibatib.', fil: 'Cavinti Bridge II sa ibabaw ng Ilog Bumbungan, na napapalibutan ng mga puno sa Tibatib.' },
      author: 'Judgefloro',
      source: 'https://commons.wikimedia.org/wiki/File:38Tibatib_Poblacion,_Cavinti,_Laguna_08.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  ],
}
