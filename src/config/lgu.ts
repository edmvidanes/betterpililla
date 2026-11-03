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
  dataPath: 'data', repository: 'https://github.com/betterpililla/betterpililla',
  officialUrl: 'https://pilillarizal.gov.ph/', defaultLocale: 'en',
  // Approximate OSM town center; map orientation only, not an official boundary.
  mapView: { center: [121.315, 14.48], zoom: 13 },
  sourceIds: {
    about: 'pililla-about', charter: 'pililla-citizens-charter',
    executive: 'pililla-executive-directory', legislative: 'pililla-legislative-directory',
    psgc: 'psa-psgc-pililla', population: 'philatlas-pililla', competitiveness: 'dti-cmci-pililla',
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
  homepagePhotos: [], demographicsPhotos: [],
}
