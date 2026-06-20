const ExcelJS = require('exceljs');

exports.generateExcel = async (complianceItems, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Compliance Report');

  sheet.columns = [
    { header: '#', key: 'index', width: 5 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Law', key: 'law', width: 20 },
    { header: 'Regulation', key: 'regulation', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Frequency', key: 'frequency', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Risk Score', key: 'riskScore', width: 12 },
    { header: 'Assigned To', key: 'assignedTo', width: 25 }
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  complianceItems.forEach((item, index) => {
    const assignedNames = item.assignedTo
      ? item.assignedTo.map(u => u.name || u.email).join(', ')
      : '-';

    sheet.addRow({
      index: index + 1,
      title: item.title,
      law: item.law,
      regulation: item.regulation,
      category: item.category,
      frequency: item.frequency,
      dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-',
      status: item.status,
      priority: item.priority,
      riskScore: item.riskScore || 0,
      assignedTo: assignedNames
    });
  });

  await workbook.xlsx.writeFile(filePath);
};
