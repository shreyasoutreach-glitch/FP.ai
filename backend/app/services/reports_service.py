"""
FP.ai Professional Report Generation Service
Generates styled PDF vulnerability reports using ReportLab with graceful fallbacks and JSON export.
"""
import io
import html
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger("fpai.reports_service")


def clean_xml_text(val: Any) -> str:
    """Escape text safely for ReportLab Paragraph XML parser."""
    if val is None:
        return ""
    text = str(val)
    # Escape standard XML characters
    escaped = html.escape(text, quote=True)
    # Ensure line breaks in string become <br/> tags
    return escaped.replace("\n", "<br/>")


def generate_pdf_report(
    analysis_data: Dict[str, Any],
    document_name: str = "Unknown Document",
) -> bytes:
    """
    Generate an executive-grade PDF vulnerability report using ReportLab.
    Includes high-level dashboard, risk cards, clause breakdowns, and legal references.
    Falls back gracefully if formatting or custom style exceptions occur.
    """
    try:
        return _build_rich_reportlab_pdf(analysis_data, document_name)
    except Exception as e:
        logger.warning(f"Rich PDF build encountered an issue: {e}. Falling back to standard layout.", exc_info=True)
        try:
            return _build_fallback_reportlab_pdf(analysis_data, document_name)
        except Exception as err2:
            logger.error(f"Fallback PDF build also failed: {err2}", exc_info=True)
            raise RuntimeError(f"PDF generation failed: {err2}")


