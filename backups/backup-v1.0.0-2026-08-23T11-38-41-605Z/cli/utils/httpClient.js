const axios = require('axios');
const chalk = require('chalk');

class HttpClient {
  constructor(options = {}) {
    this.delay = options.delay || 2000; // 2 seconds between requests
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.lastRequestTime = 0;

    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'ComplianceTrack-India/1.0 (Educational Research; +https://complytrack.in)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config) return Promise.reject(error);

        config.__retryCount = config.__retryCount || 0;

        if (config.__retryCount < this.maxRetries && this.isRetryableError(error)) {
          config.__retryCount += 1;
          const backoff = Math.pow(2, config.__retryCount) * 1000;
          console.log(chalk.yellow(`  Retry ${config.__retryCount}/${this.maxRetries} after ${backoff}ms...`));
          await this.sleep(backoff);
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  isRetryableError(error) {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 429 || status === 503 || status === 504 || status >= 500;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.delay) {
      await this.sleep(this.delay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  async get(url, options = {}) {
    await this.rateLimit();
    try {
      const response = await this.client.get(url, options);
      return response.data;
    } catch (error) {
      const message = error.response
        ? `HTTP ${error.response.status}: ${error.response.statusText}`
        : error.message;
      console.log(chalk.red(`  Failed to fetch ${url}: ${message}`));
      throw error;
    }
  }

  async checkRobotsTxt(baseUrl) {
    try {
      const url = new URL(baseUrl);
      const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
      const content = await this.get(robotsUrl);
      return this.parseRobotsTxt(content, url.pathname);
    } catch {
      return { allowed: true, message: 'robots.txt not found, assuming allowed' };
    }
  }

  parseRobotsTxt(content, path) {
    const lines = content.split('\n');
    let disallowed = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('disallow:')) {
        const disallowPath = trimmed.substring(9).trim();
        if (disallowPath && path.startsWith(disallowPath)) {
          disallowed = true;
        }
      }
    }

    return {
      allowed: !disallowed,
      message: disallowed ? `Path ${path} is disallowed by robots.txt` : 'Allowed'
    };
  }
}

module.exports = HttpClient;
