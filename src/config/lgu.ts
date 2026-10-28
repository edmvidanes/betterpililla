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
    licenseUrl?: string
  }[]
  demographicsPhotos: MunicipalityConfig['homepagePhotos']
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
    {
      src: 'images/cavinti/cavinti-arch.webp', width: 1200, height: 900,
      title: 'Cavinti Harvest Festival welcome arch',
      alt: { en: 'A Harvest Festival welcome arch at Cavinti Bridge I.', fil: 'Arko ng pagbati para sa Harvest Festival sa Cavinti Bridge I.' },
      author: 'Ramon FVelasquez', source: 'https://commons.wikimedia.org/wiki/File:Cavinti,Lagunajf7841_11.JPG',
      license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      src: 'images/cavinti/bumbungan-river.webp', width: 1200, height: 900,
      title: 'Bumbungan River · Cavinti Bridge I',
      alt: { en: 'The Bumbungan River near Cavinti Bridge I.', fil: 'Ang Ilog Bumbungan malapit sa Cavinti Bridge I.' },
      author: 'Ramon FVelasquez', source: 'https://commons.wikimedia.org/wiki/File:Cavinti,Lagunajf7871_01.JPG',
      license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      src: 'images/cavinti/cavinti-church.webp', width: 1200, height: 900,
      title: 'Transfiguration of Our Lord Parish Church',
      alt: { en: 'The stone facade of Cavinti Church framed by trees.', fil: 'Ang batong harapan ng Simbahan ng Cavinti na napapaligiran ng mga puno.' },
      author: 'Ramon FVelasquez', source: 'https://commons.wikimedia.org/wiki/File:Cavinti,LagunaChurchjf8041_01.JPG',
      license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      src: 'images/cavinti/municipal-hall.webp', width: 1200, height: 900,
      title: 'Cavinti Municipal Hall',
      alt: { en: 'Cavinti Municipal Hall with yellow flags in front.', fil: 'Munisipyo ng Cavinti na may mga dilaw na bandila sa harapan.' },
      author: 'Ramon FVelasquez', source: 'https://commons.wikimedia.org/wiki/File:Cavinti,Lagunajf_8182_04.JPG',
      license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      src: 'images/cavinti/lumot-lake.webp', width: 1200, height: 900,
      title: 'Lumot Lake',
      alt: { en: 'The wooded shore of Lumot Lake in Cavinti.', fil: 'Baybayin ng Lawa ng Lumot sa Cavinti na may mga puno.' },
      author: 'Judgefloro', source: 'https://commons.wikimedia.org/wiki/File:133Lumot,_Cavinti,_Laguna_36.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      src: 'images/cavinti/japanese-memorial-garden.webp', width: 1200, height: 900,
      title: 'Japanese Memorial Garden',
      alt: { en: 'A memorial surrounded by trees at the Japanese Memorial Garden in Cavinti.', fil: 'Isang bantayog na napapaligiran ng mga puno sa Japanese Memorial Garden sa Cavinti.' },
      author: 'Judgefloro', source: 'https://commons.wikimedia.org/wiki/File:9812Japanese_Memorial_Garden,_Cavinti_34.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      src: 'images/cavinti/bumbungan-ecopark.webp', width: 1200, height: 900,
      title: 'Bumbungan Eco-Park',
      alt: { en: 'Visitors at the river and low cascade in Bumbungan Eco-Park.', fil: 'Mga bisita sa ilog at mababang talon sa Bumbungan Eco-Park.' },
      author: 'Judgefloro', source: 'https://commons.wikimedia.org/wiki/File:38Tibatib_Poblacion,_Cavinti,_Laguna_27.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      src: 'images/cavinti/caluycoy-bridge.webp', width: 1200, height: 900,
      title: 'Caluycoy Bridge',
      alt: { en: 'The roadway and striped railing of Caluycoy Bridge in Cavinti.', fil: 'Daan at guhit-guhit na barandilya ng Caluycoy Bridge sa Cavinti.' },
      author: 'Judgefloro', source: 'https://commons.wikimedia.org/wiki/File:147Duhat_Poblacion,_Cavinti,_Laguna_42.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  ],
  demographicsPhotos: [
    {
      src: 'images/cavinti/caliraya-shore.webp', width: 960, height: 720,
      title: 'Caliraya Lake · Kanluran Talaongan',
      alt: { en: 'Caliraya Lake at Kanluran Talaongan, Cavinti.', fil: 'Lawa ng Caliraya sa Kanluran Talaongan, Cavinti.' },
      author: 'Judgefloro', source: 'https://commons.wikimedia.org/wiki/File:9720Kanluran_Talaongan,_Cavinti,_Laguna_09.jpg',
      license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      src: 'images/cavinti/cavinti-cave.webp', width: 640, height: 428,
      title: 'Cavinti Underground River and Caves Complex',
      alt: { en: 'Rock formations and daylight inside a cave in Cavinti.', fil: 'Mga batong hugis at liwanag sa loob ng kuweba sa Cavinti.' },
      author: 'Cavinti Underground River and Caves Complex',
      source: 'https://cavintiunderground.wixsite.com/cavinticave',
      license: 'Used with permission',
    },
    {
      src: 'images/cavinti/sambalilo-festival.webp', width: 1200, height: 800,
      title: 'Sambalilo Festival',
      alt: { en: 'Performers dance at the Sambalilo Festival in Cavinti.', fil: 'Mga mananayaw sa Sambalilo Festival sa Cavinti.' },
      author: 'Cavinti Tourism',
      source: 'https://www.thefilipinorambler.com/2025/02/cavinti-laguna-a-journey-into-the-art-of-sambalilo-weaving-and-beyond.html',
      license: 'Used with permission',
    },
  ],
}
