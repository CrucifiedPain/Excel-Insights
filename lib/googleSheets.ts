export const uploadToGoogleSheets = async (accessToken: string, title: string, data: Record<string, unknown>[]): Promise<string> => {
  // 1. Create a new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!createRes.ok) {
    const errorDetails = await createRes.json().catch(() => ({}));
    console.error('Create Spreadsheet Error:', errorDetails);
    throw new Error('Failed to create new Google Sheet');
  }

  const spreadSheetInfo = await createRes.json();
  const spreadsheetId = spreadSheetInfo.spreadsheetId;

  // 2. Format Data for the Spreadsheet
  // The data needs to be an array of arrays
  if (data.length === 0) {
    return spreadSheetInfo.spreadsheetUrl;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => item[header]));
  
  const values = [headers, ...rows];

  // 3. Append Data to the Spreadsheet
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: "Sheet1!A1",
      majorDimension: "ROWS",
      values: values
    }),
  });

  if (!updateRes.ok) {
    const errorDetails = await updateRes.json().catch(() => ({}));
    console.error('Update Spreadsheet Error:', errorDetails);
    throw new Error('Failed to upload data to Google Sheet');
  }

  return spreadSheetInfo.spreadsheetUrl;
};
