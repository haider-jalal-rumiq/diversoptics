/** Small RFC 4180 parser used for inventory drafts; supports quotes and CRLF. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function csvRowsToRecords(rows: string[][]) {
  const [rawHeaders, ...dataRows] = rows;
  if (!rawHeaders) throw new Error("The CSV is empty.");
  const headers = rawHeaders.map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim().toLowerCase(),
  );
  const duplicate = headers.find(
    (header, index) => headers.indexOf(header) !== index,
  );
  if (duplicate) throw new Error(`Duplicate CSV header: ${duplicate}.`);

  return dataRows.map((values, rowIndex) => ({
    rowNumber: rowIndex + 2,
    values: Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
    ),
  }));
}
