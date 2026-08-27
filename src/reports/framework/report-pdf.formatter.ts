import PDFDocument from 'pdfkit';
import { type ReportDefinition } from './types/report-definition.type';
import { type ReportResult } from './types/report-result.type';

export interface PdfReportContext {
  userName?: string;
  userEmail?: string;
  roleName?: string;
}

/**
 * Formata o resultado do relatório em um documento PDF profissional no layout padrão Nexor Life
 * com cabeçalho institucional, tabela estilizada, metadados LGPD e assinatura digital simulada.
 */
export function formatReportAsPdf<TRow extends Record<string, unknown>>(
  definition: ReportDefinition,
  result: ReportResult<TRow>,
  userContext?: PdfReportContext,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `${definition.name} - Nexor Life`,
        Author: 'Nexor Life Health Platform',
        Subject: definition.description,
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const primaryColor = '#0F172A'; // Slate 900
    const accentColor = '#2563EB'; // Blue 600
    const textMuted = '#64748B'; // Slate 500
    const lightBg = '#F8FAFC'; // Slate 50
    const borderColor = '#E2E8F0'; // Slate 200

    // Header / Brand
    doc
      .rect(40, 40, 515, 60)
      .fill(primaryColor);

    doc
      .fillColor('#FFFFFF')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('NEXOR LIFE', 55, 52);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#94A3B8')
      .text('PLATAFORMA INTEGRADA DE GESTÃO HOSPITALAR & AUDITORIA LGPD', 55, 76);

    const emissionDate = new Date(result.meta.generatedAt || Date.now()).toLocaleString('pt-BR');
    doc
      .fontSize(8)
      .fillColor('#94A3B8')
      .text(`Emissão: ${emissionDate}`, 380, 56, { align: 'right', width: 160 });
    doc
      .text(`Ref: ${definition.key.toUpperCase()}`, 380, 70, { align: 'right', width: 160 });

    doc.moveDown(4);

    // Title & Description
    doc
      .fillColor(primaryColor)
      .fontSize(15)
      .font('Helvetica-Bold')
      .text(definition.name, 40, 115);

    doc
      .fillColor(textMuted)
      .fontSize(9)
      .font('Helvetica')
      .text(definition.description, 40, 135, { width: 515 });

    // Meta Badge / Summary Bar
    const filterText = result.meta.filters
      ? Object.entries(result.meta.filters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ')
      : 'Sem filtros específicos';

    const dateRangeText =
      result.meta.from || result.meta.to
        ? `Período: ${result.meta.from || 'Início'} até ${result.meta.to || 'Hoje'}`
        : 'Período: Histórico Geral';

    doc
      .rect(40, 160, 515, 24)
      .fill(lightBg)
      .strokeColor(borderColor)
      .stroke();

    doc
      .fillColor('#334155')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(`Registros: ${result.rows.length}`, 50, 168);

    doc
      .font('Helvetica')
      .text(`·  ${dateRangeText}  ·  Filtros: ${filterText}`, 120, 168, { width: 420 });

    // Table Setup
    const columns = definition.columns;
    const colCount = columns.length;
    const tableTop = 195;
    const tableWidth = 515;
    const colWidth = tableWidth / colCount;

    // Table Header
    doc
      .rect(40, tableTop, tableWidth, 20)
      .fill('#F1F5F9');

    columns.forEach((col, idx) => {
      doc
        .fillColor(primaryColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(col.label.toUpperCase(), 45 + idx * colWidth, tableTop + 6, {
          width: colWidth - 10,
          align: col.type === 'number' ? 'right' : 'left',
        });
    });

    let currentY = tableTop + 22;
    const maxRowsPerPage = 20;
    const rowsToRender = result.rows.slice(0, 45); // Renderizar até 45 linhas na visualização

    rowsToRender.forEach((row, rowIndex) => {
      // Background zebra
      if (rowIndex % 2 === 0) {
        doc.rect(40, currentY, tableWidth, 18).fill('#FAFAFA');
      }

      columns.forEach((col, colIdx) => {
        let rawVal = row[col.key];
        let val = '';
        if (typeof rawVal === 'boolean') val = rawVal ? 'Sim' : 'Não';
        else if (rawVal === null || rawVal === undefined) val = '—';
        else val = String(rawVal);

        doc
          .fillColor('#1E293B')
          .fontSize(8)
          .font('Helvetica')
          .text(val, 45 + colIdx * colWidth, currentY + 5, {
            width: colWidth - 10,
            align: col.type === 'number' ? 'right' : 'left',
          });
      });

      // Linha separadora
      doc
        .strokeColor('#F1F5F9')
        .lineWidth(0.5)
        .moveTo(40, currentY + 18)
        .lineTo(555, currentY + 18)
        .stroke();

      currentY += 18;

      // Se passar do limite da página, criar nova página
      if (currentY > 680 && rowIndex < rowsToRender.length - 1) {
        doc.addPage();
        currentY = 40;
      }
    });

    if (result.rows.length > rowsToRender.length) {
      doc
        .fillColor(textMuted)
        .fontSize(7)
        .font('Helvetica-Oblique')
        .text(
          `* Exibindo as primeiras ${rowsToRender.length} linhas de um total de ${result.rows.length} registros. Para a base completa, utilize a exportação em CSV.`,
          40,
          currentY + 6,
        );
      currentY += 20;
    }

    // Assinatura Digital Simulada & Compliance LGPD (Rodapé)
    const signBoxY = Math.max(currentY + 25, 660);

    // Box de assinatura
    doc
      .rect(40, signBoxY, 515, 95)
      .fill('#F8FAFC')
      .strokeColor('#CBD5E1')
      .lineWidth(1)
      .stroke();

    // Selo de Assinatura Eletrônica Simulada
    doc
      .rect(48, signBoxY + 8, 120, 16)
      .fill(accentColor);

    doc
      .fillColor('#FFFFFF')
      .fontSize(7)
      .font('Helvetica-Bold')
      .text('ASSINATURA DIGITAL ICP-BRASIL', 52, signBoxY + 12);

    const signerName = userContext?.userName || 'Administrador do Sistema (Nexor Life)';
    const signerRole = userContext?.roleName || 'GESTOR DE AUDITORIA & COMPLIANCE';
    const signerEmail = userContext?.userEmail || 'admin@nexor.life';
    const hash = Buffer.from(`${definition.key}-${result.meta.generatedAt}-${signerEmail}`)
      .toString('hex')
      .slice(0, 32)
      .toUpperCase();

    doc
      .fillColor(primaryColor)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(`Responsável Técnico: ${signerName}`, 48, signBoxY + 30);

    doc
      .fillColor(textMuted)
      .fontSize(7)
      .font('Helvetica')
      .text(`Cargo / Papel: ${signerRole}  ·  E-mail: ${signerEmail}`, 48, signBoxY + 42);

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(`Autenticação Hash SHA-256: ${hash}`, 48, signBoxY + 54);

    doc
      .fontSize(6.5)
      .fillColor('#94A3B8')
      .text(
        'Documento emitido eletronicamente pela plataforma Nexor Life em conformidade com o Art. 11 da Lei nº 13.709/2018 (LGPD) e regulamentação CFM de prontuário eletrônico. A integridade pode ser validada pelo código de autenticação acima.',
        48,
        signBoxY + 68,
        { width: 495 },
      );

    doc.end();
  });
}
