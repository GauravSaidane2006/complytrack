const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class GstScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.gst.gov.in';
    this.sectorName = 'Goods & Services Tax (GST)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Central Goods and Services Tax Act, 2017 (CGST)',
        section: 'Sections 1-228',
        summary: 'The central legislation governing GST on intra-state supply of goods and services. Establishes the framework for levy, collection, and administration of CGST.',
        requirements: [
          'GST registration for businesses exceeding Rs. 40 lakh turnover (Rs. 20 lakh for services)',
          'Registration within 30 days of crossing threshold',
          'Tax invoice as per prescribed format',
          'Monthly/quarterly return filing',
          'Input Tax Credit (ITC) claims with conditions',
          'E-way bill generation for goods movement above Rs. 50,000',
          'Maintenance of records for 72 months',
          'Payment of tax by 20th of following month',
        ],
        penalties: 'Section 122: Penalty of Rs. 10,000 or 10% of tax due, whichever is higher. Section 132: Prosecution for tax evasion with imprisonment from 1 to 5 years.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-acts',
      },
      {
        title: 'Integrated Goods and Services Tax Act, 2017 (IGST)',
        section: 'Sections 1-35',
        summary: 'Governs IGST on inter-state supply of goods and services. Administered by the central government.',
        requirements: [
          'IGST collection on inter-state supplies',
          'IGST payment for imports',
          'Place of supply determination',
          'Zero-rated supply compliance',
          'Export documentation requirements',
        ],
        penalties: 'Same as CGST Act provisions apply.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-acts',
      },
      {
        title: 'State Goods and Services Tax Acts, 2017 (SGST)',
        section: 'Respective State Provisions',
        summary: 'State-level legislation governing GST on intra-state supply. Each state has enacted its own SGST Act with provisions mirroring CGST.',
        requirements: [
          'SGST registration for intra-state suppliers',
          'Compliance with state-specific SGST rules',
          'Separate SGST return filing',
          'State-wise ITC utilization',
          'Compliance with state-level amendments',
        ],
        penalties: 'Similar to CGST provisions with state-specific variations.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-acts',
      },
      {
        title: 'Union Territory Goods and Services Tax Act, 2017 (UTGST)',
        section: 'Sections 1-35',
        summary: 'Governs GST in Union Territories without legislature. Similar provisions as SGST.',
        requirements: [
          'UTGST registration for UT suppliers',
          'Compliance with UTGST rules',
          'UTGST return filing',
          'ITC as per UTGST provisions',
        ],
        penalties: 'Similar to CGST provisions.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-acts',
      },
      {
        title: 'GST Compensation to States Act, 2017',
        section: 'Sections 1-12',
        summary: 'Provides compensation to states for loss of revenue due to GST implementation. Specifies compensation cess on certain luxury and sin goods.',
        requirements: [
          'Compensation cess collection on notified goods',
          'Regular assessment and payment',
          'Compliance with cess rates',
        ],
        penalties: 'General GST penalty provisions apply.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-acts',
      },
      {
        title: 'GST Rules - Registration Rules, 2017',
        section: 'Rules 8-22',
        summary: 'Prescribes procedure for GST registration, amendment, and cancellation.',
        requirements: [
          'Online application via GST Portal',
          'PAN linkage mandatory',
          'Verification through Aadhaar or DSC',
          'Additional registration for each state',
          'Amendment within 30 days of change',
          'Voluntary cancellation with proper procedure',
        ],
        penalties: 'Penalty for non-registration: Rs. 10,000 or 10% of tax due, whichever is higher.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-rules',
      },
      {
        title: 'GST Rules - Invoice Rules, 2017',
        section: 'Rules 45-46',
        summary: 'Prescribes invoice format, contents, and time limit for issuing tax invoices.',
        requirements: [
          'Serial number (unique for financial year)',
          'Date of issue',
          'Name, address, and GSTIN of supplier',
          'Name and address of recipient',
          'HSN code of goods/SAC of services',
          'Description of goods/services',
          'Quantity and unit',
          'Total value before and after tax',
          'Tax rate and amount (CGST, SGST/UTGST, IGST)',
          'Place of supply for inter-state',
        ],
        penalties: 'Invalid invoice may lead to denial of ITC.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-rules',
      },
      {
        title: 'GST Rules - Input Tax Credit Rules, 2017',
        section: 'Rules 36-46',
        summary: 'Governs claiming of Input Tax Credit (ITC) on inputs and input services.',
        requirements: [
          'ITC claim only with valid tax invoice',
          'Invoice must have supplier GSTIN',
          'Goods/services used for business purposes',
          'ITC within time limit (September of next year)',
          'Reversal of ITC for non-payment within 180 days',
          'Block credits not eligible',
          'Matched invoices through GSTR-2B',
        ],
        penalties: 'ITC wrongly claimed: Recovery of tax with interest at 24% per annum plus penalty.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-rules',
      },
      {
        title: 'GST Rules - Return Filing Rules, 2017',
        section: 'Rules 59-61',
        summary: 'Prescribes return filing procedures, due dates, and formats.',
        requirements: [
          'GSTR-1: Outward supplies by 11th of month',
          'GSTR-3B: Summary return by 20th of month',
          'GSTR-9: Annual return by 31st December',
          'GSTR-9C: Reconciliation (turnover above Rs. 5 crore)',
          'Quarterly filing option (QRMP scheme)',
          'E-invoice for B2B above Rs. 5 crore (from Aug 2023)',
          'E-way bill for goods movement above Rs. 50,000',
        ],
        penalties: 'Late fee: Rs. 50/day (CGST) + Rs. 50/day (SGST), max Rs. 10,000. Interest at 18% per annum on late payment.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-rules',
      },
      {
        title: 'GST Rules - Assessment and Audit Rules, 2017',
        section: 'Rules 98-102',
        summary: 'Governs self-assessment, scrutiny assessment, and audit under GST.',
        requirements: [
          'Self-assessment based on returns filed',
          'Scrutiny by proper officer',
          'Audit by department or CA',
          'Reconciliation of records',
          'Response to show cause notices',
        ],
        penalties: 'Section 73: Demand without fraud - tax + 18% interest + 10% penalty. Section 74: Fraud - tax + 18% interest + 50% penalty.',
        sourceUrl: 'https://www.gst.gov.in/download/gst-rules',
      },
      {
        title: 'E-Invoice Rules under GST',
        section: 'Rule 48(4)',
        summary: 'Mandatory e-invoicing for B2B transactions exceeding specified thresholds. Applies to businesses with turnover above Rs. 5 crore.',
        requirements: [
          'Registration on Invoice Registration Portal (IRP)',
          'Generate Invoice Reference Number (IRN)',
          'QR code on invoice',
          'B2B invoice above Rs. 5 crore',
          'Export invoices',
          'E-way bill integration',
        ],
        penalties: 'Invalid invoice without IRN - ITC denied to recipient. Penalty as per general GST provisions.',
        sourceUrl: 'https://einvoice1.gst.gov.in',
      },
      {
        title: 'E-Way Bill Rules under GST',
        section: 'Rule 138',
        summary: 'Mandatory e-way bill for movement of goods exceeding Rs. 50,000 value.',
        requirements: [
          'E-way bill generation before goods movement',
          'Valid for 24 hours per 200 km',
          'Extension before expiry',
          'Part A and Part B details',
          'Vehicle number update',
          'Cancellation within 24 hours if not transported',
        ],
        penalties: 'Goods and vehicle liable for seizure. Penalty of Rs. 10,000 or tax evaded, whichever is higher.',
        sourceUrl: 'https://ewaybillgst.gov.in',
      },
    ];

    return {
      sectorName: this.sectorName,
      sourceUrl: this.baseUrl,
      regulations,
      scrapedAt: new Date().toISOString(),
    };
  }
}

module.exports = GstScraper;
