"""Read-only extraction; preserve originals and keep personal FOI rows local."""
import io
import json
import sys
from pathlib import Path
from urllib.parse import urlparse
from pypdf import PdfReader
from docx import Document
from openpyxl import load_workbook

folder = Path(sys.argv[1])
report = json.loads((folder / 'report.json').read_text(encoding='utf-8'))
output = folder / 'extracted'
output.mkdir(exist_ok=True)
index = []
for record in report['captures']:
    extension = urlparse(record['url']).path.rsplit('.', 1)[-1].lower()
    if record['httpStatus'] != 200 or extension not in ('pdf', 'docx', 'xlsx'):
        continue
    data = (folder / record['file']).read_bytes()
    result = {'id': record['id'], 'url': record['url'], 'kind': extension}
    try:
        if extension == 'pdf':
            reader = PdfReader(io.BytesIO(data))
            result['pages'] = [{'page': n + 1, 'text': page.extract_text() or ''} for n, page in enumerate(reader.pages)]
            result['imageOnlyPages'] = [p['page'] for p in result['pages'] if len(p['text'].strip()) < 40]
        elif extension == 'docx':
            doc = Document(io.BytesIO(data))
            result['paragraphs'] = [p.text for p in doc.paragraphs if p.text.strip()]
            result['tables'] = [[[c.text for c in row.cells] for row in table.rows] for table in doc.tables]
        else:
            values = load_workbook(io.BytesIO(data), read_only=True, data_only=True)
            formulas = load_workbook(io.BytesIO(data), read_only=True, data_only=False)
            result['sheets'] = []
            for sheet in values:
                formula_map = {cell.coordinate: cell.value for cells in formulas[sheet.title].iter_rows() for cell in cells if cell.data_type == 'f'}
                rows = [{'row': n, 'cells': [{'cell': cell.coordinate, 'value': cell.value, 'formula': formula_map.get(cell.coordinate)} for cell in cells if cell.value is not None]} for n, cells in enumerate(sheet.iter_rows(), 1)]
                result['sheets'].append({'name': sheet.title, 'rows': [r for r in rows if r['cells']]})
        (output / (record['id'] + '.json')).write_text(json.dumps(result, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
        index.append({'id': record['id'], 'url': record['url'], 'kind': extension, 'pages': len(result.get('pages', [])), 'imageOnlyPages': result.get('imageOnlyPages', []), 'sheets': [s['name'] for s in result.get('sheets', [])]})
    except Exception as error:
        index.append({'id': record['id'], 'url': record['url'], 'error': str(error)})
(output / 'index.json').write_text(json.dumps(index, indent=2), encoding='utf-8')
print(json.dumps(index, indent=2))
