const PdfPrinter = require('pdfmake');
const { Appraisal } = require('../models/Appraisal');
const { Employee } = require('../models/Employee');
const {
  getDepartmentWiseAveragePerformance,
  getTopPerformers,
  getBiasCases,
  getOverallAverageSentiment,
} = require('./analyticsService');

// Fonts are loaded lazily — only when report is actually requested
let cachedFonts = null;
const getFonts = () => {
  if (cachedFonts) return cachedFonts;
  const vfsData = require('pdfmake/build/vfs_fonts');
  const vfs = vfsData.pdfMake ? vfsData.pdfMake.vfs : vfsData;
  cachedFonts = {
    Roboto: {
      normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
      bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
      italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
      bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
    },
  };
  return cachedFonts;
};

const DARK_BLUE = '#1F4E79';
const LIGHT_BLUE = '#D6E4F0';
const WHITE = '#FFFFFF';
const RED = '#C0392B';
const GREEN = '#1E8449';
const ORANGE = '#D68910';
const GRAY = '#F2F2F2';

const categoryColor = (cat) => {
  if (cat === 'Excellent') return GREEN;
  if (cat === 'Good') return '#2471A3';
  if (cat === 'Average') return ORANGE;
  return RED;
};

const generatePerformanceReport = async () => {
  // ── Fetch all data ──────────────────────────────────────────────
  const [departments, topPerformers, biasCases, sentimentStats] = await Promise.all([
    getDepartmentWiseAveragePerformance(),
    getTopPerformers(5),
    getBiasCases(),
    getOverallAverageSentiment(),
  ]);

  const allAppraisals = await Appraisal.find()
    .populate('employee')
    .populate('manager')
    .sort({ finalScore: -1 });

  const totalEmployees = await Employee.countDocuments();
  const totalAppraised = allAppraisals.length;

  // Performance category counts
  const categoryCounts = { Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 };
  let totalFinalScore = 0;
  for (const a of allAppraisals) {
    if (categoryCounts[a.performanceCategory] !== undefined) {
      categoryCounts[a.performanceCategory]++;
    }
    totalFinalScore += a.finalScore || 0;
  }
  const overallAvg = totalAppraised > 0 ? (totalFinalScore / totalAppraised).toFixed(2) : 0;

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // ── Helper: section header ───────────────────────────────────────
  const sectionHeader = (title) => ({
    text: title,
    style: 'sectionHeader',
    margin: [0, 18, 0, 6],
  });

  // ── 1. Executive Snapshot table ─────────────────────────────────
  const snapshotBody = [
    [
      { text: 'Total Employees Registered', style: 'tableHeader' },
      { text: 'Total Appraised', style: 'tableHeader' },
      { text: 'Not Yet Appraised', style: 'tableHeader' },
      { text: 'Company Avg Score', style: 'tableHeader' },
      { text: 'Bias Flags', style: 'tableHeader' },
    ],
    [
      { text: String(totalEmployees), style: 'tableCell', alignment: 'center' },
      { text: String(totalAppraised), style: 'tableCell', alignment: 'center' },
      { text: String(totalEmployees - totalAppraised), style: 'tableCell', alignment: 'center' },
      { text: String(overallAvg), style: 'tableCell', alignment: 'center' },
      {
        text: String(biasCases.length),
        style: 'tableCell',
        alignment: 'center',
        color: biasCases.length > 0 ? RED : GREEN,
        bold: true,
      },
    ],
  ];

  // ── 2. Performance Distribution ─────────────────────────────────
  const distBody = [
    [
      { text: 'Category', style: 'tableHeader' },
      { text: 'Count', style: 'tableHeader' },
      { text: 'Percentage', style: 'tableHeader' },
    ],
    ...Object.entries(categoryCounts).map(([cat, count]) => [
      { text: cat, style: 'tableCell', color: categoryColor(cat), bold: true },
      { text: String(count), style: 'tableCell', alignment: 'center' },
      {
        text: totalAppraised > 0 ? `${((count / totalAppraised) * 100).toFixed(1)}%` : '0%',
        style: 'tableCell',
        alignment: 'center',
      },
    ]),
  ];

  // ── 3. Department-wise Performance ──────────────────────────────
  const deptBody = [
    [
      { text: 'Department', style: 'tableHeader' },
      { text: 'Employees Appraised', style: 'tableHeader' },
      { text: 'Avg Final Score', style: 'tableHeader' },
    ],
    ...departments.map((d) => [
      { text: d.department, style: 'tableCell' },
      { text: String(d.count), style: 'tableCell', alignment: 'center' },
      { text: String(d.averageFinalScore), style: 'tableCell', alignment: 'center' },
    ]),
  ];

  // ── 4. Top 5 Performers ─────────────────────────────────────────
  const topBody = [
    [
      { text: '#', style: 'tableHeader' },
      { text: 'Name', style: 'tableHeader' },
      { text: 'Department', style: 'tableHeader' },
      { text: 'Final Score', style: 'tableHeader' },
      { text: 'Category', style: 'tableHeader' },
    ],
    ...topPerformers.map((a, i) => [
      { text: String(i + 1), style: 'tableCell', alignment: 'center' },
      { text: a.employee?.name || 'N/A', style: 'tableCell' },
      { text: a.employee?.department || 'N/A', style: 'tableCell' },
      { text: String(a.finalScore), style: 'tableCell', alignment: 'center', bold: true, color: GREEN },
      { text: a.performanceCategory, style: 'tableCell', color: categoryColor(a.performanceCategory) },
    ]),
  ];

  // ── 5. Needs Improvement ────────────────────────────────────────
  const needsImprovement = allAppraisals.filter((a) => a.performanceCategory === 'Needs Improvement');
  const needsBody = [
    [
      { text: 'Name', style: 'tableHeader' },
      { text: 'Department', style: 'tableHeader' },
      { text: 'KPI Score', style: 'tableHeader' },
      { text: 'Attendance %', style: 'tableHeader' },
      { text: 'Final Score', style: 'tableHeader' },
    ],
    ...(needsImprovement.length > 0
      ? needsImprovement.map((a) => [
          { text: a.employee?.name || 'N/A', style: 'tableCell' },
          { text: a.employee?.department || 'N/A', style: 'tableCell' },
          { text: String(a.kpiScore), style: 'tableCell', alignment: 'center' },
          { text: `${a.attendancePercentage}%`, style: 'tableCell', alignment: 'center' },
          { text: String(a.finalScore), style: 'tableCell', alignment: 'center', color: RED, bold: true },
        ])
      : [[{ text: 'No employees in this category.', colSpan: 5, style: 'tableCell', alignment: 'center' }, {}, {}, {}, {}]]),
  ];

  // ── 6. Bias Detection ───────────────────────────────────────────
  const biasBody = [
    [
      { text: 'Employee', style: 'tableHeader' },
      { text: 'Manager', style: 'tableHeader' },
      { text: 'Manager Rating', style: 'tableHeader' },
      { text: 'Sentiment', style: 'tableHeader' },
      { text: 'KPI Score', style: 'tableHeader' },
    ],
    ...(biasCases.length > 0
      ? biasCases.map((a) => [
          { text: a.employee?.name || 'N/A', style: 'tableCell' },
          { text: a.manager?.name || 'N/A', style: 'tableCell' },
          { text: String(a.managerRating), style: 'tableCell', alignment: 'center' },
          { text: a.sentimentCategory, style: 'tableCell', alignment: 'center' },
          { text: String(a.kpiScore), style: 'tableCell', alignment: 'center' },
        ])
      : [[{ text: 'No bias cases detected. All appraisals appear fair.', colSpan: 5, style: 'tableCell', alignment: 'center', color: GREEN }, {}, {}, {}, {}]]),
  ];

  // ── 7. Full Employee Appraisal Table ────────────────────────────
  const fullTableBody = [
    [
      { text: 'Name', style: 'tableHeader' },
      { text: 'Dept', style: 'tableHeader' },
      { text: 'KPI', style: 'tableHeader' },
      { text: 'Attend %', style: 'tableHeader' },
      { text: 'Peer', style: 'tableHeader' },
      { text: 'Mgr Rating', style: 'tableHeader' },
      { text: 'Final Score', style: 'tableHeader' },
      { text: 'Category', style: 'tableHeader' },
    ],
    ...allAppraisals.map((a) => [
      { text: a.employee?.name || 'N/A', style: 'tableCell' },
      { text: a.employee?.department || 'N/A', style: 'tableCell' },
      { text: String(a.kpiScore), style: 'tableCell', alignment: 'center' },
      { text: `${a.attendancePercentage}%`, style: 'tableCell', alignment: 'center' },
      { text: String(a.peerRating), style: 'tableCell', alignment: 'center' },
      { text: String(a.managerRating), style: 'tableCell', alignment: 'center' },
      { text: String(a.finalScore), style: 'tableCell', alignment: 'center', bold: true },
      {
        text: a.performanceCategory,
        style: 'tableCell',
        color: categoryColor(a.performanceCategory),
        bold: true,
      },
    ]),
  ];

  // ── Document definition ─────────────────────────────────────────
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [35, 55, 35, 45],
    header: (currentPage) =>
      currentPage === 1
        ? null
        : {
            text: 'Performance Appraisal Report — Confidential',
            alignment: 'right',
            margin: [0, 15, 35, 0],
            fontSize: 8,
            color: '#888888',
          },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Generated on ${reportDate}`, fontSize: 8, color: '#888888', margin: [35, 0, 0, 0] },
        { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: '#888888', alignment: 'right', margin: [0, 0, 35, 0] },
      ],
      margin: [0, 10, 0, 0],
    }),

    content: [
      // ── Cover Block ──
      {
        canvas: [{ type: 'rect', x: 0, y: 0, w: 525, h: 90, color: DARK_BLUE, r: 4 }],
        margin: [0, 0, 0, 0],
      },
      {
        text: 'Performance Appraisal Report',
        style: 'reportTitle',
        margin: [0, -70, 0, 0],
      },
      {
        text: `Generated on ${reportDate}  |  Confidential — For Management Use Only`,
        style: 'reportSubtitle',
        margin: [0, 4, 0, 30],
      },

      // ── Section 1 ──
      sectionHeader('1.  Executive Snapshot'),
      {
        table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body: snapshotBody },
        layout: tableLayout(),
      },

      // ── Section 2 ──
      sectionHeader('2.  Performance Distribution'),
      {
        table: { headerRows: 1, widths: [200, '*', '*'], body: distBody },
        layout: tableLayout(),
      },

      // ── Section 3 ──
      sectionHeader('3.  Department-wise Average Performance'),
      {
        table: { headerRows: 1, widths: ['*', '*', '*'], body: deptBody },
        layout: tableLayout(),
      },

      // ── Section 4 ──
      sectionHeader('4.  Top 5 Performers'),
      {
        table: { headerRows: 1, widths: [25, '*', '*', '*', '*'], body: topBody },
        layout: tableLayout(),
      },

      // ── Section 5 ──
      sectionHeader('5.  Employees Needing Improvement'),
      {
        table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body: needsBody },
        layout: tableLayout(),
      },

      // ── Section 6 ──
      sectionHeader('6.  Bias Detection Summary'),
      {
        text: 'Appraisals where manager rating contradicts feedback sentiment or employee metrics.',
        fontSize: 9,
        color: '#555555',
        margin: [0, 0, 0, 6],
      },
      {
        table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body: biasBody },
        layout: tableLayout(),
      },

      // ── Section 7 ──
      sectionHeader('7.  Complete Employee Appraisal Record'),
      {
        table: {
          headerRows: 1,
          widths: ['*', 45, 30, 40, 25, 45, 45, 60],
          body: fullTableBody,
        },
        layout: tableLayout(),
      },
    ],

    styles: {
      reportTitle: {
        fontSize: 22,
        bold: true,
        color: WHITE,
        alignment: 'center',
      },
      reportSubtitle: {
        fontSize: 9,
        color: '#AAAAAA',
        alignment: 'center',
      },
      sectionHeader: {
        fontSize: 13,
        bold: true,
        color: DARK_BLUE,
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: WHITE,
        fillColor: DARK_BLUE,
        alignment: 'center',
        margin: [4, 5, 4, 5],
      },
      tableCell: {
        fontSize: 9,
        margin: [4, 4, 4, 4],
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  // ── Build PDF buffer ─────────────────────────────────────────────
  const printer = new PdfPrinter(getFonts());
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
};

// Shared table layout styling
const tableLayout = () => ({
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#CCCCCC',
  vLineColor: () => '#CCCCCC',
  fillColor: (rowIndex) => (rowIndex === 0 ? DARK_BLUE : rowIndex % 2 === 0 ? LIGHT_BLUE : WHITE),
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 3,
  paddingBottom: () => 3,
});

module.exports = { generatePerformanceReport };
