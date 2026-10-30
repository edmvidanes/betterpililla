const titles: Record<string, string> = {
  'CCHATTO-CC.docx': 'Cavinti Culture, History, Arts, Trade and Tourism Office',
  'Copy of CCHATTO-CC.docx': 'Cavinti Culture, History, Arts, Trade and Tourism Office (copy)',
  'CWO-CC.docx': 'Cavinti Water Office',
  'GSO-CC.docx': 'General Services Office (GSO)',
  'HRMO-CC.docx': 'Human Resource Management Office',
  'MBO-CC.docx': 'Municipal Budget Office',
  'MDRRM-CC.docx': 'Municipal Disaster Risks Reduction and Management Office',
  'MENRO-CC.docx': 'Municipal Environment and Natural Resources Office',
  'MHO-CC.docx': 'Office of the Municipal Health Officer',
  'MPDC-CC.docx': 'Municipal Planning and Development Office',
  'MTO-CC.docx': 'Office of the Municipal Treasurer',
  'OM-CC.docx': 'Office of the Mayor',
  'OMACC-CC.docx': 'Office of the Municipal Accountant',
  'OMAD-CC.docx': 'Office of the Municipal Administrator',
  'OMAG-CC.docx': 'Office of the Municipal Agriculturist',
  'OMASS-CC.docx': 'Office of the Municipal Assessor',
  'OME-CC.docx': 'Office of the Municipal Engineer',
  'OMSWD-CC.docx': 'Municipal Social Welfare and Development Officer',
  'Copy of OMSWD-CC.docx': 'Municipal Social Welfare and Development Officer (copy)',
  'PESO-CC.docx': 'Public Employment Service Office (PESO)',
  'SB-CC.docx': 'Office of the Sangguniang Bayan',
  'FEEDBACK AND COMPLAINTS MECHANISMS-Cavinti.docx': 'Help Us Serve You Better!',
  'Annex - New Schedule of Fees and Other Charges (Building Code Fee).pdf': 'Annex A: New Schedule of Fees and Other Charges of the Revised Implementing Rules and Regulations (IRR) of the National Building Code of the Philippines (PD 1096)',
  'Annex - Tax on Business.pdf': 'Annex A: Chapter II - Taxes on Business',
}

export function charterTitles(sourceDocument: string): string {
  return sourceDocument.split('; ').map(filename => titles[filename] ?? `Document title unavailable (filename: ${filename})`).join('; ')
}
