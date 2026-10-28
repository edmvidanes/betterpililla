// Portrait URLs were matched to the named cards on the municipal directories on 2026-10-28.
// The contact page states: “All content is in the public domain unless otherwise stated.”
// No photographer credit or individual rights notice was visible in the directory markup;
// the images have not been copied or individually inspected for embedded rights metadata.
export const portraitCaptureDate = '2026-10-28'
export const portraitRightsUrl = 'https://www.cavinti-egov.com/contact'
export const officialPortraits: Record<string, string> = {
  'cavinti-executive-arrantlee-romulo-arroyo': '686dd7f8ed04cDPZ_3975-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-milbert-oliveros': '686dd7ce69fddAMC_3469-Edit-Edit-Edit-Edit-Edit-Edit%20(2).jpg',
  'cavinti-council-jovenil-gordula': '68635716a3459AMC_3496-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-glenn-cabuhat': '686dd7a4613bdAMC_3424-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-godfrey-lubuguin': '686dd790eedb8AMC_3449-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-habshan-blastique': '686dd778dec35Layer%2021%20copy2.jpg',
  'cavinti-council-jose-mari-esguerra': '6863578f30391AMC_3503-Edit-Edit-Edit%20(2).jpg',
  'cavinti-council-joseph-baltazar': '6863574b29e7aAMC_3489-Edit-Edit-Edit%20(2).jpg',
  'cavinti-council-romel-villanueva': '686479ee075f5AMC_3413-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-limron-sanchez': '686479501d9a0AMC_3438-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-manuel-dela-roca': '686ddbc21aa4dAMC_3397-Edit-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-melandro-lope': '6863562f2b4f0AMC_3515-Edit-Edit-Edit%20(1).jpg',
  'cavinti-council-nitzshell-torres-dela-torre': '686dd80a51e03AMC_3460-Edit-Edit-Edit-Edit%20(1).jpg',
}
export function portraitUrl(recordId: string) {
  const filename = officialPortraits[recordId]
  return filename ? `https://www.cavinti-egov.com/author_images/${filename}` : null
}
