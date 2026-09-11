import * as XLSX from 'xlsx';

export const exportForma2ToExcel = (
  teacher,
  selectedMonthObj,
  monthlyHours,
  calendarEvents,
  daysInMonth
) => {
  const [yearStr, monthStr] = selectedMonthObj.key.split('-');
  const currentYear = parseInt(yearStr);
  const currentMonthNum = parseInt(monthStr);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const MONTHS_KEYS = ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06'];

  // Helper to check red day (Sunday/Holiday)
  const isRedDay = (day) => {
    const dateObj = new Date(currentYear, currentMonthNum - 1, day);
    const isSunday = dateObj.getDay() === 0;
    const dateStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isHoliday = calendarEvents.some(e => e.date === dateStr && (e.category === 'bayram' || e.category === 'tatil'));
    return isSunday || isHoliday;
  };

  const getSubjectDailyHours = (mKey, subjId) => {
    const subj = teacher.subjects.find(s => s.id === subjId || s.name === subjId);
    const keyToUse = subj ? subj.id : subjId;
    const nameToUse = subj ? subj.name : subjId;

    if (monthlyHours[mKey] && (monthlyHours[mKey][keyToUse] !== undefined || monthlyHours[mKey][nameToUse] !== undefined)) {
      const record = monthlyHours[mKey][keyToUse] ?? monthlyHours[mKey][nameToUse];
      if (typeof record === 'object' && record !== null) {
        return record;
      } else if (typeof record === 'number') {
        return { 1: record };
      }
    }
    return {};
  };

  const getPreviousMonthsHours = (subjId) => {
    const selectedMonthIdx = MONTHS_KEYS.findIndex(k => k === selectedMonthObj.key);
    let total = 0;

    for (let i = 0; i < selectedMonthIdx; i++) {
      const mKey = MONTHS_KEYS[i];
      const dailyH = getSubjectDailyHours(mKey, subjId);
      Object.values(dailyH).forEach(h => total += Number(h || 0));
    }
    return total;
  };

  // Build 100% Exact HTML Table for Excel Export (Full colors, borders, red columns & layout matching screenshot)
  const htmlTableString = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Forma-2 Varaqa</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: 'Calibri', 'Times New Roman', sans-serif; font-size: 11pt; }
        th, td { border: 1px solid #000000; text-align: center; vertical-align: middle; padding: 4px; }
        .red-cell { background-color: #ef4444 !important; color: #ffffff !important; font-weight: bold; }
        .gray-cell { background-color: #475569 !important; color: #ffffff !important; font-weight: bold; }
        .title-cell { font-size: 12pt; font-weight: bold; text-align: center; border: none; }
        .header-top { text-align: right; font-weight: bold; border: none; font-size: 10pt; }
        .left-align { text-align: left; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <table border="1">
        <!-- Top Right Approval Block -->
        <tr>
          <td colspan="${daysInMonth + 5}" class="header-top" style="border:none;"><strong>&quot;Tasdiqlayman&quot;</strong></td>
        </tr>
        <tr>
          <td colspan="${daysInMonth + 5}" class="header-top" style="border:none;">${teacher.school} O'IBDO'</td>
        </tr>
        <tr>
          <td colspan="${daysInMonth + 5}" class="header-top" style="border:none;">o'rinbosari ___________${teacher.deputyHead || 'S.Abduraxmonova'}</td>
        </tr>
        <tr><td colspan="${daysInMonth + 5}" style="border:none;"></td></tr>

        <!-- Main Title -->
        <tr>
          <td colspan="${daysInMonth + 5}" class="title-cell" style="border:none;">
            <strong>${teacher.school}ning Maxsus fan o'qituvchisi ${teacher.name} ${currentYear} yil ${selectedMonthObj.name} oyi uchun o'quv jarayonida bajariladigan dars soatlarini hisobga olish varaqasi</strong>
          </td>
        </tr>
        <tr><td colspan="${daysInMonth + 5}" style="border:none;"></td></tr>

        <!-- Table Header Row 1 -->
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          <th rowspan="2" style="width:30px;">№</th>
          <th rowspan="2" style="width:240px;" class="left-align">Fanlar nomi</th>
          <th rowspan="2" style="width:65px;">Jami soat</th>
          <th colspan="${daysInMonth}">Kalendar (oy) kunlari</th>
          <th rowspan="2" style="width:50px;">jami</th>
          <th rowspan="2" style="width:60px;">Qol-<br>dars</th>
        </tr>
        <!-- Table Header Row 2 (Days 1..N) -->
        <tr style="font-weight: bold;">
          ${daysArray.map(d => `
            <th class="${isRedDay(d) ? 'red-cell' : ''}" style="width:24px;">${d}</th>
          `).join('')}
        </tr>

        <!-- Subject Rows (1 to 19 format) -->
        ${teacher.subjects.map((subj, idx) => {
          const dailyHours = getSubjectDailyHours(selectedMonthObj.key, subj.id);
          let monthSum = 0;
          daysArray.forEach(d => {
            monthSum += Number(dailyHours[d] || 0);
          });
          const prevCompleted = getPreviousMonthsHours(subj.id);
          const cumulativeTotal = prevCompleted + monthSum;
          const qoldiq = Math.max(0, Number(subj.annualHours || 0) - cumulativeTotal);

          return `
            <tr>
              <td><strong>${idx + 1}</strong></td>
              <td class="left-align"><strong>${subj.name} — ${subj.groupName || '101-Guruh'}</strong></td>
              <td class="bold">${subj.annualHours}</td>
              ${daysArray.map(d => {
                const isRed = isRedDay(d);
                if (isRed) return `<td class="red-cell"></td>`;
                const h = dailyHours[d];
                return `<td>${h || ''}</td>`;
              }).join('')}
              <td class="bold">${monthSum || 0}</td>
              <td class="bold">${qoldiq}</td>
            </tr>
          `;
        }).join('')}

        <!-- Empty Padding Rows up to 19 rows -->
        ${Array.from({ length: Math.max(0, 19 - teacher.subjects.length) }).map((_, emptyIdx) => `
          <tr>
            <td>${teacher.subjects.length + emptyIdx + 1}</td>
            <td class="left-align"></td>
            <td></td>
            ${daysArray.map(d => `<td class="${isRedDay(d) ? 'red-cell' : ''}"></td>`).join('')}
            <td></td>
            <td></td>
          </tr>
        `).join('')}

        <!-- Row 20: I-semestr qolgan soat (Gray Row) -->
        <tr class="gray-cell">
          <td><strong>20</strong></td>
          <td colspan="2" class="left-align" style="background-color:#475569; color:#fff; font-weight:bold;"><strong>I-semestr qolgan soat</strong></td>
          ${daysArray.map(d => `<td class="${isRedDay(d) ? 'red-cell' : 'gray-cell'}" style="background-color:#475569;"></td>`).join('')}
          <td colspan="2" class="gray-cell" style="background-color:#475569;"></td>
        </tr>

        <!-- Row 21: Empty Row -->
        <tr>
          <td>21</td>
          <td class="left-align"></td>
          <td></td>
          ${daysArray.map(d => `<td class="${isRedDay(d) ? 'red-cell' : ''}"></td>`).join('')}
          <td></td>
          <td></td>
        </tr>

        <!-- Row 22: Jami kunlik soatlar -->
        <tr style="font-weight: bold;">
          <td><strong>22</strong></td>
          <td colspan="2" class="left-align"><strong>Jami kunlik soatlar</strong></td>
          ${daysArray.map(d => {
            const isRed = isRedDay(d);
            if (isRed) return `<td class="red-cell"></td>`;
            let dSum = 0;
            teacher.subjects.forEach(s => {
              const dh = getSubjectDailyHours(selectedMonthObj.key, s.id);
              dSum += Number(dh[d] || 0);
            });
            return `<td>${dSum > 0 ? dSum : ''}</td>`;
          }).join('')}
          <td colspan="2"></td>
        </tr>

        <tr><td colspan="${daysInMonth + 5}" style="border:none;"></td></tr>
        <tr><td colspan="${daysInMonth + 5}" style="border:none;"></td></tr>

        <!-- Signatures Row -->
        <tr>
          <td colspan="${Math.floor(daysInMonth / 2)}" style="border:none; text-align:left; font-weight:bold;">
            im boshlig'i _______________________
          </td>
          <td colspan="${Math.ceil(daysInMonth / 2) + 5}" style="border:none; text-align:right; font-weight:bold;">
            Fan o'qituvchisi _______________________
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Create Blob & Trigger Download as Excel file (.xls / .xlsx)
  const blob = new Blob([htmlTableString], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const fileName = `Forma-2_Varaqa_${teacher.name.replace(/\s+/g, '_')}_${selectedMonthObj.name}_${currentYear}.xls`;

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
