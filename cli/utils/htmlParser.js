const cheerio = require('cheerio');

class HtmlParser {
  constructor(html) {
    this.$ = cheerio.load(html);
  }

  extractText(selector) {
    return this.$(selector).text().trim();
  }

  extractHtml(selector) {
    return this.$(selector).html();
  }

  extractLinks(selector) {
    const links = [];
    this.$(selector).each((_, el) => {
      const href = this.$(el).attr('href');
      const text = this.$(el).text().trim();
      if (href && text) {
        links.push({ text, href });
      }
    });
    return links;
  }

  extractTables(selector) {
    const tables = [];
    this.$(selector || 'table').each((_, table) => {
      const rows = [];
      this.$(table).find('tr').each((_, tr) => {
        const cells = [];
        this.$(tr).find('th, td').each((_, cell) => {
          cells.push(this.$(cell).text().trim());
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
      if (rows.length > 0) {
        tables.push(rows);
      }
    });
    return tables;
  }

  extractListItems(selector) {
    const items = [];
    this.$(selector).each((_, el) => {
      const text = this.$(el).text().trim();
      if (text) {
        items.push(text);
      }
    });
    return items;
  }

  extractKeyValuePairs(containerSelector, keySelector, valueSelector) {
    const pairs = [];
    this.$(containerSelector).each((_, container) => {
      const key = this.$(container).find(keySelector).text().trim();
      const value = this.$(container).find(valueSelector).text().trim();
      if (key && value) {
        pairs.push({ key, value });
      }
    });
    return pairs;
  }

  extractCleanText(selector) {
    return this.$(selector)
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  filterByKeyword(elements, keywords) {
    const results = [];
    this.$(elements).each((_, el) => {
      const text = this.$(el).text().toLowerCase();
      if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
        results.push(el);
      }
    });
    return results;
  }

  static parse(html) {
    return new HtmlParser(html);
  }
}

module.exports = HtmlParser;