def _build_rich_reportlab_pdf(data: Dict[str, Any], document_name: str) -> bytes:
    """Rich visual PDF generation with styled flowables, tables, and risk badges."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.pdfgen import canvas

    class NumberedCanvas(canvas.Canvas):
        """Two-pass canvas for total page count and professional running footer."""
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._saved_page_states = []

        def showPage(self):
            self._saved_page_states.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            num_pages = len(self._saved_page_states)
            for state in self._saved_page_states:
                self.__dict__.update(state)
                self.draw_page_decorations(num_pages)
                super().showPage()
            super().save()

        def draw_page_decorations(self, page_count: int):
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            # Running header (pages > 1)
            if self._pageNumber > 1:
                self.drawString(1.8 * cm, A4[1] - 1.2 * cm, "FP.ai — Fine Print Engine Analysis Report")
                self.drawRightString(A4[0] - 1.8 * cm, A4[1] - 1.2 * cm, clean_xml_text(document_name)[:40])
                self.setStrokeColor(colors.HexColor("#e2e8f0"))
                self.setLineWidth(0.5)
                self.line(1.8 * cm, A4[1] - 1.4 * cm, A4[0] - 1.8 * cm, A4[1] - 1.4 * cm)

            # Running footer
            footer_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(A4[0] - 1.8 * cm, 1.2 * cm, footer_text)
            self.drawString(1.8 * cm, 1.2 * cm, "CONFIDENTIAL — FOR INFORMATIONAL PURPOSES ONLY — NOT LEGAL ADVICE")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(1.8 * cm, 1.5 * cm, A4[0] - 1.8 * cm, 1.5 * cm)
            self.restoreState()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.8 * cm,
        leftMargin=1.8 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "FP_Title", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=20, leading=24,
        textColor=colors.HexColor("#0f172a"), alignment=0, spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "FP_Subtitle", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10, leading=14,
        textColor=colors.HexColor("#475569"), spaceAfter=10,
    )
    section_h1 = ParagraphStyle(
        "FP_H1", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=13, leading=17,
        textColor=colors.HexColor("#1e293b"), spaceBefore=12, spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "FP_Body", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, leading=13.5,
        textColor=colors.HexColor("#334155"), spaceAfter=4,
    )
    summary_box_style = ParagraphStyle(
        "FP_SummaryBox", parent=styles["Normal"],
        fontName="Helvetica-Oblique", fontSize=9.5, leading=14,
        textColor=colors.HexColor("#1e293b"),
    )
    small_label = ParagraphStyle(
        "FP_Small", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, leading=11,
        textColor=colors.HexColor("#64748b"),
    )
    badge_style = ParagraphStyle(
        "FP_Badge", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=8.5, leading=11,
        textColor=colors.white, alignment=1,
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("FP.ai — Fine Print Vulnerability Analysis", title_style))
    analysis_date = data.get("created_at") or datetime.utcnow().strftime("%B %d, %Y, %H:%M UTC")
    story.append(Paragraph(f"Comprehensive Risk Assessment Report &bull; Generated on {clean_xml_text(analysis_date)}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f172a"), spaceAfter=10))

    # 2. Executive Overview Table
    overall_rating = str(data.get("overall_risk_rating", "medium")).lower()
    risk_score = float(data.get("overall_risk_score", 0.0))
    rating_colors = {
        "critical": "#dc2626",
        "high": "#ea580c",
        "medium": "#d97706",
        "low": "#16a34a",
    }
    rating_hex = rating_colors.get(overall_rating, "#64748b")

    overview_rows = [
        [
            Paragraph("<b>Target Document:</b>", small_label),
            Paragraph(clean_xml_text(document_name), body_style),
            Paragraph("<b>Overall Risk Rating:</b>", small_label),
            Paragraph(f'<font color="{rating_hex}"><b>{overall_rating.upper()}</b></font>', body_style),
        ],
        [
            Paragraph("<b>Contract Type:</b>", small_label),
            Paragraph(clean_xml_text(data.get("contract_type", "General Contract")), body_style),
            Paragraph("<b>Composite Risk Score:</b>", small_label),
            Paragraph(f"<b>{risk_score:.1f} / 100</b>", body_style),
        ],
        [
            Paragraph("<b>Clauses Analyzed:</b>", small_label),
            Paragraph(str(data.get("total_clauses", len(data.get("clauses", [])))), body_style),
            Paragraph("<b>Power Imbalance Score:</b>", small_label),
            Paragraph(f"{data.get('power_imbalance_score', 50)} / 100", body_style),
        ],
    ]

    overview_table = Table(overview_rows, colWidths=[3.2 * cm, 6.0 * cm, 3.8 * cm, 4.4 * cm])
    overview_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#e2e8f0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#f1f5f9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 0.3 * cm))

    # 3. Executive Summary Card
    exec_summary = data.get("executive_summary") or "Vulnerability analysis completed successfully."
    story.append(Paragraph("Executive Summary", section_h1))
    summary_card = Table([[Paragraph(clean_xml_text(exec_summary), summary_box_style)]], colWidths=[17.4 * cm])
    summary_card.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_card)
    story.append(Spacer(1, 0.3 * cm))

    # 4. Risk Breakdown Dashboard Table
    story.append(Paragraph("Risk Breakdown Dashboard", section_h1))
    critical_c = int(data.get("critical_count", 0))
    high_c = int(data.get("high_count", 0))
    medium_c = int(data.get("medium_count", 0))
    low_c = int(data.get("low_count", 0))

    risk_table_data = [
        [
            Paragraph("<b>Severity</b>", small_label),
            Paragraph("<b>Count</b>", small_label),
            Paragraph("<b>Impact Description</b>", small_label),
            Paragraph("<b>Required Action</b>", small_label),
        ],
        [
            Paragraph('<font color="#dc2626"><b>CRITICAL</b></font>', body_style),
            Paragraph(str(critical_c), body_style),
            Paragraph("Severely one-sided or legally void terms (e.g. non-compete, uncapped liability)", body_style),
            Paragraph("Must eliminate or amend before signing", body_style),
        ],
        [
            Paragraph('<font color="#ea580c"><b>HIGH</b></font>', body_style),
            Paragraph(str(high_c), body_style),
            Paragraph("Substantial financial, operational, or reputational liability exposure", body_style),
            Paragraph("Actively negotiate favorable terms", body_style),
        ],
        [
            Paragraph('<font color="#d97706"><b>MEDIUM</b></font>', body_style),
            Paragraph(str(medium_c), body_style),
            Paragraph("Standard commercial friction, auto-renewal windows, or foreign jurisdiction", body_style),
            Paragraph("Review and monitor compliance", body_style),
        ],
        [
            Paragraph('<font color="#16a34a"><b>LOW / INFO</b></font>', body_style),
            Paragraph(str(low_c), body_style),
            Paragraph("Customary clauses adhering to standard statutory frameworks", body_style),
            Paragraph("Acceptable as drafted", body_style),
        ],
    ]

    risk_table = Table(risk_table_data, colWidths=[2.8 * cm, 2.0 * cm, 7.8 * cm, 4.8 * cm])
    risk_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#fef2f2")),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#fff7ed")),
        ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#fffbeb")),
        ("BACKGROUND", (0, 4), (-1, 4), colors.HexColor("#f0fdf4")),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 0.4 * cm))

    # 5. Top Identified Risks (if present)
    top_risks = data.get("top_risks") or []
    if top_risks:
        story.append(Paragraph("Top Identified Vulnerabilities", section_h1))
        for idx, risk in enumerate(top_risks[:6], 1):
            severity = str(risk.get("severity", "medium")).lower()
            badge_color = rating_colors.get(severity, "#64748b")
            title = risk.get("title", f"Vulnerability #{idx}")
            explanation = risk.get("explanation", "")
            legal_ref = risk.get("legal_reference", "")
            tip = risk.get("negotiation_tip", "")

            risk_block = [
                Paragraph(
                    f'<font color="{badge_color}"><b>[{severity.upper()}]</b></font> '
                    f'<b>{idx}. {clean_xml_text(title)}</b>',
                    body_style
                ),
                Paragraph(clean_xml_text(explanation), body_style),
            ]
            if legal_ref:
                risk_block.append(Paragraph(f'<i>Legal Basis: {clean_xml_text(legal_ref)}</i>', small_label))
            if tip:
                risk_block.append(Paragraph(f'<b>Negotiation Strategy:</b> {clean_xml_text(tip)}', small_label))
            risk_block.append(Spacer(1, 0.15 * cm))
            risk_block.append(HRFlowable(width="100%", thickness=0.3, color=colors.HexColor("#e2e8f0"), spaceAfter=6))

            story.append(KeepTogether(risk_block))

    # 6. High-Risk Clause Breakdown
    clauses = data.get("clauses") or data.get("clauses_json") or []
    high_priority_clauses = [
        c for c in clauses
        if str(c.get("risk_level", "")).lower() in ("critical", "high")
    ]
    if not high_priority_clauses and clauses:
        high_priority_clauses = sorted(clauses, key=lambda x: float(x.get("risk_score", 0)), reverse=True)[:5]

    if high_priority_clauses:
        story.append(Paragraph("Critical & High-Risk Clause Breakdown", section_h1))
        for c in high_priority_clauses[:8]:
            severity = str(c.get("risk_level", "medium")).lower()
            badge_color = rating_colors.get(severity, "#64748b")
            pattern_title = c.get("matched_pattern") or c.get("category", "Flagged Clause")
            clause_text = c.get("text", "")[:450]
            plain_eng = c.get("plain_english", "")
            mitigation = c.get("mitigation", "")
            legal_basis = c.get("legal_basis", "")

            elements = [
                Paragraph(
                    f'<font color="{badge_color}"><b>[{severity.upper()}]</b></font> '
                    f'<b>{clean_xml_text(pattern_title)}</b> &bull; '
                    f'<font color="#64748b">Risk Score: {c.get("risk_score", 0)}/100</font>',
                    body_style
                ),
                Paragraph(f'<i>"{clean_xml_text(clause_text)}&hellip;"</i>', small_label),
                Paragraph(f'<b>Plain English Translation:</b> {clean_xml_text(plain_eng)}', body_style),
            ]
            if mitigation:
                elements.append(Paragraph(f'<b>Mitigation:</b> {clean_xml_text(mitigation)}', small_label))
            if legal_basis:
                elements.append(Paragraph(f'<b>Statutory Authority:</b> {clean_xml_text(legal_basis)}', small_label))

            elements.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor("#cbd5e1"), spaceBefore=4, spaceAfter=8))
            story.append(KeepTogether(elements))

    # 7. Recommendations Section
    recs = data.get("recommendations") or []
    if recs:
        story.append(Paragraph("Actionable Recommendations", section_h1))
        rec_paragraphs = []
        for r in recs:
            rec_paragraphs.append(Paragraph(f"&bull; {clean_xml_text(r)}", body_style))
        story.append(KeepTogether(rec_paragraphs))
        story.append(Spacer(1, 0.4 * cm))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()


def _build_fallback_reportlab_pdf(data: Dict[str, Any], document_name: str) -> bytes:
    """Simplified, failsafe ReportLab generator avoiding complex nested flowables."""
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin = 50
    y = height - 50

    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, "FP.ai — Contract Vulnerability Report")
    y -= 25

    c.setFont("Helvetica", 10)
    c.drawString(margin, y, f"Document: {document_name[:60]}")
    y -= 15
    c.drawString(margin, y, f"Contract Type: {data.get('contract_type', 'General Contract')}")
    y -= 15
    c.drawString(margin, y, f"Overall Risk: {str(data.get('overall_risk_rating', 'UNKNOWN')).upper()} ({data.get('overall_risk_score', 0)}/100)")
    y -= 25

    c.setStrokeColor(colors.gray)
    c.line(margin, y, width - margin, y)
    y -= 20

    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Executive Summary:")
    y -= 18

    c.setFont("Helvetica", 9)
    summary_lines = str(data.get("executive_summary", "")).split("\n")
    for line in summary_lines:
        if y < 70:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 9)
        c.drawString(margin, y, line[:100])
        y -= 14

    y -= 15
    if y < 100:
        c.showPage()
        y = height - 50

    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Risk Counts:")
    y -= 18

    c.setFont("Helvetica", 9)
    c.drawString(margin, y, f"Critical: {data.get('critical_count', 0)}  |  High: {data.get('high_count', 0)}  |  Medium: {data.get('medium_count', 0)}  |  Low: {data.get('low_count', 0)}")
    y -= 25

    # Top clauses
    clauses = data.get("clauses") or data.get("clauses_json") or []
    if clauses:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(margin, y, "Flagged Clauses:")
        y -= 18

        c.setFont("Helvetica", 8)
        for cl in clauses[:10]:
            if y < 80:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 8)
            pat = cl.get("matched_pattern") or cl.get("category", "Clause")
            rl = str(cl.get("risk_level", "info")).upper()
            c.drawString(margin, y, f"[{rl}] {pat}")
            y -= 12
            txt = cl.get("text", "")[:110].replace("\n", " ")
            c.drawString(margin + 10, y, f"Text: {txt}...")
            y -= 16

    c.setFont("Helvetica-Oblique", 7)
    c.drawString(margin, 30, "Generated by FP.ai Fine Print Engine. Informational only — not legal advice.")
    c.save()

    buffer.seek(0)
    return buffer.getvalue()
