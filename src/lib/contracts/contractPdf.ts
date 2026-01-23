import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ContractPdfContract = {
  contract_number: string;
  contractor_name: string | null;
  contractor_document: string | null;
  contracted_name: string | null;
  contracted_document: string | null;
  generated_content: string | null;
};

export type ContractPdfSignature = {
  signer_type: string;
  signed_at: string | null;
  signature_image?: string | null;
};

function maskDocument(doc: string) {
  if (!doc) return '';
  const cleaned = doc.replace(/\D/g, '');
  if (cleaned.length === 11) return `***.***.*${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  if (cleaned.length === 14) return `**.***.***/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  return doc.slice(0, -3).replace(/./g, '*') + doc.slice(-3);
}

function ensurePngDataUrl(input?: string | null) {
  if (!input) return null;
  const clean = input.replace(/\s/g, '');
  if (clean.startsWith('data:image/')) return clean;
  // assume raw base64
  return `data:image/png;base64,${clean}`;
}

function tryAddSignatureImage(doc: jsPDF, signatureImage: string | null | undefined, x: number, y: number, w: number, h: number) {
  if (!signatureImage) return false;

  const dataUrl = ensurePngDataUrl(signatureImage);
  if (!dataUrl) return false;

  try {
    // jsPDF is more reliable when receiving a full data-url for PNG.
    doc.addImage(dataUrl, 'PNG', x, y, w, h);
    return true;
  } catch {
    // Fallback: try raw base64 (without prefix)
    try {
      const commaIndex = dataUrl.indexOf(',');
      const raw = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      doc.addImage(raw, 'PNG', x, y, w, h);
      return true;
    } catch {
      return false;
    }
  }
}

type RenderOpts = {
  margin: number;
  maxWidth: number;
  pageHeight: number;
};

function renderMarkdownWithBold(doc: jsPDF, markdown: string, startY: number, opts: RenderOpts) {
  let y = startY;
  let x = opts.margin;

  const newLine = (lh: number) => {
    x = opts.margin;
    y += lh;
    if (y > opts.pageHeight - opts.margin) {
      doc.addPage();
      y = opts.margin;
    }
  };

  const writeTokens = (text: string, fontSize: number) => {
    const lineHeight = Math.max(5, fontSize * 0.55);
    // Split by **bold** blocks
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const chunk = isBold ? part.slice(2, -2) : part;

      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);

      // Preserve spaces while wrapping
      const tokens = chunk.split(/(\s+)/);
      for (const token of tokens) {
        if (!token) continue;
        // force wrap on explicit spaces only when needed
        const tokenWidth = doc.getTextWidth(token);
        if (x + tokenWidth > opts.margin + opts.maxWidth && token.trim() !== '') {
          newLine(lineHeight);
        }
        doc.text(token, x, y);
        x += tokenWidth;
      }
    }
    newLine(lineHeight);
  };

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      newLine(6);
      continue;
    }

    // Basic markdown headings support
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      doc.setFont('helvetica', 'bold');
      const fontSize = level === 1 ? 14 : level === 2 ? 13 : 12;
      doc.setFontSize(fontSize);
      writeTokens(text, fontSize);
      continue;
    }

    writeTokens(line, 12);
  }

  return y;
}

function latestSignatureByType(signatures: ContractPdfSignature[], signerType: string) {
  const filtered = signatures.filter((s) => s.signer_type === signerType && s.signed_at);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => new Date(b.signed_at as string).getTime() - new Date(a.signed_at as string).getTime())[0];
}

export function generateContractPdf(params: { contract: ContractPdfContract; signatures: ContractPdfSignature[] }) {
  const { contract, signatures } = params;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  if (!contract.generated_content) return doc;

  // Render contract content preserving bold markers
  let y = margin;
  y = renderMarkdownWithBold(doc, contract.generated_content, y, { margin, maxWidth, pageHeight });

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Signatures section
  ensureSpace(90);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ASSINATURAS', pageWidth / 2, y, { align: 'center' });
  y += 15;

  const contractorSig = latestSignatureByType(signatures, 'contractor');
  const contractedSig = latestSignatureByType(signatures, 'contracted');

  const colWidth = (pageWidth - margin * 2) / 2;
  const col1X = margin;
  const col2X = margin + colWidth;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CONTRATANTE', col1X + colWidth / 2, y, { align: 'center' });
  doc.text('CONTRATADO', col2X + colWidth / 2, y, { align: 'center' });
  y += 8;

  const sigY = y;
  const sigWidth = 60;
  const sigHeight = 20;

  // images
  tryAddSignatureImage(doc, contractorSig?.signature_image, col1X + (colWidth - sigWidth) / 2, sigY, sigWidth, sigHeight);
  tryAddSignatureImage(doc, contractedSig?.signature_image, col2X + (colWidth - sigWidth) / 2, sigY, sigWidth, sigHeight);

  y = sigY + sigHeight + 5;

  // signature line
  doc.setDrawColor(100);
  doc.line(col1X + 10, y, col1X + colWidth - 10, y);
  doc.line(col2X + 10, y, col2X + colWidth - 10, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(contract.contractor_name || '', col1X + colWidth / 2, y, { align: 'center' });
  doc.text(contract.contracted_name || '', col2X + colWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(8);
  doc.text(maskDocument(contract.contractor_document || ''), col1X + colWidth / 2, y, { align: 'center' });
  doc.text(maskDocument(contract.contracted_document || ''), col2X + colWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(8);
  if (contractorSig?.signed_at) {
    doc.text(
      `Assinado em ${format(new Date(contractorSig.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      col1X + colWidth / 2,
      y,
      { align: 'center' }
    );
  }
  if (contractedSig?.signed_at) {
    doc.text(
      `Assinado em ${format(new Date(contractedSig.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      col2X + colWidth / 2,
      y,
      { align: 'center' }
    );
  }

  return doc;
}
