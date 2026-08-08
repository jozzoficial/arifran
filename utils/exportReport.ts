import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// =====================================================
// Cores da marca AriFran Glamour
// =====================================================
const BRAND = {
  primary: '795465',
  primaryLight: 'F8C8DC',
  secondary: '9026C3',
  secondaryLight: 'F6D9FF',
  tertiary: '735C00',
  tertiaryLight: 'FFE088',
  surface: 'F9F9F9',
  white: 'FFFFFF',
  textDark: '1A1C1C',
  textMuted: '4F4448',
  outline: 'D2C3C7',
  error: 'BA1A1A',
  errorLight: 'FFDAD6',
}

interface SaleRow {
  created_at: string
  products: { name: string } | null
  quantity: number
  unit_price: number
  total: number
  profiles: { full_name: string } | null
}

interface ExpenseRow {
  description: string
  amount: number
  expense_type: string
  is_recurring: boolean
}

interface ExportData {
  sales: SaleRow[]
  expenses: ExpenseRow[]
  monthLabel: string // Ex: "Agosto 2026"
  grossRevenue: number
  totalExpenses: number
  netProfit: number
}

// =====================================================
// Helpers
// =====================================================
const formatKZS = (value: number) =>
  Number(value).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' KZS'

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// =====================================================
// EXPORT TO EXCEL (.xlsx)
// =====================================================
export async function exportToExcel(data: ExportData) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'AriFran Glamour'
  wb.created = new Date()

  // ---- Estilos reutilizáveis ----
  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    bold: true,
    color: { argb: 'FF' + BRAND.white },
    size: 11,
  }
  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    bold: true,
    color: { argb: 'FF' + BRAND.primary },
    size: 18,
  }
  const subtitleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    color: { argb: 'FF' + BRAND.textMuted },
    size: 12,
    italic: true,
  }
  const currencyFormat = '#,##0.00 "KZS"'
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF' + BRAND.outline } },
    bottom: { style: 'thin', color: { argb: 'FF' + BRAND.outline } },
    left: { style: 'thin', color: { argb: 'FF' + BRAND.outline } },
    right: { style: 'thin', color: { argb: 'FF' + BRAND.outline } },
  }

  // ===============================
  // FOLHA 1: RESUMO
  // ===============================
  const wsResumo = wb.addWorksheet('Resumo', {
    properties: { tabColor: { argb: 'FF' + BRAND.primary } },
  })

  // Cabeçalho da marca
  wsResumo.mergeCells('A1:D1')
  const titleCell = wsResumo.getCell('A1')
  titleCell.value = '✦ AriFran Glamour'
  titleCell.font = titleFont
  titleCell.alignment = { vertical: 'middle' }
  wsResumo.getRow(1).height = 40

  wsResumo.mergeCells('A2:D2')
  const subtitleCell = wsResumo.getCell('A2')
  subtitleCell.value = `Relatório Financeiro — ${data.monthLabel}`
  subtitleCell.font = subtitleFont
  wsResumo.getRow(2).height = 24

  // Linha decorativa
  wsResumo.getRow(3).height = 6
  for (let col = 1; col <= 4; col++) {
    const cell = wsResumo.getCell(3, col)
    cell.fill = {
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: 'FF' + BRAND.primary } },
        { position: 1, color: { argb: 'FF' + BRAND.secondary } },
      ],
    }
  }

  // Cards de resumo
  const summaryData = [
    ['Faturamento Bruto (Vendas)', data.grossRevenue],
    ['Despesas Totais', data.totalExpenses],
    ['Lucro Líquido', data.netProfit],
  ]

  // Cabeçalho dos cards
  wsResumo.getRow(5).values = ['', 'Indicador', '', 'Valor']
  wsResumo.getRow(5).eachCell((cell) => {
    cell.font = headerFont
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.primary } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })
  wsResumo.getRow(5).height = 28

  summaryData.forEach((item, idx) => {
    const rowNum = 6 + idx
    wsResumo.mergeCells(`B${rowNum}:C${rowNum}`)
    const row = wsResumo.getRow(rowNum)
    row.values = ['', item[0] as string, '', item[1] as number]
    row.height = 30

    const labelCell = wsResumo.getCell(`B${rowNum}`)
    labelCell.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FF' + BRAND.textDark } }
    labelCell.alignment = { vertical: 'middle' }
    labelCell.border = thinBorder

    const valueCell = wsResumo.getCell(`D${rowNum}`)
    valueCell.numFmt = currencyFormat
    valueCell.font = {
      name: 'Calibri',
      bold: true,
      size: 14,
      color: { argb: idx === 2 ? 'FF' + BRAND.primary : (idx === 1 ? 'FF' + BRAND.error : 'FF' + BRAND.textDark) },
    }
    valueCell.alignment = { horizontal: 'right', vertical: 'middle' }
    valueCell.border = thinBorder

    // Zebra background
    if (idx % 2 === 0) {
      row.eachCell((cell) => {
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).pattern !== 'solid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.surface } }
        }
      })
    }
  })

  // Rodapé
  const footerRow = wsResumo.getRow(10)
  wsResumo.mergeCells('A10:D10')
  footerRow.getCell(1).value = `Gerado em ${new Date().toLocaleDateString('pt-BR')} — AriFran Glamour © ${new Date().getFullYear()}`
  footerRow.getCell(1).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF' + BRAND.textMuted } }
  footerRow.getCell(1).alignment = { horizontal: 'center' }

  // Larguras de coluna
  wsResumo.getColumn(1).width = 3
  wsResumo.getColumn(2).width = 35
  wsResumo.getColumn(3).width = 10
  wsResumo.getColumn(4).width = 25

  // ===============================
  // FOLHA 2: VENDAS
  // ===============================
  const wsVendas = wb.addWorksheet('Vendas', {
    properties: { tabColor: { argb: 'FF' + BRAND.secondary } },
  })

  // Título
  wsVendas.mergeCells('A1:E1')
  wsVendas.getCell('A1').value = `Vendas — ${data.monthLabel}`
  wsVendas.getCell('A1').font = { ...titleFont, size: 14 }
  wsVendas.getRow(1).height = 32

  // Cabeçalhos
  const salesHeaders = ['Data', 'Produto', 'Qtd', 'Preço Unit.', 'Total']
  wsVendas.getRow(3).values = salesHeaders
  wsVendas.getRow(3).height = 28
  wsVendas.getRow(3).eachCell((cell) => {
    cell.font = headerFont
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.secondary } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Dados
  data.sales.forEach((sale, idx) => {
    const rowNum = 4 + idx
    const row = wsVendas.getRow(rowNum)
    row.values = [
      formatDate(sale.created_at),
      sale.products?.name || 'Produto Removido',
      sale.quantity,
      Number(sale.unit_price),
      Number(sale.total),
    ]
    row.height = 24
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF' + BRAND.textDark } }
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle' }
      if (colNumber === 3) cell.alignment = { horizontal: 'center', vertical: 'middle' }
      if (colNumber >= 4) {
        cell.numFmt = currencyFormat
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
      // Zebra
      if (idx % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.surface } }
      }
    })
  })

  // Linha de total
  if (data.sales.length > 0) {
    const totalRowNum = 4 + data.sales.length
    const totalRow = wsVendas.getRow(totalRowNum)
    wsVendas.mergeCells(`A${totalRowNum}:D${totalRowNum}`)
    totalRow.getCell(1).value = 'TOTAL'
    totalRow.getCell(5).value = data.grossRevenue
    totalRow.height = 30
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FF' + BRAND.white } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.primary } }
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle' }
    })
    totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
    totalRow.getCell(5).numFmt = currencyFormat
    totalRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' }
  }

  // Larguras
  wsVendas.getColumn(1).width = 20
  wsVendas.getColumn(2).width = 30
  wsVendas.getColumn(3).width = 8
  wsVendas.getColumn(4).width = 18
  wsVendas.getColumn(5).width = 18

  // ===============================
  // FOLHA 3: DESPESAS
  // ===============================
  const wsDespesas = wb.addWorksheet('Despesas', {
    properties: { tabColor: { argb: 'FF' + BRAND.error } },
  })

  // Título
  wsDespesas.mergeCells('A1:D1')
  wsDespesas.getCell('A1').value = `Despesas — ${data.monthLabel}`
  wsDespesas.getCell('A1').font = { ...titleFont, size: 14, color: { argb: 'FF' + BRAND.error } }
  wsDespesas.getRow(1).height = 32

  // Cabeçalhos
  const expHeaders = ['Descrição', 'Tipo', 'Recorrente', 'Valor']
  wsDespesas.getRow(3).values = expHeaders
  wsDespesas.getRow(3).height = 28
  wsDespesas.getRow(3).eachCell((cell) => {
    cell.font = headerFont
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.error } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Dados
  data.expenses.forEach((exp, idx) => {
    const rowNum = 4 + idx
    const row = wsDespesas.getRow(rowNum)
    row.values = [
      exp.description,
      exp.expense_type === 'fixed' ? 'Fixo' : 'Variável',
      exp.is_recurring ? 'Sim' : 'Não',
      Number(exp.amount),
    ]
    row.height = 24
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF' + BRAND.textDark } }
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle' }
      if (colNumber >= 2 && colNumber <= 3) cell.alignment = { horizontal: 'center', vertical: 'middle' }
      if (colNumber === 4) {
        cell.numFmt = currencyFormat
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF' + BRAND.error }, bold: true }
      }
      if (idx % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.surface } }
      }
    })
  })

  // Linha de total
  if (data.expenses.length > 0) {
    const totalRowNum = 4 + data.expenses.length
    const totalRow = wsDespesas.getRow(totalRowNum)
    wsDespesas.mergeCells(`A${totalRowNum}:C${totalRowNum}`)
    totalRow.getCell(1).value = 'TOTAL DESPESAS'
    totalRow.getCell(4).value = data.totalExpenses
    totalRow.height = 30
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FF' + BRAND.white } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND.error } }
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle' }
    })
    totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
    totalRow.getCell(4).numFmt = currencyFormat
    totalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' }
  }

  // Larguras
  wsDespesas.getColumn(1).width = 35
  wsDespesas.getColumn(2).width = 14
  wsDespesas.getColumn(3).width = 14
  wsDespesas.getColumn(4).width = 20

  // ---- Gerar e fazer download ----
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AriFran_Glamour_Relatorio_${data.monthLabel.replace(/\s/g, '_')}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// =====================================================
// EXPORT TO PDF
// =====================================================
export function exportToPDF(data: ExportData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()

  // ---- Cabeçalho ----
  doc.setFontSize(22)
  doc.setTextColor(0x79, 0x54, 0x65) // primary
  doc.text('AriFran Glamour', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(0x4F, 0x44, 0x48) // textMuted
  doc.text('Cosméticos de Luxo', 14, 27)

  doc.setFontSize(13)
  doc.setTextColor(0x1A, 0x1C, 0x1C) // textDark
  doc.text(`Relatório Financeiro — ${data.monthLabel}`, 14, 38)

  // Linha decorativa
  doc.setDrawColor(0x79, 0x54, 0x65)
  doc.setLineWidth(0.8)
  doc.line(14, 42, pageWidth - 14, 42)

  // ---- Cards de Resumo ----
  const cardY = 48
  const cardWidth = (pageWidth - 42) / 3
  const cards = [
    { label: 'Faturamento Bruto', value: formatKZS(data.grossRevenue), color: [0x79, 0x54, 0x65] as [number, number, number] },
    { label: 'Despesas Totais', value: formatKZS(data.totalExpenses), color: [0xBA, 0x1A, 0x1A] as [number, number, number] },
    { label: 'Lucro Líquido', value: formatKZS(data.netProfit), color: [0x90, 0x26, 0xC3] as [number, number, number] },
  ]

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + 7)

    // Fundo do card
    doc.setFillColor(0xF9, 0xF9, 0xF9)
    doc.setDrawColor(0xD2, 0xC3, 0xC7)
    doc.roundedRect(x, cardY, cardWidth, 22, 2, 2, 'FD')

    // Linha de acento colorido no topo
    doc.setFillColor(...card.color)
    doc.rect(x, cardY, cardWidth, 3, 'F')

    // Label
    doc.setFontSize(8)
    doc.setTextColor(0x4F, 0x44, 0x48)
    doc.text(card.label, x + 4, cardY + 10)

    // Value
    doc.setFontSize(12)
    doc.setTextColor(...card.color)
    doc.text(card.value, x + 4, cardY + 18)
  })

  // ---- Tabela de Vendas ----
  let startY = cardY + 32

  doc.setFontSize(12)
  doc.setTextColor(0x79, 0x54, 0x65)
  doc.text('Vendas', 14, startY)
  startY += 4

  if (data.sales.length > 0) {
    autoTable(doc, {
      startY,
      head: [['Data', 'Produto', 'Qtd', 'Preço Unit.', 'Total']],
      body: data.sales.map((s) => [
        formatDate(s.created_at),
        s.products?.name || 'Removido',
        String(s.quantity),
        formatKZS(Number(s.unit_price)),
        formatKZS(Number(s.total)),
      ]),
      foot: [['', '', '', 'TOTAL', formatKZS(data.grossRevenue)]],
      headStyles: {
        fillColor: [0x90, 0x26, 0xC3],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      footStyles: {
        fillColor: [0x79, 0x54, 0x65],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0x1A, 0x1C, 0x1C],
      },
      alternateRowStyles: {
        fillColor: [0xF9, 0xF9, 0xF9],
      },
      styles: {
        cellPadding: 3,
        lineColor: [0xD2, 0xC3, 0xC7],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startY = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.setFontSize(9)
    doc.setTextColor(0x4F, 0x44, 0x48)
    doc.text('Sem vendas registadas neste mês.', 14, startY + 6)
    startY += 16
  }

  // ---- Tabela de Despesas ----
  doc.setFontSize(12)
  doc.setTextColor(0xBA, 0x1A, 0x1A)
  doc.text('Despesas', 14, startY)
  startY += 4

  if (data.expenses.length > 0) {
    autoTable(doc, {
      startY,
      head: [['Descrição', 'Tipo', 'Recorrente', 'Valor']],
      body: data.expenses.map((e) => [
        e.description,
        e.expense_type === 'fixed' ? 'Fixo' : 'Variável',
        e.is_recurring ? 'Sim' : 'Não',
        formatKZS(Number(e.amount)),
      ]),
      foot: [['', '', 'TOTAL', formatKZS(data.totalExpenses)]],
      headStyles: {
        fillColor: [0xBA, 0x1A, 0x1A],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      footStyles: {
        fillColor: [0xBA, 0x1A, 0x1A],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0x1A, 0x1C, 0x1C],
      },
      alternateRowStyles: {
        fillColor: [0xFF, 0xDA, 0xD6],
      },
      styles: {
        cellPadding: 3,
        lineColor: [0xD2, 0xC3, 0xC7],
        lineWidth: 0.2,
      },
      columnStyles: {
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    })
  } else {
    doc.setFontSize(9)
    doc.setTextColor(0x4F, 0x44, 0x48)
    doc.text('Sem despesas registadas neste mês.', 14, startY + 6)
  }

  // ---- Rodapé ----
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor(0x81, 0x74, 0x78)
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} — AriFran Glamour © ${new Date().getFullYear()}`,
      pageWidth / 2,
      pageH - 8,
      { align: 'center' }
    )
  }

  // ---- Fazer download ----
  doc.save(`AriFran_Glamour_Relatorio_${data.monthLabel.replace(/\s/g, '_')}.pdf`)
}
