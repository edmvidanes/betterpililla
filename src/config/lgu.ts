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
}

export const lgu: MunicipalityConfig = {
  slug: 'cavinti', name: 'Cavinti', province: 'Laguna', recordId: 'ph:laguna:cavinti',
  dataPath: 'data', repository: 'https://github.com/klnwlks/bettercavinti',
  officialUrl: 'https://www.cavinti-egov.com/', defaultLocale: 'en',
  sourceIds: {
    about: 'cavinti-about', charter: 'cavinti-citizens-charter',
    executive: 'cavinti-executive-directory', legislative: 'cavinti-legislative-directory',
    psgc: 'psa-psgc-cavinti', population: 'philatlas-cavinti', competitiveness: 'dti-cmci-cavinti',
    fdp: 'dilg-fdp', fiscal: 'blgf-fiscal-data', audit: 'coa-annual-audits', procurement: 'philgeps-cavinti-award-lead',
  },
}
