export interface MunicipalityConfig {
  slug: string
  name: string
  province: string
  recordId: string
  dataPath: string
  repository: string
  withheldDatasets: readonly string[]
  officialUrl: string
  citizensCharterUrl: string
  defaultLocale: 'en' | 'fil'
  sourceIds: Record<'about' | 'charter' | 'executive' | 'legislative' | 'psgc' | 'population' | 'competitiveness' | 'fdp' | 'fiscal' | 'audit' | 'procurement', string>
  mapView: { center: readonly [number, number]; zoom: number }
  transparency: {
    searchHost: string
    searchKey: string
    procurementOrganization: string
    procurementDashboard: string
    dpwhDashboard: string
  }
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
  slug: 'pililla', name: 'Pililla', province: 'Rizal', recordId: 'ph:rizal:pililla',
  dataPath: 'data', repository: 'https://github.com/edmvidanes/betterpililla',
  withheldDatasets: ['services', 'sector-inventory', 'ordinances', 'resolutions', 'research-updates'],
  officialUrl: 'https://pilillarizal.gov.ph/', defaultLocale: 'en',
  citizensCharterUrl: 'https://pilillarizal.gov.ph/wp-content/uploads/2025/06/Pililla_CC_2024.pdf',
  // Approximate OSM town center; map orientation only, not an official boundary.
  mapView: { center: [121.315, 14.48], zoom: 13 },
  sourceIds: {
    about: 'pililla-about', charter: 'pililla-citizens-charter',
    executive: 'pililla-executive-directory', legislative: 'pililla-legislative-directory',
    psgc: 'psa-psgc-pililla', population: 'psa-2024-openstat', competitiveness: 'dti-cmci-pililla',
    fdp: 'dilg-fdp', fiscal: 'blgf-fiscal-data', audit: 'coa-annual-audits', procurement: 'philgeps-pililla-award-lead',
  },
  transparency: {
    // BetterGov PH shared search (same public search-only key BetterLB ships).
    searchHost: 'https://search2.bettergov.ph',
    searchKey: '307c9f43a066a443cc37d62b45fa47fde2b39f765139dd964ea151daed65f55c',
    procurementOrganization: 'MUNICIPALITY OF PILILLA, RIZAL',
    procurementDashboard: 'https://transparency.bettergov.ph/organizations/',
    dpwhDashboard: 'https://transparency.bettergov.ph/dpwh',
  },
  homepagePhotos: [{
    src: 'images/pililla/windfarm.jpg', width: 1920, height: 1281,
    title: 'Pililla Windfarm',
    alt: { en: 'Wind turbines across the green hills of Pililla, Rizal', fil: 'Mga wind turbine sa luntiang burol ng Pililla, Rizal' },
    author: 'Froi Rivera', source: 'https://commons.wikimedia.org/wiki/File:Pililla_Windfarm.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  }], demographicsPhotos: [],
}
